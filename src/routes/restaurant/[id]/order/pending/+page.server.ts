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

    console.log('Pending Orders:', pendingOrders.length);
    console.log('Sample orders:', pendingOrders.slice(0, 3).map(o => ({ id: o.id, status: o.Status })));

    // ดึงข้อมูล Notes สำหรับแต่ละ Order
    const orderIds = pendingOrders.map(order => order.id);
    let notes: any[] = [];
    if (orderIds.length > 0) {
      const noteFilter = orderIds.map(id => `Order_ID="${id}"`).join(' || ');
      notes = await pb.collection('Note').getFullList({
        filter: noteFilter,
        $autoCancel: false
      });
    }

    // เพิ่ม notes เข้าไปใน orders
    const ordersWithNotes = pendingOrders.map(order => {
      const orderNotes = notes.filter(note => note.Order_ID === order.id);
      return {
        ...order,
        notes: orderNotes
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