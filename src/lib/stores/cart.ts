import { writable } from 'svelte/store';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	Photo?: string;
	Details?: string;
	category?: string;
	restaurantId: string;
	restaurantName: string;
}

export interface CartStore {
	items: CartItem[];
	total: number;
	count: number;
}

function createCartStore() {
	const { subscribe, set, update } = writable<CartStore>({
		items: [],
		total: 0,
		count: 0
	});

	return {
		subscribe,
		addItem: (item: Omit<CartItem, 'quantity'>) => {
			let success = false;
			let message = '';
			
			update(cart => {
				// ตรวจสอบว่ามีสินค้าในตะกร้าอยู่แล้วหรือไม่
				if (cart.items.length > 0) {
					// เช็คว่าสินค้าในตะกร้ามาจากร้านเดียวกันหรือไม่
					const currentRestaurantId = cart.items[0].restaurantId;
					
					if (currentRestaurantId !== item.restaurantId) {
						// ไม่ใช่ร้านเดียวกัน - ไม่อนุญาต
						success = false;
						message = `ไม่สามารถสั่งอาหารจากหลายร้านพร้อมกันได้\nกรุณาล้างตะกร้าก่อนสั่งจากร้าน ${item.restaurantName}`;
						return cart; // คืนค่า cart เดิมโดยไม่เปลี่ยนแปลง
					}
				}
				
				// ร้านเดียวกัน หรือเป็นสินค้าชิ้นแรก - อนุญาตให้เพิ่ม
				const existingItem = cart.items.find(i => i.id === item.id);
				
				if (existingItem) {
					existingItem.quantity += 1;
					message = `เพิ่มจำนวน ${item.name} แล้ว`;
				} else {
					cart.items.push({ ...item, quantity: 1 });
					message = `เพิ่ม ${item.name} ลงตะกร้าแล้ว`;
				}
				
				success = true;
				
				// Recalculate totals
				cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
				cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
				
				return cart;
			});
			
			return { success, message };
		},
		removeItem: (itemId: string) => {
			update(cart => {
				cart.items = cart.items.filter(item => item.id !== itemId);
				cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
				cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
				return cart;
			});
		},
		updateQuantity: (itemId: string, quantity: number) => {
			update(cart => {
				const item = cart.items.find(i => i.id === itemId);
				if (item) {
					if (quantity <= 0) {
						cart.items = cart.items.filter(i => i.id !== itemId);
					} else {
						item.quantity = quantity;
					}
				}
				cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
				cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
				return cart;
			});
		},
		clear: () => {
			set({
				items: [],
				total: 0,
				count: 0
			});
		},
		getCurrentRestaurant: () => {
			let currentRestaurant: { id: string; name: string } | null = null;
			subscribe(cart => {
				if (cart.items.length > 0) {
					currentRestaurant = {
						id: cart.items[0].restaurantId,
						name: cart.items[0].restaurantName
					};
				}
			})();
			return currentRestaurant;
		}
	};
}

export const cart = createCartStore();