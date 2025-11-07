import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ locals, params, url }: any) => {
    const shopId = params.id;
    const dateStr = url.searchParams.get('date');
    
    if (!dateStr) {
        throw error(400, 'Date parameter is required');
    }
    
    // Check authentication
    if (!locals.user || locals.role !== 'restaurant') {
        throw error(401, 'Authentication required');
    }
    
    const pb = locals.pb;
    
    try {
        // ดึงข้อมูลร้าน
        const shop = await pb.collection('Shop').getOne(shopId);
        
        console.log('=== REPORT DEBUG ===');
        console.log('Requested date string:', dateStr);
        
        // แปลง date string (YYYY-MM-DD)
        const [year, month, day] = dateStr.split('-').map(Number);
        console.log('Parsed date:', { year, month, day });
        
        // สร้างช่วงเวลาของวันที่เลือกในเวลาไทย แล้วแปลงเป็น UTC
        // วันที่ 8 พ.ย. 2568 เวลา 00:00:00 ไทย (UTC+7) = 7 พ.ย. 2568 เวลา 17:00:00 UTC
        // วันที่ 8 พ.ย. 2568 เวลา 23:59:59 ไทย (UTC+7) = 8 พ.ย. 2568 เวลา 16:59:59 UTC
        
        // สร้างเวลาเริ่มต้นวัน (00:00:00 ไทย)
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        startDate.setHours(startDate.getHours() - 7); // ลบ 7 ชั่วโมงเพื่อแปลงเป็น UTC
        
        // สร้างเวลาสิ้นสุดวัน (23:59:59 ไทย)
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        endDate.setHours(endDate.getHours() - 7); // ลบ 7 ชั่วโมงเพื่อแปลงเป็น UTC
        
        const startStr = startDate.toISOString().replace('T', ' ').replace('Z', '');
        const endStr = endDate.toISOString().replace('T', ' ').replace('Z', '');
        
        console.log('Start Date (Thai):', `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')} 00:00:00`);
        console.log('End Date (Thai):', `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')} 23:59:59`);
        console.log('Start Date (UTC):', startStr);
        console.log('End Date (UTC):', endStr);
        
        // ดึง Orders ของวันที่เลือก
        const dayOrders = await pb.collection('Order').getFullList({
            filter: `Shop_ID="${shopId}" && created >= "${startStr}" && created <= "${endStr}"`,
            expand: 'Menu_ID'
        });
        
        console.log('Total orders found:', dayOrders.length);
        if (dayOrders.length > 0) {
            console.log('First order created:', dayOrders[0].created);
            console.log('Last order created:', dayOrders[dayOrders.length - 1].created);
        }
        
        // ดึง Payments ของวันที่เลือก
        const dayPayments = await pb.collection('Payment').getFullList({
            filter: `Shop_ID="${shopId}" && created >= "${startStr}" && created <= "${endStr}"`
        });
        
        // สร้าง Payment Map
        const paymentMap = new Map<string, any>();
        dayPayments.forEach((payment: any) => {
            if (payment.Order_ID) {
                paymentMap.set(payment.Order_ID, payment);
            }
        });
        
        console.log('Total payments found:', dayPayments.length);
        console.log('Payments with Success status:', dayPayments.filter(p => p.status === 'Success').length);
        
        // กรองเอาเฉพาะ orders ที่จ่ายเงินสำเร็จแล้ว (Payment Status = Success)
        const paidOrders = dayOrders.filter((order: any) => {
            const payment = paymentMap.get(order.id);
            return payment && payment.status === 'Success';
        });
        
        console.log('Orders with successful payment:', paidOrders.length);
        
        // คำนวณสถิติ (นับเฉพาะออเดอร์ที่จ่ายเงินสำเร็จแล้ว)
        const totalOrders = paidOrders.length; // นับเฉพาะที่จ่ายเงินแล้ว
        const completedOrders = paidOrders.filter((o: any) => o.Status === 'Completed').length;
        const canceledOrders = paidOrders.filter((o: any) => o.Status === 'Canceled').length;
        const pendingOrders = paidOrders.filter((o: any) => o.Status !== 'Completed' && o.Status !== 'Canceled').length;
        
        // ยอดขายรวม (จากออเดอร์ที่จ่ายเงินสำเร็จ)
        const totalRevenue = paidOrders.reduce((sum: number, order: any) => sum + (order.Total_Amount || 0), 0);
        const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
        
        console.log('Statistics:', {
            totalOrders,
            completedOrders,
            canceledOrders,
            pendingOrders,
            totalRevenue,
            avgOrderValue
        });
        
        // Payment Methods Breakdown
        const paymentMethodsMap = new Map<string, { count: number, revenue: number }>();
        dayPayments.forEach((payment: any) => {
            if (payment.status === 'Success') {
                const method = payment.Method_Payment || 'Unknown';
                const existing = paymentMethodsMap.get(method) || { count: 0, revenue: 0 };
                existing.count++;
                existing.revenue += payment.Total_Amount || 0;
                paymentMethodsMap.set(method, existing);
            }
        });
        
        const paymentMethods = Array.from(paymentMethodsMap.entries()).map(([method, data]) => ({
            method,
            count: data.count,
            revenue: data.revenue,
            percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
        }));
        
        // Popular Menus (ใช้เฉพาะออเดอร์ที่จ่ายเงินสำเร็จ)
        const menuCount = new Map<string, { name: string, quantity: number, revenue: number }>();
        paidOrders.forEach((order: any) => {
            if (order.expand?.Menu_ID && Array.isArray(order.expand.Menu_ID)) {
                order.expand.Menu_ID.forEach((menu: any) => {
                    if (menu.field === shopId) {
                        const menuName = menu.name || 'Unknown';
                        const existing = menuCount.get(menuName) || { name: menuName, quantity: 0, revenue: 0 };
                        existing.quantity++;
                        const menuShare = (order.Total_Amount || 0) / (order.expand.Menu_ID.length || 1);
                        existing.revenue += menuShare;
                        menuCount.set(menuName, existing);
                    }
                });
            }
        });
        
        const popularMenus = Array.from(menuCount.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        
        // Hourly Orders (นับเฉพาะออเดอร์ที่จ่ายเงินสำเร็จแล้ว)
        const hourlyCount = Array(24).fill(0).map(() => ({ orders: 0 }));
        paidOrders.forEach((order: any) => {
            const orderTime = new Date(order.created);
            // แปลง UTC เป็นเวลาไทย (UTC+7)
            const localHour = (orderTime.getUTCHours() + 7) % 24;
            hourlyCount[localHour].orders++;
        });
        
        const hourlyOrders = hourlyCount.map((data, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            orders: data.orders
        }));
        
        console.log('Hourly distribution (paid orders only):', hourlyOrders.filter(h => h.orders > 0));
        
        // สร้าง Date object สำหรับแสดงผล
        const displayDate = new Date(year, month - 1, day);
        
        // สร้าง response
        const reportData = {
            shopName: shop.name,
            reportDate: displayDate.toLocaleDateString('th-TH', { 
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            }),
            totalOrders,
            completedOrders,
            canceledOrders,
            totalRevenue,
            avgOrderValue,
            paymentMethods,
            popularMenus,
            hourlyOrders
        };
        
        return json(reportData);
        
    } catch (err) {
        console.error('Error fetching report data:', err);
        throw error(500, 'Failed to fetch report data');
    }
};
