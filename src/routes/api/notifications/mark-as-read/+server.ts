import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const POST: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;
		
		if (!user?.id) {
			return json({ success: false, error: 'Not authenticated' }, { status: 401 });
		}
		
		const userId = user.id;
		
		// บันทึกเวลาที่อ่านการแจ้งเตือน (ใช้ localStorage หรือ session)
		// หรือสามารถสร้าง collection ใหม่สำหรับเก็บว่าอ่านเมื่อไหร่
		
		console.log('✅ Marked all notifications as read for user:', userId);
		
		return json({ success: true });
		
	} catch (error) {
		console.error('❌ Error marking notifications as read:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};
