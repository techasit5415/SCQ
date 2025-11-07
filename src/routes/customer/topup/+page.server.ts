import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL, PUBLIC_ADMIN_PROMPTPAY_PHONE } from '$env/static/public';

export const load: PageServerLoad = async ({ locals }) => {
	// ต้อง login ถึงจะเข้าหน้านี้ได้
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
	const userId = locals.user.id;

	try {
		// ดึงข้อมูล Point ปัจจุบัน
		const userPointRecords = await pb.collection('Point').getFullList({
			filter: `User_ID = "${userId}"`,
			sort: '-created'
		});

		let currentPoints = 0;
		if (userPointRecords.length > 0) {
			currentPoints = userPointRecords[0].Point || 0;
		}

		// ดึงประวัติการเติมเงิน (Payment records ที่เป็น Point)
		const topupHistory = await pb.collection('Payment').getFullList({
			filter: `User_ID = "${userId}" && Method_Payment = "Point"`,
			sort: '-created',
			expand: 'Order_ID',
			limit: 50
		});

		return {
			currentPoints,
			topupHistory,
			adminPhone: PUBLIC_ADMIN_PROMPTPAY_PHONE || '0812345678'
		};
	} catch (error) {
		console.error('Error loading topup page:', error);
		return {
			currentPoints: 0,
			topupHistory: [],
			adminPhone: PUBLIC_ADMIN_PROMPTPAY_PHONE || '0812345678'
		};
	}
};

export const actions = {
	// สร้าง Topup Request
	createTopup: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
		}

		const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
		const userId = locals.user.id;

		const formData = await request.formData();
		const amount = parseInt(formData.get('amount') as string);

		if (!amount || amount < 1) {
			return fail(400, { error: 'กรุณาระบุจำนวนเงิน' });
		}

		try {
			// ใช้ Shop และ Menu ID พิเศษสำหรับระบบ Top-up
			const TOPUP_SHOP_ID = '000000000000001';
			const TOPUP_MENU_ID = '000000000000001';

			// สร้าง Order สำหรับการเติมเงิน
			const order = await pb.collection('Order').create({
				User_ID: userId,
				Total_Amount: amount,
				Status: 'Pending',
				Shop_ID: TOPUP_SHOP_ID,
				Menu_ID: [TOPUP_MENU_ID]
			});

			// สร้าง Payment record สำหรับการเติมเงิน
			await pb.collection('Payment').create({
				User_ID: userId,
				Shop_ID: TOPUP_SHOP_ID,
				Order_ID: order.id,
				Method_Payment: 'Point',
				Total_Amount: amount,
				status: 'Pending'
			});

			console.log('✅ Topup request created:', order.id);

			// Redirect อยู่นอก try-catch
			throw redirect(303, `/customer/topup/payment/${order.id}`);
			
		} catch (error: any) {
			// ถ้าเป็น redirect ให้ throw ต่อ
			if (error?.status >= 300 && error?.status < 400) {
				throw error;
			}
			
			console.error('Error creating topup:', error);
			return fail(500, { error: 'ไม่สามารถสร้างคำขอเติมเงินได้' });
		}
	}
} satisfies Actions;
