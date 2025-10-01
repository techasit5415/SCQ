import type { PageServerLoad } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
	try {
		// ใช้ hardcode user ID เหมือนหน้าอื่นๆ
		const userId = "5v70v6p91pfakvb";
		
		console.log('🔔 Loading notifications for User ID:', userId);
		
		// ดึงการแจ้งเตือนจาก Order และ Payment ที่เกี่ยวข้องกับ user
		const notifications = [];
		
		// 1. ดึง Order records ล่าสุด 10 รายการ
		const orderRecords = await pb.collection('Order').getFullList({
			filter: `User_ID = "${userId}"`,
			sort: '-created',
			limit: 10
		});
		
		// สร้างการแจ้งเตือนจาก Order records
		for (const order of orderRecords) {
			notifications.push({
				id: order.id,
				type: 'order',
				title: 'การสั่งซื้อของคุณ',
				message: `คำสั่งซื้อ #${order.id.slice(-8)} ${order.Status ? 'อัปเดตสถานะแล้ว' : 'รอดำเนินการ'}`,
				status: order.Status ? 'success' : 'pending',
				amount: order.Total_Price || 0,
				time: order.created,
				icon: order.Status ? '✅' : '⏳',
				read: false
			});
		}
		
		// 2. ดึง Payment records ล่าสุด 5 รายการ (เพิ่มเติม)
		const paymentRecords = await pb.collection('Payment').getFullList({
			filter: `User_ID = "${userId}"`,
			sort: '-created',
			limit: 5
		});
		
		// สร้างการแจ้งเตือนจาก Payment records
		for (const payment of paymentRecords) {
			notifications.push({
				id: `payment_${payment.id}`,
				type: 'payment',
				title: 'การชำระเงิน',
				message: `การชำระเงิน #${payment.id.slice(-8)} ${payment.Status === 'Success' ? 'สำเร็จแล้ว' : 'กำลังดำเนินการ'}`,
				status: payment.Status === 'Success' ? 'success' : 'pending',
				amount: payment.Total_Price || 0,
				time: payment.created,
				icon: payment.Status === 'Success' ? '💰' : '💳',
				read: false
			});
		}
		
		// 3. ดึง Point records ล่าสุด 5 รายการ
		const pointRecords = await pb.collection('Point').getFullList({
			filter: `User_ID = "${userId}"`,  
			sort: '-created',
			limit: 5
		});
		
		// สร้างการแจ้งเตือนจาก Point records
		for (const point of pointRecords) {
			notifications.push({
				id: `point_${point.id}`,
				type: 'point',
				title: 'SCQ Point',
				message: `คุณมี ${point.Point} แต้ม`,
				status: 'info',
				amount: point.Point,
				time: point.created,
				icon: '💎',
				read: false
			});
		}
		
		// เรียงลำดับตามเวลาล่าสุด
		notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
		
		console.log('🔔 Found notifications:', notifications.length);
		
		return {
			notifications: notifications.slice(0, 20), // จำกัด 20 รายการ
			totalCount: notifications.length
		};
		
	} catch (error) {
		console.error('❌ Error loading notifications:', error);
		
		// ข้อมูล fallback
		return {
			notifications: [
				{
					id: 'welcome',
					type: 'system',
					title: 'ยินดีต้อนรับ',
					message: 'ยินดีต้อนรับสู่ SCQ! เริ่มสั่งอาหารได้เลย',
					status: 'info',
					time: new Date().toISOString(),
					icon: '🎉',
					read: false
				}
			],
			totalCount: 1
		};
	}
};