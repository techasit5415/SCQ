import { fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);

export const load = async ({ cookies, params }: any) => {
  const session = cookies.get('session');
  const shopId = params.id; // ดึง shop ID จาก URL
  console.log('Session cookie in dashboard:', session);
  console.log('Shop ID:', shopId);

  // ตรวจสอบว่ามี session และเป็นตัวเลข (user id)
  if (!session || !session.match(/^\d+$/)) {
      console.log('No valid session, redirecting to /admin');
      // throw redirect(302, '/admin');
  }

  console.log('Session valid, loading dashboard page for shop:', shopId);

  try {
    console.log('Attempting to connect to PocketBase...');
    
    // Initialize stats object
    // let stats = {
    //   users: 0,
    //   orders: 0,
    //   dishes: 0,
    //   canceled: 0
    // };

    let shops = []
    
    let restaurant = {
      newOrder: 0,
      inProgressOrder: 0,
      completedOrder: 0,
      todaySale: 0
    };

    let analytics: any = {
      dailyOrders: [],
      weeklyRevenue: [],
      popularMenus: [],
      orderStatusChart: [],
      hourlyOrders: []
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
    
    // ดึงข้อมูล New Orders (เฉพาะร้านนี้)
    try {
      console.log('Fetching new orders count for shop:', shopId);
      const newOrderCount = await pb.collection('Order').getFullList({
        filter: `Status = "Pending" && Shop_ID = "${shopId}"`
      });
      console.log('New orders count result:', newOrderCount);
      restaurant.newOrder = newOrderCount.length;
    } catch (error) {
      console.log('Error fetching new orders:', error);
    }

    // ดึงข้อมูล In Progress Orders (เฉพาะร้านนี้)
    try {
      console.log('Fetching in-progress orders count for shop:', shopId);
      const inProgressOrderCount = await pb.collection('Order').getFullList({
        filter: `Status = "In-progress" && Shop_ID = "${shopId}"`
      });
      console.log('In-progress orders count result:', inProgressOrderCount);
      restaurant.inProgressOrder = inProgressOrderCount.length;
    } catch (error) {
      console.log('Error fetching in-progress orders:', error);
    }

    // ดึงข้อมูล Completed Orders (เฉพาะร้านนี้)
    try {
      console.log('Fetching completed orders count for shop:', shopId);
      const completedOrderCount = await pb.collection('Order').getFullList({
        filter: `Status = "Completed" && Shop_ID = "${shopId}"`
      });
      console.log('Completed orders count result:', completedOrderCount);
      restaurant.completedOrder = completedOrderCount.length;
    } catch (error) {
      console.log('Error fetching completed orders:', error);
    }

    // ดึงข้อมูล Total Today Sale (รวมทั้ง Completed และ In-progress - เฉพาะร้านนี้)
    try {
      console.log('Fetching today orders for sales calculation for shop:', shopId);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      // ดึง orders ทั้ง Completed และ In-progress ของวันนี้ (เฉพาะร้านนี้)
      const todayOrders = await pb.collection('Order').getFullList({
        filter: `(Status = "Completed" || Status = "In-progress") && Shop_ID = "${shopId}" && created >= "${todayStart.toISOString()}" && created < "${todayEnd.toISOString()}"`
      });
      
      console.log('Today orders for sales:', todayOrders.map(o => ({ 
        id: o.id, 
        status: o.Status, 
        amount: o.Total_Amount, 
        created: o.created 
      })));
      
      restaurant.todaySale = todayOrders.reduce((sum, order) => {
        return sum + (order.Total_Amount || 0)
      }, 0);
      console.log('Total today sale (Completed + In-progress):', restaurant.todaySale);
    } catch (error) {
      console.log('Error fetching today sales:', error);
    }

    // ดึงข้อมูลสำหรับกราฟ Daily Orders (7 วันที่ผ่านมา - เฉพาะร้านนี้)
    try {
      console.log('Fetching daily orders data for shop:', shopId);
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const dayOrders = await pb.collection('Order').getFullList({
          filter: `Shop_ID = "${shopId}" && created >= "${dayStart.toISOString()}" && created < "${dayEnd.toISOString()}"`
        });
        
        last7Days.push({
          date: dayStart.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, order) => sum + (order.Total_Amount || 0), 0)
        });
      }
      analytics.dailyOrders = last7Days;
      console.log('Daily orders data:', JSON.stringify(last7Days, null, 2));
    } catch (error) {
      console.log('Error fetching daily orders:', error);
    }

    // ดึงข้อมูลเมนูยอดนิยม (Top 5 - เฉพาะร้านนี้)
    try {
      console.log('Fetching popular menus for shop:', shopId);
      const allOrders = await pb.collection('Order').getFullList({
        filter: `Shop_ID = "${shopId}"`,
        expand: 'Menu_ID'
      });
      
      const menuCount: any = {};
      allOrders.forEach(order => {
        if (order.expand?.Menu_ID) {
          order.expand.Menu_ID.forEach((menu: any) => {
            const menuName = menu.name || 'Unknown';
            menuCount[menuName] = (menuCount[menuName] || 0) + 1;
          });
        }
      });
      
      analytics.popularMenus = Object.entries(menuCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);
    } catch (error) {
      console.log('Error fetching popular menus:', error);
    }

    // ดึงข้อมูลสถานะคำสั่งซื้อสำหรับ Pie Chart (เฉพาะร้านนี้)
    try {
      console.log('Fetching order status data for shop:', shopId);
      const allOrders = await pb.collection('Order').getFullList({
        filter: `Shop_ID = "${shopId}"`
      });
      
      const statusCount = {
        'Pending': 0,
        'In-progress': 0,
        'Completed': 0,
        'Cancelled': 0
      };
      
      allOrders.forEach(order => {
        const status = order.Status || 'Unknown';
        if (statusCount.hasOwnProperty(status)) {
          (statusCount as any)[status]++;
        }
      });
      
      analytics.orderStatusChart = Object.entries(statusCount).map(([status, count]) => ({
        status,
        count,
        percentage: allOrders.length > 0 ? ((count / allOrders.length) * 100).toFixed(1) : 0
      }));
    } catch (error) {
      console.log('Error fetching order status data:', error);
    }

    // ดึงข้อมูลคำสั่งซื้อตามชั่วโมง (วันนี้ - เฉพาะร้านนี้)
    try {
      console.log('Fetching hourly orders data for shop:', shopId);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const todayOrders = await pb.collection('Order').getFullList({
        filter: `Shop_ID = "${shopId}" && created >= "${todayStart.toISOString()}" && created < "${todayEnd.toISOString()}"`
      });
      
      const hourlyCount = Array(24).fill(0);
      todayOrders.forEach(order => {
        const hour = new Date(order.created).getHours();
        hourlyCount[hour]++;
      });
      
      analytics.hourlyOrders = hourlyCount.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: count
      }));
    } catch (error) {
      console.log('Error fetching hourly orders:', error);
    }

    const result = {
      restaurant,
      analytics
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
      },
      analytics: {
        dailyOrders: [],
        weeklyRevenue: [],
        popularMenus: [],
        orderStatusChart: [],
        hourlyOrders: []
      }
    };
  }
};

export const actions = {
  addRestaurant: async ({ request }: any) => {
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