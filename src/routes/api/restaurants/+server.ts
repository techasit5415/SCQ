import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';

export const GET: RequestHandler = async () => {
    try {
        console.log('GET /api/restaurants called');
        const restaurants = await query('SELECT * FROM restaurants ORDER BY created_at DESC');
        console.log('Returning restaurants:', restaurants);
        return json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้านค้า' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        console.log('POST /api/restaurants called');
        const data = await request.json();
        console.log('Received data:', data);
        
        // Validation
        if (!data.name || !data.phone) {
            return json({ message: 'กรุณากรอกชื่อร้านค้าและเบอร์โทรศัพท์' }, { status: 400 });
        }
        
        // เช็คชื่อซ้ำ
        const existing = await query('SELECT id FROM restaurants WHERE name = ?', [data.name]);
        if (existing.length > 0) {
            return json({ message: 'ชื่อร้านค้านี้มีอยู่แล้วในระบบ' }, { status: 400 });
        }
        
        // เพิ่มร้านค้าใหม่
        const result = await query(
            `INSERT INTO restaurants (name, category, description, address, phone) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.name,
                data.category || null,
                data.description || null,
                data.address || null,
                data.phone
            ]
        );
        
        // ดึงข้อมูลร้านค้าที่เพิ่งสร้าง
        const newRestaurant = await query('SELECT * FROM restaurants WHERE id = LAST_INSERT_ID()');
        
        console.log('Created restaurant:', newRestaurant[0]);
        
        return json(newRestaurant[0], { status: 201 });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return json({ message: 'ร้านค้านี้มีอยู่แล้วในระบบ' }, { status: 400 });
        }
        
        return json({ message: 'เกิดข้อผิดพลาดในการสร้างร้านค้า' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ url }) => {
    try {
        const id = url.searchParams.get('id');
        console.log('DELETE /api/restaurants called with id:', id);
        
        if (!id) {
            return json({ message: 'กรุณาระบุ ID ของร้านค้า' }, { status: 400 });
        }
        
        // เช็คว่าร้านค้ามีอยู่จริงไหม
        const existing = await query('SELECT * FROM restaurants WHERE id = ?', [id]);
        if (existing.length === 0) {
            return json({ message: 'ไม่พบร้านค้าที่ต้องการลบ' }, { status: 404 });
        }
        
        // ลบร้านค้า
        await query('DELETE FROM restaurants WHERE id = ?', [id]);
        
        console.log('Restaurant deleted successfully, id:', id);
        
        return json({ 
            message: 'ลบร้านค้าสำเร็จ',
            deletedRestaurant: existing[0]
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return json({ message: 'เกิดข้อผิดพลาดในการลบร้านค้า' }, { status: 500 });
    }
};