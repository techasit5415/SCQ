import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ params, cookies }) => {
  const session = cookies.get('session');
  console.log('Session cookie in restaurant detail:', session);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  const restaurantId = params.id;
  
  // Skip static routes - these should be handled by their own routes
  if (restaurantId === 'AddRestaurant' || restaurantId === 'edit') {
    console.log('Skipping dynamic route for static path:', restaurantId);
    throw error(404, { message: 'Restaurant not found' });
  }
  
  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Admin authentication
    try {
      await pb.admins.authWithPassword(
        privateEnv.POCKETBASE_ADMIN_EMAIL || 'admin@example.com', 
        privateEnv.POCKETBASE_ADMIN_PASSWORD || 'admin123'
      );
      console.log('Admin authenticated successfully');
    } catch (authError) {
      console.log('Admin auth failed, trying without auth...');
    }
    
    // ดึงข้อมูลร้านอาหารตาม ID
    try {
      console.log('Fetching restaurant with ID:', restaurantId);
      const restaurant = await pb.collection('Shop').getOne(restaurantId, {
        expand: 'User_Owner_ID'
      });
      console.log('Restaurant found:', restaurant);
      
      // ดึงข้อมูล shops ทั้งหมดสำหรับ sidebar
      let shops: any[] = [];
      try {
        console.log('Fetching all shops for sidebar...');
        shops = await pb.collection('Shop').getFullList({
          sort: '-created'
        });
        console.log('Shops for sidebar:', shops);
      } catch (shopError) {
        console.log('Error fetching shops:', shopError);
      }
      
      // ดึงข้อมูล users สำหรับแสดงชื่อ owner
      let users: any[] = [];
      try {
        console.log('Fetching users...');
        users = await pb.collection('users').getFullList();
        console.log('Users:', users);
      } catch (userError) {
        console.log('Error fetching users:', userError);
      }

      // ดึงข้อมูล Recent Orders ของร้านนี้
      let recentOrdersResult: any = { items: [], totalItems: 0 };
      try {
        console.log('Fetching recent orders for restaurant:', restaurantId);
        recentOrdersResult = await pb.collection('Order').getList(1, 10, {
          filter: `Shop_ID = "${restaurantId}"`,
          expand: 'Menu_ID,User_ID',
          sort: '-created'
        });
        console.log('Recent orders:', recentOrdersResult);
      } catch (orderError) {
        console.log('Error fetching recent orders:', orderError);
      }

      // ดึงข้อมูล Payments ของร้านนี้เพื่อคำนวณยอดขาย
      let payments: any[] = [];
      let totalSales = 0;
      try {
        console.log('Fetching payments for restaurant:', restaurantId);
        payments = await pb.collection('Payment').getFullList({
          filter: `Shop_ID = "${restaurantId}" && status = "Sus"`,
          expand: 'Order_ID,User_ID'
        });
        
        totalSales = payments.reduce((sum, payment) => sum + (payment.Total_Amount || 0), 0);
        console.log('Total sales:', totalSales);
      } catch (paymentError) {
        console.log('Error fetching payments:', paymentError);
      }

      // ดึงข้อมูล Menus ของร้านนี้และหาเมนูยอดนิยม
      let menus: any[] = [];
      let popularMenus: any[] = [];
      try {
        console.log('Fetching menus for restaurant:', restaurantId);
        // ตาม schema Menu.field เป็น relation ไปยัง Shop
        menus = await pb.collection('Menu').getFullList({
          filter: `field = "${restaurantId}"`,
          expand: 'field',
          sort: '-created'
        });
        console.log('Menus fetched:', menus);

        // คำนวณเมนูยอดนิยมจาก Order data
        const menuPopularity: any = {};
        const orders = await pb.collection('Order').getFullList({
          filter: `Shop_ID = "${restaurantId}" && Status = "Completed"`,
          expand: 'Menu_ID'
        });

        console.log('Orders for popular menus:', orders);
        console.log('Menus available:', menus);

        orders.forEach((order: any) => {
          if (order.Menu_ID && Array.isArray(order.Menu_ID)) {
            order.Menu_ID.forEach((menuId: string) => {
              if (!menuPopularity[menuId]) {
                // หาเมนูจาก menus array ที่ดึงมาแล้ว
                const menu = menus.find(m => m.id === menuId);
                console.log(`Looking for menu ${menuId}:`, menu);
                
                menuPopularity[menuId] = {
                  menuId,
                  menuName: menu?.name || 'Unknown Menu',
                  totalOrdered: 0,
                  price: menu?.Price || 0,
                  available: menu?.Available || false
                };
              }
              menuPopularity[menuId].totalOrdered += 1;
            });
          }
        });

        console.log('Menu popularity calculated:', menuPopularity);

        popularMenus = Object.values(menuPopularity)
          .sort((a: any, b: any) => b.totalOrdered - a.totalOrdered)
          .slice(0, 5);

        console.log('Popular menus:', popularMenus);
      } catch (menuError) {
        console.log('Error fetching menus:', menuError);
      }
      
      return {
        restaurant,
        shops,
        users,
        recentOrders: recentOrdersResult.items || [],
        totalSales,
        popularMenus,
        menus,
        analytics: {
          totalOrders: recentOrdersResult.totalItems || 0,
          completedOrders: (recentOrdersResult.items || []).filter((order: any) => order.Status === 'Completed').length,
          totalPayments: payments.length
        }
      };
    } catch (fetchError) {
      console.error('Error fetching restaurant:', fetchError);
      throw error(404, 'Restaurant not found');
    }
    
  } catch (err) {
    console.error('Error loading restaurant data:', err);
    throw error(500, 'Failed to load restaurant data');
  }
};