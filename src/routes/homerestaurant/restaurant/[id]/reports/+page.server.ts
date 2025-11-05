import PocketBase from 'pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD } from '$env/static/private';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ locals, cookies, params }) => {
  console.log('=== Loading Reports Page ===');
  const shopId = params.id; // ดึง shop ID จาก URL
  console.log('Shop ID:', shopId);

  // Initialize data structures
  let reports: any = {
    totalSales: 0,
    totalOrders: 0,
    totalDishes: 0,
    totalCustomers: 0,
    monthlyRevenue: [],
    paymentMethods: [],
    topCustomers: []
  };

  // Authenticate as admin
  try {
    await pb.admins.authWithPassword(
      POCKETBASE_ADMIN_EMAIL,
      POCKETBASE_ADMIN_PASSWORD
    );
    console.log('Admin authenticated successfully');
  } catch (authError) {
    console.error('Authentication error:', authError);
    throw error(401, 'Authentication failed');
  }

  try {
    // 1. ดึงข้อมูล Total Sales (ยอดขายรวมทั้งหมด - เฉพาะร้านนี้)
    console.log('Fetching total sales for shop:', shopId);
    const allCompletedOrders = await pb.collection('Order').getFullList({
      filter: `Status = "Completed" && Shop_ID = "${shopId}"`
    });
    
    reports.totalSales = allCompletedOrders.reduce((sum, order) => {
      return sum + (order.Total_Amount || 0);
    }, 0);
    console.log('Total sales:', reports.totalSales);

    // 2. ดึงข้อมูล Total Orders (จำนวนออร์เดอร์ทั้งหมด - เฉพาะร้านนี้)
    console.log('Fetching total orders for shop:', shopId);
    const allOrders = await pb.collection('Order').getFullList({
      filter: `Shop_ID = "${shopId}"`
    });
    reports.totalOrders = allOrders.length;
    console.log('Total orders:', reports.totalOrders);

    // 3. ดึงข้อมูล Total Dishes (จำนวนเมนูทั้งหมด - เฉพาะร้านนี้)
    console.log('Fetching total dishes for shop:', shopId);
    const allMenus = await pb.collection('Menu').getFullList({
      filter: `Available = true && field = "${shopId}"`
    });
    reports.totalDishes = allMenus.length;
    console.log('Total dishes:', reports.totalDishes);

    // 4. ดึงข้อมูล Total Customers (จำนวนลูกค้าที่เคยสั่งอาหาร - เฉพาะร้านนี้)
    console.log('Fetching total customers for shop:', shopId);
    const uniqueCustomers = new Set();
    allOrders.forEach(order => {
      if (order.User_ID) {
        uniqueCustomers.add(order.User_ID);
      }
    });
    reports.totalCustomers = uniqueCustomers.size;
    console.log('Total customers:', reports.totalCustomers);

    // 5. ดึงข้อมูล Monthly Revenue (รายได้ 6 เดือนย้อนหลัง - เฉพาะร้านนี้)
    console.log('Fetching monthly revenue for shop:', shopId);
    const monthlyRevenue = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonthDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const monthOrders = await pb.collection('Order').getFullList({
        filter: `Status = "Completed" && Shop_ID = "${shopId}" && created >= "${monthDate.toISOString()}" && created < "${nextMonthDate.toISOString()}"`
      });
      
      const revenue = monthOrders.reduce((sum, order) => sum + (order.Total_Amount || 0), 0);
      
      monthlyRevenue.push({
        month: monthDate.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }),
        revenue: revenue,
        orders: monthOrders.length
      });
    }
    reports.monthlyRevenue = monthlyRevenue;
    console.log('Monthly revenue:', monthlyRevenue);

    // 6. ดึงข้อมูล Payment Methods (วิธีการชำระเงิน - เฉพาะร้านนี้)
    console.log('Fetching payment methods for shop:', shopId);
    const allPayments = await pb.collection('Payment').getFullList({
      filter: `Shop_ID = "${shopId}"`
    });
    
    const paymentMethodsMap = new Map();
    allPayments.forEach(payment => {
      const method = payment.Method_Payment || 'Unknown';
      const current = paymentMethodsMap.get(method) || { count: 0, amount: 0 };
      paymentMethodsMap.set(method, {
        count: current.count + 1,
        amount: current.amount + (payment.Total_Amount || 0)
      });
    });
    
    reports.paymentMethods = Array.from(paymentMethodsMap.entries()).map(([method, data]) => ({
      method: method,
      count: data.count,
      amount: data.amount,
      percentage: allPayments.length > 0 ? Math.round((data.count / allPayments.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
    
    console.log('Payment methods:', reports.paymentMethods);

    // 7. ดึงข้อมูล Top Customers (ลูกค้าที่สั่งมากที่สุด - เฉพาะร้านนี้)
    console.log('Fetching top customers for shop:', shopId);
    const customerOrdersMap = new Map();
    
    // ใช้ allOrders ที่กรองด้วย shopId แล้วจากด้านบน
    for (const order of allOrders) {
      if (order.User_ID) {
        const current = customerOrdersMap.get(order.User_ID) || { 
          count: 0, 
          totalAmount: 0,
          userId: order.User_ID 
        };
        customerOrdersMap.set(order.User_ID, {
          ...current,
          count: current.count + 1,
          totalAmount: current.totalAmount + (order.Total_Amount || 0)
        });
      }
    }
    
    // ดึงข้อมูลชื่อลูกค้า
    const topCustomersList = Array.from(customerOrdersMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Fetch customer names
    for (const customer of topCustomersList) {
      try {
        const user = await pb.collection('users').getOne(customer.userId);
        customer.name = user.name || user.email || 'Unknown Customer';
      } catch (e) {
        customer.name = 'Unknown Customer';
      }
    }
    
    reports.topCustomers = topCustomersList;
    console.log('Top customers:', topCustomersList);

    console.log('Final reports data:', reports);

    return {
      reports
    };

  } catch (err) {
    console.error('Error fetching reports data:', err);
    return {
      reports: {
        totalSales: 0,
        totalOrders: 0,
        totalDishes: 0,
        totalCustomers: 0,
        monthlyRevenue: [],
        paymentMethods: [],
        topCustomers: []
      }
    };
  }
};
