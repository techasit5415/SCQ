import { logActivity } from '$lib/server/logging';

export async function load({ cookies, url, getClientAddress }) {
    const session = cookies.get('session');
    
    // Log admin page access
    if (session && url.pathname.startsWith('/admin/')) {
        try {
            const pageName = url.pathname.split('/admin/')[1] || 'dashboard';
            await logActivity({
                action: `Admin Page Access`,
                user_email: 'admin@scq.com',
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
        session
    };
}