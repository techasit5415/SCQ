import type { PageServerLoad, Actions } from '../$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  console.log('Session cookie in manage restaurant:', session);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  console.log('Session valid, loading manage restaurant page');
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

    // ดึงข้อมูล Shops สำหรับแสดงใน Cards
    let shops: any[] = [];
    try {
      console.log('Fetching shops with owner details...');
      const allShops = await pb.collection('Shop').getFullList({
        expand: 'User_Owner_ID',
        sort: '-created'
      });
      
      // กรองเอาเฉพาะร้านจริง ไม่เอาร้าน placeholder สำหรับระบบ
      shops = allShops.filter((shop: any) => {
        return shop.id !== '000000000000001' && !shop.name?.startsWith('[SYSTEM]');
      });
      
      console.log('Shops fetched:', shops.length, '(filtered from', allShops.length, 'total)');
    } catch (error) {
      console.error('Error fetching shops:', error);
    }

    // ดึงข้อมูลจำนวนคิวของแต่ละร้าน
    let queueCounts: { [shopId: string]: number } = {};
    try {
      console.log('Fetching queue counts...');
      const orders = await pb.collection('Order').getFullList({
        filter: 'Status = "In-progress"',
        fields: 'Shop_ID'
      });
      
      // นับจำนวนคิวแต่ละร้าน
      queueCounts = orders.reduce((acc: { [key: string]: number }, order: any) => {
        const shopId = order.Shop_ID;
        acc[shopId] = (acc[shopId] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Queue counts:', queueCounts);
    } catch (error) {
      console.error('Error fetching queue counts:', error);
    }

    // เพิ่มจำนวนคิวเข้าไปในข้อมูลร้าน
    shops = shops.map(shop => ({
      ...shop,
      queueCount: queueCounts[shop.id] || 0
    }));

    // คำนวณสถิติร้านค้า
    const restaurantStats = calculateRestaurantStats(shops);

    const result = {
      shops,
      restaurantStats,
      totalRestaurants: shops.length
    };

    console.log('Manage restaurant data loaded successfully');
    return result;
  } catch (error) {
    console.error('Error loading manage restaurant data:', error);
    
    return {
      shops: [],
      restaurantStats: {
        totalRestaurants: 0,
        activeRestaurants: 0,
        newThisMonth: 0,
        totalOrders: 0
      },
      totalRestaurants: 0
    };
  }
};

function calculateRestaurantStats(shops: any[]) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const stats = {
    totalRestaurants: shops.length,
    activeRestaurants: shops.filter(shop => shop.Status !== false).length,
    newThisMonth: shops.filter(shop => new Date(shop.created) >= thisMonth).length,
    totalOrders: 0 // จะต้องดึงจาก Order collection ในอนาคต
  };

  return stats;
}

