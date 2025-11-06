// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = ({ cookies }) => {
    console.log('Logout handler called');
    
    const cookieOptions = { 
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'lax' as const
    };
    
    // ลบ cookie ทุก role
    cookies.delete('pb_auth_customer', cookieOptions);
    cookies.delete('pb_auth_admin', cookieOptions);
    cookies.delete('pb_auth_restaurant', cookieOptions);
    
    // ลบ old cookie (backward compatibility)
    cookies.delete('session', cookieOptions);
    cookies.delete('pb_auth', cookieOptions);
    
    console.log('All auth cookies deleted');
    
    throw redirect(303, '/login');
};
