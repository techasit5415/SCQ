import type { PageServerLoad } from './$types.js';
import PocketBase from 'pocketbase';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ params }) => {
    try {
        const restaurantId = params.id;
        
        console.log('Loading reviews for restaurant ID:', restaurantId);

        // ดึงข้อมูลร้าน
        const restaurant = await pb.collection('Shop').getOne(restaurantId);
        
        // ดึงรีวิวทั้งหมดของร้านนี้
        const reviews = await pb.collection('Review').getFullList({
            filter: `Shop_ID = "${restaurantId}"`,
            sort: '-created',
            expand: 'User_ID'
        });

        console.log(`Found ${reviews.length} reviews for ${restaurant.name}`);

        // คำนวณสถิติ
        let averageRating = 0;
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        if (reviews.length > 0) {
            const totalStars = reviews.reduce((sum, review) => sum + (review.Star || 0), 0);
            averageRating = Math.round((totalStars / reviews.length) * 10) / 10;
            
            // นับจำนวนดาวแต่ละระดับ
            reviews.forEach(review => {
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
            totalReviews: reviews.length,
            starCounts,
            success: true
        };

    } catch (err) {
        console.error('Error loading reviews:', err);
        throw error(404, 'Restaurant reviews not found');
    }
};