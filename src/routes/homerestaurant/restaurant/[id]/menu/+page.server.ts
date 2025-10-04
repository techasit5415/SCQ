import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { page } from '$app/state';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load = async ({ params }: { params: { id: string } }) => {
  console.log('Session valid, loading homeadmin page');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    // Initialize stats object
    let pageID: 'undefined';
    let stats = {
      menus: 0
    };
    let cate = [];
    
    // ดึงจำนวน Menu ทั้งหมด
    let menuData = [];
    try {
      console.log('Fetching users count...');
      const menuCount = await pb.collection('Menu').getFullList({
        filter:`field = "${params.id}"`
      });
      console.log('Users count result:', menuCount);
      console.log('Users totalItems:', menuCount.length);
      stats.menus = menuCount.length;
      menuData = menuCount; // เก็บข้อมูล users แบบละเอียด
    } catch (error) {
      console.log('Error fetching users:', error);
    }

    // ดึง Category
    try {
      console.log('Fetching category menu count...');
      const categoryOnly = await pb.collection('Menu').getFullList({
        fields: 'category',
        filter:`field = "${params.id}"`
      });

      const categorySort = categoryOnly.map(o => o.category).filter(c => c != null && c !== '');; // หรือ o.expand?.menu?.category
      const categoryCount = Array.from(new Set(categorySort)); 
      
      // เปลี่ยนจากเก็บแค่จำนวน → เป็น array ที่ใช้แสดง
      cate = categoryCount.map(category => ({ category }));
    } catch (error) {
      console.log('Error fetching category menu:', error);
    }

    const result = {
      pageID: params.id,
      menus: menuData, // เพิ่มข้อมูล users แบบละเอียด
      cate
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading menu data:', error);
    
    // Return fallback data if database connection fails
    return {
      pageID: 'undefined',
      menus: [],
      cate: {
        category: 0
      }
    };
  }
};

export const actions: Actions = {
  // addMenu: async ({ request }) => {
  //   try {
  //     const formData = await request.formData();
  //     const menuId = formData.get('menuId') as string;
  //     const name = formData.get('name') as string;
  //     const detail = formData.get('detail') as string;
  //     const category = formData.get('category') as string;
  //     const price = formData.get('price') as string;
  //     const status = formData.get('status') as string;

  //     console.log('Adding menu:', { name, detail, category, price, status });

  //     // Try to authenticate - skip if fails since PocketBase might allow public updates
  //     try {
  //       const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
  //       const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
  //       console.log('Attempting admin login with:', adminEmail);

  //       await pb.admins.authWithPassword(adminEmail, adminPassword);
  //       console.log('Admin authenticated successfully');
  //     } catch (authError) {
  //       console.log('Admin auth failed, continuing without auth...');
  //       // PocketBase might be configured to allow updates without admin auth
  //       // This is common in development environments
  //     }

  //     // Update user
  //     const addData: any = {
  //       name,
  //       detail,
  //       category,
  //       Price: price,
  //       Available: status
  //     };

  //     // Only add role if roleId is provided and not empty
  //     // if (roleId && roleId.trim() !== '') {
  //     //   updateData.Role = roleId;
  //     // }

  //     console.log('Update data:', addData);
  //     const addMenu = await pb.collection('Menu').create(addData);
  //     console.log('Menu added successfully:', addMenu);

  //     return {
  //       success: true,
  //       message: 'เพิ่มข้อมูลเมนูสำเร็จ'
  //     };

  //   } catch (error: any) {
  //     console.error('Error adding menu:', error);
  //     return fail(400, {
  //       error: 'ไม่สามารถเพิ่มข้อมูลเมนูได้: ' + (error.message || 'Unknown error')
  //     });
  //   }
  // },

  updateMenu: async ({ request }) => {
      try {
        const formData = await request.formData();
        const menuId = formData.get('menuId') as string;
        const name = formData.get('name') as string;
        const detail = formData.get('detail') as string;
        const category = formData.get('category') as string;
        const price = formData.get('price') as string;
        const status = formData.get('status') as string;

        console.log('Updating menu:', { menuId, name, detail, category, price, status});
  
        // Try to authenticate - skip if fails since PocketBase might allow public updates
        try {
          const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
          const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
          console.log('Attempting admin login with:', adminEmail);
          
          await pb.admins.authWithPassword(adminEmail, adminPassword);
          console.log('Admin authenticated successfully');
        } catch (authError) {
          console.log('Admin auth failed, continuing without auth...');
          // PocketBase might be configured to allow updates without admin auth
          // This is common in development environments
        }
  
        // Update user
        const updateData: any = {
          name,
          detail,
          category,
          Price: price,
          Available: status
        };
  
        // Only add role if roleId is provided and not empty
        // if (roleId && roleId.trim() !== '') {
        //   updateData.Role = roleId;
        // }
  
        console.log('Update data:', updateData);
        const updatedMenu = await pb.collection('Menu').update(menuId, updateData);
        console.log('Menu updated successfully:', updatedMenu);
  
        return {
          success: true,
          message: 'อัปเดตข้อมูลเมนูสำเร็จ'
        };
  
      } catch (error: any) {
        console.error('Error updating menu:', error);
        return fail(400, {
          error: 'ไม่สามารถอัปเดตข้อมูลเมนูได้: ' + (error.message || 'Unknown error')
        });
      }
    },
  deleteMenu: async ({ request }) => {
    try {
      const formData = await request.formData();
      const menuId = formData.get('menuId') as string;

      console.log('Deleting menu:', menuId);

      // Try to authenticate as admin first, but continue if fails
      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        console.log('Attempting admin login for delete with:', adminEmail);
        
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully for delete');
      } catch (authError) {
        console.log('Admin auth failed for delete:', authError);
        console.log('Trying without auth...');
        // Continue without admin auth
      }

      // Delete user
      await pb.collection('Menu').delete(menuId);
      console.log('Menu deleted successfully:', menuId);

      return {
        success: true,
        message: 'ลบเมนูสำเร็จ'
      };

    } catch (error: any) {
      console.error('Error deleting menu:', error);
      return fail(400, {
        error: 'ไม่สามารถลบเมนูได้: ' + (error.message || 'Unknown error')
      });
    }
  }
};
