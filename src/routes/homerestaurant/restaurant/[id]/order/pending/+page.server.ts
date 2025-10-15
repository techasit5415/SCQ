import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD } from '$env/static/private';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ params }) => {
  const shopId = params.id;
  console.log('=== Loading Pending Orders for Shop:', shopId, '===');

  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(
      POCKETBASE_ADMIN_EMAIL,
      POCKETBASE_ADMIN_PASSWORD
    );

    // ดึงข้อมูล Orders ที่มี Status = "Pending" และเป็นของร้านนี้เท่านั้น
    const pendingOrders = await pb.collection('Order').getFullList({
      filter: `Shop_ID = "${shopId}" && Status = "Pending"`,
      expand: 'User_ID,Menu_ID',
      sort: '-created'
    });

    console.log('Pending Orders:', pendingOrders.length);

    // ดึงข้อมูล Shop
    const shop = await pb.collection('Shop').getOne(shopId);

    return {
      shop,
      orders: pendingOrders,
      shopId
    };

  } catch (err) {
    console.error('Error loading pending orders:', err);
    throw error(500, 'Failed to load orders');
  }
};