import type { PageServerLoad } from './$types';
import PocketBase from 'pocketbase';

const PB_URL = 'http://10.1.1.113:8080';

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

        let favoriteShops = userData.expand?.shoplove || [];

        // นับคิวสำหรับแต่ละร้าน (ใช้ for loop เพื่อหลีกเลี่ยงการ auto-cancel)
        if (favoriteShops.length > 0) {
            console.log('Starting queue count for favorite shops...');
            
            for (let i = 0; i < favoriteShops.length; i++) {
                try {
                    // สร้าง PocketBase instance ใหม่สำหรับแต่ละ request
                    const queuePb = new PocketBase(PB_URL);
                    
                    // นับ Order ที่มี Status = "Pending" หรือ "In-progress" สำหรับร้านนี้
                    const queueCount = await queuePb.collection('Order').getList(1, 1, {
                        filter: `Shop = "${favoriteShops[i].id}" && (Status = "Pending" || Status = "In-progress")`,
                        $autoCancel: false
                    });
                    
                    favoriteShops[i].queueCount = queueCount.totalItems;
                    console.log(`Shop ${favoriteShops[i].Name}: ${queueCount.totalItems} queues`);
                } catch (queueError) {
                    console.error(`Error counting queue for shop ${favoriteShops[i].id}:`, queueError);
                    favoriteShops[i].queueCount = 0;
                }
            }
            
            console.log('Queue counts added for all favorite shops');
        }

        return {
            favoriteShops,
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
