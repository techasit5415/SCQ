import type { PageServerLoad, Actions } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { redirect, fail } from '@sveltejs/kit';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ cookies, locals }) => {
	try {
		// ตรวจสอบ authentication
		if (!locals.user || !locals.user.id) {
			console.error('❌ No authenticated user found');
			throw redirect(303, '/');
		}
		
		// ตรวจสอบว่าเป็น customer role
		if (locals.role !== 'customer') {
			console.error('❌ User is not a customer. Role:', locals.role);
			throw redirect(303, '/');
		}
		
		const userId = locals.user.id;
		console.log('👤 Loading profile for User ID:', userId);
		console.log('👤 locals.user data:', locals.user);
		
		// ดึงข้อมูลผู้ใช้จาก locals.user ที่มาจาก authStore
		let userRecord: any = locals.user;
		let userName = 'ผู้ใช้';
		let userEmail = '';
		let userAvatar = '';
		let userRole = '';
		
		try {
			// ใช้ข้อมูลจาก locals.user ก่อน
			if (userRecord) {
				userRole = userRecord.Role || '';
				console.log('🔐 User Role:', userRole);
				
				// ลองหา field ชื่อต่างๆ
				const firstName = userRecord.name || userRecord.Name || userRecord.fname || '';
				const lastName = userRecord.Lastname || userRecord.lastname || userRecord.lname || '';
				userName = `${firstName} ${lastName}`.trim() || userRecord.username || userRecord.email?.split('@')[0] || 'ผู้ใช้';
				userEmail = userRecord.email || '';
				userAvatar = userRecord.avatar || '';
				
				console.log('✅ User data from locals:', { firstName, lastName, userName, userEmail, userAvatar });
				console.log('📸 Avatar:', userAvatar);
			}
			
			// ถ้าข้อมูลยังไม่ครบ ให้ดึงจาก PocketBase อีกทีเผื่อ
			if (!userName || userName === 'ผู้ใช้' || !userEmail) {
				console.log('🔄 Fetching fresh data from PocketBase...');
				const freshRecord = await pb.collection('users').getOne(userId);
				console.log('📦 Fresh record:', freshRecord);
				
				const firstName = freshRecord.name || freshRecord.Name || freshRecord.fname || '';
				const lastName = freshRecord.Lastname || freshRecord.lastname || freshRecord.lname || '';
				userName = `${firstName} ${lastName}`.trim() || freshRecord.username || freshRecord.email?.split('@')[0] || userName;
				userEmail = freshRecord.email || userEmail;
				userAvatar = freshRecord.avatar || userAvatar;
				userRecord = freshRecord;
				
				console.log('✅ Updated from fresh data:', { userName, userEmail, userAvatar });
			}
		} catch (userError: any) {
			console.error('⚠️ User fetch error:', userError);
			console.error('⚠️ Error details:', userError?.message, userError?.status);
			
			// ใช้ข้อมูลจาก locals.user ตามที่มี
			if (locals.user) {
				const firstName = locals.user.name || locals.user.Name || locals.user.fname || '';
				const lastName = locals.user.Lastname || locals.user.lastname || locals.user.lname || '';
				userName = `${firstName} ${lastName}`.trim() || locals.user.username || locals.user.email?.split('@')[0] || 'ผู้ใช้';
				userEmail = locals.user.email || '';
				userAvatar = locals.user.avatar || '';
				console.log('⚠️ Using data from locals.user:', { userName, userEmail, userAvatar });
			}
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
		
		// นับจำนวนร้านโปรด (จาก field shoplove ใน users collection)
		let favoriteCount = 0;
		try {
			console.log('🔍 Checking favorite shops from shoplove field');
			
			// shoplove เป็น array ของ relation records (Shop IDs)
			if (userRecord && userRecord.shoplove && Array.isArray(userRecord.shoplove)) {
				favoriteCount = userRecord.shoplove.length;
				console.log('❤️ Favorite shops found:', favoriteCount);
				console.log('� Shop IDs:', userRecord.shoplove);
			} else {
				console.log('⚠️ No shoplove field or empty array');
				favoriteCount = 0;
			}
		} catch (favError: any) {
			console.error('⚠️ Error checking favorites:', favError?.message);
			favoriteCount = 0;
		}
		
		return {
			user: {
				id: userId,
				username: userName,
				email: userEmail,
				avatar: userAvatar,
				name: userName
			},
			points: userPoints,
			orderCount: orderCount,
			favoriteCount: favoriteCount
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
		throw redirect(303, '/');
	}
};

export const actions: Actions = {
	// บันทึกข้อมูลโปรไฟล์
	updateProfile: async ({ cookies, request, locals }) => {
		try {
			// ตรวจสอบ authentication
			if (!locals.user || !locals.user.id) {
				return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
			}
			
			const userId = locals.user.id;

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
	uploadAvatar: async ({ cookies, request, locals }) => {
		try {
			// ตรวจสอบ authentication
			if (!locals.user || !locals.user.id) {
				console.error('❌ No authenticated user');
				return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
			}
			
			const userId = locals.user.id;

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
	},

	// เปลี่ยนรหัสผ่าน
	changePassword: async ({ cookies, request, locals }) => {
		try {
			// ตรวจสอบ authentication
			if (!locals.user || !locals.user.id) {
				return fail(401, { error: 'กรุณาเข้าสู่ระบบ' });
			}
			
			const userId = locals.user.id;
			const formData = await request.formData();
			const oldPassword = formData.get('oldPassword') as string;
			const newPassword = formData.get('newPassword') as string;
			const confirmPassword = formData.get('confirmPassword') as string;

			console.log('🔒 Changing password for user:', userId);

			// ตรวจสอบข้อมูล
			if (!oldPassword || !newPassword || !confirmPassword) {
				return fail(400, { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
			}

			// ตรวจสอบว่ารหัสผ่านใหม่ตรงกันหรือไม่
			if (newPassword !== confirmPassword) {
				return fail(400, { error: 'รหัสผ่านใหม่ไม่ตรงกัน' });
			}

			// ตรวจสอบความยาวรหัสผ่าน
			if (newPassword.length < 8) {
				return fail(400, { error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
			}

			// ยืนยันตัวตนด้วยรหัสผ่านเก่า
			let userEmail = '';
			try {
				const user = await pb.collection('_pb_users_auth_').getOne(userId);
				userEmail = user.email;
				console.log('🔍 Verifying old password for:', userEmail);
				
				// สร้าง PocketBase instance ใหม่เพื่อ auth
				const pbAuth = new PocketBase(PUBLIC_POCKETBASE_URL);
				await pbAuth.collection('_pb_users_auth_').authWithPassword(userEmail, oldPassword);
				console.log('✅ Old password verified');
			} catch (authError: any) {
				console.error('❌ Authentication failed:', authError?.message);
				return fail(401, { error: 'รหัสผ่านเก่าไม่ถูกต้อง' });
			}

			// เปลี่ยนรหัสผ่าน - ใช้ oldPassword เพื่อยืนยัน
			try {
				const pbUpdate = new PocketBase(PUBLIC_POCKETBASE_URL);
				// ต้อง auth ก่อนแล้วค่อย update
				await pbUpdate.collection('_pb_users_auth_').authWithPassword(userEmail, oldPassword);
				
				await pbUpdate.collection('_pb_users_auth_').update(userId, {
					password: newPassword,
					passwordConfirm: newPassword,
					oldPassword: oldPassword // PocketBase ต้องการ oldPassword เพื่อยืนยัน
				});

				console.log('✅ Password changed successfully');

				return {
					success: true,
					message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
				};
			} catch (updateError: any) {
				console.error('❌ Password update failed:', updateError);
				console.error('❌ Error details:', updateError?.response);
				return fail(500, { 
					error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้: ' + (updateError?.message || 'Unknown error')
				});
			}

		} catch (error: any) {
			console.error('❌ Error changing password:', error);
			return fail(500, { 
				error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ' + (error.message || 'Unknown error')
			});
		}
	}
};
