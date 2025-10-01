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

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	createOrder: async ({ request }) => {
		try {
			const formData = await request.formData();
			const orderData = JSON.parse(formData.get('orderData') as string);
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
			
			// เพิ่ม optional fields ทีละตัว
			if (orderData.note && orderData.note.trim()) {
				createData.Note = orderData.note.trim();
			}
			
			console.log('📝 Final createData:', JSON.stringify(createData, null, 2));
			
			// สร้าง Order record
			const orderRecord = await pb.collection('Order').create(createData);
			console.log('✅ Order created:', orderRecord.id);
			
			// สร้าง Payment record ที่เชื่อมโยงกับ Order
			const paymentData = {
                User_ID: "2giyhm2due2kb1g",
				Shop_ID: shopId,
				Order_ID: orderRecord.id,
				Method_Payment: getPaymentMethodName(orderData.paymentMethod),
				Total_Amount: orderData.total + 5,
				status: "success"
			};
			
			console.log('💳 Creating payment:', JSON.stringify(paymentData, null, 2));
			
			let paymentRecord;
			try {
				paymentRecord = await pb.collection('Payment').create(paymentData);
				console.log('✅ Payment created:', paymentRecord.id);
			} catch (paymentError) {
				console.error('❌ Payment creation failed:', paymentError);
				console.error('💳 Payment data that failed:', JSON.stringify(paymentData, null, 2));
				throw paymentError;
			}
			
			return {
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