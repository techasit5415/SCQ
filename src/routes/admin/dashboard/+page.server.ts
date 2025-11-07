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
      const allOrders = await pb.collection('Order').getFullList({
        expand: 'Shop_ID,Menu_ID',
        sort: '-created'
      });
      
      // กรองเอาเฉพาะ Orders ของร้านจริง ไม่เอา Orders จากร้าน SCQ (Top-up)
      orders = allOrders.filter((order: any) => {
        return order.Shop_ID !== '000000000000001';
      });
      
      console.log('Orders fetched:', orders.length, '(filtered from', allOrders.length, 'total, excluding SCQ Top-up orders)');
    } catch (error) {
      console.error('Error fetching orders:', error);
    }

    // Fetch shops
    try {
      console.log('Fetching shops...');
      const allShops = await pb.collection('Shop').getFullList({
        expand: 'User_Owner_ID',
        sort: 'name'
      });
      
      // กรองเอาเฉพาะร้านจริง ไม่เอาร้าน SCQ (ใช้สำหรับ Top-up เท่านั้น)
      shops = allShops.filter((shop: any) => {
        return shop.id !== '000000000000001' && !shop.Name?.startsWith('[SYSTEM]') && !shop.name?.startsWith('[SYSTEM]');
      });
      
      console.log('Shops fetched:', shops.length, '(filtered from', allShops.length, 'total)');
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

    // Fetch payments
    let payments: any[] = [];
    try {
      console.log('Fetching payments...');
      payments = await pb.collection('Payment').getFullList({
        sort: '-created'
      });
      console.log('Payments fetched:', payments.length);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }

    // Calculate KPIs (ส่ง payments ด้วย)
    kpis = calculateKPIs(orders, payments, todayStartISO, monthStartISO);
    
    // Debug logging
    console.log('KPIs calculated:', {
      activeOrders: kpis.activeOrders,
      avgPreparationTime: kpis.avgPreparationTime
    });
    
    // Calculate charts data
    charts = calculateCharts(orders, payments, shops, menus);

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

function calculateKPIs(orders: any[], payments: any[], todayStartISO: string, monthStartISO: string) {
  const now = new Date();
  
  // สร้าง Map ของ Order ID -> Payment สำหรับการเช็คเร็วขึ้น
  const paymentMap = new Map<string, any>();
  payments.forEach(payment => {
    if (payment.Order_ID) {
      paymentMap.set(payment.Order_ID, payment);
    }
  });
  
  // กรองเอาเฉพาะ Orders ที่:
  // 1. Status ไม่ใช่ Canceled
  // 2. มี Payment ที่ status = Success
  const validOrders = orders.filter(order => {
    if (order.Status === 'Canceled') {
      return false; // ไม่นับ Orders ที่ยกเลิก
    }
    
    const payment = paymentMap.get(order.id);
    // ถ้าไม่มี Payment หรือ Payment status ไม่ใช่ Success ก็ไม่นับ
    if (!payment || payment.status !== 'Success') {
      return false;
    }
    
    return true;
  });
  
  console.log('📊 Orders filtered for revenue:', {
    total: orders.length,
    validForRevenue: validOrders.length,
    canceled: orders.filter(o => o.Status === 'Canceled').length,
    withoutPayment: orders.filter(o => !paymentMap.has(o.id)).length,
    paymentNotSuccess: orders.filter(o => {
      const p = paymentMap.get(o.id);
      return p && p.status !== 'Success';
    }).length
  });
  
  // Filter orders by date (ใช้ validOrders)
  const todayOrders = validOrders.filter(order => 
    new Date(order.created) >= new Date(todayStartISO)
  );
  
  const monthOrders = validOrders.filter(order => 
    new Date(order.created) >= new Date(monthStartISO)
  );

  // Active Orders (In-progress, Pending) - ใช้ orders ทั้งหมด ไม่กรอง payment
  const activeOrders = orders.filter(order => 
    ['In-progress', 'Pending'].includes(order.Status)
  ).length;

  // Orders Today/MTD - ใช้ validOrders
  const ordersToday = todayOrders.length;
  const ordersMTD = monthOrders.length;

  // Revenue Today/MTD - ใช้ validOrders เท่านั้น
  const revenueToday = todayOrders.reduce((sum, order) => 
    sum + (parseFloat(order.Total_Amount) || 0), 0
  );
  const revenueMTD = monthOrders.reduce((sum, order) => 
    sum + (parseFloat(order.Total_Amount) || 0), 0
  );

  // Cancel Rate - ใช้ orders ทั้งหมด
  const totalOrders = orders.length;
  const canceledOrders = orders.filter(order => 
    order.Status === 'Canceled'
  ).length;
  const cancelRate = totalOrders > 0 ? (canceledOrders / totalOrders * 100).toFixed(1) : '0';

  // Average Order Value - ใช้ validOrders เท่านั้น
  const totalRevenue = validOrders.reduce((sum, order) => sum + (parseFloat(order.Total_Amount) || 0), 0);
  const avgOrderValue = validOrders.length > 0 ? (totalRevenue / validOrders.length).toFixed(2) : '0';

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
    console.log('⏱️ Avg Preparation Time:', avgPreparationTime, 'minutes from', ordersWithPrepTime.length, 'orders');
  } else {
    console.log('⚠️ No orders with preparation time data');
  }

  return {
    activeOrders,
    ordersToday,
    ordersMTD,
    revenueToday: revenueToday.toFixed(2),
    revenueMTD: revenueMTD.toFixed(2),
    avgOrderValue,
    cancelRate,
    avgPreparationTime
  };
}

