import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ params }) => {
    try {
        const shopId = params.id;
        
        console.log('Loading settings for shop ID:', shopId);

        // ดึงข้อมูลร้าน
        const shop = await pb.collection('Shop').getOne(shopId);

        return {
            shop,
            success: true
        };
    } catch (err) {
        console.error('Error loading shop settings:', err);
        return fail(500, {
            message: 'Failed to load shop settings'
        });
    }
};

export const actions: Actions = {
    // อัพเดทสถานะร้าน (เปิด/ปิด)
    toggleStatus: async ({ request, params }) => {
        try {
            const formData = await request.formData();
            const isOpen = formData.get('is_open') === 'true';

            await pb.collection('Shop').update(params.id, {
                is_open: isOpen
            });

            return {
                success: true,
                message: isOpen ? 'เปิดร้านสำเร็จ' : 'ปิดร้านสำเร็จ'
            };
        } catch (err) {
            console.error('Error toggling shop status:', err);
            return fail(500, {
                success: false,
                message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะร้าน'
            });
        }
    },

    // อัพเดทข้อมูลร้าน
    updateShop: async ({ request, params }) => {
        try {
            const formData = await request.formData();
            
            console.log('=== Received Form Data ===');
            console.log('name:', formData.get('name'));
            console.log('description:', formData.get('description'));
            console.log('address:', formData.get('address'));
            console.log('phone:', formData.get('phone'));
            
            const photo = formData.get('photo') as File;
            console.log('photo:', photo);
            if (photo) {
                console.log('Photo details:', {
                    name: photo.name,
                    size: photo.size,
                    type: photo.type
                });
            }
            
            // สร้าง FormData ใหม่สำหรับ PocketBase
            const pbFormData = new FormData();
            pbFormData.append('name', formData.get('name') as string);
            pbFormData.append('Details', formData.get('description') as string);
            pbFormData.append('Addr', formData.get('address') as string);
            pbFormData.append('Phone', formData.get('phone') as string);

            // ถ้ามีรูปภาพใหม่
            if (photo && photo.size > 0) {
                pbFormData.append('Pic_Shop', photo); // ใช้ Pic_Shop ไม่ใช่ Photo
                console.log('Photo will be uploaded');
            }

            console.log('=== Updating Shop ===');
            console.log('Shop ID:', params.id);

            const result = await pb.collection('Shop').update(params.id, pbFormData);
            
            console.log('Update result:', result);

            return {
                success: true,
                message: 'อัพเดทข้อมูลร้านสำเร็จ'
            };
        } catch (err: any) {
            console.error('=== Error updating shop ===');
            console.error('Error:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            return fail(500, {
                success: false,
                message: `เกิดข้อผิดพลาด: ${err.message || 'ไม่สามารถอัพเดทข้อมูลได้'}`
            });
        }
    }
};
