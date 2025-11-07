import type { PageServerLoad } from './$types.js';
import PocketBase from 'pocketbase';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ params, url }) => {
    try {
        const restaurantId = params.id;
        const filterStar = url.searchParams.get('star');
        
        console.log('Loading reviews for restaurant ID:', restaurantId);

        // ดึงข้อมูลร้าน
        const restaurant = await pb.collection('Shop').getOne(restaurantId);
        
        // สร้าง filter
        let filter = `Shop_ID="${restaurantId}"`;
        if (filterStar && filterStar !== 'all') {
            const starValue = parseInt(filterStar);
            if (starValue >= 1 && starValue <= 5) {
                filter += ` && Star=${starValue}`;
            }
        }

        // ดึงรีวิวทั้งหมดของร้านนี้
        const reviews = await pb.collection('Review').getFullList({
            filter: filter,
            sort: '-created',
            expand: 'User_ID,Order_ID'
        });

        console.log(`Found ${reviews.length} reviews for ${restaurant.name}`);
        
        // Debug: แสดงข้อมูลรีวิวแรก
        if (reviews.length > 0) {
            console.log('Sample review:', {
                id: reviews[0].id,
                Description: reviews[0].Description,
                Star: reviews[0].Star,
                User_ID: reviews[0].expand?.User_ID,
                Order_ID: reviews[0].expand?.Order_ID
            });
        }

        // คำนวณสถิติ
        let averageRating = 0;
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        // ดึงรีวิวทั้งหมด (ไม่มี filter) เพื่อคำนวณสถิติ
        const allReviews = await pb.collection('Review').getFullList({
            filter: `Shop_ID="${restaurantId}"`,
        });

        if (allReviews.length > 0) {
            const totalStars = allReviews.reduce((sum, review) => sum + (review.Star || 0), 0);
            averageRating = Math.round((totalStars / allReviews.length) * 10) / 10;
            
            // นับจำนวนดาวแต่ละระดับ
            allReviews.forEach(review => {
                const star = review.Star || 0;
                if (star >= 1 && star <= 5) {
                    starCounts[star]++;
                }
            });
        }

        return {
            restaurant,
            reviews,
            averageRating,
            totalReviews: allReviews.length,
            starCounts,
            currentFilter: filterStar || 'all',
            success: true
        };
    } catch (err) {
        console.error('Error loading reviews:', err);
        throw error(500, {
            message: 'Failed to load reviews'
        });
    }
};
