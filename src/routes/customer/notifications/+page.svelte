<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { markAllAsRead } from '$lib/stores/notifications';
	import type { PageData } from './$types';

	export let data: PageData;

	$: notifications = data?.notifications || [];
	$: totalCount = data?.totalCount || 0;
	
	// Debug logs
	$: console.log('🔔 Notifications data:', data);
	$: console.log('📋 Notifications:', notifications);

	// Auto-refresh ทุก 30 วินาที
	let refreshInterval: any;
	let isRefreshing = false;
	let lastRefreshTime = new Date();

	onMount(() => {
		// Mark all as read เมื่อเข้าหน้าการแจ้งเตือน
		markAllAsRead();
		
		// Auto-refresh ทุก 30 วินาที
		refreshInterval = setInterval(async () => {
			await refreshNotifications();
		}, 30000); // 30 วินาที

		console.log('✅ Auto-refresh started (every 30 seconds)');
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
			console.log('🛑 Auto-refresh stopped');
		}
	});

	async function refreshNotifications() {
		if (isRefreshing) return;
		
		isRefreshing = true;
		console.log('🔄 Refreshing notifications...');
		
		try {
			// ใช้ invalidate เพื่อรีโหลดข้อมูลจาก server
			await invalidate('app:notifications');
			lastRefreshTime = new Date();
			console.log('✅ Notifications refreshed');
		} catch (error) {
			console.error('❌ Error refreshing notifications:', error);
		} finally {
			isRefreshing = false;
		}
	}

	function goBack() {
		goto('/customer');
	}

	function formatTime(timeString: string): string {
		const now = new Date();
		const time = new Date(timeString);
		const diffMs = now.getTime() - time.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return 'เพิ่งสร้าง';
		if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
		if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
		if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
		
		return time.toLocaleDateString('th-TH');
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'success': return '#4CAF50';
			case 'pending': return '#FF9800'; 
			case 'error': return '#F44336';
			case 'info': return '#2196F3';
			default: return '#757575';
		}
	}

	function handleNotificationClick(notification: any) {
		console.log('Clicked notification:', notification);
		
		// นำไปหน้าที่เกี่ยวข้อง
		if (notification.type === 'order') {
			goto('/customer/orders');
		} else if (notification.type === 'payment') {
			goto('/customer/orders');
		} else if (notification.type === 'point') {
			goto('/customer/profile');
		}
	}

	function handleMarkAllAsRead() {
		markAllAsRead();
		console.log('✅ All notifications marked as read');
	}
</script>

<svelte:head>
	<title>การแจ้งเตือน - SCQ</title>
</svelte:head>

