import type { PageServerLoad, Actions } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { redirect, fail } from '@sveltejs/kit';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies }) => {
	try {
		// ตอนนี้ยังไม่มี session management ใช้ hardcode ก่อน
		const userId = "5v70v6p91pfakvb"; // hardcode user ID ที่มีอยู่จริง (TheBug)
		
		console.log('👤 Loading profile for User ID:', userId);
		
		// ดึงข้อมูลผู้ใช้จาก PocketBase users collection
		let userRecord: any = null;
		let userName = 'ผู้ใช้';
		let userEmail = '';
		let userAvatar = '';
		let userRole = '';
		
		try {
			userRecord = await pb.collection('_pb_users_auth_').getOne(userId);
			
			// เช็ค Role ว่าเป็น user หรือไม่
			userRole = userRecord.Role || '';
			console.log('🔐 User Role:', userRole);
			
			// เช็ค Role (ตอนนี้ skip ไปก่อน เพราะยังไม่มี session management)
			// Role ที่อนุญาต: 000000000000001 (user), 000000000000002 (user)
			// Role ที่ไม่อนุญาต: 000000000000003 (shop owner)  
			console.log('ℹ️ Skipping role check for testing')
			
			// รวมชื่อและนามสกุล
			const firstName = userRecord.name || '';
			const lastName = userRecord.Lastname || '';
			userName = `${firstName} ${lastName}`.trim() || userRecord.username || 'ผู้ใช้';
			userEmail = userRecord.email || '';
			userAvatar = userRecord.avatar || '';
			console.log('✅ User found:', userName, '| Email:', userEmail);
			console.log('📸 Avatar:', userAvatar);
		} catch (userError: any) {
			console.error('⚠️ User fetch error:', userError);
			console.error('⚠️ Error details:', userError?.message, userError?.status);
			
			// ตอนนี้ยังไม่มี login system ใช้ fallback data แทน
			userName = 'Test User';
			userEmail = 'test@example.com';
			userAvatar = '';
			console.log('⚠️ Using fallback user data for testing');
		}
		
		// ดึงข้อมูล Point คงเหลือจาก PocketBase
		const userPointRecords = await pb.collection('Point').getFullList({
			filter: `User_ID = "${userId}"`,
			sort: '-created'
		});
		
		let userPoints = 0;
		if (userPointRecords.length > 0) {
			userPoints = userPointRecords[0].Point || 0;
		}
		
		console.log('💎 User Points:', userPoints);
		
		// นับจำนวน Order ที่เคยสั่ง (จาก Payment collection)
		const paymentRecords = await pb.collection('Payment').getFullList({
			filter: `User_ID = "${userId}"`
		});
		
		const orderCount = paymentRecords.length;
		console.log('📦 Orders found:', orderCount);
		
		return {
			user: {
				id: userId,
				username: userName,
				email: userEmail,
				avatar: userAvatar,
				name: userName
			},
			points: userPoints,
			orderCount: orderCount
		};
		
	} catch (error: any) {
		console.error('❌ Error loading profile:', error);
		console.error('❌ Error stack:', error?.stack);
		console.error('❌ Error type:', typeof error);
		
		// ถ้าเป็น redirect error ให้ throw ต่อไป
		if (error instanceof Response) {
			throw error;
		}
		
		// Error อื่นๆ ให้ redirect ไป login
		throw redirect(303, '/login');
	}
};

export const actions: Actions = {
	// บันทึกข้อมูลโปรไฟล์
	updateProfile: async ({ cookies, request }) => {
		try {
			// ใช้ hardcode user ID เหมือนใน load function
			const userId = "5v70v6p91pfakvb";
			
			if (!userId) {
				return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
			}

			const formData = await request.formData();
			const name = formData.get('name') as string;
			const email = formData.get('email') as string;

			console.log('💾 Updating profile for user:', userId);
			console.log('📝 New data:', { name, email });

			// แยกชื่อและนามสกุล
			const nameParts = name.trim().split(' ');
			const firstName = nameParts[0] || '';
			const lastName = nameParts.slice(1).join(' ') || '';

			// อัพเดทข้อมูลใน PocketBase
			const updatedUser = await pb.collection('_pb_users_auth_').update(userId, {
				name: firstName,
				Lastname: lastName,
				email: email
			});

			console.log('✅ Profile updated successfully');

			return {
				success: true,
				message: 'บันทึกข้อมูลเรียบร้อยแล้ว'
			};

		} catch (error: any) {
			console.error('❌ Error updating profile:', error);
			return fail(500, { 
				error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message 
			});
		}
	},

	// อัพโหลดรูปโปรไฟล์
	uploadAvatar: async ({ cookies, request }) => {
		try {
			// ใช้ hardcode user ID เหมือนใน load function
			const userId = "5v70v6p91pfakvb";
			
			if (!userId) {
				console.error('❌ No session cookie found');
				return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
			}

			const formData = await request.formData();
			const avatar = formData.get('avatar');

			console.log('📸 Upload request for user:', userId);
			console.log('📁 Form data keys:', Array.from(formData.keys()));
			console.log('📁 Avatar value:', avatar);

			// ตรวจสอบว่าได้รับไฟล์หรือไม่
			if (!avatar) {
				console.error('❌ No avatar file in form data');
				return fail(400, { error: 'ไม่พบไฟล์รูปภาพ' });
			}

			// ตรวจสอบว่าเป็น File object
			if (!(avatar instanceof File)) {
				console.error('❌ Avatar is not a File object:', typeof avatar);
				return fail(400, { error: 'ข้อมูลไฟล์ไม่ถูกต้อง' });
			}

			if (avatar.size === 0) {
				console.error('❌ Avatar file is empty');
				return fail(400, { error: 'ไฟล์รูปภาพว่างเปล่า' });
			}

			// ตรวจสอบขนาดไฟล์ (จำกัด 5MB)
			if (avatar.size > 5 * 1024 * 1024) {
				console.error('❌ File too large:', avatar.size);
				return fail(400, { error: 'ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่เล็กกว่า 5MB' });
			}

			console.log('📁 File details:', {
				name: avatar.name,
				type: avatar.type,
				size: avatar.size
			});

			// สร้าง FormData ใหม่สำหรับ PocketBase
			const pbFormData = new FormData();
			pbFormData.append('avatar', avatar, avatar.name);

			console.log('📤 Sending to PocketBase...');

			// อัพโหลดไปยัง PocketBase
			const updatedUser = await pb.collection('_pb_users_auth_').update(userId, pbFormData);

			console.log('✅ Avatar uploaded successfully:', updatedUser.avatar);

			return {
				success: true,
				message: 'อัพโหลดรูปโปรไฟล์เรียบร้อยแล้ว',
				avatar: updatedUser.avatar
			};

		} catch (error: any) {
			console.error('❌ Error uploading avatar:', error);
			console.error('❌ Error details:', {
				message: error.message,
				status: error.status,
				response: error.response
			});
			return fail(500, { 
				error: 'เกิดข้อผิดพลาดในการอัพโหลดรูป: ' + (error.message || 'Unknown error')
			});
		}
	}
};
