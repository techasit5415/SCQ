import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }: any) => {
    // console.log('🔍 API /completed-orders called');
    // console.log('User:', locals.user?.id, 'Role:', locals.role);
    
    // ตรวจสอบว่า login แล้วและเป็น customer
    if (!locals.user || locals.role !== 'customer') {
        // console.error('❌ Unauthorized access');
        throw error(401, 'Unauthorized');
    }

    const pb = locals.pb;
    const userId = locals.user.id;

    try {
        // ดึงออเดอร์ที่ completed ทั้งหมดของ customer
        // console.log(`🔍 Looking for completed orders for customer: ${userId}`);

        // ดึงออเดอร์ที่ Status = Completed (จำกัดแค่ 20 รายการล่าสุด)
        const completedOrders = await pb.collection('Order').getList(1, 20, {
            filter: `User_ID="${userId}" && Status="Completed"`,
            expand: 'Shop_ID,Menu_ID',
            sort: '-updated'
        });

        // console.log(`📦 Found ${completedOrders.items.length} completed orders`);

        // เช็คแต่ละออเดอร์ว่ามี payment success หรือไม่
        const validOrders = [];
        
        for (const order of completedOrders.items) {
            try {
                // ดึง payment ของออเดอร์นี้
                const payments = await pb.collection('Payment').getFirstListItem(
                    `Order_ID="${order.id}" && status="Success"`
                ).catch(() => null);

                if (payments) {
                    // console.log(`✅ Order ${order.id} has successful payment`);
                    validOrders.push({
                        id: order.id,
                        shopName: order.expand?.Shop_ID?.name || 'Unknown',
                        totalAmount: order.Total_Amount || 0,
                        menuCount: Array.isArray(order.expand?.Menu_ID) ? order.expand.Menu_ID.length : 0,
                        completedAt: order.updated,
                        queueNumber: order.QueueNumber || null
                    });
                } else {
                    // console.log(`⚠️ Order ${order.id} has no successful payment`);
                }
            } catch (err) {
                console.error('Error checking payment for order:', order.id, err);
            }
        }

        // console.log(`✅ Returning ${validOrders.length} valid orders`);

        return json({
            success: true,
            orders: validOrders,
            count: validOrders.length
        });

    } catch (err) {
        console.error('❌ Error fetching completed orders:', err);
        throw error(500, 'Failed to fetch completed orders');
    }
};
