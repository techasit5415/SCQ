import type { PageServerLoad } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async () => {
	try {
		const userId = "5v70v6p91pfakvb"; // ใช้ User ID เดียวกับที่ใช้ในการสร้าง Order
		
		// ดึงข้อมูล orders ของผู้ใช้คนนี้เท่านั้น
		const orders = await pb.collection('Order').getFullList({
			filter: `User_ID = "${userId}"`,
			sort: '-created', // เรียงตามวันที่สร้างล่าสุดก่อน
			expand: 'Shop_ID,Menu_ID,Note' // ขยายข้อมูล relation รวม Note
		});
		
		// คำนวณลำดับคิวสำหรับแต่ละ order ที่ยังไม่เสร็จ
		const ordersWithQueuePosition = await Promise.all(orders.map(async (order: any) => {
			let queuePosition = null;
			
			// คำนวณเฉพาะ order ที่มีสถานะ Pending หรือ In-progress
			// if (order.Status === 'Pending' || order.Status === 'In-progress') {
				if (order.Status === 'In-progress') {
				try {
					// ดึง order ทั้งหมดของร้านเดียวกันที่สร้างก่อนหน้านี้และยังไม่เสร็จ
					const queueOrders = await pb.collection('Order').getFullList({
						// filter: `Shop_ID = "${order.Shop_ID}" && created <= "${order.created}" && (Status = "Pending" || Status = "In-progress")`,
						filter: `Shop_ID = "${order.Shop_ID}" && created <= "${order.created}" && (Status = "In-progress")`,

						sort: 'created'
					});
					
					// หาตำแหน่งของ order นี้ในคิว (เริ่มนับจาก 1)
					queuePosition = queueOrders.findIndex((qOrder: any) => qOrder.id === order.id) + 1;
					
					console.log(`🎯 Order ${order.id.slice(-8)} at ${order.expand?.Shop_ID?.name}: position ${queuePosition}/${queueOrders.length}`);
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

		// จับคู่ payment กับ order และเพิ่มข้อมูลคิว
		const ordersWithPayment = ordersWithQueuePosition.map((order: any) => ({
			...order,
			payment: payments.find(p => p.Order_ID === order.id)
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