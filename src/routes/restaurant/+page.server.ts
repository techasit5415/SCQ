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
      shops: 0,
    }

    // ดึงข้อมูลรายละเอียดของ Peending
    let shopData = []
    try {
      console.log('Fetching shop count...');
      const shopCount = await pb.collection('Shop').getFullList({});
      console.log('Shop count result:', shopCount);
      console.log('Shop totalItems:', shopCount.length);
      stats.shops = shopCount.length;
      shopData = shopCount; // เก็บข้อมูล order แบบละเอียด
    } catch (error) {
      console.log('Error fetching shop:', error);
    }

    const result = {
      shops: shopData,
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading shop data:', error);
    
    // Return fallback data if database connection fails
    return {
      shops: []
    };
  }
};