import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

// ใช้ URL จาก environment variable
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ cookies }) => {
    try {
        console.log('Loading restaurants from PocketBase...');
        console.log('PocketBase URL:', env.PUBLIC_POCKETBASE_URL);
        
        // ดึงข้อมูลร้านค้าทั้งหมด (เรียงเองในโค้ด)
        const restaurants = await pb.collection('Shop').getFullList();
        
        console.log(`Successfully loaded ${restaurants.length} restaurants`);
        
        // นับจำนวนคิวสำหรับแต่ละร้าน (Order ที่ Pending หรือ In-progress)
        // ใช้ for loop แทน Promise.all เพื่อหลีกเลี่ยง auto-cancellation
        const restaurantsWithQueue: any[] = [];
        
        for (const restaurant of restaurants) {
            try {
                console.log(`🔍 Counting queue for: ${restaurant.Name} (ID: ${restaurant.id})`);
                
                // สร้าง PocketBase instance ใหม่สำหรับแต่ละ request
                const pbQueue = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');
                
                const queueOrders = await pbQueue.collection('Order').getFullList({
                    filter: `Shop_ID = "${restaurant.id}" && (Status = "Pending" || Status = "In-progress")`,
                    sort: 'created'
                });
                
                console.log(`  ✅ ${restaurant.Name}: ${queueOrders.length} orders in queue`);
                
                // ดึงรีวิวของร้านนี้
                let reviews: any[] = [];
                let averageRating = 0;
                let totalReviews = 0;
                
                try {
                    const pbReview = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');
                    reviews = await pbReview.collection('Review').getFullList({
                        filter: `Shop_ID = "${restaurant.id}"`,
                        $autoCancel: false
                    });
                    
                    if (reviews.length > 0) {
                        const totalStars = reviews.reduce((sum, review) => sum + (review.Star || 0), 0);
                        averageRating = Math.round((totalStars / reviews.length) * 10) / 10;
                        totalReviews = reviews.length;
                        console.log(`  ⭐ ${restaurant.Name}: ${averageRating} stars from ${totalReviews} reviews`);
                    }
                } catch (reviewError) {
                    console.error(`  ❌ Error loading reviews for ${restaurant.Name}:`, reviewError);
                }
                
                restaurantsWithQueue.push({
                    ...restaurant,
                    queueCount: queueOrders.length,
                    rating: averageRating || 0,
                    review_count: totalReviews
                });
            } catch (queueError: any) {
                console.error(`  ❌ Error counting queue for ${restaurant.Name}:`, queueError?.message);
                restaurantsWithQueue.push({
                    ...restaurant,
                    queueCount: 0,
                    rating: 0,
                    review_count: 0
                });
            }
        }
        
        console.log(`✅ Queue counts added for all restaurants`);
        
        // แสดงสรุป
        const totalQueue = restaurantsWithQueue.reduce((sum, r) => sum + (r.queueCount || 0), 0);
        console.log(`📊 Total queue count across all restaurants: ${totalQueue}`);
        
        // ดึงข้อมูลโฆษณาที่ active
        let activeAds: any[] = [];
        try {
            const now = new Date().toISOString();
            activeAds = await pb.collection('shop_advertisements').getFullList({
                filter: `status = "Active" && payment_status = "Paid" && end_date > "${now}"`,
                sort: '-created'
            });
            console.log(`Found ${activeAds.length} active advertisements`);
        } catch (adError) {
            console.log('Could not load advertisements:', adError);
        }
        
        // สร้าง Map ของ shop ID -> priority level
        const shopPriorityMap = new Map<string, number>();
        activeAds.forEach(ad => {
            const currentPriority = shopPriorityMap.get(ad.shop_id) || 0;
            const newPriority = ad.priority_level || 1;
            // เก็บ priority สูงสุดถ้ามีหลาย ads
            if (newPriority > currentPriority) {
                shopPriorityMap.set(ad.shop_id, newPriority);
            }
        });
        
        // เพิ่ม priority level ให้กับร้านทั้งหมด
        const restaurantsWithPriority = restaurantsWithQueue.map(r => ({
            ...r,
            priorityLevel: shopPriorityMap.get(r.id) || 0
        }));
        
        // เรียงตาม priority จากมากไปน้อย แล้วตามด้วยชื่อ
        restaurantsWithPriority.sort((a, b) => {
            // Priority สูงก่อน (มากไปน้อย)
            if (b.priorityLevel !== a.priorityLevel) {
                return b.priorityLevel - a.priorityLevel;
            }
            // ถ้า priority เท่ากัน เรียงตามชื่อ
            return (a.Name || '').localeCompare(b.Name || '', 'th');
        });
        
        const sortedRestaurants = restaurantsWithPriority;
        
        console.log(`Sorting by priority:`);
        const promotedCount = sortedRestaurants.filter(r => r.priorityLevel > 0).length;
        sortedRestaurants.forEach(r => {
            if (r.priorityLevel > 0) {
                console.log(`  📍 Priority ${r.priorityLevel}: ${r.Name}`);
            }
        });
        
        console.log(`Promoted restaurants: ${promotedCount}, Normal: ${sortedRestaurants.length - promotedCount}`);
        
        return {
            restaurants: sortedRestaurants || [],
            promotedShopIds: Array.from(shopPriorityMap.keys()),
            success: true
        };
        
    } catch (error) {
        console.error('Error loading restaurants:', error);
        
        // Return empty array with error info for graceful handling
        return {
            restaurants: [],
            promotedShopIds: [],
            success: false,
            error: 'ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองใหม่อีกครั้ง'
        };
    }
};