function calculateCharts(orders: any[], payments: any[], shops: any[], menus: any[]) {
  console.log('📊 Calculate Charts - Total Orders:', orders.length);
  console.log('📊 Calculate Charts - Total Payments:', payments.length);
  
  // สร้าง Payment Map สำหรับ O(1) lookup
  const paymentMap = new Map<string, any>();
  payments.forEach(payment => {
    if (payment.Order_ID) {
      paymentMap.set(payment.Order_ID, payment);
    }
  });
  
  // กรอง validOrders สำหรับ revenue/sales - ต้องมี Payment.status = "Success" และไม่เป็น Canceled
  const validOrders = orders.filter(order => {
    if (order.Status === 'Canceled') return false;
    const payment = paymentMap.get(order.id);
    return payment && payment.status === 'Success';
  });
  
  console.log('📊 Valid Orders (Paid & Not Canceled):', validOrders.length);
  
  // Hourly heatmap - ใช้ orders ทั้งหมดเพื่อดูภาพรวมการสั่งอาหาร
  const hourlyData = Array(24).fill(0);
  orders.forEach(order => {
    const hour = new Date(order.created).getHours();
    hourlyData[hour]++;
  });

  // Top 5 Restaurants by orders - ใช้ validOrders เท่านั้น (นับเฉพาะที่จ่ายเงินแล้ว)
  const shopOrderCounts: { [key: string]: number } = {};
  
  // นับ Orders ของแต่ละร้าน (เฉพาะที่จ่ายแล้ว)
  validOrders.forEach(order => {
    const shopId = order.Shop_ID;
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      shopOrderCounts[shop.name] = (shopOrderCounts[shop.name] || 0) + 1;
    }
  });
  
  // เพิ่มร้านที่ยังไม่มี Orders เข้าไปด้วย (count = 0)
  shops.forEach(shop => {
    if (!shopOrderCounts[shop.name] && shop.name) {
      shopOrderCounts[shop.name] = 0;
    }
  });
  
  // เรียงและเอา Top 5
  const topRestaurants = Object.entries(shopOrderCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top 5 Dishes by sales (best seller from each restaurant) - ใช้ validOrders เท่านั้น
  const shopMenuSales: { [key: string]: { [key: string]: { name: string; shopName: string; sales: number; revenue: number } } } = {};
  
  validOrders.forEach(order => {
    if (order.Menu_ID && Array.isArray(order.Menu_ID) && order.Shop_ID) {
      const shop = shops.find(s => s.id === order.Shop_ID);
      const shopName = shop?.name || 'Unknown Shop';
      
      if (!shopMenuSales[order.Shop_ID]) {
        shopMenuSales[order.Shop_ID] = {};
      }
      
      order.Menu_ID.forEach((menuId: string) => {
        const menu = menus.find(m => m.id === menuId);
        if (menu) {
          const menuKey = menu.name;
          if (!shopMenuSales[order.Shop_ID][menuKey]) {
            shopMenuSales[order.Shop_ID][menuKey] = { 
              name: menu.name, 
              shopName: shopName,
              sales: 0, 
              revenue: 0 
            };
          }
          shopMenuSales[order.Shop_ID][menuKey].sales += 1;
          shopMenuSales[order.Shop_ID][menuKey].revenue += (parseFloat(menu.Price) || 0);
        }
      });
    }
  });

  // Get best selling dish from each restaurant
  const topDishesFromEachShop: { name: string; shopName: string; sales: number; revenue: number }[] = [];
  
  Object.keys(shopMenuSales).forEach(shopId => {
    const shopMenus = Object.values(shopMenuSales[shopId]);
    if (shopMenus.length > 0) {
      // Get the dish with highest sales (orders) from this shop
      const bestDish = shopMenus.sort((a, b) => b.sales - a.sales)[0];
      topDishesFromEachShop.push({
        name: `${bestDish.name} (${bestDish.shopName})`,
        shopName: bestDish.shopName,
        sales: bestDish.sales,
        revenue: bestDish.revenue
      });
    }
  });

  // Sort by sales (orders) and take top 5
  const topDishes = topDishesFromEachShop
    .sort((a, b) => b.sales - a.sales)
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
    avgPreparationTime: 0 // Will show 0 until real data is available
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
      { name: "ข้าวผัดกุ้ง (ร้านข้าวผัดป้าแดง)", shopName: "ร้านข้าวผัดป้าแดง", sales: 25, revenue: 1250 },
      { name: "ก๋วยเตี๋ยวต้มยำ (ก๋วยเตี๋ยวลูกชิ้น)", shopName: "ก๋วยเตี๋ยวลูกชิ้น", sales: 22, revenue: 880 },
      { name: "ส้มตำไทย (โซมตำไทย)", shopName: "โซมตำไทย", sales: 20, revenue: 800 },
      { name: "ข้าวมันไก่ (ข้าวมันไก่ป้าจิ๋ม)", shopName: "ข้าวมันไก่ป้าจิ๋ม", sales: 18, revenue: 720 },
      { name: "ลาบหมู (ลาบหนองคาย)", shopName: "ลาบหนองคาย", sales: 15, revenue: 675 }
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