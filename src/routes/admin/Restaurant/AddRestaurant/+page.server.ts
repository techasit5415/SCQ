import type { PageServerLoad, Actions } from '../$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  console.log('Session cookie in add restaurant:', session);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  console.log('Session valid, loading add restaurant page');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    console.log('Attempting to connect to PocketBase...');

    // Try to authenticate as admin first
    try {
      const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
      console.log('Attempting admin login with:', adminEmail);
      
      await pb.admins.authWithPassword(adminEmail, adminPassword);
      console.log('Admin authenticated successfully');
    } catch (authError) {
      console.log('Admin auth failed:', authError);
      console.log('Trying without auth...');
    }

    // ดึงรายชื่อ Role สำหรับตรวจสอบ
    let roles: any[] = [];
    try {
      console.log('Fetching roles...');
      roles = await pb.collection('Role').getFullList();
      console.log('Roles fetched:', roles.length);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }

    // หา Role ID ของ Restaurant
    const restaurantRole = roles.find(role => role.name.toLowerCase() === 'restaurant');
    
    // ดึงเฉพาะ Users ที่เป็น Role Restaurant สำหรับเลือกเป็น Owner
    let restaurantOwners: any[] = [];
    try {
      console.log('Fetching restaurant owners...');
      if (restaurantRole) {
        restaurantOwners = await pb.collection('users').getFullList({
          filter: `Role = "${restaurantRole.id}"`,
          sort: 'name'
        });
        console.log('Restaurant owners fetched:', restaurantOwners.length);
      } else {
        console.log('Restaurant role not found');
      }
    } catch (error) {
      console.error('Error fetching restaurant owners:', error);
    }

    const result = {
      restaurantOwners,
      roles,
      restaurantTypes: [
        'อาหารญี่ปุ่น',
        'อาหารเกาหลี', 
        'อาหารไทย',
        'อาหารจีน',
        'อาหารฝรั่ง',
        'เครื่องดื่ม'
      ]
    };

    console.log('Add restaurant data loaded successfully');
    return result;
  } catch (error) {
    console.error('Error loading add restaurant data:', error);
    
    return {
      restaurantOwners: [],
      roles: [],
      restaurantTypes: [
        'อาหารญี่ปุ่น',
        'อาหารเกาหลี', 
        'อาหารไทย',
        'อาหารจีน',
        'อาหารฝรั่ง',
        'เครื่องดื่ม'
      ]
    };
  }
};

export const actions: Actions = {
  addRestaurant: async ({ request }) => {
    try {
      const formData = await request.formData();
      
      const restaurantData = {
        name: formData.get('name') as string,
        Type: formData.get('type') as string, // เปลี่ยนจาก Type_Shop เป็น Type
        User_Owner_ID: formData.get('ownerId') as string,
        Phone: formData.get('phone') as string,
        Address: formData.get('address') as string, // เปลี่ยนจาก Addr เป็น Address
        Description: formData.get('description') as string, // เปลี่ยนจาก Details เป็น Description
        Status: true // เพิ่ม Status เป็น active
      };

      console.log('Attempting to create restaurant with data:', restaurantData);

      // Validate required fields
      if (!restaurantData.name || !restaurantData.Type || !restaurantData.Phone || !restaurantData.Address) {
        console.log('Missing required fields:', {
          name: !!restaurantData.name,
          type: !!restaurantData.Type,
          phone: !!restaurantData.Phone,
          address: !!restaurantData.Address
        });
        
        return fail(400, {
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          formData: restaurantData
        });
      }

      // Try to authenticate as admin for creating restaurant
      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated for restaurant creation');
      } catch (authError) {
        console.log('Admin auth failed for restaurant creation, continuing...');
      }

      // Create restaurant in database
      const record = await pb.collection('Shop').create(restaurantData);
      
      console.log('Restaurant created successfully:', record);
      
      return {
        success: true,
        message: 'เพิ่มร้านอาหารสำเร็จ!',
        restaurantId: record.id
      };
      
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'ไม่สามารถเพิ่มร้านอาหารได้ กรุณาลองใหม่อีกครั้ง';
      
      if (error.response?.data?.data) {
        const fieldErrors = error.response.data.data;
        const errorFields = Object.keys(fieldErrors);
        if (errorFields.length > 0) {
          errorMessage = `ข้อผิดพลาดในฟิลด์: ${errorFields.join(', ')}`;
        }
      }
      
      return fail(400, {
        error: errorMessage,
        details: error.message
      });
    }
  }
};