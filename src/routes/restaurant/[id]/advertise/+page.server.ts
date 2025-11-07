import type { PageServerLoad, Actions } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { ADVERTISE_SHOP_ID, ADVERTISE_MENU_ID } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';

const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const load: PageServerLoad = async ({ params }) => {
	try {
		const restaurantId = params.id;
		
		console.log('🏪 Loading advertise page for restaurant:', restaurantId);
		
		// ดึงข้อมูลร้านอาหาร
		let restaurant = null;
		try {
			restaurant = await pb.collection('Shop').getOne(restaurantId);
			console.log('✅ Restaurant found:', restaurant.Name);
		} catch (error) {
			console.error('❌ Error loading restaurant:', error);
		}
		
		// ดึงเมนูทั้งหมดของร้าน - ใช้ field 'field' ที่เก็บ Shop ID
		let menus: any[] = [];
		try {
			console.log(`🔍 Loading menus for restaurant: ${restaurantId}`);
			menus = await pb.collection('Menu').getFullList({
				filter: `field = "${restaurantId}"`,
				sort: '-created'
			});
			console.log(`✅ Found ${menus.length} menus for this restaurant`);
			
			// ลอง log ตัวอย่างเมนูเพื่อดู field structure
			if (menus.length > 0) {
				console.log('📋 Sample menu:', {
					id: menus[0].id,
					name: menus[0].name,
					price: menus[0].Price,
					category: menus[0].category,
					field: menus[0].field
				});
			}
		} catch (error: any) {
			console.error('❌ Error loading menus:', error?.message);
			// ถ้า error ลองดึงทั้งหมดมาแทน
			try {
				console.log('🔍 Loading all menus as fallback...');
				menus = await pb.collection('Menu').getFullList({
					sort: '-created'
				});
				console.log(`📋 Total menus in database: ${menus.length}`);
			} catch (fallbackError) {
				console.error('❌ Could not load menus at all:', fallbackError);
			}
		}
		
		// ดึงข้อมูล Advertisement ที่มีอยู่จาก shop_advertisements collection
		let advertisements: any[] = [];
		try {
			advertisements = await pb.collection('shop_advertisements').getFullList({
				filter: `shop_id = "${restaurantId}"`,
				sort: '-created',
				expand: 'menus'
			});
			console.log('📢 Found advertisements:', advertisements.length);
			
			if (advertisements.length > 0) {
				console.log('📢 Sample advertisement:', {
					id: advertisements[0].id,
					shop_id: advertisements[0].shop_id,
					menus: advertisements[0].menus,
					status: advertisements[0].status,
					payment_status: advertisements[0].payment_status
				});
			}
		} catch (error: any) {
			console.log('⚠️ shop_advertisements filter error:', error?.message);
		}

		// ดึง advertisement packages
		let packages: any[] = [];
		try {
			packages = await pb.collection('advertisement_packages').getFullList({
				filter: 'is_active = true',
				sort: 'duration_days'
			});
			console.log('📦 Found packages:', packages.length);
		} catch (error: any) {
			console.log('⚠️ Error loading packages:', error?.message);
		}

		return {
			restaurant,
			menus,
			advertisements,
			packages
		};
	} catch (error: any) {
		console.error('❌ Error in load function:', error);
		return {
			restaurant: null,
			menus: [],
			advertisements: [],
			packages: []
		};
	}
};

