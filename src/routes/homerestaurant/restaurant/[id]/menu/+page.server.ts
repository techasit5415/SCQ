// import type { PageServerLoad, Actions } from '../$types.js';
// import { redirect, fail } from '@sveltejs/kit';
// import PocketBase from 'pocketbase';
// import { env } from '$env/dynamic/public';
// import { env as privateEnv } from '$env/dynamic/private';

import PocketBase from 'pocketbase';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

// ใช้ URL จาก environment variable
// const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load = async ({ params }: { params: { id: string } }) => {
// export const load: PageServerLoad = async ({ cookies }) => {
  // const session = cookies.get('session');
  // console.log('Session cookie in homeadmin:', session);

  // // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  // if (!session || !session.match(/^\d+$/)) {
  //     console.log('No valid session, redirecting to /admin');
  //     // throw redirect(302, '/admin');
  // }

  // console.log('Session valid, loading homeadmin page');
  // console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    // เอาเมนูทั้งหมดแล้วกรองเอาเฉพาะร้านนี้
    const allMenus = await pb.collection('Menu').getFullList({});
    
    // Fetch restaurant data
    const restaurant = await pb.collection('Shop').getOne(params.id, {
      expand: 'User_Owner_ID'
    });
    
    console.log('Successfully loaded restaurant:', restaurant.name);
    
    // Fetch menu items - ใช้ field ที่เชื่อมกับ restaurant ID
    let menuItems: any[] = [];
    try {
      // เอาเมนูทั้งหมดแล้วกรองเอาเฉพาะร้านนี้
      const allMenus = await pb.collection('Menu').getFullList({
        sort: 'name'
      });          
      // กรองเมนูที่เป็นของร้านนี้
      menuItems = allMenus.filter(menu => 
        menu.field === params.id || 
        menu.restaurant_id === params.id ||
        menu.Shop === params.id
      );
      console.log('Found menu items:', menuItems.length);

      // Debug: แสดงข้อมูลเมนูทั้งหมดเพื่อดู category
      menuItems.forEach((item, index) => {
        console.log(`Menu ${index + 1}:`, {
          name: item.name,
          category: item.category || 'ไม่มี category',
          id: item.id
        });
      });
      if (menuItems.length > 0) {
        console.log('Sample menu item:', JSON.stringify(menuItems[0], null, 2));
      }      
    } catch (menuError) {
      console.error('Error loading menu:', menuError);
      menuItems = []; // ถ้าไม่มีเมนูก็ให้เป็น array ว่าง
    }
    
    return {
      restaurant,
      menuItems,
      success: true
    };
    
    } catch (err) {
      console.error('Error loading restaurant:', err);
      throw error(404, 'Restaurant not found');
  }
};

  //   // Initialize stats object
  //   let stats = {
  //     menus: 0
  //   };

  //   let cate = [];
    
  //   // ดึงจำนวน Menu ทั้งหมด
  //   let menuData = [];
  //   try {
  //     console.log('Fetching users count...');
  //     const menuCount = await pb.collection('Menu').getFullList();
  //     console.log('Users count result:', menuCount);
  //     console.log('Users totalItems:', menuCount.length);
  //     stats.menus = menuCount.length;
  //     menuData = menuCount; // เก็บข้อมูล users แบบละเอียด
  //   } catch (error) {
  //     console.log('Error fetching users:', error);
  //   }

  //   // ดึง Category
  //   try {
  //     console.log('Fetching category menu count...');
  //     const categoryOnly = await pb.collection('Menu').getFullList({
  //       fields: 'category'
  //     });

  //     const categorySort = categoryOnly.map(o => o.category).filter(c => c != null && c !== '');; // หรือ o.expand?.menu?.category
  //     const categoryCount = Array.from(new Set(categorySort)); 
      
  //     // เปลี่ยนจากเก็บแค่จำนวน → เป็น array ที่ใช้แสดง
  //     cate = categoryCount.map(category => ({ category }));
  //   } catch (error) {
  //     console.log('Error fetching category menu:', error);
  //   }

  //   const result = {
  //     menus: menuData, // เพิ่มข้อมูล users แบบละเอียด
  //     cate
  //   };

  //   console.log('Final result:', result);
  //   return result;
  // } catch (error) {
  //   console.error('Error loading menu data:', error);
    
  //   // Return fallback data if database connection fails
  //   return {
  //     menus: [],
  //     cate: {
  //       category: 0
  //     }
  //   };
  // }
// };