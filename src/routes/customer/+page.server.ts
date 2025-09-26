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
        console.log('First restaurant data:', restaurants[0]); // Debug first restaurant
        
        return {
            restaurants: restaurants || [],
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