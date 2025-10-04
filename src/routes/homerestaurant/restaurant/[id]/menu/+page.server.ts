import type { PageServerLoad, Actions } from '../$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { page } from '$app/state';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load = async ({ params }: { params: { id: string } }) => {

// export const load: PageServerLoad = async ({ cookies }) => {
//   const session = cookies.get('session');
//   console.log('Session cookie in homeadmin:', session);

//   // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
//   if (!session || !session.match(/^\d+$/)) {
//       console.log('No valid session, redirecting to /admin');
//       // throw redirect(302, '/admin');
//   }

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