import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load = async ({ params }: { params: { id: string } }) => {
  console.log('Session valid, loading menu page');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    // Initialize stats object
    let pageID: 'undefined';
    let stats = {
      menus: 0
    };
    let cate = [];

    // ดึงข้อมูล Shop เพื่อเอา categories
    let shopData = null;
    try {
      console.log('Fetching shop data...');
      shopData = await pb.collection('Shop').getOne(params.id);
      console.log('Shop data:', shopData);
      
      // ดึง categories จาก Shop.category (JSON field)
      if (shopData && shopData.category && Array.isArray(shopData.category)) {
        cate = shopData.category.map(cat => ({ category: cat }));
        console.log('Categories from Shop:', cate);
      }
    } catch (error) {
      console.log('Error fetching shop data:', error);
    }

    // ดึงจำนวน Menu ทั้งหมด
    let menuData = [];
    try {
      console.log('Fetching menu items...');
      const menuCount = await pb.collection('Menu').getFullList({
        filter: `field = "${params.id}"`
      });
      console.log('Menu items count:', menuCount.length);
      stats.menus = menuCount.length;
      menuData = menuCount;
    } catch (error) {
      console.log('Error fetching menu items:', error);
    }

    const result = {
      pageID: params.id,
      menus: menuData,
      cate,
      shopData
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading menu data:', error);

    // Return fallback data if database connection fails
    return {
      pageID: 'undefined',
      menus: [],
      cate: [],
      shopData: null
    };
  }
};

