import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;
		
		if (!user?.id) {
			return json({ count: 0 });
		}
		
		const userId = user.id;
		
		// นับการแจ้งเตือนภายใน 1 ชั่วโมงล่าสุด
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
		const filterTime = oneHourAgo.toISOString();
		
		console.log('🔍 Checking notifications for user:', userId);
		console.log('🕐 Since:', filterTime);
		
		const orderCount = await pb.collection('Order').getList(1, 1, {
			filter: `User_ID = "${userId}" && created > "${filterTime}"`,
			$autoCancel: false
		});
		
		console.log('📦 Orders found:', orderCount.totalItems);
		
		const paymentCount = await pb.collection('Payment').getList(1, 1, {
			filter: `User_ID = "${userId}" && created > "${filterTime}"`,
			$autoCancel: false
		});
		
		console.log('💳 Payments found:', paymentCount.totalItems);
		
		const totalUnread = orderCount.totalItems + paymentCount.totalItems;
		
		console.log('🔔 Total unread:', totalUnread);
		
		return json({ count: totalUnread });
		
	} catch (error) {
		console.error('❌ Error counting unread notifications:', error);
		return json({ count: 0 });
	}
};
