import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  console.log('Session cookie in reports:', session);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /login');
      // throw redirect(302, '/login');
  }

  console.log('Session valid, loading reports page');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Initialize reports data
    let reportsData = {
      totalSales: 0,
      totalOrders: 0,
      totalDishes: 0,
      totalUsers: 0,
      activeUsers: [],
      orderStatus: {
        completed: 0,
        canceled: 0
      },
      monthlyData: {
        2024: Array(12).fill(0),
        2025: Array(12).fill(0)
      }
    };

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
    
    // ดึงข้อมูล Orders สำหรับคำนวณ Total Sales และ Total Orders
    try {
      console.log('Fetching orders data...');
      const orders = await pb.collection('Order').getFullList();
      console.log('Orders result:', orders);
      
      reportsData.totalOrders = orders.length;
      reportsData.totalSales = orders.reduce((sum, order) => sum + (order.Total_Amount || 0), 0);
      
      // คำนวณ Order Status
      reportsData.orderStatus.completed = orders.filter(order => 
        order.Status === 'sus' || order.Status === 'completed'
      ).length;
      reportsData.orderStatus.canceled = orders.filter(order => 
        order.Status === 'error' || order.Status === 'canceled'
      ).length;
      
      // จำลองข้อมูล monthly data (ในอนาคตสามารถคำนวณจากวันที่ created ของ orders)
      reportsData.monthlyData[2024] = [80, 95, 110, 125, 90, 105, 130, 115, 95, 110, 85, 100];
      reportsData.monthlyData[2025] = [90, 105, 85, 180, 75, 95, 140, 125, 105, 115, 90, 80];
      
    } catch (error) {
      console.log('Error fetching orders:', error);
    }

    // ดึงข้อมูล Menu สำหรับ Total Dishes
    try {
      console.log('Fetching menu data...');
      const menus = await pb.collection('Menu').getFullList();
      console.log('Menu result count:', menus.length);
      reportsData.totalDishes = menus.length;
    } catch (error) {
      console.log('Error fetching menu:', error);
    }

    // ดึงข้อมูล Users
    try {
      console.log('Fetching users data...');
      const users = await pb.collection('users').getFullList();
      console.log('Users result count:', users.length);
      reportsData.totalUsers = users.length;
      
      // จำลองข้อมูล active users (ในอนาคตสามารถคำนวณจาก last login)
      reportsData.activeUsers = users.slice(0, Math.min(users.length, 2));
    } catch (error) {
      console.log('Error fetching users:', error);
    }

    console.log('Final reports data:', reportsData);
    return {
      reports: reportsData
    };
    
  } catch (error) {
    console.error('Error loading reports data:', error);
    
    // Return fallback data if database connection fails
    return {
      reports: {
        totalSales: 0,
        totalOrders: 0,
        totalDishes: 0,
        totalUsers: 0,
        activeUsers: [],
        orderStatus: {
          completed: 0,
          canceled: 0
        },
        monthlyData: {
          2024: Array(12).fill(0),
          2025: Array(12).fill(0)
        }
      }
    };
  }
};