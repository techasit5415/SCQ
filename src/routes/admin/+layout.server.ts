import { redirect } from '@sveltejs/kit';
import { logActivity } from '$lib/server/logging';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies, url, getClientAddress }) => {
    // ตรวจสอบว่ามี user และเป็น admin หรือไม่
    if (!locals.user || locals.role !== 'admin') {
        // บันทึก URL ปัจจุบันเพื่อ redirect กลับหลัง login
        const redirectTo = url.pathname + url.search;
        throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    }
    
    const session = cookies.get('session');
    
    // Log admin page access
    if (locals.user && url.pathname.startsWith('/admin/')) {
        try {
            const pageName = url.pathname.split('/admin/')[1] || 'dashboard';
            await logActivity({
                action: `Admin Page Access`,
                user_email: locals.user.email || 'admin@scq.com',
                details: `เข้าสู่หน้า ${pageName} ในระบบจัดการ`,
                type: 'AUTH',
                severity: 'INFO',
                ip_address: getClientAddress() || 'unknown',
                target_collection: 'System',
                user_agent: 'Web Browser'
            });
        } catch (error) {
            console.error('Failed to log admin page access:', error);
        }
    }
    
    return {
        session,
        user: locals.user,
        role: locals.role
    };
};