export const actions: Actions = {
  addMenu: async ({ request, params }) => {
    try {
      const formData = await request.formData();
      const field = params.id;
      const photo = formData.get('photo') as File | null;
      const name = formData.get('name') as string;
      const detail = formData.get('detail') as string;
      const category = formData.get('category') as string;
      const price = formData.get('price') as string;
      const statusRaw = formData.get('status') as string;
      const status = statusRaw === 'on';

      console.log('Adding menu:', {field, name, detail, category, price, status, photoName: photo?.name, photoSize: photo?.size});

      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        console.log('Attempting admin login with:', adminEmail);

        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully');
      } catch (authError) {
        console.log('Admin auth failed, continuing without auth...');
      }

      // Photo is REQUIRED - validate before proceeding
      if (!photo || photo.size === 0) {
        console.error('Photo is required but not provided');
        return fail(400, {
          error: 'กรุณาอัปโหลดรูปภาพเมนู (Photo is required)'
        });
      }

      // Validate category is not empty
      if (!category || category.trim() === '' || category === 'Select category...') {
        console.error('Category is required but not selected');
        return fail(400, {
          error: 'กรุณาเลือกหมวดหมู่เมนู (Category is required)'
        });
      }

      // Create FormData for PocketBase (Photo is always required)
      const pbFormData = new FormData();
      pbFormData.append('field', field);
      pbFormData.append('Photo', photo);
      pbFormData.append('name', name);
      pbFormData.append('detail', detail || ''); // Allow empty detail
      pbFormData.append('category', category.trim());
      pbFormData.append('Price', (parseFloat(price) || 0).toString());
      pbFormData.append('Available', status.toString());

      console.log('Creating menu with FormData:', {
        field,
        photoName: photo.name,
        photoSize: photo.size,
        name,
        detail,
        category: category.trim(),
        price: parseFloat(price) || 0,
        available: status
      });

      const addMenu = await pb.collection('Menu').create(pbFormData);
      console.log('Menu added successfully:', addMenu);

      return {
        success: true,
        message: 'เพิ่มข้อมูลเมนูสำเร็จ'
      };

    } catch (error: any) {
      console.error('Error adding menu:', error);
      console.error('Error details:', error.response);
      return fail(400, {
        error: 'ไม่สามารถเพิ่มข้อมูลเมนูได้: ' + (error.message || 'Unknown error')
      });
    }
  },

  updateMenu: async ({ request }) => {
    try {
      const formData = await request.formData();
      const menuId = formData.get('menuId') as string;
      const photo = formData.get('photo') as File | null;
      const name = formData.get('name') as string;
      const detail = formData.get('detail') as string;
      const category = formData.get('category') as string;
      const price = formData.get('price') as string;
      const statusRaw = formData.get('status') as string;
      const status = statusRaw === 'on';

      console.log('Updating menu:', { menuId, name, detail, category, price, status, hasPhoto: !!(photo && photo.size > 0) });

      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        console.log('Attempting admin login with:', adminEmail);

        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully');
      } catch (authError) {
        console.log('Admin auth failed, continuing without auth...');
      }

      // Create FormData for PocketBase
      const pbFormData = new FormData();
      pbFormData.append('name', name);
      pbFormData.append('detail', detail);
      pbFormData.append('category', category);
      pbFormData.append('Price', (parseFloat(price) || 0).toString());
      pbFormData.append('Available', status.toString());

      // Only add photo if new one is uploaded
      if (photo && photo.size > 0) {
        pbFormData.append('Photo', photo);
      }

      console.log('Updating menu with FormData');
      const updatedMenu = await pb.collection('Menu').update(menuId, pbFormData);
      console.log('Menu updated successfully:', updatedMenu);

      return {
        success: true,
        message: 'อัปเดตข้อมูลเมนูสำเร็จ'
      };

    } catch (error: any) {
      console.error('Error updating menu:', error);
      console.error('Error details:', error.response);
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

      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        console.log('Attempting admin login for delete with:', adminEmail);

        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully for delete');
      } catch (authError) {
        console.log('Admin auth failed for delete:', authError);
        console.log('Trying without auth...');
      }

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
  },

  addCategory: async ({ request, params }) => {
    try {
      const formData = await request.formData();
      const categoryName = formData.get('categoryName') as string;
      const field = params.id;

      console.log('Adding category:', categoryName, 'for shop:', field);

      // Validate category name
      if (!categoryName || categoryName.trim() === '') {
        return fail(400, {
          error: 'กรุณาระบุชื่อหมวดหมู่'
        });
      }

      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully');
      } catch (authError) {
        console.log('Admin auth failed, continuing without auth...');
      }

      // ดึงข้อมูล Shop ปัจจุบัน
      const shop = await pb.collection('Shop').getOne(field);
      console.log('Current shop data:', shop);

      // ดึง categories ปัจจุบัน
      let currentCategories = shop.category || [];
      if (!Array.isArray(currentCategories)) {
        currentCategories = [];
      }

      // ตรวจสอบว่า category ซ้ำหรือไม่
      if (currentCategories.includes(categoryName.trim())) {
        return {
          success: true,
          message: 'หมวดหมู่นี้มีอยู่แล้ว'
        };
      }

      // เพิ่ม category ใหม่
      const updatedCategories = [...currentCategories, categoryName.trim()];
      console.log('Updated categories:', updatedCategories);

      // อัพเดต Shop
      await pb.collection('Shop').update(field, {
        category: updatedCategories
      });

      console.log('Category added successfully');

      return {
        success: true,
        message: 'เพิ่มหมวดหมู่สำเร็จ'
      };

    } catch (error: any) {
      console.error('Error adding category:', error);
      console.error('Error details:', error.response);
      return fail(400, {
        error: 'ไม่สามารถเพิ่มหมวดหมู่ได้: ' + (error.message || 'Unknown error')
      });
    }
  },

  updateCategory: async ({ request, params }) => {
    try {
      const formData = await request.formData();
      const oldCategoryName = formData.get('oldCategoryName') as string;
      const newCategoryName = formData.get('newCategoryName') as string;
      const field = params.id;

      console.log('Updating category from:', oldCategoryName, 'to:', newCategoryName);

      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully');
      } catch (authError) {
        console.log('Admin auth failed, continuing without auth...');
      }

      // อัพเดต Shop.category
      const shop = await pb.collection('Shop').getOne(field);
      let currentCategories = shop.category || [];
      if (!Array.isArray(currentCategories)) {
        currentCategories = [];
      }

      // แทนที่ category เก่าด้วยใหม่
      const updatedCategories = currentCategories.map(cat => 
        cat === oldCategoryName ? newCategoryName : cat
      );

      await pb.collection('Shop').update(field, {
        category: updatedCategories
      });

      // อัพเดต Menu items ทั้งหมดที่ใช้ category เก่า
      const menuItems = await pb.collection('Menu').getFullList({
        filter: `field = "${field}" && category = "${oldCategoryName}"`
      });

      for (const item of menuItems) {
        await pb.collection('Menu').update(item.id, {
          category: newCategoryName
        });
      }

      console.log('Category updated successfully');

      return {
        success: true,
        message: 'อัปเดตหมวดหมู่สำเร็จ'
      };

    } catch (error: any) {
      console.error('Error updating category:', error);
      return fail(400, {
        error: 'ไม่สามารถอัปเดตหมวดหมู่ได้: ' + (error.message || 'Unknown error')
      });
    }
  },

  deleteCategory: async ({ request, params }) => {
    try {
      const formData = await request.formData();
      const categoryName = formData.get('categoryName') as string;
      const field = params.id;

      console.log('Deleting category:', categoryName);

      try {
        const adminEmail = privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123';
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('Admin authenticated successfully');
      } catch (authError) {
        console.log('Admin auth failed, continuing without auth...');
      }

      // ลบ category ออกจาก Shop.category
      const shop = await pb.collection('Shop').getOne(field);
      let currentCategories = shop.category || [];
      if (!Array.isArray(currentCategories)) {
        currentCategories = [];
      }

      // กรอง category ที่ต้องการลบออก
      const updatedCategories = currentCategories.filter(cat => cat !== categoryName);

      await pb.collection('Shop').update(field, {
        category: updatedCategories
      });

      // เคลียร์ category จาก menu items ทั้งหมดที่ใช้ category นี้
      const menuItems = await pb.collection('Menu').getFullList({
        filter: `field = "${field}" && category = "${categoryName}"`
      });

      for (const item of menuItems) {
        await pb.collection('Menu').update(item.id, {
          category: ''
        });
      }

      console.log('Category deleted successfully');

      return {
        success: true,
        message: 'ลบหมวดหมู่สำเร็จ'
      };

    } catch (error: any) {
      console.error('Error deleting category:', error);
      return fail(400, {
        error: 'ไม่สามารถลบหมวดหมู่ได้: ' + (error.message || 'Unknown error')
      });
    }
  }
};
