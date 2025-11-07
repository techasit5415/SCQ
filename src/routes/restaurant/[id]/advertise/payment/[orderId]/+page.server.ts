import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL, PUBLIC_ADMIN_PROMPTPAY_PHONE } from '$env/static/public';
import { OKSLIP_API_KEY, OKSLIP_BRANCH_ID, OKSLIP_API_URL } from '$env/static/private';

// ฟังก์ชันตรวจสอบสลิปด้วย OK Slip API (เหมือนเดิม)
async function verifySlipWithOKSlip(slipImage: File, expectedAmount: number, recipientPhone: string) {
	try {
		const fullUrl = `${OKSLIP_API_URL}/${OKSLIP_BRANCH_ID}`;
		console.log('🔍 Calling SlipOK API:', fullUrl);
		
		const formData = new FormData();
		formData.append('files', slipImage);
		formData.append('log', 'true');
		formData.append('amount', expectedAmount.toString());
		
		const response = await fetch(fullUrl, {
			method: 'POST',
			headers: {
				'x-authorization': OKSLIP_API_KEY || ''
			},
			body: formData
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ SlipOK API error:', response.status);
			return { success: false, error: 'ไม่สามารถตรวจสอบสลิปได้' };
		}

		const data = await response.json();
		console.log('📋 SlipOK response:', data);

		if (!data.success) {
			const errorMsg = data.message || 'ไม่สามารถอ่านข้อมูลสลิปได้';
			console.error('❌ SlipOK error:', data.code, errorMsg);
			return { success: false, error: errorMsg };
		}

		const slip = data.data;
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

export const load: PageServerLoad = async ({ params }) => {
	const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
	
	console.log('🔍 Advertise Payment Page - Loading Order ID:', params.orderId);
	console.log('🏪 Restaurant ID:', params.id);

	try {
		// ดึงข้อมูล Order
		const order = await pb.collection('Order').getOne(params.orderId);
		
		console.log('🔍 Order data:', JSON.stringify(order, null, 2));
		console.log('🔍 Order fields:', Object.keys(order));
		
		// ตรวจสอบว่าเป็น Advertise order โดยใช้ Menu_ID 
		// (เพราะ PocketBase ไม่มี Order_Type field)
		const ADVERTISE_MENU_ID = '000000000000002';
		const isAdvertiseOrder = order.Menu_ID && order.Menu_ID.includes(ADVERTISE_MENU_ID);
		
		if (!isAdvertiseOrder) {
			console.log('❌ Not an advertise order - Menu_ID:', order.Menu_ID);
			throw redirect(303, `/restaurant/${params.id}/dashboard`);
		}
		
		console.log('✅ Confirmed advertise order - Menu_ID contains:', ADVERTISE_MENU_ID);

		// ดึงข้อมูล Payment record
		const payments = await pb.collection('Payment').getFullList({
			filter: `Order_ID = "${params.orderId}"`,
			sort: '-created'
		});
		
		const payment = payments[0];
		
		if (!payment || payment.Method_Payment !== 'Qr Code') {
			console.log('❌ No QR Code payment found');
			throw redirect(303, `/restaurant/${params.id}/advertise`);
		}

		// ถ้าชำระเงินสำเร็จแล้ว -> redirect
		if (payment.status === 'Success') {
			console.log('✅ Payment already completed');
			throw redirect(303, `/restaurant/${params.id}/advertise`);
		}

		// ดึงข้อมูลร้าน
		const restaurant = await pb.collection('Shop').getOne(params.id);
		
		console.log('🏪 Advertise payment info:', {
			orderId: order.id,
			amount: order.Total_Amount,
			restaurant: restaurant.name
		});

		return {
			order: {
				id: order.id,
				total: order.Total_Amount,
				status: order.Status,
				created: order.created
			},
			restaurant: {
				id: restaurant.id,
				name: restaurant.name,
				phone: restaurant.phone
			},
			adminPhone: PUBLIC_ADMIN_PROMPTPAY_PHONE // ส่งเบอร์ admin แยกต่างหาก
		};
	} catch (error: any) {
		console.error('Error loading advertise payment page:', error);
		
		if (error.status === 303) {
			throw error;
		}
		
		throw redirect(303, `/restaurant/${params.id}/advertise`);
	}
};

export const actions = {
	uploadSlip: async ({ request, params }) => {
		const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
		
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

			// ตรวจสอบขนาดไฟล์
			if (slip.size > 5 * 1024 * 1024) {
				return { success: false, error: 'ไฟล์ใหญ่เกิน 5MB' };
			}

			// ดึง Order เพื่อเช็คจำนวนเงิน
			const order = await pb.collection('Order').getOne(params.orderId);

			// ค้นหา Payment record
			const payments = await pb.collection('Payment').getFullList({
				filter: `Order_ID = "${params.orderId}"`
			});
			
			if (!payments || payments.length === 0) {
				return { success: false, error: 'ไม่พบข้อมูลการชำระเงิน' };
			}
			
			const payment = payments[0];
			const restaurant = await pb.collection('Shop').getOne(params.id);

			// ตรวจสอบสลิปด้วย OK Slip API
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
				restaurant.Phone || PUBLIC_ADMIN_PROMPTPAY_PHONE || ''
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

			// TODO: สร้าง Advertisement จริงใน shop_advertisements collection
			// ดึงข้อมูล package และสร้าง advertisement
			
			console.log('✅ Advertise payment completed for Order:', order.id);

			return { success: true };
		} catch (error: any) {
			console.error('Error uploading slip:', error);
			return { 
				success: false, 
				error: error.message || 'เกิดข้อผิดพลาดในการอัพโหลด' 
			};
		}
	}
} satisfies Actions;