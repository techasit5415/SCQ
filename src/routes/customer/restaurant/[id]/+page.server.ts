import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const pb = locals.pb;
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

        // Check if this restaurant is in user's favorites
        let isFavorite = false;
        if (locals.user?.id) {
            try {
                const userData = await pb.collection('users').getOne(locals.user.id);
                isFavorite = userData.shoplove?.includes(params.id) || false;
                console.log('Is favorite:', isFavorite);
            } catch (favError) {
                console.error('Error checking favorite status:', favError);
            }
        }

        return {
            restaurant,
            menuItems,
            reviews,
            averageRating,
            totalReviews,
            isFavorite,
            success: true
        };

    } catch (err) {
        console.error('Error loading restaurant:', err);
        throw error(404, 'Restaurant not found');
    }
};

export const actions: Actions = {
    toggleFavorite: async ({ params, locals }) => {
        try {
            const pb = locals.pb;
            const user = locals.user;
            
            if (!user?.id) {
                return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
            }
            
            const userId = user.id;
            const restaurantId = params.id;

            // ดึงข้อมูลผู้ใช้
            const userData = await pb.collection('users').getOne(userId);
            let shoplove = userData.shoplove || [];

            // ตรวจสอบว่ามีร้านนี้ในรายการโปรดหรือไม่
            const index = shoplove.indexOf(restaurantId);
            let isFavorite = false;
            let message = '';

            if (index > -1) {
                // ลบออกจากรายการโปรด
                shoplove.splice(index, 1);
                message = 'ลบออกจากรายการโปรดแล้ว';
                isFavorite = false;
            } else {
                // เพิ่มเข้ารายการโปรด
                shoplove.push(restaurantId);
                message = 'เพิ่มเข้ารายการโปรดแล้ว';
                isFavorite = true;
            }

            // อัพเดทข้อมูล
            await pb.collection('users').update(userId, {
                shoplove: shoplove
            });

            console.log('Toggle favorite success:', message);

            return {
                success: true,
                isFavorite,
                message
            };

        } catch (err) {
            console.error('Error toggling favorite:', err);
            return fail(500, { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
        }
    }
};