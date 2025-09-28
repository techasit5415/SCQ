import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ params, cookies }) => {
  const session = cookies.get('session');
  console.log('Session cookie in restaurant detail:', session);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  const restaurantId = params.id;
  
  // Skip static routes - these should be handled by their own routes
  if (restaurantId === 'AddRestaurant' || restaurantId === 'edit') {
    console.log('Skipping dynamic route for static path:', restaurantId);
    throw error(404, { message: 'Restaurant not found' });
  }
  
  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Admin authentication
    try {
      await pb.admins.authWithPassword(
        privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com', 
        privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123'
      );
      console.log('Admin authenticated successfully');
    } catch (authError) {
      console.log('Admin auth failed, trying without auth...');
    }
    
    // ดึงข้อมูลร้านอาหารตาม ID
    try {
      console.log('Fetching restaurant with ID:', restaurantId);
      const restaurant = await pb.collection('Shop').getOne(restaurantId, {
        expand: 'User_Owner_ID'
      });
      console.log('Restaurant found:', restaurant);
      
      // ดึงข้อมูล shops ทั้งหมดสำหรับ sidebar
      let shops: any[] = [];
      try {
        console.log('Fetching all shops for sidebar...');
        shops = await pb.collection('Shop').getFullList({
          sort: '-created'
        });
        console.log('Shops for sidebar:', shops);
      } catch (shopError) {
        console.log('Error fetching shops:', shopError);
      }
      
      // ดึงข้อมูล users สำหรับแสดงชื่อ owner
      let users: any[] = [];
      try {
        console.log('Fetching users...');
        users = await pb.collection('users').getFullList();
        console.log('Users:', users);
      } catch (userError) {
        console.log('Error fetching users:', userError);
      }
      
      return {
        restaurant,
        shops,
        users
      };
    } catch (fetchError) {
      console.error('Error fetching restaurant:', fetchError);
      throw error(404, 'Restaurant not found');
    }
    
  } catch (err) {
    console.error('Error loading restaurant data:', err);
    throw error(500, 'Failed to load restaurant data');
  }
};