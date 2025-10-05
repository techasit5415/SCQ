import type { PageServerLoad, Actions } from '../$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { page } from '$app/state';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ params }: { params: { id: string } }) => {
  console.log('Session valid, loading homeadmin page');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Initialize stats object

    let stats = {
      payments: 0,
      orders: 0,
      menus: 0
    }

    // ดึงข้อมูลรายละเอียดของ Payment
    let paymentData = []
    try {
      console.log('Fetching payments count...');
      const paymentCount = await pb.collection('Payment').getFullList({
        filter: `Shop_ID = "${params.id}"`,
        expand: 'Order_ID, Order_ID.Menu_ID, User_ID'
    });
      console.log('Payments count result:', paymentCount);
      console.log('Payments totalItems:', paymentCount.length);
      stats.payments = paymentCount.length;
      paymentData = paymentCount; // เก็บข้อมูล payment แบบละเอียด
    } catch (error) {
      console.log('Error fetching payment:', error);
    }

    // ดึงข้อมูลรายละเอียดของ Menu
    let menuData = []
    try {
      console.log('Fetching orders count...');
      const menuCount = await pb.collection('Menu').getFullList({
        filter: `Shop_ID = "${params.id}"`
      });
      console.log('Menu count result:', menuCount);
      console.log('Menu totalItems:', menuCount.length);
      stats.menus = menuCount.length;
      menuData = menuCount; // เก็บข้อมูล menu แบบละเอียด
    } catch (error) {
      console.log('Error fetching users:', error);
    }

    const result = {
      payments: paymentData,
      menus: menuData
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data if database connection fails
    return {
      payments: [],
      menus: []
    };
  }
};