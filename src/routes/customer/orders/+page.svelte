<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

	export let data;

	$: orders = data.orders || [];

	function goBack() {
		goto('/customer');
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'Pending':
				return '#ff9500'; // สีส้ม
			case 'Completed':
				return '#34c759'; // สีเขียว
			case 'Cancelled':
				return '#ff3b30'; // สีแดง
			default:
				return '#8e8e93'; // สีเทา
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'Pending':
				return 'กำลังเตรียม';
			case 'Completed':
				return 'เสร็จสิ้น';
			case 'Cancelled':
				return 'ยกเลิก';
			default:
				return status;
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('th-TH', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getMenuImageUrl(menuItem: any): string {
		if (menuItem.Photo) {
			return `${PUBLIC_POCKETBASE_URL}/api/files/Menu/${menuItem.id}/${menuItem.Photo}`;
		}
		return '/Photo/Icon.png';
	}

	function viewOrderDetail(order: any) {
		// TODO: Navigate to order detail page
		console.log('View order detail:', order.id);
	}
</script>

<svelte:head>
	<title>ประวัติการสั่งอาหาร</title>
</svelte:head>

<!-- Header -->
<div class="header">
	<button class="back-btn" on:click={goBack} aria-label="กลับหน้าหลัก">
		<span class="material-icons">arrow_back</span>
	</button>
	<h1 class="title">ประวัติการสั่งอาหาร</h1>
</div>

<!-- Content -->
<div class="content">
	{#if data.success === false}
		<!-- Error State -->
		<div class="error-state">
			<div class="error-icon">⚠️</div>
			<h2>เกิดข้อผิดพลาด</h2>
			<p>{data.error}</p>
			<button class="retry-btn" on:click={() => window.location.reload()}>
				ลองใหม่
			</button>
		</div>
	{:else if orders.length === 0}
		<!-- Empty State -->
		<div class="empty-state">
			<div class="empty-icon">🍽️</div>
			<h2>ยังไม่มีประวัติการสั่งอาหาร</h2>
			<p>เมื่อคุณสั่งอาหารแล้ว ประวัติจะแสดงที่นี่</p>
			<button class="browse-btn" on:click={goBack}>
				เลือกร้านอาหาร
			</button>
		</div>
	{:else}
		<!-- Orders List -->
		<div class="orders-list">
			{#each orders as order}
				<div class="order-card" on:click={() => viewOrderDetail(order)}>
					<!-- Order Header -->
					<div class="order-header">
						<div class="restaurant-info">
							<h3 class="restaurant-name">
								{#if order.expand?.Shop_ID}
									{order.expand.Shop_ID.name}
								{:else}
									ร้านอาหาร
								{/if}
							</h3>
							<p class="order-date">{formatDate(order.created)}</p>
						</div>
						<div class="order-status" style="color: {getStatusColor(order.Status)}">
							{getStatusText(order.Status)}
						</div>
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
			{/each}
		</div>
	{/if}
</div>

<style>
	.header {
		display: flex;
		align-items: center;
		padding: 16px;
		background: white;
		border-bottom: 1px solid #e5e5e5;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.back-btn {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16px;
	}

	.back-btn:hover {
		background: #f5f5f5;
	}

	.back-btn .material-icons {
		font-size: 24px;
		color: #333;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.content {
		padding: 16px;
		max-width: 600px;
		margin: 0 auto;
		min-height: calc(100vh - 80px);
	}

	/* Error State */
	.error-state {
		text-align: center;
		padding: 60px 20px;
	}

	.error-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.error-state h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.error-state p {
		color: #666;
		margin: 0 0 24px 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.retry-btn {
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 12px 24px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.empty-state p {
		color: #666;
		margin: 0 0 24px 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.browse-btn {
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 12px 24px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	/* Orders List */
	.orders-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.order-card {
		background: white;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		transition: all 0.2s ease;
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
	}

	.restaurant-name {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 4px 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.order-date {
		font-size: 0.875rem;
		color: #666;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.order-status {
		font-size: 0.875rem;
		font-weight: 600;
		padding: 4px 12px;
		border-radius: 12px;
		background: rgba(255, 107, 53, 0.1);
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.menu-items {
		margin-bottom: 12px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	.menu-image {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		overflow: hidden;
		background: #f5f5f5;
		flex-shrink: 0;
	}

	.menu-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.menu-placeholder {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		background: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
	}

	.menu-info {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.menu-name {
		font-size: 0.9rem;
		color: #333;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.menu-price {
		font-size: 0.9rem;
		font-weight: 600;
		color: #ff6b35;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.more-items {
		font-size: 0.8rem;
		color: #666;
		padding: 8px 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.order-footer {
		border-top: 1px solid #e5e5e5;
		padding-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.order-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.total-label {
		font-size: 1rem;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.total-amount {
		font-size: 1.1rem;
		font-weight: 600;
		color: #ff6b35;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.order-note {
		display: flex;
		gap: 8px;
	}

	.note-label {
		font-size: 0.875rem;
		color: #666;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.note-text {
		font-size: 0.875rem;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.payment-info {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}

	.payment-label {
		font-size: 0.875rem;
		color: #666;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.payment-method {
		font-size: 0.875rem;
		color: #333;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.payment-status {
		font-size: 0.8rem;
		padding: 2px 8px;
		border-radius: 12px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.payment-status.success {
		background: rgba(52, 199, 89, 0.1);
		color: #34c759;
	}

	.payment-status.error {
		background: rgba(255, 59, 48, 0.1);
		color: #ff3b30;
	}

	/* Mobile Responsive */
	@media (max-width: 480px) {
		.content {
			padding: 12px;
		}

		.order-card {
			padding: 12px;
		}

		.restaurant-name {
			font-size: 1rem;
		}

		.order-date {
			font-size: 0.8rem;
		}

		.order-status {
			font-size: 0.8rem;
			padding: 3px 8px;
		}
	}
</style>