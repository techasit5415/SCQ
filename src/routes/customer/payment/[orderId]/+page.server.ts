import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL, PUBLIC_ADMIN_PROMPTPAY_PHONE } from '$env/static/public';
import { OKSLIP_API_KEY, OKSLIP_BRANCH_ID, OKSLIP_API_URL } from '$env/static/private';

// ฟังก์ชันตรวจสอบสลิปด้วย OK Slip API
async function verifySlipWithOKSlip(slipImage: File, expectedAmount: number, recipientPhone: string) {
	try {
		const fullUrl = `${OKSLIP_API_URL}/${OKSLIP_BRANCH_ID}`;
		console.log('🔍 Calling SlipOK API:', fullUrl);
		
		// สร้าง FormData สำหรับส่งไฟล์ (ตาม SlipOK documentation)
		const formData = new FormData();
		formData.append('files', slipImage);
		formData.append('log', 'true');
		formData.append('amount', expectedAmount.toString());
		
		console.log('📤 Sending data:', {
			fileName: slipImage.name,
			fileSize: slipImage.size,
			fileType: slipImage.type,
			amount: expectedAmount
		});
		
		// เรียก SlipOK API
		const response = await fetch(fullUrl, {
			method: 'POST',
			headers: {
				'x-authorization': OKSLIP_API_KEY || ''
				// ไม่ต้องระบุ Content-Type เพราะ FormData จะจัดการให้
			},
			body: formData
		});

		const responseText = await response.text();
		console.log('API Response Status:', response.status);
		console.log('API Response Text:', responseText);
		console.log('--- End OK Slip Verification Debug ---');

		if (!response.ok) {
			console.error('❌ SlipOK API error:', response.status);
			console.error('❌ Error response:', responseText);
			return { success: false, error: 'ไม่สามารถตรวจสอบสลิปได้' };
		}

		const data = JSON.parse(responseText);
		console.log('📋 SlipOK response:', data);

		// ตรวจสอบผลลัพธ์
		if (!data.success) {
			// แสดง error message จาก API
			const errorMsg = data.message || 'ไม่สามารถอ่านข้อมูลสลิปได้';
			console.error('❌ SlipOK error:', data.code, errorMsg);
			
			// Error codes ที่พบบ่อย:
			// 1003: Package หมดอายุ
			// 1010: สลิปล่าช้า (delay slip)
			// 1012: สลิปซ้ำ (repeated slip)
			// 1013: จำนวนเงินไม่ตรง
			// 1014: เบอร์ผู้รับไม่ตรง
			
			return { success: false, error: errorMsg };
		}

		const slip = data.data;
		
		// API จะเช็คจำนวนเงินให้อัตโนมัติ (ถ้าส่ง amount parameter ไป)
		// ตรวจสอบเบอร์ผู้รับ (ถ้ามี)
		const normalizedRecipient = recipientPhone.replace(/^0/, '66').replace(/\D/g, '');
		const normalizedSlipRecipient = slip.receiver?.proxy?.value?.replace(/\D/g, '');
		
		if (normalizedSlipRecipient && normalizedSlipRecipient !== normalizedRecipient) {
			console.warn('⚠️ Recipient phone mismatch:', normalizedSlipRecipient, 'vs', normalizedRecipient);
		}

		return { 
			success: true, 
			slip: {
				amount: slip.amount,
				date: slip.transDate,
				time: slip.transTime,
				sender: slip.sender?.displayName || 'Unknown',
				ref: slip.ref1 || slip.transRef
			}
		};
	} catch (error: any) {
		console.error('❌ Error verifying slip:', error);
		return { success: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบสลิป' };
	}
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
	
	console.log('🔍 Payment Page - Loading Order ID:', params.orderId);
	console.log('👤 Payment Page - User:', locals.user?.id);
	
	// ต้อง login ถึงจะดูหน้านี้ได้
	if (!locals.user) {
		console.log('❌ No user logged in, redirecting to login');
		throw redirect(303, '/');
	}

	try {
		// ดึงข้อมูล Order พร้อม expand ข้อมูลร้านค้า
		const order = await pb.collection('Order').getOne(params.orderId, {
			expand: 'Shop_ID'
		});
		
		// ตรวจสอบว่า Order เป็นของ User คนนี้
		if (order.User_ID !== locals.user.id) {
			console.log('❌ Order does not belong to user');
			throw redirect(303, '/customer/orders');
		}

		// ดึงข้อมูล Payment record ของ Order นี้
		const payments = await pb.collection('Payment').getFullList({
			filter: `Order_ID = "${params.orderId}"`,
			sort: '-created'
		});
		
		const payment = payments[0];
		
		console.log('🛒 Order loaded:', {
			id: order.id,
			status: order.Status,
			hasPayment: !!payment
		});
		
		console.log('💳 Payment record:', payment ? {
			id: payment.id,
			method: payment.Method_Payment,
			status: payment.status
		} : 'No payment found');

		// ถ้าไม่มี Payment record หรือไม่ใช่ QR Code/Point -> redirect
		if (!payment || (payment.Method_Payment !== 'Qr Code' && payment.Method_Payment !== 'Point')) {
			console.log('❌ No QR Code or Point payment found');
			throw redirect(303, '/customer/orders');
		}

		// ถ้าชำระเงินสำเร็จแล้ว (status: Success) -> redirect
		if (payment.status === 'Success') {
			console.log('✅ Payment already completed');
			throw redirect(303, '/customer/orders');
		}

		const restaurant = order.expand?.Shop_ID;
		
		// กำหนดเบอร์โทรที่จะใช้ - ถ้าเป็น Point ใช้เบอร์ Admin, ถ้าเป็น QR Code ใช้เบอร์ร้าน
		const phoneNumber = payment.Method_Payment === 'Point' 
			? (PUBLIC_ADMIN_PROMPTPAY_PHONE || '0812345678')
			: (restaurant?.Phone || '');
		
		const recipientName = payment.Method_Payment === 'Point'
			? 'SCQ System'
			: (restaurant?.name || 'ร้านค้า');
		
		console.log('🏪 Payment info:', {
			method: payment.Method_Payment,
			recipientName,
			phone: phoneNumber
		});

		return {
			order: {
				id: order.id,
				order_number: order.Order_number || order.id,
				total: order.Total_Amount,
				status: order.Status,
				created: order.created
			},
			paymentMethod: payment.Method_Payment,
			recipient: {
				name: recipientName,
				phone: phoneNumber
			},
			restaurant: restaurant ? {
				id: restaurant.id,
				name: restaurant.name,
				phone: restaurant.Phone,
				address: restaurant.Addr
			} : null
		};
	} catch (error: any) {
		console.error('Error loading payment page:', error);
		
		// ถ้าเป็น redirect error ให้ throw ต่อ
		if (error.status === 303) {
			throw error;
		}
		
		// ถ้าไม่เจอ Order หรือมีปัญหาอื่น redirect กลับ
		throw redirect(303, '/customer/orders');
	}
};

export const actions = {
	uploadSlip: async ({ request, params, locals }: { request: Request; params: any; locals: any }) => {
		const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
		
		if (!locals.user) {
			return { success: false, error: 'กรุณาเข้าสู่ระบบ' };
		}

		try {
			const formData = await request.formData();
			const slip = formData.get('slip');

			if (!slip || !(slip instanceof File) || slip.size === 0) {
				return { success: false, error: 'กรุณาอัพโหลดหลักฐานการโอนเงิน' };
			}

			// ตรวจสอบประเภทไฟล์
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
			if (!allowedTypes.includes(slip.type)) {
				return { success: false, error: 'รองรับเฉพาะไฟล์ภาพ (JPEG, PNG, WebP)' };
			}

			// ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
			if (slip.size > 5 * 1024 * 1024) {
				return { success: false, error: 'ไฟล์ใหญ่เกิน 5MB' };
			}

			// ดึงข้อมูล Order พร้อม Shop
			const order = await pb.collection('Order').getOne(params.orderId, {
				expand: 'Shop_ID'
			});
			
			// ค้นหา Payment record
			const payments = await pb.collection('Payment').getFullList({
				filter: `Order_ID = "${params.orderId}"`
			});
			
			if (!payments || payments.length === 0) {
				return { success: false, error: 'ไม่พบข้อมูลการชำระเงิน' };
			}
			
			const payment = payments[0];

			// กำหนดเบอร์โทรที่จะตรวจสอบ
			const recipientPhone = payment.Method_Payment === 'Point' 
				? (PUBLIC_ADMIN_PROMPTPAY_PHONE || '')
				: (order.expand?.Shop_ID?.Phone || '');

			// ตรวจสอบสลิปด้วย OK Slip API (บังคับต้องมี API key)
			if (!OKSLIP_API_KEY) {
				console.error('❌ OK Slip API key not configured');
				return { 
					success: false, 
					error: 'ระบบตรวจสอบสลิปไม่พร้อมใช้งาน กรุณาติดต่อ Admin' 
				};
			}

			console.log('🔍 Verifying slip with OK Slip API...');
			const verifyResult = await verifySlipWithOKSlip(
				slip, 
				order.Total_Amount,
				recipientPhone
			);

			if (!verifyResult.success) {
				console.error('❌ Slip verification failed:', verifyResult.error);
				return { 
					success: false, 
					error: verifyResult.error || 'สลิปไม่ถูกต้อง' 
				};
			}

			console.log('✅ Slip verified:', verifyResult.slip);

			// อัพเดท Payment status เป็น Success
			await pb.collection('Payment').update(payment.id, {
				status: 'Success'
			});

			console.log('✅ Payment status updated to Success');

			return { success: true };
		} catch (error: any) {
			console.error('Error uploading slip:', error);
			return { 
				success: false, 
				error: error.message || 'เกิดข้อผิดพลาดในการอัพโหลด' 
			};
		}
	},
	
	cancelOrder: async ({ params, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'กรุณาเข้าสู่ระบบ' };
		}

		const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

		try {
			// ดึงข้อมูล Order
			const order = await pb.collection('Order').getOne(params.orderId);
			
			// ตรวจสอบว่าเป็น Order ของ user คนนี้
			if (order.User_ID !== locals.user.id) {
				return { success: false, error: 'ไม่มีสิทธิ์ยกเลิก Order นี้' };
			}

			// ยกเลิก Order
			await pb.collection('Order').update(params.orderId, {
				Status: 'Canceled'
			});

			// อัปเดต Payment เป็น Canceled
			const payments = await pb.collection('Payment').getFullList({
				filter: `Order_ID = "${params.orderId}"`
			});
			
			if (payments.length > 0) {
				await pb.collection('Payment').update(payments[0].id, {
					status: 'Canceled'
				});
			}

			console.log('✅ Order cancelled due to timeout');
			return { success: true };
		} catch (error: any) {
			console.error('Error cancelling order:', error);
			return { success: false, error: 'ไม่สามารถยกเลิก Order ได้' };
		}
	}
} satisfies Actions;
