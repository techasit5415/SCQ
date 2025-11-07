import type { PageServerLoad, Actions } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { fail } from '@sveltejs/kit';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// ดึง User ID จาก session
		const user = locals.user;
		
		if (!user?.id) {
			return {
				success: false,
				error: 'กรุณาเข้าสู่ระบบ',
				orders: []
			};
		}
		
		const userId = user.id;
		
		// ดึงข้อมูล orders ของผู้ใช้คนนี้เท่านั้น
		const orders = await pb.collection('Order').getFullList({
			filter: `User_ID = "${userId}"`,
			sort: '-created', // เรียงตามวันที่สร้างล่าสุดก่อน
			expand: 'Shop_ID,Menu_ID,Note' // ขยายข้อมูล relation รวม Note
		});
		
		// กรอง Top-up orders ออก (ดูจาก Shop_ID ที่เป็น placeholder)
		const TOPUP_SHOP_ID = '000000000000001';
		const filteredOrders = orders.filter((order: any) => {
			// ซ่อน Order ที่เป็น Top-up (Shop_ID เป็น placeholder ของระบบ)
			return order.Shop_ID !== TOPUP_SHOP_ID;
		});
		
		// คำนวณลำดับคิวสำหรับแต่ละ order ที่ยังไม่เสร็จ
		const ordersWithQueuePosition = await Promise.all(filteredOrders.map(async (order: any) => {
			let queuePosition = null;
			
			// คำนวณเฉพาะ order ที่มีสถานะ In-progress
			if (order.Status === 'In-progress') {
				try {
					// ดึง order ทั้งหมดของร้านเดียวกันที่สร้างก่อนหน้านี้และยังไม่เสร็จ
					const queueOrders = await pb.collection('Order').getFullList({
						filter: `Shop_ID = "${order.Shop_ID}" && created <= "${order.created}" && (Status = "In-progress")`,
						sort: 'created',
						$autoCancel: false  // ป้องกัน autocancellation
					});
					
					// หาตำแหน่งของ order นี้ในคิว (เริ่มนับจาก 1)
					queuePosition = queueOrders.findIndex((qOrder: any) => qOrder.id === order.id) + 1;
					
					// console.log(`🎯 Order ${order.id.slice(-8)} at ${order.expand?.Shop_ID?.name}: position ${queuePosition}/${queueOrders.length}`);
				} catch (queueError) {
					console.error('Error calculating queue position:', queueError);
				}
			}
			
			return {
				...order,
				queuePosition
			};
		}));

		// ดึงข้อมูล payments ที่เกี่ยวข้องกับ orders เหล่านี้
		const orderIds = ordersWithQueuePosition.map((order: any) => order.id);
		let payments: any[] = [];
		if (orderIds.length > 0) {
			payments = await pb.collection('Payment').getFullList({
				filter: orderIds.map(id => `Order_ID="${id}"`).join(' || '),
				expand: 'Order_ID'
			});
		}

		// ดึง Reviews ของ user คนนี้
		let reviews: any[] = [];
		try {
			reviews = await pb.collection('Review').getFullList({
				filter: `User_ID = "${userId}"`,
				fields: 'Order'
			});
			// console.log('📝 Found reviews:', reviews.length);
		} catch (reviewError) {
			console.error('Error loading reviews:', reviewError);
		}
		
		// สร้าง Set ของ Order ID ที่เคยรีวิวแล้ว
		const reviewedOrders = new Set(reviews.map(r => r.Order));

		// จับคู่ payment กับ order และเพิ่มข้อมูลคิว + เช็คว่ารีวิวแล้วหรือยัง
		const ordersWithPayment = ordersWithQueuePosition.map((order: any) => ({
			...order,
			payment: payments.find(p => p.Order_ID === order.id),
			hasReviewed: reviewedOrders.has(order.id) // เช็คว่าเคยรีวิว order นี้แล้วหรือยัง
		}));

		console.log('📋 Found orders:', ordersWithPayment.length);
		console.log('📋 Sample order with payment:', ordersWithPayment[0]);

		return {
			success: true,
			orders: ordersWithPayment
		};

	} catch (error) {
		console.error('❌ Error loading orders:', error);
		
		return {
			success: false,
			error: 'ไม่สามารถโหลดประวัติการสั่งอาหารได้',
			orders: []
		};
	}
};

export const actions: Actions = {
	submitReview: async ({ request, locals }) => {
		try {
			// ดึง User ID จาก session
			const user = locals.user;
			
			if (!user?.id) {
				return fail(401, { error: 'กรุณาเข้าสู่ระบบเพื่อรีวิว' });
			}
			
			const userId = user.id;
			
			const formData = await request.formData();
			const shopId = formData.get('shopId') as string;
			const orderId = formData.get('orderId') as string;
			const star = parseInt(formData.get('star') as string);
			const description = formData.get('description') as string;
			
			console.log('📝 Submitting review:', { shopId, orderId, star, description, userId });
			
			// Validate
			if (!shopId) {
				return fail(400, { error: 'ไม่พบข้อมูลร้าน' });
			}
			
			if (!orderId) {
				return fail(400, { error: 'ไม่พบข้อมูล Order' });
			}
			
			if (!star || star < 1 || star > 5) {
				return fail(400, { error: 'กรุณาเลือกคะแนน 1-5 ดาว' });
			}
			
			try {
				// เช็คว่ารีวิว order นี้ไปแล้วหรือยัง
				const existingReview = await pb.collection('Review').getFirstListItem(
					`User_ID = "${userId}" && Order = "${orderId}"`,
					{ requestKey: null }
				).catch(() => null);
				
				if (existingReview) {
					return fail(400, { error: 'คุณได้รีวิว Order นี้ไปแล้ว' });
				}
				
				// บันทึกตาม Schema ของ PocketBase Review collection
				const reviewData = {
					User_ID: userId,
					Shop_ID: shopId,
					Order: orderId,  // เพิ่ม Order field
					Star: star,  // ใช้ Star ไม่ใช่ Rating
					Description: description || ''  // ใช้ Description ไม่ใช่ Comment
				};
				
				const review = await pb.collection('Review').create(reviewData);
				console.log('✅ Review created successfully:', review.id);
				
				return {
					success: true,
					message: 'ขอบคุณสำหรับรีวิวค่ะ!'
				};
			} catch (createError: any) {
				console.error('❌ Error creating review:', createError);
				console.error('Error details:', createError?.response?.data);
				
				return fail(500, {
					error: 'ไม่สามารถบันทึกรีวิวได้: ' + (createError?.message || 'Unknown error')
				});
			}
			
		} catch (error: any) {
			console.error('❌ Error in submitReview:', error);
			return fail(500, {
				error: 'เกิดข้อผิดพลาด: ' + (error?.message || 'Unknown error')
			});
		}
	}
};