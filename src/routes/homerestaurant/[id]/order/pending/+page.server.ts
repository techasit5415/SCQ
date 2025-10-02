import type { PageServerLoad, Actions } from '../$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  console.log('Session cookie in homeadmin:', session);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  console.log('Session valid, loading homeadmin page');

  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Initialize stats object

    let stats = {
      orders: 0,
      menus: 0
    }

    // ดึงข้อมูลรายละเอียดของ Peending
    let orderData = []
    try {
      console.log('Fetching orders count...');
      const orderCount = await pb.collection('Order').getFullList({
        filter: 'Status = "Pending"'
    });
      console.log('Orders count result:', orderCount);
      console.log('Orders totalItems:', orderCount.length);
      stats.orders = orderCount.length;
      orderData = orderCount; // เก็บข้อมูล order แบบละเอียด
    } catch (error) {
      console.log('Error fetching users:', error);
    }

    // ดึงข้อมูลรายละเอียดของ Menu
    let menuData = []
    try {
      console.log('Fetching orders count...');
      const menuCount = await pb.collection('Menu').getFullList({});
      console.log('Menu count result:', menuCount);
      console.log('Menu totalItems:', menuCount.length);
      stats.menus = menuCount.length;
      menuData = menuCount; // เก็บข้อมูล menu แบบละเอียด
    } catch (error) {
      console.log('Error fetching users:', error);
    }

    const result = {
      orders: orderData,
      menus: menuData
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data if database connection fails
    return {
      orders: [],
      menus: []
    };
  }
};