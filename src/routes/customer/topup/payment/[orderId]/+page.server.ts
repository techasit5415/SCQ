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

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ SlipOK API error:', response.status);
			console.error('❌ Error response:', errorText);
			return { success: false, error: 'ไม่สามารถตรวจสอบสลิปได้' };
		}

		const data = await response.json();
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
	
	// ต้อง login ถึงจะดูหน้านี้ได้
	if (!locals.user) {
		throw redirect(303, '/');
	}

	try {
		// ดึงข้อมูล Order
		const order = await pb.collection('Order').getOne(params.orderId);
		
		// ตรวจสอบว่า Order เป็นของ User คนนี้
		if (order.User_ID !== locals.user.id) {
			throw redirect(303, '/customer/topup');
		}

		// ดึงข้อมูล Payment record
		const payments = await pb.collection('Payment').getFullList({
			filter: `Order_ID = "${params.orderId}"`,
			sort: '-created'
		});
		
		const payment = payments[0];

		// ถ้าไม่มี Payment หรือไม่ใช่ Point -> redirect
		if (!payment || payment.Method_Payment !== 'Point') {
			throw redirect(303, '/customer/topup');
		}

		// ถ้าชำระเงินสำเร็จแล้ว -> redirect
		if (payment.status === 'Success') {
			throw redirect(303, '/customer/topup');
		}

		return {
			order: {
				id: order.id,
				total: order.Total_Amount,
				created: order.created
			},
			payment: {
				id: payment.id,
				status: payment.status
			},
			adminPhone: PUBLIC_ADMIN_PROMPTPAY_PHONE || '0812345678'
		};
	} catch (error: any) {
		console.error('Error loading topup payment page:', error);
		
		// ถ้าเป็น redirect error ให้ throw ต่อ
		if (error.status === 303) {
			throw error;
		}
		
		throw redirect(303, '/customer/topup');
	}
};

export const actions = {
	uploadSlip: async ({ request, params, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'กรุณาเข้าสู่ระบบ' };
		}

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

			// ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
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
				PUBLIC_ADMIN_PROMPTPAY_PHONE || ''
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

			// 🎯 Auto เติม Point ให้ User
			try {
				// ดึง Point record ของ user
				const userPoints = await pb.collection('Point').getFullList({
					filter: `User_ID = "${locals.user.id}"`
				});

				const pointAmount = order.Total_Amount; // 1 บาท = 1 Point

				if (userPoints.length > 0) {
					// อัปเดต Point ที่มีอยู่
					const currentPoint = userPoints[0];
					await pb.collection('Point').update(currentPoint.id, {
						Point: currentPoint.Point + pointAmount
					});
					console.log(`✅ Added ${pointAmount} points to user ${locals.user.id}`);
				} else {
					// สร้าง Point record ใหม่
					await pb.collection('Point').create({
						User_ID: locals.user.id,
						Point: pointAmount
					});
					console.log(`✅ Created Point record with ${pointAmount} points for user ${locals.user.id}`);
				}
			} catch (pointError: any) {
				console.error('❌ Error adding points:', pointError);
				// ถ้าเพิ่ม Point ไม่ได้ ให้ลบ Payment Success ออก
				await pb.collection('Payment').update(payment.id, {
					status: 'Pending'
				});
				return { 
					success: false, 
					error: 'ไม่สามารถเติม Point ได้ กรุณาติดต่อ Admin' 
				};
			}

			// TODO: Admin ต้องมาอนุมัติและเพิ่ม Point ให้ user ด้วยตนเอง
			// หรือทำระบบ Auto-approve ถ้าต้องการ

			console.log('✅ Topup slip uploaded, waiting for admin approval');

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
