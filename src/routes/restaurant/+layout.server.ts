import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    // ตรวจสอบว่ามี user และเป็น restaurant หรือไม่
    if (!locals.user || locals.role !== 'restaurant') {
        // บันทึก URL ปัจจุบันเพื่อ redirect กลับหลัง login
        const redirectTo = url.pathname + url.search;
        throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
    }

    return {
        user: locals.user,
        role: locals.role
    };
};
