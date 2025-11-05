import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies, params }) => {
  const session = cookies.get('session');
  console.log('Session cookie in edit restaurant:', session);

  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  console.log('Session valid, loading edit restaurant page');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);
  console.log('Restaurant ID:', params.id);

  try {
    console.log('Attempting to connect to PocketBase...');

    // Try to authenticate as admin
    try {
      const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
      const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
      console.log('Attempting admin login with:', adminEmail);
      
      await pb.admins.authWithPassword(adminEmail, adminPassword);
      console.log('Admin authenticated successfully');
    } catch (authError) {
      console.log('Admin auth failed:', authError);
    }

    // ดึงข้อมูลร้านอาหาร
    let restaurant = null;
    try {
      console.log('Fetching restaurant data...');
      restaurant = await pb.collection('Shop').getOne(params.id, {
        expand: 'User_Owner_ID'
      });
      console.log('Restaurant fetched:', restaurant);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw redirect(302, '/admin/restaurant');
    }

    // ดึงรายชื่อ users สำหรับ dropdown
    let users = [];
    try {
      console.log('Fetching users...');
      users = await pb.collection('users').getFullList({
        sort: 'name'
      });
      console.log('Users fetched:', users.length);
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    const result = {
      restaurant,
      users
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading edit restaurant data:', error);
    
    return {
      restaurant: null,
      users: []
    };
  }
};

export const actions: Actions = {
  updateRestaurant: async ({ request, params }) => {
    const formData = await request.formData();
    
    const restaurantData = {
      name: formData.get('name') as string,
      Type_Shop: formData.get('type') as string,
      User_Owner_ID: formData.get('ownerId') as string,
      Phone: formData.get('phone') as string,
      Addr: formData.get('address') as string,
      Details: formData.get('description') as string
    };

    console.log('Attempting to update restaurant with data:', restaurantData);
    console.log('Restaurant ID:', params.id);

    try {
      // Authenticate as admin
      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || '66050193@kmitl.ac.th';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        await pb.admins.authWithPassword(adminEmail, adminPassword);
      } catch (authError) {
        console.error('Admin authentication failed:', authError);
        return fail(500, {
          error: 'Authentication failed'
        });
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

      // Update restaurant in database
      const record = await pb.collection('Shop').update(params.id, restaurantData);
      
      console.log('Restaurant updated successfully:', record);
      
      return {
        success: true,
        message: 'แก้ไขข้อมูลร้านอาหารสำเร็จ!'
      };
      
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'ไม่สามารถแก้ไขข้อมูลร้านอาหารได้ กรุณาลองใหม่อีกครั้ง';
      
      if (error.response?.data?.data) {
        const fieldErrors = error.response.data.data;
        if (fieldErrors.Type_Shop) {
          errorMessage = `ประเภทร้านอาหารไม่ถูกต้อง`;
        } else if (fieldErrors.User_Owner_ID) {
          errorMessage = `เจ้าของร้านไม่ถูกต้อง`;
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