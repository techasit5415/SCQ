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
      users: 0,
    };



    
    // ดึงจำนวน Users ทั้งหมด
    let usersData = [];
    try {
      console.log('Fetching users count...');
      const usersCount = await pb.collection('users').getFullList();
      console.log('Users count result:', usersCount);
      console.log('Users totalItems:', usersCount.length);
      stats.users = usersCount.length;
      usersData = usersCount; // เก็บข้อมูล users แบบละเอียด
    } catch (error) {
      console.log('Error fetching users:', error);
    }


    const result = {
      users: usersData // เพิ่มข้อมูล users แบบละเอียด
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data if database connection fails
    return {
      users: []
    };
  }
};


