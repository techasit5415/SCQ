import { writable } from 'svelte/store';

export interface ToastNotification {
	id: number;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastNotification[]>([]);
	
	let idCounter = 0;
	
	function addToast(message: string, type: ToastNotification['type'] = 'info', duration = 3000) {
		const id = idCounter++;
		const toast: ToastNotification = { id, message, type, duration };
		
		update(toasts => [...toasts, toast]);
		
		// Auto remove after duration
		if (duration > 0) {
			setTimeout(() => {
				removeToast(id);
			}, duration + 300); // Add 300ms for animation
		}
		
		return id;
	}
	
	function removeToast(id: number) {
		update(toasts => toasts.filter(t => t.id !== id));
	}
	
	return {
		subscribe,
		success: (message: string, duration?: number) => addToast(message, 'success', duration),
		error: (message: string, duration?: number) => addToast(message, 'error', duration),
		warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
		info: (message: string, duration?: number) => addToast(message, 'info', duration),
		remove: removeToast
	};
}

export const toastStore = createToastStore();
