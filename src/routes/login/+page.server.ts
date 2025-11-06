import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080');

export const load: PageServerLoad = async ({ cookies, url }) => {
    // ตรวจสอบว่ามี session อยู่แล้วหรือไม่
    const customerAuth = cookies.get('pb_auth_customer');
    const adminAuth = cookies.get('pb_auth_admin');
    const restaurantAuth = cookies.get('pb_auth_restaurant');
    
    // เก็บ redirectTo parameter
    const redirectTo = url.searchParams.get('redirectTo') || null;

    if (customerAuth) {
        throw redirect(303, redirectTo || '/customer');
    } else if (adminAuth) {
        // ถ้า redirectTo เป็นหน้า admin ให้ไปตาม ไม่งั้นไป dashboard
        throw redirect(303, (redirectTo && redirectTo.startsWith('/admin')) ? redirectTo : '/admin/dashboard');
    } else if (restaurantAuth) {
        // ถ้า redirectTo เป็นหน้า restaurant ให้ไปตาม ไม่งั้นไป homerestaurant
        throw redirect(303, (redirectTo && redirectTo.startsWith('/homerestaurant')) ? redirectTo : '/homerestaurant');
    }

    return {
        redirectTo
    };
};

export const actions: Actions = {
    default: async ({ request, cookies, url }) => {
        console.log('Login action called');
        const form = await request.formData();
        const email = String(form.get('email') ?? '').trim();
        const password = String(form.get('password') ?? '');
        const redirectTo = String(form.get('redirectTo') ?? '');

        if (!email || !password) {
            return fail(400, { error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
        }

        try {
            // Login ผ่าน PocketBase
            const authData = await pb.collection('users').authWithPassword(email, password);
            
            console.log('Auth data:', authData);
            console.log('User role:', authData.record.Role);

            // ดึง Role ID เพื่อตรวจสอบ role
            const roleId = authData.record.Role;
            let role = null;
            let redirectPath = '/';

            // ดึงข้อมูล role จาก collection Role
            const roleData = await pb.collection('Role').getOne(roleId);
            console.log('Role data:', roleData);
            
            // ใช้ field name (lowercase) และแปลงเป็นตัวเล็กเพื่อเปรียบเทียบ
            role = roleData.name || roleData.Name;
            const roleLower = role?.toLowerCase();
            
            console.log('Role name:', role);

            // กำหนด redirect path และ cookie name ตาม role
            if (roleLower === 'customer') {
                // ใช้ redirectTo ถ้ามี ไม่งั้นไป /customer
                redirectPath = redirectTo || '/customer';
                cookies.set('pb_auth_customer', JSON.stringify({
                    token: authData.token,
                    model: authData.record
                }), {
                    path: '/',
                    httpOnly: false,
                    sameSite: 'lax',
                    secure: false,
                    maxAge: 60 * 60 * 24 * 7 // 7 วัน
                });
            } else if (roleLower === 'admin') {
                // ใช้ redirectTo ถ้ามีและเป็นหน้า admin ไม่งั้นไป /admin/dashboard
                redirectPath = (redirectTo && redirectTo.startsWith('/admin')) ? redirectTo : '/admin/dashboard';
                cookies.set('pb_auth_admin', JSON.stringify({
                    token: authData.token,
                    model: authData.record
                }), {
                    path: '/',
                    httpOnly: false,
                    sameSite: 'lax',
                    secure: false,
                    maxAge: 60 * 60 * 24 * 7
                });
            } else if (roleLower === 'restaurant') {
                // ใช้ redirectTo ถ้ามีและเป็นหน้า restaurant ไม่งั้นไป /homerestaurant
                redirectPath = (redirectTo && redirectTo.startsWith('/homerestaurant')) ? redirectTo : '/homerestaurant';
                cookies.set('pb_auth_restaurant', JSON.stringify({
                    token: authData.token,
                    model: authData.record
                }), {
                    path: '/',
                    httpOnly: false,
                    sameSite: 'lax',
                    secure: false,
                    maxAge: 60 * 60 * 24 * 7
                });
            } else {
                return fail(403, { error: `Role ไม่ถูกต้อง: ${role}` });
            }

            console.log('Login successful, redirecting to:', redirectPath);
            throw redirect(303, redirectPath);

        } catch (error: any) {
            console.error('Login error:', error);
            
            // ถ้า error เป็น redirect ให้ throw ต่อไป
            if (error?.status === 303 || error?.location) {
                throw error;
            }
            
            if (error.status === 400) {
                return fail(401, { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
            }
            
            return fail(500, { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
        }
    }
};