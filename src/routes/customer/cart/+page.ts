import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ data }) => {
	// ส่งข้อมูลจาก server ไปยัง client
	return {
		...data
	};
};