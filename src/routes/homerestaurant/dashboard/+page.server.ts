import type { PageServerLoad, Actions } from '../$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable

// let PUBLIC_POCKETBASE_URL = 'http://10.1.1.113:8080'
// const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

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
  
  // console.log('PocketBase URL:', PUBLIC_POCKETBASE_URL);
  
  const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Initialize stats object
    let stats = {
      users: 0,
      orders: 0,
      dishes: 0,
      canceled: 0
    };
    let shops = [];

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

    // ดึงจำนวน Orders ทั้งหมด
    try {
      console.log('Fetching orders count...');
      const ordersCount = await pb.collection('Order').getFullList();
      console.log('Orders count result:', ordersCount);
      stats.orders = ordersCount.length;
    } catch (error) {
      console.log('Error fetching orders:', error);
    }

    // ดึงจำนวน Menu/Dishes ทั้งหมด
    try {
      console.log('Fetching menu count...');
      const menuCount = await pb.collection('Menu').getFullList();
      console.log('Menu count result:', menuCount);
      stats.dishes = menuCount.length;
    } catch (error) {
      console.log('Error fetching menu:', error);
    }

    // ดึงจำนวน Canceled Orders (Status = "error")
    try {
      console.log('Fetching canceled orders count...');
      const canceledCount = await pb.collection('Order').getFullList({
        filter: 'Status = "error"'
      });
      console.log('Canceled count result:', canceledCount);
      stats.canceled = canceledCount.length;
    } catch (error) {
      console.log('Error fetching canceled orders:', error);
    }

    // ดึงข้อมูล Shops สำหรับแสดงในตาราง
    try {
      console.log('Fetching shops...');
      shops = await pb.collection('Shop').getFullList({
        expand: 'User_Owner_ID'
      });
      console.log('Shops result:', shops);
    } catch (error) {
      console.log('Error fetching shops:', error);
    }

    const result = {
      stats,
      shops,
      users: usersData // เพิ่มข้อมูล users แบบละเอียด
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data if database connection fails
    return {
      stats: {
        users: 0,
        orders: 0,
        dishes: 0,
        canceled: 0
      },
      shops: [],
      users: []
    };
  }
};

export const actions: Actions = {
  addRestaurant: async ({ request }) => {
    const formData = await request.formData();
    
    const restaurantData = {
      name: formData.get('name') as string,
      Type_Shop: formData.get('type') as string,
      User_Owner_ID: formData.get('ownerId') as string,
      Phone: formData.get('phone') as string,
      Addr: formData.get('address') as string,
      Details: formData.get('description') as string,
      field: '' // Required field in schema
    };

    console.log('Attempting to create restaurant with data:', restaurantData);

    try {
      // Admin authentication
      if (privateEnv.POCKETBASE_ADMIN_EMAIL && privateEnv.POCKETBASE_ADMIN_PASSWORD) {
        await pb.admins.authWithPassword(
          privateEnv.POCKETBASE_ADMIN_EMAIL,
          privateEnv.POCKETBASE_ADMIN_PASSWORD
        );
        console.log('Admin authenticated successfully');
      }

      // Validate required fields
      if (!restaurantData.name || !restaurantData.Type_Shop || !restaurantData.Phone || !restaurantData.Addr) {
        console.log('Missing required fields:', {
          name: !!restaurantData.name,
          type: !!restaurantData.Type_Shop,
          phone: !!restaurantData.Phone,
          address: !!restaurantData.Addr
        });
        
        return fail(400, {
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          formData: restaurantData
        });
      }

      // Create restaurant in database
      const record = await pb.collection('Shop').create(restaurantData);
      
      console.log('Restaurant created successfully:', record);
      
      return {
        success: true,
        message: 'เพิ่มร้านอาหารสำเร็จ!'
      };
      
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'ไม่สามารถเพิ่มร้านอาหารได้ กรุณาลองใหม่อีกครั้ง';
      
      if (error.response?.data?.data) {
        const fieldErrors = error.response.data.data;
        if (fieldErrors.Type_Shop) {
          errorMessage = `ประเภทร้านอาหารไม่ถูกต้อง: กรุณาเลือกเฉพาะ "อาหารไทย" หรือ "อาหารญี่ปุ่น" เท่านั้น`;
        } else if (fieldErrors.User_Owner_ID) {
          errorMessage = `เจ้าของร้านไม่ถูกต้อง: กรุณาเลือกเจ้าของร้าน`;
        } else {
          errorMessage = `ข้อมูลไม่ถูกต้อง: ${JSON.stringify(fieldErrors)}`;
        }
      }
      
      return fail(400, {
        error: errorMessage,
        formData: restaurantData
      });
    }
  }
};