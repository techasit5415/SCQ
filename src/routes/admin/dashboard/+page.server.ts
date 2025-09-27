import type { PageServerLoad, Actions } from '../$types.js';
import { redirect, fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  console.log('Session cookie in dashboard:', session);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  console.log('Session valid, loading dashboard page');
  console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);

  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Set date ranges for calculations
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Convert to ISO strings for PocketBase filter
    const todayStartISO = todayStart.toISOString();
    const monthStartISO = monthStart.toISOString();

    // Initialize data objects
    let kpis: any = {};
    let charts: any = {};
    let shops: any[] = [];

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
    
    // Fetch all orders with expanded relations
    let orders: any[] = [];
    try {
      console.log('Fetching orders...');
      orders = await pb.collection('Order').getFullList({
        expand: 'Shop_ID,Menu_ID',
        sort: '-created'
      });
      console.log('Orders fetched:', orders.length);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }

    // Fetch shops
    try {
      console.log('Fetching shops...');
      shops = await pb.collection('Shop').getFullList({
        expand: 'User_Owner_ID',
        sort: 'name'
      });
      console.log('Shops fetched:', shops.length);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
    
    // Fetch menus
    let menus: any[] = [];
    try {
      console.log('Fetching menus...');
      menus = await pb.collection('Menu').getFullList({
        expand: 'field',
        sort: 'name'
      });
      console.log('Menus fetched:', menus.length);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }

    // Fetch users
    let users: any[] = [];
    try {
      console.log('Fetching users...');
      users = await pb.collection('users').getFullList();
      console.log('Users fetched:', users.length);
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    // Calculate KPIs
    kpis = calculateKPIs(orders, todayStartISO, monthStartISO);
    
    // Debug logging
    console.log('KPIs calculated:', {
      activeOrders: kpis.activeOrders,
      avgPreparationTime: kpis.avgPreparationTime,
      avgFulfillmentTime: kpis.avgFulfillmentTime
    });
    
    // Calculate charts data
    charts = calculateCharts(orders, shops, menus);

    const result = {
      kpis,
      charts,
      shops,
      users,
      totalOrders: orders.length,
      recentOrders: orders.slice(0, 10)
    };

    console.log('Dashboard data loaded successfully');
    return result;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data for development
    return {
      kpis: getMockKPIs(),
      charts: getMockCharts(),
      shops: [],
      users: [],
      totalOrders: 0,
      recentOrders: []
    };
  }
};

function calculateKPIs(orders: any[], todayStartISO: string, monthStartISO: string) {
  const now = new Date();
  
  // Filter orders by date
  const todayOrders = orders.filter(order => 
    new Date(order.created) >= new Date(todayStartISO)
  );
  
  const monthOrders = orders.filter(order => 
    new Date(order.created) >= new Date(monthStartISO)
  );

  // Active Orders (In-progress, Pending)
  const activeOrders = orders.filter(order => 
    ['In-progress', 'Pending'].includes(order.Status)
  ).length;

  // Orders Today/MTD
  const ordersToday = todayOrders.length;
  const ordersMTD = monthOrders.length;

  // Revenue Today/MTD
  const revenueToday = todayOrders.reduce((sum, order) => 
    sum + (parseFloat(order.Total_Amount) || 0), 0
  );
  const revenueMTD = monthOrders.reduce((sum, order) => 
    sum + (parseFloat(order.Total_Amount) || 0), 0
  );

  // Cancel Rate
  const totalOrders = orders.length;
  const canceledOrders = orders.filter(order => 
    order.Status === 'Canceled'
  ).length;
  const cancelRate = totalOrders > 0 ? (canceledOrders / totalOrders * 100).toFixed(1) : '0';

  // Average Order Value
  const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.Total_Amount) || 0), 0);
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0';

  // Calculate Average Preparation Time (in minutes)
  const ordersWithPrepTime = orders.filter(order => 
    order.preparation_start_time && order.preparation_end_time
  );
  
  let avgPreparationTime = 0;
  if (ordersWithPrepTime.length > 0) {
    const totalPrepTime = ordersWithPrepTime.reduce((sum, order) => {
      const startTime = new Date(order.preparation_start_time);
      const endTime = new Date(order.preparation_end_time);
      const diffMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // Convert to minutes
      return sum + diffMinutes;
    }, 0);
    avgPreparationTime = Math.round(totalPrepTime / ordersWithPrepTime.length);
  }

  // Calculate Average Fulfillment Time (from order time to completion)
  const completedOrders = orders.filter(order => 
    order.Status === 'Completed' && order.completed_time && order.Order_Time
  );
  
  let avgFulfillmentTime = 0;
  if (completedOrders.length > 0) {
    const totalFulfillmentTime = completedOrders.reduce((sum, order) => {
      const orderTime = new Date(order.Order_Time);
      const completedTime = new Date(order.completed_time);
      const diffMinutes = (completedTime.getTime() - orderTime.getTime()) / (1000 * 60); // Convert to minutes
      return sum + Math.max(diffMinutes, 0); // Ensure positive values only
    }, 0);
    avgFulfillmentTime = Math.round(totalFulfillmentTime / completedOrders.length);
  }

  return {
    activeOrders,
    ordersToday,
    ordersMTD,
    revenueToday: revenueToday.toFixed(2),
    revenueMTD: revenueMTD.toFixed(2),
    avgOrderValue,
    cancelRate,
    avgPreparationTime,
    avgFulfillmentTime
  };
}

