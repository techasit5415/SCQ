import type { PageServerLoad, Actions } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { fail } from '@sveltejs/kit';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

// แปลง payment method จาก form เป็นค่าที่ PocketBase ต้องการ
function getPaymentMethodName(method: string): string {
	switch (method) {
		case 'cash':
			return 'Cash';
		case 'qr':
			return 'Qr Code';
		case 'credit':
			return 'Point';
		default:
			return 'Cash';
	}
}

export const load: PageServerLoad = async ({ cookies }) => {
	try {
		// ดึง User ID จาก session
		const userId = "5v70v6p91pfakvb"; // fallback สำหรับ debug
		
		console.log('🔍 Loading points for User ID:', userId);
		
		// ดึงข้อมูล Point คงเหลือของผู้ใช้
		const userPointRecords = await pb.collection('Point').getFullList({
			filter: `User_ID = "${userId}"`,
			sort: '-created'
		});
		
		console.log('📊 Point records found:', userPointRecords.length);
		console.log('📊 Raw Point record:', JSON.stringify(userPointRecords[0], null, 2));
		
		let userPoints = 0;
		if (userPointRecords.length > 0) {
			userPoints = userPointRecords[0].Point || 0;
			console.log('💎 User Points from DB:', userPoints);
		} else {
			console.log('⚠️ No Point records found for user:', userId);
		}
		
		return {
			userPoints
		};
	} catch (error: any) {
		console.error('❌ Error loading user points:', error);
		console.error('❌ Error details:', error?.message, error?.data);
		return { userPoints: 0 };
	}
};

