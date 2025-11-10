// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = ({ cookies, setHeaders }) => {
    console.log('🔓 Logout handler called');
    console.log('📋 Current cookies:', cookies.getAll());
    
    // ใช้ options เดียวกันกับตอนสร้าง cookie
    const cookieOptions = { 
        path: '/',
        httpOnly: false,
        sameSite: 'lax' as const,
        secure: false
    };
    
    // วิธีที่ 1: ใช้ delete
    cookies.delete('pb_auth_customer', cookieOptions);
    cookies.delete('pb_auth_admin', cookieOptions);
    cookies.delete('pb_auth_restaurant', cookieOptions);
    cookies.delete('session', cookieOptions);
    cookies.delete('pb_auth', cookieOptions);
    
    // วิธีที่ 2: Set ให้หมดอายุในอดีต (เพื่อความแน่ใจ)
    const expiredOptions = {
        ...cookieOptions,
        maxAge: -1,
        expires: new Date(0)
    };
    
    cookies.set('pb_auth_customer', '', expiredOptions);
    cookies.set('pb_auth_admin', '', expiredOptions);
    cookies.set('pb_auth_restaurant', '', expiredOptions);
    cookies.set('session', '', expiredOptions);
    cookies.set('pb_auth', '', expiredOptions);
    
    console.log('✅ All auth cookies deleted');
    console.log('📋 Cookies after delete:', cookies.getAll());
    
    // ป้องกัน browser cache - ห้ามย้อนกลับ
    setHeaders({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    throw redirect(303, '/');
};