function calculateCharts(orders: any[], shops: any[], menus: any[]) {
  // Hourly heatmap
  const hourlyData = Array(24).fill(0);
  orders.forEach(order => {
    const hour = new Date(order.created).getHours();
    hourlyData[hour]++;
  });

  // Top 5 Restaurants by orders
  const shopOrderCounts: { [key: string]: number } = {};
  orders.forEach(order => {
    const shopId = order.Shop_ID;
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      shopOrderCounts[shop.name] = (shopOrderCounts[shop.name] || 0) + 1;
    }
  });
  
  const topRestaurants = Object.entries(shopOrderCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top 5 Dishes by sales
  const menuSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};
  orders.forEach(order => {
    if (order.Menu_ID && Array.isArray(order.Menu_ID)) {
      order.Menu_ID.forEach((menuId: string) => {
        const menu = menus.find(m => m.id === menuId);
        if (menu) {
          const key = menu.name;
          if (!menuSales[key]) {
            menuSales[key] = { name: key, sales: 0, revenue: 0 };
          }
          menuSales[key].sales += 1;
          menuSales[key].revenue += (parseFloat(menu.Price) || 0);
        }
      });
    }
  });

  const topDishes = Object.values(menuSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Orders by Status
  const statusCounts: { [key: string]: number } = {};
  orders.forEach(order => {
    const status = order.Status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return {
    hourlyHeatmap: hourlyData.map((count, hour) => ({ hour, count })),
    topRestaurants,
    topDishes,
    ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: orders.length > 0 ? ((count / orders.length) * 100).toFixed(1) : '0'
    }))
  };
}

// Mock data functions for development/fallback
function getMockKPIs() {
  return {
    activeOrders: 12,
    ordersToday: 45,
    ordersMTD: 890,
    revenueToday: "15420.50",
    revenueMTD: "234560.75",
    avgOrderValue: "342.50",
    cancelRate: "5.2",
    avgPreparationTime: 0, // Will show 0 until real data is available
    avgFulfillmentTime: 0  // Will show 0 until real data is available
  };
}

function getMockCharts() {
  return {
    hourlyHeatmap: Array(24).fill(0).map((_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 20) + (hour >= 11 && hour <= 14 ? 15 : 0) + (hour >= 18 && hour <= 21 ? 12 : 0)
    })),
    topRestaurants: [
      { name: "ร้านข้าวผัดป้าแดง", count: 45 },
      { name: "ก๋วยเตี๋ยวลูกชิ้น", count: 38 },
      { name: "โซมตำไทย", count: 32 },
      { name: "ข้าวมันไก่ป้าจิ๋ม", count: 28 },
      { name: "ลาบหนองคาย", count: 25 }
    ],
    topDishes: [
      { name: "ข้าวผัดกุ้ง", sales: 25, revenue: 1250 },
      { name: "ก๋วยเตี๋ยวต้มยำ", sales: 22, revenue: 880 },
      { name: "ส้มตำไทย", sales: 20, revenue: 800 },
      { name: "ข้าวมันไก่", sales: 18, revenue: 720 },
      { name: "ลาบหมู", sales: 15, revenue: 675 }
    ],
    ordersByStatus: [
      { status: "Completed", count: 156, percentage: "65.0" },
      { status: "In-progress", count: 28, percentage: "11.7" },
      { status: "Canceled", count: 15, percentage: "6.3" },
      { status: "Pending", count: 41, percentage: "17.1" }
    ]
  };
}

export const actions: Actions = {
  addRestaurant: async ({ request }: { request: any }) => {
    const formData = await request.formData();
    
    const restaurantData = {
      name: formData.get('name') as string,
      Type_Shop: formData.get('type') as string,
      User_Owner_ID: formData.get('ownerId') as string,
      Phone: formData.get('phone') as string,
      Addr: formData.get('address') as string,
      Details: formData.get('description') as string,
      field: '' // Required field in schema
    };

    console.log('Attempting to create restaurant with data:', restaurantData);

    try {
      // Admin authentication
      if (privateEnv.POCKETBASE_ADMIN_EMAIL && privateEnv.POCKETBASE_ADMIN_PASSWORD) {
        await pb.admins.authWithPassword(
          privateEnv.POCKETBASE_ADMIN_EMAIL,
          privateEnv.POCKETBASE_ADMIN_PASSWORD
        );
        console.log('Admin authenticated successfully');
      }

      // Validate required fields
      if (!restaurantData.name || !restaurantData.Type_Shop || !restaurantData.Phone || !restaurantData.Addr) {
        console.log('Missing required fields:', {
          name: !!restaurantData.name,
          type: !!restaurantData.Type_Shop,
          phone: !!restaurantData.Phone,
          address: !!restaurantData.Addr
        });
        
        return fail(400, {
          error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          formData: restaurantData
        });
      }

      // Create restaurant in database
      const record = await pb.collection('Shop').create(restaurantData);
      
      console.log('Restaurant created successfully:', record);
      
      return {
        success: true,
        message: 'เพิ่มร้านอาหารสำเร็จ!'
      };
      
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'ไม่สามารถเพิ่มร้านอาหารได้ กรุณาลองใหม่อีกครั้ง';
      
      if (error.response?.data?.data) {
        const fieldErrors = error.response.data.data;
        if (fieldErrors.Type_Shop) {
          errorMessage = `ประเภทร้านอาหารไม่ถูกต้อง: กรุณาเลือกเฉพาะ "อาหารไทย" หรือ "อาหารญี่ปุ่น" เท่านั้น`;
        } else if (fieldErrors.User_Owner_ID) {
          errorMessage = `เจ้าของร้านไม่ถูกต้อง: กรุณาเลือกเจ้าของร้าน`;
        } else {
          errorMessage = `ข้อมูลไม่ถูกต้อง: ${JSON.stringify(fieldErrors)}`;
        }
      }
      
      return fail(400, {
        error: errorMessage,
        formData: restaurantData
      });
    }
  }
};