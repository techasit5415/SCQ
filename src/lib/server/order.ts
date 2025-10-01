import type { PageServerLoad} from '../$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async () => {
  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Initialize object
    
    let restaurant = {
      newOrder: 0,
      inProgressOrder: 0,
      completedOrder: 0,
      todaySale: 0
    };
    
    // ดึงข้อมูล New Orders
    try {
      console.log('Fetching new orders count...');
      const newOrderCount = await pb.collection('Order').getFullList({
        filter: 'Status = "Pending"'
      });
      console.log('New orders count result:', newOrderCount);
      restaurant.newOrder = newOrderCount.length;
    } catch (error) {
      console.log('Error fetching new orders:', error);
    }

    // ดึงข้อมูล In Progress Orders
    try {
      console.log('Fetching in-progress orders count...');
      const inProgressOrderCount = await pb.collection('Order').getFullList({
        filter: 'Status = "In-progress"'
      });
      console.log('In-progress orders count result:', inProgressOrderCount);
      restaurant.inProgressOrder = inProgressOrderCount.length;
    } catch (error) {
      console.log('Error fetching in-progress orders:', error);
    }

    // ดึงข้อมูล Completed Orders
    try {
      console.log('Fetching completed orders count...');
      const completedOrderCount = await pb.collection('Order').getFullList({
        filter: 'Status = "Completed"'
      });
      console.log('Completed orders count result:', completedOrderCount);
      restaurant.completedOrder = completedOrderCount.length;
    } catch (error) {
      console.log('Error fetching completed orders:', error);
    }

    // ดึงข้อมูล Total Today Sale
    try {
      console.log('Fetching completed orders count...');
      const completedOrderCount = await pb.collection('Order').getFullList({
        filter: 'Status = "Completed"'
      });
      
      restaurant.todaySale = completedOrderCount.reduce((sum, order) => {
        return sum + (order.Total_Amount || 0)
      }, 0);
      console.log('Total today sale from completed orders:', restaurant.todaySale);
    } catch (error) {
      console.log('Error fetching completed orders:', error);
    }

    const result = {
      // stats,
      restaurant
      // shops,
      // users: usersData // เพิ่มข้อมูล users แบบละเอียด
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data if database connection fails
    return {
      restaurant: {
        newOrder: 0,
        inProgressOrder: 0,
        completedOrder: 0,
        todaySale: 0
      }
    };
  }
};