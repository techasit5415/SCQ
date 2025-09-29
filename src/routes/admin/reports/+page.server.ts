import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

// Helper function to get date range
function getDateRange(period: string) {
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'daily':
      startDate.setDate(now.getDate() - 7); // Last 7 days
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 28); // Last 4 weeks
      break;
    case 'monthly':
      startDate.setMonth(now.getMonth() - 12); // Last 12 months
      break;
    case 'yearly':
      startDate.setFullYear(now.getFullYear() - 3); // Last 3 years
      break;
    default:
      startDate.setMonth(now.getMonth() - 1); // Default to last month
  }
  
  return { startDate, endDate: now };
}

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
      activeUsers: [] as any[],
      orderStatus: {
        completed: 0,
        canceled: 0
      },
      monthlyData: {
        2024: Array(12).fill(0),
        2025: Array(12).fill(0)
      },
      paymentMethods: {
        cash: 0,
        credit_card: 0,
        promptpay: 0,
        bank_transfer: 0
      },
      shopSales: [] as any[],
      popularMenus: [] as any[]
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
    
    // ดึงข้อมูล Orders
    try {
      console.log('Fetching orders data...');
      const orders = await pb.collection('Order').getFullList({
        expand: 'Shop_ID,Menu_ID'
      });
      console.log('Orders result:', orders);
      
      reportsData.totalOrders = orders.length;
      
      // คำนวณ Order Status
      reportsData.orderStatus.completed = orders.filter(order => 
        order.Status === 'Completed'
      ).length;
      reportsData.orderStatus.canceled = orders.filter(order => 
        order.Status === 'Canceled'
      ).length;
      
    } catch (error) {
      console.log('Error fetching orders:', error);
    }

    // ดึงข้อมูล Payments สำหรับคำนวณ Total Sales และ Payment Methods
    try {
      console.log('Fetching payments data...');
      const payments = await pb.collection('Payment').getFullList({
        expand: 'User_ID,Shop_ID,Order_ID'
      });
      console.log('Payments result:', payments);
      
      // คำนวณ Total Sales จากการชำระที่สำเร็จ
      reportsData.totalSales = payments
        .filter(payment => payment.status === 'Sus')
        .reduce((sum, payment) => sum + (payment.Total_Amount || 0), 0);
      
      // คำนวณ Payment Methods จาก Payment table
      const paymentMethodCounts = payments
        .filter(payment => payment.status === 'Sus')
        .reduce((acc, payment) => {
          const method = payment.Method_Payment;
          if (method === 'Cash') acc.cash++;
          else if (method === 'Qr Code') acc.promptpay++;
          else if (method === 'Point') acc.credit_card++;
          return acc;
        }, { cash: 0, credit_card: 0, promptpay: 0, bank_transfer: 0 });
      
      reportsData.paymentMethods = paymentMethodCounts;
      
      // คำนวณยอดขายของแต่ละร้านจาก Payment data
      const shopSalesMap = payments
        .filter(payment => payment.status === 'Sus')
        .reduce((acc, payment) => {
          const shopId = payment.Shop_ID;
          const shopName = payment.expand?.Shop_ID?.name || 'Unknown Shop';
          if (!acc[shopId]) {
            acc[shopId] = {
              shopId,
              shopName,
              totalSales: 0,
              totalOrders: 0
            };
          }
          acc[shopId].totalSales += payment.Total_Amount || 0;
          acc[shopId].totalOrders += 1;
          return acc;
        }, {} as any);
      
      reportsData.shopSales = Object.values(shopSalesMap);
      
    } catch (error) {
      console.log('Error fetching payments:', error);
    }

    // ดึงข้อมูล Menu สำหรับ Total Dishes
    try {
      console.log('Fetching menu data...');
      const menus = await pb.collection('Menu').getFullList({
        expand: 'Shop_ID'
      });
      console.log('Menu result count:', menus.length);
      reportsData.totalDishes = menus.length;
    } catch (error) {
      console.log('Error fetching menu:', error);
    }

    // ดึงข้อมูล Orders อีกครั้งเพื่อคำนวณเมนูยอดนิยม
    try {
      console.log('Calculating popular menus from orders...');
      const orders = await pb.collection('Order').getFullList({
        expand: 'Menu_ID,Shop_ID'
      });
      
      const menus = await pb.collection('Menu').getFullList({
        expand: 'field'
      });
      
      // คำนวณเมนูยอดนิยมจาก Order.Menu_ID (array relation)
      const menuPopularity = {} as any;
      
      orders.forEach(order => {
        if (order.Menu_ID && Array.isArray(order.Menu_ID) && order.Status === 'Completed') {
          order.Menu_ID.forEach(menuId => {
            if (!menuPopularity[menuId]) {
              const menu = menus.find(m => m.id === menuId);
              menuPopularity[menuId] = {
                menuId,
                menuName: menu?.name || 'Unknown Menu',
                shopId: order.Shop_ID,
                shopName: order.expand?.Shop_ID?.name || 'Unknown Shop',
                totalOrdered: 0
              };
            }
            menuPopularity[menuId].totalOrdered += 1;
          });
        }
      });
      
      // เรียงลำดับตามความนิยม
      reportsData.popularMenus = Object.values(menuPopularity)
        .sort((a: any, b: any) => b.totalOrdered - a.totalOrdered)
        .slice(0, 10); // Top 10 popular menus
        
    } catch (error) {
      console.log('Error calculating popular menus:', error);
    }

    // ดึงข้อมูล Users และคำนวณ Active Users
    try {
      console.log('Fetching users data...');
      const users = await pb.collection('users').getFullList({
        expand: 'Role'
      });
      console.log('Users result count:', users.length);
      reportsData.totalUsers = users.length;
      
      // ดึง Payments เพื่อหา Active Users (ผู้ใช้ที่มีการทำรายการ)
      const payments = await pb.collection('Payment').getFullList({
        filter: 'status = "Sus"'
      });
      
      const activeUserIds = new Set(payments.map(p => p.User_ID));
      
      // สร้างรายการ active users พร้อมข้อมูลเพิ่มเติม
      reportsData.activeUsers = users
        .filter(user => activeUserIds.has(user.id))
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.expand?.Role?.name || 'Unknown',
          created: user.created
        }))
        .slice(0, 10); // แสดงแค่ 10 คนแรก
        
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
        },
        paymentMethods: {
          cash: 0,
          credit_card: 0,
          promptpay: 0,
          bank_transfer: 0
        },
        shopSales: [],
        popularMenus: []
      }
    };
  }
};