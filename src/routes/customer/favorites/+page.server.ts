import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    try {
        const pb = locals.pb;
        const user = locals.user;
        
        if (!user?.id) {
            return {
                favoriteShops: [],
                success: false,
                error: 'กรุณาเข้าสู่ระบบ'
            };
        }

        // ดึงข้อมูลผู้ใช้พร้อม expand ร้านโปรด
        const userData = await pb.collection('users').getOne(user.id, {
            expand: 'shoplove'
        });

        console.log('User data:', userData);
        console.log('Favorite shops:', userData.expand?.shoplove);

        return {
            favoriteShops: userData.expand?.shoplove || [],
            success: true
        };

    } catch (error) {
        console.error('Error loading favorite shops:', error);
        return {
            favoriteShops: [],
            success: false,
            error: 'ไม่สามารถโหลดข้อมูลร้านโปรดได้'
        };
    }
};
