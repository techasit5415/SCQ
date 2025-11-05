import PocketBase from 'pocketbase';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');


export const load = async ({ params }: { params: { id: string } }) => {
    try {
        console.log('Loading restaurant and menu for ID:', params.id);

        // Fetch restaurant data
        const restaurant = await pb.collection('Shop').getOne(params.id, {
            expand: 'User_Owner_ID'
        });

        console.log('Successfully loaded restaurant:', restaurant.name);

        // Fetch menu items - ใช้ field ที่เชื่อมกับ restaurant ID
        let menuItems: any[] = [];
        
        try {
            // เอาเมนูทั้งหมดแล้วกรองเอาเฉพาะร้านนี้
            const allMenus = await pb.collection('Menu').getFullList({
                sort: 'name'
            });
            
            // กรองเมนูที่เป็นของร้านนี้
            menuItems = allMenus.filter(menu => 
                menu.field === params.id || 
                menu.restaurant_id === params.id ||
                menu.Shop === params.id
            );

            console.log('Found menu items:', menuItems.length);
            
            // Debug: แสดงข้อมูลเมนูทั้งหมดเพื่อดู category
            menuItems.forEach((item, index) => {
                console.log(`Menu ${index + 1}:`, {
                    name: item.name,
                    category: item.category || 'ไม่มี category',
                    id: item.id
                });
            });
            
            if (menuItems.length > 0) {
                console.log('Sample menu item:', JSON.stringify(menuItems[0], null, 2));
            }
            
        } catch (menuError) {
            console.error('Error loading menu:', menuError);
            menuItems = []; // ถ้าไม่มีเมนูก็ให้เป็น array ว่าง
        }

        // Fetch reviews for this restaurant
        let reviews: any[] = [];
        let averageRating = 0;
        let totalReviews = 0;
        
        try {
            reviews = await pb.collection('Review').getFullList({
                filter: `Shop_ID = "${params.id}"`,
                sort: '-created',
                expand: 'User_ID'
            });

            console.log('Found reviews:', reviews.length);
            
            if (reviews.length > 0) {
                // คำนวณคะแนนเฉลี่ย
                const totalStars = reviews.reduce((sum, review) => sum + (review.Star || 0), 0);
                averageRating = Math.round((totalStars / reviews.length) * 10) / 10;
                totalReviews = reviews.length;
                
                console.log('Average rating:', averageRating, 'from', totalReviews, 'reviews');
            }
            
        } catch (reviewError) {
            console.error('Error loading reviews:', reviewError);
            reviews = [];
        }

        return {
            restaurant,
            menuItems,
            reviews,
            averageRating,
            totalReviews,
            success: true
        };

    } catch (err) {
        console.error('Error loading restaurant:', err);
        throw error(404, 'Restaurant not found');
    }
};