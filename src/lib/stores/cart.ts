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
			update(cart => {
				const existingItem = cart.items.find(i => i.id === item.id);
				
				if (existingItem) {
					existingItem.quantity += 1;
				} else {
					cart.items.push({ ...item, quantity: 1 });
				}
				
				// Recalculate totals
				cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
				cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
				
				return cart;
			});
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
		}
	};
}

export const cart = createCartStore();