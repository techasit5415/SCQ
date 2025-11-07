<script lang="ts">
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import { createEventDispatcher } from 'svelte';

	export let order: any;
	
	const dispatch = createEventDispatcher();

	function getMenuImageUrl(menuItem: any): string {
		if (menuItem.Photo) {
			return `${PUBLIC_POCKETBASE_URL}/api/files/Menu/${menuItem.id}/${menuItem.Photo}`;
		}
		return '/Photo/Icon.png';
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			'Pending': '#ffa726',
			'In-progress': '#42a5f5',
			'Completed': '#66bb6a',
			'Canceled': '#ef5350'
		};
		return colors[status] || '#9e9e9e';
	}

	function getStatusIcon(status: string): string {
		const icons: Record<string, string> = {
			'Pending': 'schedule',
			'In-progress': 'restaurant',
			'Completed': 'check_circle',
			'Canceled': 'cancel'
		};
		return icons[status] || 'help';
	}

	function getStatusText(status: string): string {
		const texts: Record<string, string> = {
			'Pending': 'รอดำเนินการ',
			'In-progress': 'กำลังเตรียม',
			'Completed': 'เสร็จสิ้น',
			'Canceled': 'ยกเลิก'
		};
		return texts[status] || status;
	}

	function handleReview() {
		dispatch('review', order);
	}
</script>

<div class="order-card">
	<!-- Order Header -->
	<div class="order-header">
		<div class="order-info">
			<h3 class="restaurant-name">{order.expand?.Shop_ID?.name || 'ร้านอาหาร'}</h3>
			<p class="order-id">Order #{order.id.slice(-8)}</p>
		</div>
		<div class="order-status" style="background-color: {getStatusColor(order.Status)}">
			<span class="material-icons">{getStatusIcon(order.Status)}</span>
			<span>{getStatusText(order.Status)}</span>
		</div>
	</div>

	<!-- Order Date -->
	<div class="order-date">
		<span class="material-icons">access_time</span>
		<span>{new Date(order.created).toLocaleString('th-TH')}</span>
	</div>

	<!-- Menu Items -->
	<div class="menu-items">
		{#if order.expand?.Menu_ID && Array.isArray(order.expand.Menu_ID)}
			{#each order.expand.Menu_ID.slice(0, 3) as menuItem}
				<div class="menu-item">
					<div class="menu-image">
						<img src={getMenuImageUrl(menuItem)} alt={menuItem.name} />
					</div>
					<div class="menu-info">
						<p class="menu-name">{menuItem.name}</p>
						<p class="menu-price">฿{menuItem.Price || '50'}</p>
					</div>
				</div>
			{/each}
			{#if order.expand.Menu_ID.length > 3}
				<div class="more-items">
					+{order.expand.Menu_ID.length - 3} รายการ
				</div>
			{/if}
		{:else}
			<div class="menu-item">
				<div class="menu-placeholder">🍽️</div>
				<div class="menu-info">
					<p class="menu-name">รายการอาหาร</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Order Footer -->
	<div class="order-footer">
		<div class="order-total">
			<span class="total-label">ยอดรวม:</span>
			<span class="total-amount">฿{order.Total_Amount}</span>
		</div>
		
		<!-- Review Button -->
		{#if order.Status === 'Completed'}
			{#if order.hasReviewed}
				<div class="reviewed-badge">
					<span class="material-icons">check_circle</span>
					<span>รีวิวแล้ว</span>
				</div>
			{:else}
				<button class="review-btn" on:click={handleReview}>
					<span class="material-icons">star_rate</span>
					<span>รีวิวร้านนี้</span>
				</button>
			{/if}
		{/if}
		
		{#if order.payment}
			<div class="payment-info">
				<span class="payment-label">ชำระผ่าน:</span>
				<span class="payment-method">{order.payment.Method_Payment}</span>
				<span class="payment-status" class:success={order.payment.status === 'success'} class:error={order.payment.status === 'error'}>
					{order.payment.status === 'success' ? '✅ สำเร็จ' : order.payment.status === 'error' ? '❌ ล้มเหลว' : '⏳ รอดำเนินการ'}
				</span>
			</div>
		{/if}
		
		{#if order.Note}
			<div class="order-note">
				<span class="note-label">หมายเหตุ:</span>
				<span class="note-text">{order.Note}</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.order-card {
		background: white;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.order-card:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
		gap: 12px;
	}

	.order-info {
		flex: 1;
	}

	.restaurant-name {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 4px 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.order-id {
		font-size: 13px;
		color: #666;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.order-status {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border-radius: 20px;
		color: white;
		font-size: 13px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
		white-space: nowrap;
	}

	.order-status .material-icons {
		font-size: 18px;
	}

	.order-date {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #666;
		font-size: 13px;
		margin-bottom: 16px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.order-date .material-icons {
		font-size: 16px;
	}

	.menu-items {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 16px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.menu-image {
		width: 50px;
		height: 50px;
		border-radius: 8px;
		overflow: hidden;
		background: white;
		flex-shrink: 0;
	}

	.menu-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.menu-placeholder {
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		background: white;
		border-radius: 8px;
	}

	.menu-info {
		flex: 1;
	}

	.menu-name {
		font-size: 14px;
		font-weight: 500;
		color: #333;
		margin: 0 0 4px 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.menu-price {
		font-size: 13px;
		color: #ff6b35;
		font-weight: 600;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.more-items {
		text-align: center;
		padding: 8px;
		background: #e3f2fd;
		border-radius: 8px;
		color: #1976d2;
		font-size: 13px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.order-footer {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding-top: 16px;
		border-top: 1px solid #e0e0e0;
	}

	.order-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.total-label {
		font-size: 14px;
		color: #666;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.total-amount {
		font-size: 20px;
		font-weight: 700;
		color: #ff6b35;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.review-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.review-btn:hover {
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(255, 167, 38, 0.3);
	}

	.review-btn .material-icons {
		font-size: 18px;
	}

	.reviewed-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 16px;
		background: #e8f5e9;
		color: #2e7d32;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.reviewed-badge .material-icons {
		font-size: 18px;
	}

	.payment-info {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.payment-label {
		color: #666;
	}

	.payment-method {
		color: #333;
		font-weight: 500;
	}

	.payment-status {
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}

	.payment-status.success {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.payment-status.error {
		background: #ffebee;
		color: #c62828;
	}

	.order-note {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px;
		background: #fff3e0;
		border-radius: 8px;
		font-size: 13px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.note-label {
		color: #666;
		font-weight: 500;
	}

	.note-text {
		color: #333;
	}
</style>
