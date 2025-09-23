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
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Initialize stats object
    let stats = {
    
    };
    let shops: any[] = [];

    // Authenticate as admin first
    try {
      await pb.admins.authWithPassword(
        privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com', 
        privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123'
      );
      console.log('Admin authenticated successfully');
    } catch (authError) {
      console.log('Admin auth failed, trying without auth...');
    }
    


    // ดึงข้อมูล Shops สำหรับแสดงในตาราง
    try {
      console.log('Fetching shops...');
      shops = await pb.collection('Shop').getFullList({
        expand: 'User_Owner_ID',
        sort: '-created'
      });
      console.log('Shops result:', shops);
    } catch (error) {
      console.log('Error fetching shops:', error);
    }

    const result = {
      stats,
      shops,
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data if database connection fails
    return {
      stats: {
        users: 0,
    
      },
      shops: [],
      users: []
    };
  }
};

