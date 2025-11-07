import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async ({ cookies, locals }) => {
  const pb = locals.pb || new PocketBase(env.PUBLIC_POCKETBASE_URL);
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

    // ดึงรายชื่อ Role สำหรับตรวจสอบ
    let roles: any[] = [];
    try {
      console.log('Fetching roles...');
      roles = await pb.collection('Role').getFullList();
      console.log('Roles fetched:', roles.length);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }

    // แสดงข้อมูล roles ทั้งหมดเพื่อ debug
    console.log('All roles:', roles.map(r => ({ id: r.id, name: r.name })));
    
    // หา Role ID ของ Restaurant (ลองหลายแบบ)
    let restaurantRole = roles.find(role => role.name.toLowerCase() === 'restaurant');
    if (!restaurantRole) {
      restaurantRole = roles.find(role => role.name.toLowerCase().includes('shop'));
    }
    if (!restaurantRole) {
      restaurantRole = roles.find(role => role.name.toLowerCase().includes('owner'));
    }
    
    console.log('Restaurant role found:', restaurantRole);
    
    // ดึงเฉพาะ Users ที่เป็น Restaurant role สำหรับเลือกเป็น Owner
    let restaurantOwners: any[] = [];
    try {
      console.log('Fetching restaurant owners...');
      if (restaurantRole) {
        console.log('Filtering users with Role ID:', restaurantRole.id);
        restaurantOwners = await pb.collection('users').getFullList({
          filter: `Role = "${restaurantRole.id}"`,
          sort: 'name'
        });
        console.log('Restaurant owners fetched:', restaurantOwners.length);
        console.log('Restaurant owners data:', restaurantOwners.map(u => ({ 
          id: u.id, 
          email: u.email, 
          name: u.name, 
          lastname: u.Lastname,
          role: u.Role 
        })));
      } else {
        console.log('Restaurant role not found, fetching all users...');
        restaurantOwners = await pb.collection('users').getFullList({
          sort: 'name'
        });
        console.log('All users fetched:', restaurantOwners.length);
        console.log('All users data:', restaurantOwners.map(u => ({ 
          id: u.id, 
          email: u.email, 
          name: u.name, 
          lastname: u.Lastname,
          role: u.Role 
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    // ดึงข้อมูล Shops สำหรับแสดงในตาราง
    let shops: any[] = [];
    try {
      console.log('Fetching shops...');
      const allShops = await pb.collection('Shop').getFullList({
        expand: 'User_Owner_ID'
      });
      
      // กรองเอาเฉพาะร้านจริง ไม่เอาร้าน SCQ
      shops = allShops.filter((shop: any) => {
        return shop.id !== '000000000000001' && !shop.Name?.startsWith('[SYSTEM]') && !shop.name?.startsWith('[SYSTEM]');
      });
      
      console.log('Shops result:', shops.length, '(filtered from', allShops.length, 'total)');
    } catch (error) {
      console.log('Error fetching shops:', error);
    }

    const result = {
      shops,
      users: restaurantOwners, // ส่งข้อมูล users สำหรับเลือกเป็น owner
      roles,
      restaurantOwners, // เก็บไว้เผื่อใช้
      restaurantTypes: [
        'อาหารเกาหลี',
        'อาหารญี่ปุ่น', 
        'อาหารอีสาน',
        'อาหารตามสั่ง',
        'เครื่องดื่ม'
      ] // Updated to match PocketBase schema
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data if database connection fails
    return {
      shops: [],
      users: []
    };
  }
};

export const actions: Actions = {
  addRestaurant: async ({ request, locals }) => {
    const pb = locals.pb || new PocketBase(env.PUBLIC_POCKETBASE_URL);
    const formData = await request.formData();
    
    console.log('=== Add Restaurant Action Start ===');
    
    // Get the image file
    const imageFile = formData.get('image') as File;
    
    console.log('Image file received:', {
      name: imageFile?.name,
      size: imageFile?.size,
      type: imageFile?.type
    });
    
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const ownerId = formData.get('ownerId') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const description = formData.get('description') as string;
    
    const restaurantData = {
      name,
      Type_Shop: type,
      User_Owner_ID: ownerId,
      Phone: phone,
      Addr: address,
      Details: description
    };

    console.log('Restaurant data:', restaurantData);

    // Validate required fields
    if (!name || !type || !phone || !address) {
      console.log('Missing required fields:', {
        name: !!name,
        type: !!type,
        phone: !!phone,
        address: !!address
      });
      
      return fail(400, {
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        formData: restaurantData
      });
    }

    // Validate User_Owner_ID exists if provided
    if (ownerId) {
      try {
        await pb.collection('users').getOne(ownerId);
        console.log('Owner validated:', ownerId);
      } catch (userError) {
        console.log('Invalid User_Owner_ID:', ownerId);
        return fail(400, {
          error: 'เจ้าของร้านไม่ถูกต้อง กรุณาเลือกเจ้าของร้านใหม่',
          formData: restaurantData
        });
      }
    }

    // Create FormData for PocketBase
    const pbFormData = new FormData();
    pbFormData.append('name', name);
    pbFormData.append('Type_Shop', type);
    pbFormData.append('Phone', phone);
    pbFormData.append('Addr', address);
    pbFormData.append('field', ''); // Required field in schema
    pbFormData.append('Details', description || '-'); // Required field, use '-' if empty
    pbFormData.append('category', JSON.stringify(['ทั่วไป'])); // Required field - JSON array with default category
    
    // Add optional fields
    if (ownerId) {
      pbFormData.append('User_Owner_ID', ownerId);
    }

    // Add image file if provided
    if (imageFile && imageFile.size > 0) {
      console.log('Adding image to form data...');
      // Validate image file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(imageFile.type)) {
        return fail(400, {
          error: 'รูปภาพต้องเป็นไฟล์ JPG, PNG หรือ WebP เท่านั้น',
          formData: restaurantData
        });
      }

      if (imageFile.size > maxSize) {
        return fail(400, {
          error: 'ขนาดรูปภาพต้องไม่เกิน 5MB',
          formData: restaurantData
        });
      }

      pbFormData.append('Pic_Shop', imageFile);
      console.log('Image added to form data with field name: Pic_Shop');
    } else {
      console.log('No image file provided or file size is 0');
    }

    console.log('Form data contents:');
    for (let [key, value] of pbFormData.entries()) {
      console.log(key, ':', value instanceof File ? `File: ${value.name}` : value);
    }

    try {
      // Create restaurant in database using locals.pb (authenticated session)
      console.log('=== Creating Restaurant ===');
      console.log('PB Instance:', pb ? 'OK' : 'NULL');
      console.log('Auth Store:', pb?.authStore?.isValid ? 'Valid' : 'Invalid');
      console.log('Sending request to PocketBase...');
      
      const record = await pb.collection('Shop').create(pbFormData);
      
      console.log('Restaurant created successfully:', record);
      
      return {
        success: true,
        message: 'เพิ่มร้านอาหารสำเร็จ!'
      };
      
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      console.error('Error status:', error.status);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'ไม่สามารถเพิ่มร้านอาหารได้ กรุณาลองใหม่อีกครั้ง';
      
      if (error.response?.data?.data) {
        const fieldErrors = error.response.data.data;
        console.log('Field errors:', fieldErrors);
        
        if (fieldErrors.Type_Shop) {
          errorMessage = `ประเภทร้านอาหารไม่ถูกต้อง: ${fieldErrors.Type_Shop.message || 'กรุณาเลือกประเภทร้านอาหาร'}`;
        } else if (fieldErrors.User_Owner_ID) {
          errorMessage = `เจ้าของร้านไม่ถูกต้อง: ${fieldErrors.User_Owner_ID.message || 'กรุณาเลือกเจ้าของร้าน'}`;
        } else if (fieldErrors.Pic_Shop) {
          errorMessage = `รูปภาพไม่ถูกต้อง: ${fieldErrors.Pic_Shop.message || 'ปัญหากับไฟล์รูปภาพ'}`;
        } else {
          const firstError = Object.keys(fieldErrors)[0];
          errorMessage = `${firstError}: ${fieldErrors[firstError].message || JSON.stringify(fieldErrors[firstError])}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return fail(400, {
        error: errorMessage,
        formData: restaurantData
      });
    }
  }
};