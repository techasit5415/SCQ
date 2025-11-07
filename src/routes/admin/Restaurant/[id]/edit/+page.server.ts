import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async ({ cookies, params, locals }) => {
  const session = cookies.get('session');
  console.log('Session cookie in edit restaurant:', session);

  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  console.log('Session valid, loading edit restaurant page');
  console.log('Restaurant ID:', params.id);

  try {
    // Use authenticated PocketBase from locals
    const pb = locals.pb || new PocketBase(env.PUBLIC_POCKETBASE_URL);
    console.log('Using PocketBase instance');

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
      throw redirect(302, '/admin/Restaurant');
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
  updateRestaurant: async ({ request, params, locals }) => {
    const formData = await request.formData();
    
    // Get the image file if provided
    const imageFile = formData.get('image') as File;
    
    console.log('=== Update Restaurant Action ===');
    console.log('Restaurant ID:', params.id);
    console.log('Form data received:', {
      name: formData.get('name'),
      type: formData.get('type'),
      ownerId: formData.get('ownerId'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      description: formData.get('description'),
      image: imageFile ? { name: imageFile.name, size: imageFile.size, type: imageFile.type } : null
    });

    try {
      // Use authenticated PocketBase from locals
      const pb = locals.pb || new PocketBase(env.PUBLIC_POCKETBASE_URL);
      console.log('Using authenticated PocketBase instance');

      // Validate required fields
      const name = formData.get('name') as string;
      const type = formData.get('type') as string;
      const phone = formData.get('phone') as string;
      const address = formData.get('address') as string;

      if (!name || !type || !phone || !address) {
        console.log('Missing required fields');
        return fail(400, {
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน'
        });
      }

      // สร้าง FormData ใหม่สำหรับ PocketBase
      const pbFormData = new FormData();
      pbFormData.append('name', name);
      pbFormData.append('Type_Shop', type);
      pbFormData.append('User_Owner_ID', formData.get('ownerId') as string);
      pbFormData.append('Phone', phone);
      pbFormData.append('Addr', address);
      pbFormData.append('Details', formData.get('description') as string || '');

      // Add image file if provided
      if (imageFile && imageFile.size > 0) {
        console.log('Processing image update...');
        // Validate image file
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(imageFile.type)) {
          return fail(400, {
            error: 'รูปภาพต้องเป็นไฟล์ JPG, PNG หรือ WebP เท่านั้น'
          });
        }

        if (imageFile.size > maxSize) {
          return fail(400, {
            error: 'ขนาดรูปภาพต้องไม่เกิน 5MB'
          });
        }

        pbFormData.append('Pic_Shop', imageFile);
        console.log('Image will be updated');
      }

      console.log('Updating restaurant in database...');

      // Update restaurant in database
      const record = await pb.collection('Shop').update(params.id, pbFormData);
      
      console.log('Restaurant updated successfully:', record);
      
      return {
        success: true,
        message: 'แก้ไขข้อมูลร้านอาหารสำเร็จ!'
      };
      
    } catch (error: any) {
      console.error('=== Error updating restaurant ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'ไม่สามารถแก้ไขข้อมูลร้านอาหารได้ กรุณาลองใหม่อีกครั้ง';
      
      if (error.response?.data?.data) {
        const fieldErrors = error.response.data.data;
        if (fieldErrors.Type_Shop) {
          errorMessage = `ประเภทร้านอาหารไม่ถูกต้อง: ${JSON.stringify(fieldErrors.Type_Shop)}`;
        } else if (fieldErrors.User_Owner_ID) {
          errorMessage = `เจ้าของร้านไม่ถูกต้อง: ${JSON.stringify(fieldErrors.User_Owner_ID)}`;
        } else if (fieldErrors.name) {
          errorMessage = `ชื่อร้านไม่ถูกต้อง: ${JSON.stringify(fieldErrors.name)}`;
        } else {
          errorMessage = `ข้อมูลไม่ถูกต้อง: ${JSON.stringify(fieldErrors)}`;
        }
      } else if (error.message) {
        errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
      }
      
      return fail(400, {
        error: errorMessage
      });
    }
  }
};