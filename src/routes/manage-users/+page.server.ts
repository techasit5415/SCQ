import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ cookies }) => {
  // const session = cookies.get('session');
  // console.log('Session cookie in manage-users:', session);

  // // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  // if (!session || !session.match(/^\d+$/)) {
  //     console.log('No valid session, redirecting to /admin');
  //     // throw redirect(302, '/admin');
  // }

  console.log('Loading manage users page (session check disabled)');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

  try {
    console.log('Attempting to connect to PocketBase...');
    
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
    
    // ดึงข้อมูล Users ทั้งหมดพร้อม Role
    try {
      console.log('Fetching users with roles...');
      const users = await pb.collection('users').getFullList({
        expand: 'Role',
        sort: '-created'
      });
      console.log('Users result:', users);
      
      return {
        users: users
      };
    } catch (error) {
      console.log('Error fetching users:', error);
      return {
        users: []
      };
    }

  } catch (error) {
    console.error('Error loading manage users data:', error);
    
    return {
      users: []
    };
  }
};