export const actions: Actions = {
	createOrder: async ({ request, cookies }) => {
		try {
			const formData = await request.formData();
			const orderData = JSON.parse(formData.get('orderData') as string);
			
			// ดึง User ID จาก session cookie
			// const userId = cookies.get('session');
			const userId = "userId";
			if (!userId) {
				throw new Error('User not authenticated - No session found');
			}
			
			console.log('👤 User ID from session:', userId);
			// Log orderData as pretty JSON
			console.log('📦 Raw orderData:', JSON.stringify(orderData, null, 2));
			console.log('🏪 restaurantId:', JSON.stringify(orderData.restaurantId, null, 2));
			console.log('🍽️ items:', JSON.stringify(orderData.items, null, 2));
			console.log('🆔 Menu IDs:', JSON.stringify(orderData.items?.map((item: any) => item.id), null, 2));
			
			const shopId = orderData.restaurantId;
			const menuIds = orderData.items?.map((item: any) => item.id) || [];
			
			console.log('🔍 Final Shop_ID:', JSON.stringify(shopId, null, 2), 'type:', typeof shopId);
			console.log('🔍 Final Menu_ID:', JSON.stringify(menuIds, null, 2), 'type:', typeof menuIds, 'length:', menuIds.length);
			
			if (!shopId) {
				throw new Error('Shop_ID is empty or undefined');
			}
			
			if (!menuIds || menuIds.length === 0) {
				throw new Error('Menu_ID array is empty');
			}
			
			// ส่งข้อมูลตาม PocketBase schema
			const createData: any = {
				Shop_ID: shopId,
				Menu_ID: menuIds,
				Total_Amount: orderData.total + 5,
				Status: "Pending"
			};
			
			console.log('📝 Final createData (before Note):', JSON.stringify(createData, null, 2));
			
			// สร้าง Order record ก่อน
			const orderRecord = await pb.collection('Order').create(createData);
			console.log('✅ Order created:', orderRecord.id);
			
			// เพิ่ม Note หลังจากสร้าง Order เสร็จแล้ว
			if (orderData.note && orderData.note.trim()) {
				try {
					console.log('📝 Creating Note record with Details:', orderData.note.trim());
					
					// สร้าง Note record โดยใช้ field ที่ถูกต้อง
					const noteRecord = await pb.collection('Note').create({
						Details: orderData.note.trim(),
						Order_ID: orderRecord.id
					});
					
					// อัพเดท Order ให้เชื่อมโยงกับ Note
					await pb.collection('Order').update(orderRecord.id, {
						Note: noteRecord.id
					});
					
					console.log('✅ Note created and linked:', noteRecord.id);
				} catch (noteError: any) {
					console.error('❌ Failed to create Note:', noteError);
					console.error('❌ Note error details:', noteError?.message, noteError?.data);
					// ถ้าสร้าง Note ไม่ได้ ก็ยังมี Order อยู่
				}
			}
			
		// สร้าง Payment record ที่เชื่อมโยงกับ Order
		const paymentData = {
			User_ID: userId,
			Shop_ID: shopId,
			Order_ID: orderRecord.id,
			Method_Payment: getPaymentMethodName(orderData.paymentMethod),
			Total_Amount: orderData.total + 5,
			status: "Success"
		};			console.log('💳 Creating payment:', JSON.stringify(paymentData, null, 2));
			
			let paymentRecord;
			try {
				paymentRecord = await pb.collection('Payment').create(paymentData);
				console.log('✅ Payment created:', paymentRecord.id);
			} catch (paymentError) {
				console.error('❌ Payment creation failed:', paymentError);
				console.error('💳 Payment data that failed:', JSON.stringify(paymentData, null, 2));
				throw paymentError;
			}
			
		// 💎 บันทึก Point transaction ถ้าชำระเงินด้วย Point
		if (orderData.paymentMethod === 'credit') {
			try {
				const pointAmount = orderData.total + 5; // จำนวน Point ที่ใช้
				
				// ดึงข้อมูล Point ปัจจุบันของผู้ใช้
				const userPointRecords = await pb.collection('Point').getFullList({
					filter: `User_ID = "${userId}"`,
					sort: '-created'
				});
				
				let currentPoints = 0;
				if (userPointRecords.length > 0) {
					currentPoints = userPointRecords[0].Point || 0;
				}
				
				// ตรวจสอบว่า Point เพียงพอหรือไม่
				if (currentPoints < pointAmount) {
					throw new Error(`Point ไม่เพียงพอ (มี ${currentPoints} ต้องการ ${pointAmount})`);
				}
				
				// บันทึกการใช้ Point (อัพเดท Point ให้เป็นค่าใหม่หลังหัก)
				const newPointBalance = currentPoints - pointAmount;
				
				console.log(`💎 Updating Point: ${currentPoints} - ${pointAmount} = ${newPointBalance}`);
				
				// อัพเดท Point record ที่มีอยู่
				if (userPointRecords.length > 0) {
					const existingPointId = userPointRecords[0].id;
					const pointRecord = await pb.collection('Point').update(existingPointId, {
						Point: newPointBalance
					});
					console.log('✅ Point updated:', JSON.stringify(pointRecord, null, 2));
				} else {
					// ถ้าไม่มี record ให้สร้างใหม่
					const pointRecord = await pb.collection('Point').create({
						User_ID: userId,
						Point: newPointBalance
					});
					console.log('✅ Point record created:', JSON.stringify(pointRecord, null, 2));
				}
			} catch (pointError: any) {
				console.error('❌ Point transaction failed:', pointError);
				// ลบ Payment และ Order ที่สร้างไปแล้ว (rollback)
				try {
					await pb.collection('Payment').delete(paymentRecord.id);
					await pb.collection('Order').delete(orderRecord.id);
				} catch (rollbackError) {
					console.error('❌ Rollback failed:', rollbackError);
				}
				throw new Error(`ไม่สามารถใช้ Point ได้: ${pointError.message}`);
			}
		}			return {
				success: true,
				orderId: orderRecord.id,
				paymentId: paymentRecord.id
			};
			
		} catch (error: any) {
			console.error('❌ Error creating order:', error);
			
			return fail(500, {
				error: 'ไม่สามารถสร้างคำสั่งซื้อได้',
				details: error?.message || 'Unknown error'
			});
		}
	}
};