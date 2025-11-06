import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Store สำหรับเก็บจำนวน unread notifications
export const unreadCount = writable<number>(0);

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

// Auto-refresh ทุก 30 วินาที
let refreshInterval: any;

export function startNotificationPolling() {
	if (!browser) return;
	
	// ดึงครั้งแรก
	fetchUnreadCount();
	
	// ตั้ง interval
	if (refreshInterval) {
		clearInterval(refreshInterval);
	}
	
	refreshInterval = setInterval(() => {
		fetchUnreadCount();
	}, 30000); // 30 วินาที
	
	console.log('✅ Notification polling started (every 30 seconds)');
}

export function stopNotificationPolling() {
	if (refreshInterval) {
		clearInterval(refreshInterval);
		console.log('🛑 Notification polling stopped');
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
