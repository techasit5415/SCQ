import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

export const handle: Handle = async ({ event, resolve }) => {
    const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');
    
    // โหลด authStore จาก cookies ตาม role
    const customerAuth = event.cookies.get('pb_auth_customer');
    const adminAuth = event.cookies.get('pb_auth_admin');
    const restaurantAuth = event.cookies.get('pb_auth_restaurant');
    
    let authData = null;
    let role = null;
    
    // ตรวจสอบ cookie แต่ละ role
    if (customerAuth) {
        try {
            authData = JSON.parse(customerAuth);
            role = 'customer';
            pb.authStore.save(authData.token, authData.model || authData.record);
        } catch (e) {
            console.error('Error parsing customer auth:', e);
        }
    } else if (adminAuth) {
        try {
            authData = JSON.parse(adminAuth);
            role = 'admin';
            pb.authStore.save(authData.token, authData.model || authData.record);
        } catch (e) {
            console.error('Error parsing admin auth:', e);
        }
    } else if (restaurantAuth) {
        try {
            authData = JSON.parse(restaurantAuth);
            role = 'restaurant';
            pb.authStore.save(authData.token, authData.model || authData.record);
        } catch (e) {
            console.error('Error parsing restaurant auth:', e);
        }
    }
    
    // ส่ง pb instance และ user data ไปยัง locals
    event.locals.pb = pb;
    event.locals.user = pb.authStore.model;
    event.locals.role = role;
    
    const response = await resolve(event);
    
    return response;
};
