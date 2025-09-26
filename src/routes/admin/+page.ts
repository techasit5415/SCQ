import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async () => {
    // Redirect to dashboard by default
    throw redirect(302, '/admin/dashboard');
};