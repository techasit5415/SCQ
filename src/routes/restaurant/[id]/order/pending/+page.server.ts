import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
  // บอก SvelteKit ว่า load function นี้ depend on 'orders:pending'
  depends('orders:pending');
  
  const shopId = params.id;
  console.log('=== Loading Pending Orders for Shop:', shopId, '===');

  // Check authentication
  if (!locals.user || locals.role !== 'restaurant') {
    throw error(401, 'Authentication required');
  }

  const pb = locals.pb;

  try {

    // ดึงข้อมูล Orders ที่มี Status = "Pending" และเป็นของร้านนี้เท่านั้น
    // เพิ่ม $autoCancel: false เพื่อป้องกัน auto-cancel
    const pendingOrders = await pb.collection('Order').getFullList({
      filter: `Shop_ID="${shopId}" && Status="Pending"`,
      expand: 'User_ID,Menu_ID',
      sort: '-created',
      $autoCancel: false
    });

    console.log('Total Pending Orders (before payment filter):', pendingOrders.length);

    // ดึงข้อมูล Payment สำหรับ Orders ที่ Pending
    const orderIds = pendingOrders.map(order => order.id);
    let payments: any[] = [];
    
    if (orderIds.length > 0) {
      const paymentFilter = orderIds.map(id => `Order_ID="${id}"`).join(' || ');
      payments = await pb.collection('Payment').getFullList({
        filter: paymentFilter,
        $autoCancel: false
      });
      console.log('Payments found:', payments.length);
    }

    // สร้าง Set ของ Order IDs ที่ชำระเงินสำเร็จแล้ว
    const paidOrderIds = new Set(
      payments
        .filter(payment => payment.status === 'Success')
        .map(payment => payment.Order_ID)
    );

    console.log('Orders with successful payment:', paidOrderIds.size);

    // กรองเอาเฉพาะ Orders ที่ชำระเงินสำเร็จแล้ว
    const paidPendingOrders = pendingOrders.filter(order => paidOrderIds.has(order.id));

    console.log('Pending Orders (after payment filter):', paidPendingOrders.length);
    console.log('Sample orders:', paidPendingOrders.slice(0, 3).map(o => ({ 
      id: o.id, 
      status: o.Status,
      hasPaidPayment: paidOrderIds.has(o.id)
    })));

    // ดึงข้อมูล Notes สำหรับแต่ละ Order ที่ผ่านการกรอง
    const filteredOrderIds = paidPendingOrders.map(order => order.id);
    let notes: any[] = [];
    
    if (filteredOrderIds.length > 0) {
      const noteFilter = filteredOrderIds.map(id => `Order_ID="${id}"`).join(' || ');
      notes = await pb.collection('Note').getFullList({
        filter: noteFilter,
        $autoCancel: false
      });
    }

    // เพิ่ม notes และ payment info เข้าไปใน orders
    const ordersWithNotes = paidPendingOrders.map(order => {
      const orderNotes = notes.filter(note => note.Order_ID === order.id);
      const orderPayment = payments.find(payment => payment.Order_ID === order.id);
      return {
        ...order,
        notes: orderNotes,
        payment: orderPayment
      };
    });

    // ดึงข้อมูล Shop
    const shop = await pb.collection('Shop').getOne(shopId);

    return {
      shop,
      orders: ordersWithNotes,
      shopId
    };

  } catch (err) {
    console.error('Error loading pending orders:', err);
    throw error(500, 'Failed to load orders');
  }
};