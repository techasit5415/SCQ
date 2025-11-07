import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Store สำหรับเก็บจำนวน unread notifications
export const unreadCount = writable<number>(0);

// Store สำหรับเก็บ order IDs ที่เคยแจ้งเตือนแล้ว (ป้องกันแจ้งซ้ำ)
// เก็บใน localStorage เพื่อไม่ให้แจ้งซ้ำเมื่อ refresh
function createNotifiedOrdersStore() {
	const STORAGE_KEY = 'notifiedOrders';
	
	// โหลดจาก localStorage
	const getStoredOrders = (): Set<string> => {
		if (!browser) return new Set();
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? new Set(JSON.parse(stored)) : new Set();
		} catch {
			return new Set();
		}
	};
	
	const { subscribe, update } = writable<Set<string>>(getStoredOrders());
	
	return {
		subscribe,
		add: (orderId: string) => {
			update(orders => {
				orders.add(orderId);
				// บันทึกลง localStorage
				if (browser) {
					try {
						localStorage.setItem(STORAGE_KEY, JSON.stringify([...orders]));
					} catch (e) {
						console.error('Failed to save notified orders:', e);
					}
				}
				return orders;
			});
		},
		has: (orderId: string): boolean => {
			let result = false;
			subscribe(orders => {
				result = orders.has(orderId);
			})();
			return result;
		},
		clear: () => {
			update(() => {
				if (browser) {
					localStorage.removeItem(STORAGE_KEY);
				}
				return new Set();
			});
		}
	};
}

const notifiedOrders = createNotifiedOrdersStore();

// ฟังก์ชันสำหรับดึงจำนวน unread notifications จาก API
export async function fetchUnreadCount() {
	if (!browser) return;
	
	try {
		const response = await fetch('/api/notifications/unread-count');
		if (response.ok) {
			const data = await response.json();
			unreadCount.set(data.count || 0);
			console.log('🔔 Frontend - Unread notifications:', data.count);
		} else {
			console.error('❌ API response not OK:', response.status);
		}
	} catch (error) {
		console.error('❌ Error fetching unread count:', error);
	}
}

// ฟังก์ชันสำหรับเช็คออเดอร์ที่เสร็จสิ้นใหม่
export async function checkCompletedOrders(onOrderCompleted?: (order: any) => void) {
	if (!browser) return;
	
	console.log('🔍 Checking for completed orders...');
	
	try {
		const response = await fetch('/api/customer/completed-orders');
		console.log('📡 API Response status:', response.status);
		
		if (response.ok) {
			const data = await response.json();
			console.log('📦 API Response data:', data);
			
			const completedOrders = data.orders || [];
			console.log(`✅ Found ${completedOrders.length} completed orders`);
			
			// เช็คว่ามีออเดอร์ใหม่ที่เสร็จสิ้นหรือไม่
			for (const order of completedOrders) {
				console.log(`Checking order ${order.id}, already notified:`, notifiedOrders.has(order.id));
				// ถ้ายังไม่เคยแจ้งเตือน
				if (!notifiedOrders.has(order.id)) {
					notifiedOrders.add(order.id);
					console.log('🎉 New completed order detected:', order);
					// เรียก callback เพื่อแสดง popup
					if (onOrderCompleted) {
						console.log('Calling onOrderCompleted callback...');
						onOrderCompleted(order);
					} else {
						console.warn('⚠️ No callback provided');
					}
				}
			}
		} else {
			console.error('❌ API response not OK:', response.status);
		}
	} catch (error) {
		console.error('❌ Error checking completed orders:', error);
	}
}

// Auto-refresh ทุก 30 วินาที
let refreshInterval: any;
let orderCheckInterval: any;

export function startNotificationPolling(onOrderCompleted?: (order: any) => void) {
	if (!browser) return;
	
	// ดึงครั้งแรก
	fetchUnreadCount();
	checkCompletedOrders(onOrderCompleted);
	
	// ตั้ง interval สำหรับ notification count
	if (refreshInterval) {
		clearInterval(refreshInterval);
	}
	
	refreshInterval = setInterval(() => {
		fetchUnreadCount();
	}, 30000); // 30 วินาที
	
	// ตั้ง interval สำหรับเช็คออเดอร์ที่เสร็จสิ้น (เร็วกว่า)
	if (orderCheckInterval) {
		clearInterval(orderCheckInterval);
	}
	
	orderCheckInterval = setInterval(() => {
		checkCompletedOrders(onOrderCompleted);
	}, 15000); // 15 วินาที (เช็คบ่อยกว่า)
	
	console.log('✅ Notification polling started (notifications: 30s, orders: 15s)');
}

export function stopNotificationPolling() {
	if (refreshInterval) {
		clearInterval(refreshInterval);
		console.log('🛑 Notification polling stopped');
	}
	if (orderCheckInterval) {
		clearInterval(orderCheckInterval);
		console.log('🛑 Order checking stopped');
	}
}

// Mark all as read - เพียงแค่ reset count (จะนับใหม่ในครั้งถัดไปอัตโนมัติ)
export async function markAllAsRead() {
	if (!browser) return;
	
	try {
		// Reset count ใน store
		unreadCount.set(0);
		console.log('✅ All notifications marked as read');
	} catch (error) {
		console.error('❌ Error marking notifications as read:', error);
	}
}
