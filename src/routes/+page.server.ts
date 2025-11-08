import type { Actions, PageServerLoad } from './$types.js';
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
        // ถ้า redirectTo เป็นหน้า restaurant ให้ไปตาม ไม่งั้นไป restaurant list
        throw redirect(303, (redirectTo && redirectTo.startsWith('/restaurant')) ? redirectTo : '/restaurant');
    }

    return {
        redirectTo
    };
};

export const actions: Actions = {
    login: async ({ request, cookies, url }) => {
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
                // หา Shop ที่ user เป็นเจ้าของ
                try {
                    const shops = await pb.collection('Shop').getFullList({
                        filter: `User_Owner_ID = "${authData.record.id}"`
                    });
                    
                    console.log('Found shops for user:', shops.length);
                    
                    // ถ้ามีร้านให้ redirect ไปหน้าร้านแรก
                    if (shops.length > 0) {
                        const shopId = shops[0].id;
                        redirectPath = (redirectTo && redirectTo.startsWith('/restaurant/')) 
                            ? redirectTo 
                            : `/restaurant/${shopId}/dashboard`;
                        console.log('Redirecting to shop:', shopId);
                    } else {
                        // ถ้าไม่มีร้านให้ไปหน้า restaurant list
                        redirectPath = '/restaurant';
                        console.log('No shop found, redirecting to restaurant list');
                    }
                } catch (shopError) {
                    console.error('Error fetching shop:', shopError);
                    redirectPath = '/restaurant';
                }
                
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
    },
    
    // OAuth callback handler
    oauthCallback: async ({ request, cookies }: { request: Request; cookies: any }) => {
        try {
            console.log('🔐 OAuth callback handler called');
            console.log('Request method:', request.method);
            
            const formData = await request.formData();
            console.log('FormData entries:');
            for (const [key, value] of formData.entries()) {
                console.log(`  ${key}:`, typeof value === 'string' ? value.substring(0, 100) : value);
            }
            
            const token = formData.get('token') as string;
            const recordStr = formData.get('record') as string;
            const role = formData.get('role') as string || 'customer';
            
            console.log('Token exists:', !!token);
            console.log('Record exists:', !!recordStr);
            console.log('Role:', role);
            
            if (!token || !recordStr) {
                console.error('❌ Missing token or record');
                return fail(400, { error: 'Invalid OAuth data: missing token or record' });
            }
            
            let record;
            try {
                record = JSON.parse(recordStr);
                console.log('📝 OAuth user:', record.email, 'ID:', record.id);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                return fail(400, { error: 'Invalid OAuth data: cannot parse record' });
            }
            
            // Set appropriate cookie based on role
            const cookieName = `pb_auth_${role}`;
            const cookieValue = JSON.stringify({
                token: token,
                model: record
            });
            
            const cookieOptions = {
                path: '/',
                httpOnly: false,
                sameSite: 'lax' as const,
                secure: false,
                maxAge: 60 * 60 * 24 * 7 // 7 days
            };
            
            cookies.set(cookieName, cookieValue, cookieOptions);
            console.log('✅ Cookie set:', cookieName);
            
            // Determine redirect path
            let redirectTo = '/customer';
            
            if (role === 'admin') {
                redirectTo = '/admin/dashboard';
            } else if (role === 'restaurant') {
                try {
                    const shops = await pb.collection('Shop').getFullList({
                        filter: `User_Owner_ID = "${record.id}"`
                    });
                    if (shops.length > 0) {
                        redirectTo = `/restaurant/${shops[0].id}/dashboard`;
                    } else {
                        redirectTo = '/restaurant';
                    }
                } catch (e) {
                    console.error('❌ Error fetching shop:', e);
                    redirectTo = '/restaurant';
                }
            }
            
            console.log('🚀 Redirecting to:', redirectTo);
            throw redirect(303, redirectTo);
            
        } catch (error: any) {
            // ถ้าเป็น redirect error ให้ throw ต่อไป
            if (error?.status === 303) {
                throw error;
            }
            
            console.error('❌ OAuth callback error:', error);
            console.error('Error stack:', error?.stack);
            return fail(500, { 
                error: 'Failed to process OAuth callback',
                details: error?.message || 'Unknown error'
            });
        }
    }
};