export const actions = {
	createAdvertisement: async ({ request, params, cookies }) => {
		try {
			const data = await request.formData();
			const restaurantId = params.id;

			// หา User ID ของเจ้าของร้าน
			let userId: string;
			
			try {
				// ดึงข้อมูลร้านเพื่อหา Owner
				console.log('🔍 Looking up restaurant:', restaurantId);
				const restaurant = await pb.collection('Shop').getOne(restaurantId);
				console.log('🏪 Restaurant data:', JSON.stringify(restaurant, null, 2));
				
				// แสดงฟิลด์ทั้งหมดเพื่อดูว่ามีอะไรบ้าง
				console.log('🔍 Available fields:', Object.keys(restaurant));
				
				// หา Owner ID จากฟิลด์ต่าง ๆ ที่เป็นไปได้
				const ownerId = restaurant.User_Owner_ID || restaurant.Owner_ID || restaurant.owner_id || restaurant.user_id;
				console.log('🔍 Owner search result:', { 
					User_Owner_ID: restaurant.User_Owner_ID,
					Owner_ID: restaurant.Owner_ID, 
					owner_id: restaurant.owner_id, 
					user_id: restaurant.user_id, 
					User_ID: restaurant.User_ID 
				});
				
				if (ownerId) {
					userId = ownerId;
					console.log('👤 Found restaurant owner:', userId);
				} else {
					console.log('⚠️ No owner field found in restaurant data, using restaurant ID as user ID for testing');
					userId = restaurantId;
					console.log('👤 Using restaurant ID as user:', userId);
				}
			} catch (error) {
				console.log('❌ Error finding restaurant owner:', error);
				throw new Error('ไม่สามารถหาเจ้าของร้านได้');
			}
			
			console.log('👤 Final user ID (restaurant owner):', userId);
			
			const packageId = data.get('packageId') as string;

			if (!packageId) {
				return fail(400, { error: 'กรุณาเลือกแพ็กเกจ' });
			}

			// ดึงข้อมูล package
			let selectedPackage = null;
			try {
				selectedPackage = await pb.collection('advertisement_packages').getOne(packageId);
			} catch (error) {
				return fail(400, { error: 'ไม่พบแพ็กเกจที่เลือก' });
			}

			const duration = selectedPackage.duration_days;
			const price = selectedPackage.price;

			const startDate = new Date();
			const endDate = new Date();
			endDate.setDate(endDate.getDate() + duration);

			// คำนวณ priority level ตามราคา (ราคาแพงกว่า = priority สูงกว่า)
			// 1 Week (7 days) = Priority 1
			// Priority เพิ่มขึ้นตามราคา
			let priorityLevel = 1;
			
			if (duration <= 7) {
				// 1 Week = Priority 1
				priorityLevel = 1;
			} else if (duration <= 14) {
				// 2 Weeks = Priority 2
				priorityLevel = 2;
			} else if (duration <= 30) {
				// 1 Month = Priority 3
				priorityLevel = 3;
			} else if (duration <= 90) {
				// 3 Months = Priority 4
				priorityLevel = 4;
			} else {
				// มากกว่า 3 เดือน = Priority 5+
				priorityLevel = 5;
			}
			
			// ปรับเพิ่ม priority ตามราคา (ทุก 100 บาท เพิ่ม 1 level)
			const priceBonus = Math.floor(price / 100);
			priorityLevel += priceBonus;
			
			// จำกัดไม่เกิน 10
			priorityLevel = Math.min(priorityLevel, 10);
			
			console.log(`📊 Calculated priority: ${priorityLevel} (duration: ${duration} days, price: ${price} ฿)`);

			// ตรงตาม schema ของ database
			const advertisementData = {
				shop_id: restaurantId,
				package_id: packageId,
				start_date: startDate.toISOString(),
				end_date: endDate.toISOString(),
				status: 'Active',
				payment_status: 'Paid',
				priority_level: priorityLevel,
				total_amount: price
			};

			console.log('Creating advertisement with data:', advertisementData);
			console.log('Package ID being used:', packageId);

			try {
				
				// สร้าง Order สำหรับ Advertise (เหมือน top-up)
				const orderData = {
					User_ID: userId, // ใช้ User ID ที่หาได้ (authenticated หรือ default)
					Shop_ID: restaurantId, // ใช้ Shop ID ปัจจุบัน (ร้านที่ซื้อโฆษณา)
					Menu_ID: [ADVERTISE_MENU_ID || '000000000000002'], // ใช้ Menu ID สำหรับ advertise package
					Total_Amount: price,
					Status: 'Pending',
					Order_Type: 'Advertise' // เพิ่มประเภทเพื่อแยกจาก order ธรรมดา
				};
				
				const orderRecord = await pb.collection('Order').create(orderData);
				console.log('📦 Advertise Order created:', orderRecord.id);
				
				// สร้าง Payment record สำหรับ QR Code
				const paymentData = {
					User_ID: userId, // ใช้ User ID ที่หาได้ (authenticated หรือ default)
					Shop_ID: restaurantId, // ใช้ Shop ID ปัจจุบัน (ร้านที่ซื้อโฆษณา)
					Order_ID: orderRecord.id,
					Method_Payment: 'Qr Code',
					Total_Amount: price,
					status: 'Pending' // รอการอัพโหลดสลิป
				};
				
				const paymentRecord = await pb.collection('Payment').create(paymentData);
				console.log('💳 Advertise Payment created:', paymentRecord.id);
				
				console.log('✅ Advertisement flow initiated for Order:', orderRecord.id);
				
				// Redirect ไปหน้า payment
				// Redirect ไปหน้า QR payment ใน restaurant area
				throw redirect(303, `/restaurant/${restaurantId}/advertise/payment/${orderRecord.id}`);
			} catch (createError: any) {
				// ถ้าเป็น redirect (status 303) ให้โยนต่อไป ไม่ใช่ error
				if (createError?.status === 303) {
					throw createError;
				}
				
				console.log('❌ Create failed:', createError);
				console.log('❌ Error details:', createError?.response?.data);
				
				return fail(500, { 
					error: 'ไม่สามารถสร้างการชำระเงินได้: ' + (createError?.message || 'Unknown error'),
					details: createError?.response?.data 
				});
			}
		} catch (error: any) {
			// ถ้าเป็น redirect (status 303) ให้โยนต่อไป ไม่ใช่ error
			if (error?.status === 303) {
				throw error;
			}
			
			console.error('❌ Error creating advertisement:', error);
			return fail(500, { 
				error: 'เกิดข้อผิดพลาด: ' + (error?.message || 'Unknown error')
			});
		}
	}
} satisfies Actions;
