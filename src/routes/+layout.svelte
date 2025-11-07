<script>
	import '../app.css';
	import ToastContainer from '$lib/Components/ToastContainer.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { startNotificationPolling, stopNotificationPolling } from '$lib/stores/notifications';
	
	let refreshInterval;
	
	// เริ่ม notification polling และ auto-refresh เมื่อ app โหลด
	onMount(() => {
		// เริ่ม notification polling
		startNotificationPolling();
		console.log('🚀 App mounted - Notification polling started');
		
		// Auto-refresh ทุกหน้า ทุกๆ 5 วินาที
		refreshInterval = setInterval(() => {
			invalidateAll();
			console.log('🔄 Auto-refresh: Page data reloaded');
		}, 5000); // 5 วินาที
		
		console.log('🔄 Auto-refresh started (every 5 seconds)');
	});
	
	// หยุด polling และ refresh เมื่อ app ถูก destroy
	onDestroy(() => {
		stopNotificationPolling();
		
		if (refreshInterval) {
			clearInterval(refreshInterval);
			console.log('🛑 Auto-refresh stopped');
		}
		
		console.log('🛑 App destroyed');
	});
</script>

<ToastContainer />
<slot />

<style>
	:global(body) {
		font-family: 'Noto Sans Thai', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		margin: 0;
		padding: 0;
		background-color: #fafafa;
		color: #333;
		line-height: 1.6;
	}
</style>