<div class="notifications-page">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" on:click={goBack} aria-label="กลับหน้าหลัก">
			<span class="material-icons">arrow_back</span>
		</button>
		<h1 class="title">การแจ้งเตือน</h1>
		<button class="action-btn" on:click={handleMarkAllAsRead} aria-label="อ่านทั้งหมด">
			<span class="material-icons">done_all</span>
		</button>
	</div>

	<!-- Notifications Count -->
	<div class="count-section">
		<div class="count-header">
			<p class="count-text">การแจ้งเตือนทั้งหมด {totalCount} รายการ</p>
			<button 
				class="refresh-btn" 
				on:click={refreshNotifications}
				disabled={isRefreshing}
				aria-label="รีเฟรช"
			>
				<span class="material-icons" class:spinning={isRefreshing}>refresh</span>
			</button>
		</div>
		{#if isRefreshing}
			<p class="refresh-status">กำลังรีเฟรช...</p>
		{:else}
			<p class="refresh-status">อัพเดทล่าสุด: {formatTime(lastRefreshTime.toISOString())}</p>
		{/if}
	</div>

	<!-- Notifications List -->
	<div class="notifications-list">
		{#if notifications.length > 0}
			{#each notifications as notification (notification.id)}
				<button 
					class="notification-item {notification.read ? 'read' : 'unread'}"
					on:click={() => handleNotificationClick(notification)}
				>
					<div class="notification-icon">
						<span class="icon">{notification.icon}</span>
					</div>
					
					<div class="notification-content">
						<div class="notification-header">
							<h3 class="notification-title">{notification.title}</h3>
							<span class="notification-time">{formatTime(notification.time)}</span>
						</div>
						
						<p class="notification-message">{notification.message}</p>
						
						{#if notification.amount}
							<div class="notification-amount">
								{#if notification.type === 'order' || notification.type === 'payment'}
									<span class="amount">฿{notification.amount}</span>
								{:else if notification.type === 'point'}
									<span class="amount">{notification.amount} แต้ม</span>
								{/if}
							</div>
						{/if}
						
						<div class="notification-status">
							<span 
								class="status-badge" 
								style="background-color: {getStatusColor(notification.status)}"
							>
								{#if notification.status === 'success'}
									สำเร็จ
								{:else if notification.status === 'pending'}
									รอดำเนินการ
								{:else if notification.status === 'error'}
									ผิดพลาด
								{:else}
									ข้อมูล
								{/if}
							</span>
						</div>
					</div>
					
					<div class="notification-arrow">
						<span class="material-icons">chevron_right</span>
					</div>
				</button>
			{/each}
		{:else}
			<div class="empty-state">
				<div class="empty-icon">
					<span class="material-icons">notifications_none</span>
				</div>
				<h3 class="empty-title">ไม่มีการแจ้งเตือน</h3>
				<p class="empty-message">เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.notifications-page {
		min-height: 100vh;
		background: #f8f9fa;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		background: white;
		border-bottom: 1px solid #e5e5e5;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.back-btn,
	.action-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: transparent;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.back-btn:hover,
	.action-btn:hover {
		background: #f5f5f5;
	}

	.back-btn .material-icons,
	.action-btn .material-icons {
		font-size: 24px;
		color: #333;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: #333;
	}

	.count-section {
		padding: 16px 20px;
		background: white;
		border-bottom: 8px solid #f8f9fa;
	}

	.count-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.count-text {
		font-size: 0.9rem;
		color: #666;
		margin: 0;
	}

	.refresh-btn {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease;
	}

	.refresh-btn:hover:not(:disabled) {
		background: #f5f5f5;
	}

	.refresh-btn:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.refresh-btn .material-icons {
		font-size: 20px;
		color: #666;
		transition: transform 0.3s ease;
	}

	.refresh-btn .material-icons.spinning {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.refresh-status {
		font-size: 0.75rem;
		color: #999;
		margin: 0;
	}

	.notifications-list {
		background: white;
	}

	.notification-item {
		display: flex;
		align-items: flex-start;
		width: 100%;
		padding: 16px 20px;
		background: white;
		border: none;
		border-bottom: 1px solid #f0f0f0;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s ease;
		position: relative;
	}

	.notification-item.unread {
		background: #f8f9ff;
	}

	.notification-item.unread::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: #ff6b35;
	}

	.notification-item:hover {
		background: #f5f5f5;
	}

	.notification-item:last-child {
		border-bottom: none;
	}

	.notification-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12px;
		flex-shrink: 0;
	}

	.notification-icon .icon {
		font-size: 24px;
	}

	.notification-content {
		flex: 1;
		min-width: 0;
	}

	.notification-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 4px;
	}

	.notification-title {
		font-size: 1rem;
		font-weight: 600;
		color: #333;
		margin: 0;
		flex: 1;
	}

	.notification-time {
		font-size: 0.8rem;
		color: #999;
		flex-shrink: 0;
		margin-left: 8px;
	}

	.notification-message {
		font-size: 0.9rem;
		color: #666;
		line-height: 1.4;
		margin: 0 0 8px 0;
	}

	.notification-amount {
		margin-bottom: 8px;
	}

	.notification-amount .amount {
		font-size: 0.9rem;
		font-weight: 600;
		color: #ff6b35;
	}

	.notification-status {
		display: flex;
		align-items: center;
	}

	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
		color: white;
	}

	.notification-arrow {
		margin-left: 8px;
		flex-shrink: 0;
	}

	.notification-arrow .material-icons {
		font-size: 20px;
		color: #999;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20px;
	}

	.empty-icon .material-icons {
		font-size: 40px;
		color: #ccc;
	}

	.empty-title {
		font-size: 1.2rem;
		font-weight: 600;
		color: #333;
		margin: 0 0 8px 0;
	}

	.empty-message {
		font-size: 0.9rem;
		color: #666;
		margin: 0;
	}

	/* Material Icons Support */
	@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');
</style>