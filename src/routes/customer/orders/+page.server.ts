import type { PageServerLoad } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async () => {
	try {
		// ดึงข้อมูล orders ทั้งหมดพร้อมข้อมูล relations รวม Payment
		const orders = await pb.collection('Order').getFullList({
			sort: '-created', // เรียงตามวันที่สร้างล่าสุดก่อน
			expand: 'Shop_ID,Menu_ID' // ขยายข้อมูล relation
		});

		// ดึงข้อมูล payments ที่เกี่ยวข้องกับ orders เหล่านี้
		const orderIds = orders.map((order: any) => order.id);
		let payments: any[] = [];
		if (orderIds.length > 0) {
			payments = await pb.collection('Payment').getFullList({
				filter: orderIds.map(id => `Order_ID="${id}"`).join(' || '),
				expand: 'Order_ID'
			});
		}

		// จับคู่ payment กับ order
		const ordersWithPayment = orders.map((order: any) => ({
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