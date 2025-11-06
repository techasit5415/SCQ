import type { PageServerLoad, Actions } from './$types.js';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { fail } from '@sveltejs/kit';

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
	createAdvertisement: async ({ request, params }) => {
		try {
			const data = await request.formData();
			const restaurantId = params.id;
			
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

			// ตรงตาม schema ของ database
			const advertisementData = {
				shop_id: restaurantId,
				package_id: packageId,
				start_date: startDate.toISOString(),
				end_date: endDate.toISOString(),
				status: 'Active',
				payment_status: 'Paid',
				priority_level: 1,
				total_amount: price
			};

			console.log('Creating advertisement with data:', advertisementData);
			console.log('Package ID being used:', packageId);

			try {
				const newAd = await pb.collection('shop_advertisements').create(advertisementData);
				console.log('✅ Advertisement created:', newAd.id);
				return { success: true, advertisement: newAd };
			} catch (createError: any) {
				console.log('❌ Create failed:', createError);
				console.log('❌ Error details:', createError?.response?.data);
				
				// ถ้า error เรื่อง package_id ให้แสดง available packages
				if (createError?.response?.data?.data?.package_id) {
					try {
						const availablePackages = await pb.collection('advertisement_packages').getFullList();
						console.log('📦 Available packages:', availablePackages.map(p => ({ id: p.id, name: p.name })));
					} catch (e) {
						console.log('Could not fetch available packages');
					}
				}
				
				return fail(500, { 
					error: 'ไม่สามารถสร้างโฆษณาได้: ' + (createError?.message || 'Unknown error'),
					details: createError?.response?.data 
				});
			}
		} catch (error: any) {
			console.error('❌ Error creating advertisement:', error);
			return fail(500, { 
				error: 'เกิดข้อผิดพลาด: ' + (error?.message || 'Unknown error')
			});
		}
	}
} satisfies Actions;
