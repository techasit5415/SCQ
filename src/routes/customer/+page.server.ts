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
        
        // สร้าง Set ของ shop IDs ที่มีโฆษณา active
        const promotedShopIds = new Set(activeAds.map(ad => ad.shop_id));
        
        // แบ่งร้านออกเป็น 2 กลุ่ม: มีโฆษณา และไม่มีโฆษณา
        const promotedRestaurants = restaurants.filter(r => promotedShopIds.has(r.id));
        const normalRestaurants = restaurants.filter(r => !promotedShopIds.has(r.id));
        
        // เรียงตามชื่อทั้ง 2 กลุ่ม
        promotedRestaurants.sort((a, b) => (a.Name || '').localeCompare(b.Name || '', 'th'));
        normalRestaurants.sort((a, b) => (a.Name || '').localeCompare(b.Name || '', 'th'));
        
        // รวมกัน: ร้านที่มีโฆษณาก่อน ตามด้วยร้านปกติ
        const sortedRestaurants = [...promotedRestaurants, ...normalRestaurants];
        
        console.log(`Promoted restaurants: ${promotedRestaurants.length}, Normal: ${normalRestaurants.length}`);
        
        return {
            restaurants: sortedRestaurants || [],
            promotedShopIds: Array.from(promotedShopIds),
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