import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ cookies }) => {
    try {
        console.log('Loading restaurants from PocketBase...');
        console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);
        
        // ดึงข้อมูลร้านค้าทั้งหมด
        const restaurants = await pb.collection('Shop').getFullList({
            sort: '-created',
            // เพิ่ม filter ถ้าต้องการเฉพาะร้านค้าที่เปิดให้บริการ
            // filter: 'status = "active"',
        });
        
        console.log(`Successfully loaded ${restaurants.length} restaurants`);
        
        // ดึงรีวิวทั้งหมดแค่ครั้งเดียว
        let allReviews = [];
        try {
            allReviews = await pb.collection('Review').getFullList();
            console.log(`📊 Found ${allReviews.length} total reviews`);
        } catch (reviewError) {
            console.error('Error loading reviews:', reviewError);
            allReviews = [];
        }
        
        // จัดกลุ่มรีวิวตาม Shop_ID
        const reviewsByShop = allReviews.reduce((acc, review) => {
            if (!acc[review.Shop_ID]) {
                acc[review.Shop_ID] = [];
            }
            acc[review.Shop_ID].push(review);
            return acc;
        }, {});
        
        // ดึงข้อมูลคิวจริงจากฐานข้อมูล - นับ Order ที่มีสถานะ In-progress
        let queueByShop: any = {};
        try {
            const inProgressOrders = await pb.collection('Order').getFullList({
                filter: 'Status = "In-progress"',
                fields: 'Shop_ID'
            });
            
            console.log('🍳 Found in-progress orders:', inProgressOrders.length);
            
            // นับจำนวนคิวต่อร้าน
            queueByShop = inProgressOrders.reduce((acc: any, order: any) => {
                acc[order.Shop_ID] = (acc[order.Shop_ID] || 0) + 1;
                return acc;
            }, {});
            
            console.log('🍳 Queue by shop:', queueByShop);
        } catch (queueError) {
            console.error('Error loading queue info:', queueError);
        }
        
        // คำนวณคะแนนเฉลี่ยและจำนวนคิวสำหรับแต่ละร้าน
        const restaurantsWithRatings = restaurants.map((restaurant) => {
            const shopReviews = reviewsByShop[restaurant.id] || [];
            let averageRating = 0;
            
            if (shopReviews.length > 0) {
                const totalStars = shopReviews.reduce((sum: number, review: any) => sum + (review.Star || 0), 0);
                averageRating = Math.round((totalStars / shopReviews.length) * 10) / 10;
                console.log(`⭐ ${restaurant.name}: ${averageRating} ดาว (${shopReviews.length} รีวิว)`);
            }
            
            const queueCount = queueByShop[restaurant.id] || 0;
            console.log(`🍳 ${restaurant.name}: ${queueCount} คิว`);
            
            return {
                ...restaurant,
                averageRating,
                totalReviews: shopReviews.length,
                queueCount
            };
        });
        
        console.log('First restaurant with ratings:', restaurantsWithRatings[0]); // Debug first restaurant
        
        return {
            restaurants: restaurantsWithRatings || [],
            success: true
        };
        
    } catch (error) {
        console.error('Error loading restaurants:', error);
        
        // Return empty array with error info for graceful handling
        return {
            restaurants: [],
            success: false,
            error: 'ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองใหม่อีกครั้ง'
        };
    }
};