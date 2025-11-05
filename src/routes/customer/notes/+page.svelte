<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

	export let data: PageData;

	$: notes = data.notes || [];
	$: ordersWithNotes = data.ordersWithNotes || [];

	function goBack() {
		goto('/customer');
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('th-TH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatAmount(amount: number): string {
		return amount?.toLocaleString('th-TH') || '0';
	}

	function getShopImageUrl(shop: any): string {
		if (shop?.Pic_Shop) {
			return `${PUBLIC_POCKETBASE_URL}/api/files/Shop/${shop.id}/${shop.Pic_Shop}`;
		}
		return '/restaurant-placeholder.svg';
	}
</script>

<svelte:head>
	<title>หมายเหตุคำสั่งซื้อ - SCQ</title>
</svelte:head>

<div class="notes-page">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" on:click={goBack}>
			<span class="material-icons">arrow_back</span>
		</button>
		<h1>หมายเหตุคำสั่งซื้อ</h1>
	</div>

	<!-- Error State -->
	{#if data.error}
		<div class="error-message">
			<span class="material-icons">error</span>
			<p>เกิดข้อผิดพลาด: {data.error}</p>
		</div>
	{/if}

	<!-- Notes List -->
	<div class="notes-container">
		{#if notes.length > 0}
			<div class="section-header">
				<h2>หมายเหตุทั้งหมด ({notes.length})</h2>
				<span class="material-icons">note</span>
			</div>

			<div class="notes-list">
				{#each notes as note}
					<div class="note-card">
						<div class="note-header">
							<div class="shop-info">
								{#if note.expand?.Shop_ID}
									<img 
										src={getShopImageUrl(note.expand.Shop_ID)} 
										alt={note.expand.Shop_ID.name}
										class="shop-avatar"
									/>
									<div class="shop-details">
										<h3>{note.expand.Shop_ID.name}</h3>
										<p class="shop-address">{note.expand.Shop_ID.Addr}</p>
									</div>
								{:else}
									<div class="shop-details">
										<h3>ร้านอาหาร</h3>
										<p class="shop-address">-</p>
									</div>
								{/if}
							</div>
							<div class="note-date">
								{formatDate(note.created)}
							</div>
						</div>

						<div class="note-content">
							<div class="content-label">
								<span class="material-icons">message</span>
								หมายเหตุ:
							</div>
							<p class="note-text">{note.Content}</p>
						</div>

						{#if note.relatedOrder}
							<div class="order-info">
								<div class="order-label">
									<span class="material-icons">receipt</span>
									คำสั่งซื้อที่เกี่ยวข้อง:
								</div>
								<div class="order-details">
									<span class="order-id">#{note.relatedOrder.id.slice(-8)}</span>
									<span class="order-amount">฿{formatAmount(note.relatedOrder.Total_Amount)}</span>
									<span class="order-status status-{note.relatedOrder.Status?.toLowerCase()}">{note.relatedOrder.Status}</span>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<span class="material-icons">note_add</span>
				<h2>ยังไม่มีหมายเหตุ</h2>
				<p>หมายเหตุจากคำสั่งซื้อของคุณจะแสดงที่นี่</p>
				<button class="cta-button" on:click={() => goto('/customer')}>
					เริ่มสั่งอาหาร
				</button>
			</div>
		{/if}
	</div>

	<!-- Orders with Notes Section -->
	{#if ordersWithNotes.length > 0}
		<div class="section-divider"></div>
		
		<div class="orders-section">
			<div class="section-header">
				<h2>คำสั่งซื้อที่มีหมายเหตุ ({ordersWithNotes.length})</h2>
				<span class="material-icons">shopping_cart</span>
			</div>

			<div class="orders-list">
				{#each ordersWithNotes as order}
					<div class="order-card">
						<div class="order-header">
							<div class="order-id-section">
								<span class="material-icons">receipt</span>
								<div>
									<h3>#{order.id.slice(-8)}</h3>
									<p class="order-date">{formatDate(order.created)}</p>
								</div>
							</div>
							<div class="order-status-section">
								<span class="order-amount">฿{formatAmount(order.Total_Amount)}</span>
								<span class="order-status status-{order.Status?.toLowerCase()}">{order.Status}</span>
							</div>
						</div>

						{#if order.expand?.Shop_ID}
							<div class="shop-section">
								<img 
									src={getShopImageUrl(order.expand.Shop_ID)} 
									alt={order.expand.Shop_ID.name}
									class="shop-mini-avatar"
								/>
								<span class="shop-name">{order.expand.Shop_ID.name}</span>
							</div>
						{/if}

						{#if order.expand?.Note}
							<div class="note-section">
								<div class="note-label">
									<span class="material-icons">sticky_note_2</span>
									หมายเหตุ:
								</div>
								<p class="note-content">{order.expand.Note.Content}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.notes-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 15px;
		margin-bottom: 30px;
		color: white;
	}

	.back-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 12px;
		padding: 12px;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.back-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px);
	}

	.header h1 {
		font-size: 24px;
		font-weight: 600;
		margin: 0;
	}

	.notes-container {
		background: white;
		border-radius: 20px;
		padding: 25px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		margin-bottom: 20px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 2px solid #f5f5f5;
	}

	.section-header h2 {
		font-size: 20px;
		font-weight: 600;
		color: #333;
		margin: 0;
	}

	.section-header .material-icons {
		color: #667eea;
		font-size: 28px;
	}

	.notes-list, .orders-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.note-card, .order-card {
		background: #f8f9ff;
		border: 1px solid #e1e5ff;
		border-radius: 15px;
		padding: 20px;
		transition: all 0.3s ease;
	}

	.note-card:hover, .order-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 20px rgba(102, 126, 234, 0.1);
	}

	.note-header, .order-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 15px;
	}

	.shop-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.shop-avatar {
		width: 50px;
		height: 50px;
		border-radius: 12px;
		object-fit: cover;
		border: 2px solid #e1e5ff;
	}

	.shop-mini-avatar {
		width: 30px;
		height: 30px;
		border-radius: 8px;
		object-fit: cover;
		border: 1px solid #e1e5ff;
	}

	.shop-details h3 {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin: 0 0 4px 0;
	}

	.shop-address {
		font-size: 13px;
		color: #666;
		margin: 0;
	}

	.note-date, .order-date {
		font-size: 12px;
		color: #888;
		text-align: right;
	}

	.note-content, .note-section {
		background: white;
		border-radius: 10px;
		padding: 15px;
		border-left: 4px solid #667eea;
	}

	.content-label, .note-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #667eea;
		margin-bottom: 8px;
	}

	.content-label .material-icons, .note-label .material-icons {
		font-size: 18px;
	}

	.note-text, .note-content {
		font-size: 14px;
		color: #555;
		line-height: 1.5;
		margin: 0;
	}

	.order-info {
		background: white;
		border-radius: 10px;
		padding: 15px;
		margin-top: 15px;
		border-left: 4px solid #28a745;
	}

	.order-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #28a745;
		margin-bottom: 8px;
	}

	.order-details {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.order-id {
		font-family: monospace;
		background: #f0f0f0;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
	}

	.order-amount {
		font-weight: 600;
		color: #333;
	}

	.order-status {
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-pending {
		background: #fff3cd;
		color: #856404;
	}

	.status-completed, .status-success {
		background: #d4edda;
		color: #155724;
	}

	.status-cancelled {
		background: #f8d7da;
		color: #721c24;
	}

	.order-id-section {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.order-id-section h3 {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin: 0;
		font-family: monospace;
	}

	.order-status-section {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
	}

	.shop-section {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 15px;
		padding-bottom: 15px;
		border-bottom: 1px solid #e1e5ff;
	}

	.shop-name {
		font-weight: 500;
		color: #555;
	}

	.section-divider {
		height: 2px;
		background: rgba(255, 255, 255, 0.3);
		margin: 30px 0;
		border-radius: 1px;
	}

	.orders-section {
		background: white;
		border-radius: 20px;
		padding: 25px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: #666;
	}

	.empty-state .material-icons {
		font-size: 80px;
		color: #ddd;
		margin-bottom: 20px;
	}

	.empty-state h2 {
		font-size: 24px;
		font-weight: 600;
		color: #333;
		margin: 0 0 12px 0;
	}

	.empty-state p {
		font-size: 16px;
		color: #666;
		margin: 0 0 30px 0;
	}

	.cta-button {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 25px;
		padding: 15px 30px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.cta-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
	}

	.error-message {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
		border-radius: 10px;
		padding: 15px;
		margin-bottom: 20px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.error-message .material-icons {
		color: #721c24;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.notes-page {
			padding: 15px;
		}

		.header h1 {
			font-size: 20px;
		}

		.notes-container, .orders-section {
			padding: 20px;
		}

		.note-header, .order-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 15px;
		}

		.note-date, .order-date {
			text-align: left;
		}

		.order-status-section {
			align-items: flex-start;
		}

		.shop-info {
			flex-direction: column;
			align-items: flex-start;
		}

		.order-details {
			flex-wrap: wrap;
		}
	}
</style>