<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import { toastStore } from '$lib/stores/toast';
	import { enhance } from '$app/forms';

	export let data;

	$: orders = data.orders || [];
	
	// Review modal state
	let showReviewModal = false;
	let selectedOrder: any = null;
	let reviewRating = 5;
	let reviewComment = '';
	let isSubmittingReview = false;

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

	// เช็คว่าหมดเวลาชำระเงินหรือยัง (5 นาที)
	function isPaymentExpired(orderCreated: string): boolean {
		const PAYMENT_TIMEOUT = 5 * 60 * 1000; // 5 นาที
		const createdTime = new Date(orderCreated).getTime();
		const now = Date.now();
		return (now - createdTime) > PAYMENT_TIMEOUT;
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
	
	function openReviewModal(order: any, event: MouseEvent) {
		event.stopPropagation(); // ป้องกันไม่ให้คลิก card
		selectedOrder = order;
		reviewRating = 5;
		reviewComment = '';
		showReviewModal = true;
	}
	
	function closeReviewModal() {
		showReviewModal = false;
		selectedOrder = null;
		reviewRating = 5;
		reviewComment = '';
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
								{#if order.Shop_ID === '000000000000001'}
									💎 เติม SCQ Point
								{:else if order.expand?.Shop_ID}
									{order.expand.Shop_ID.name}
								{:else}
									ร้านอาหาร
								{/if}
							</h3>
							<p class="order-date">{formatDate(order.created)}</p>
						</div>
						<div class="order-status-section">
							<div class="order-status" style="color: {getStatusColor(order.Status)}">
								{getStatusText(order.Status)}
							</div>
							{#if order.queuePosition && (order.Status === 'Pending' || order.Status === 'In-progress')}
								<div class="queue-position">
									<span class="queue-icon">🍳</span>
									<span class="queue-text">คิวที่ {order.queuePosition}</span>
								</div>
							{/if}
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
						
					<!-- Payment Button (แสดงเฉพาะ QR Code ที่ Pending และยังไม่หมดเวลา) -->
					{#if order.payment && order.payment.Method_Payment === 'Qr Code' && order.payment.status === 'Pending'}
						{#if isPaymentExpired(order.created)}
							<!-- หมดเวลาชำระเงินแล้ว -->
							<div class="expired-badge">
								<span class="material-icons">schedule</span>
								<span>หมดเวลาชำระ</span>
							</div>
						{:else}
							<!-- ยังไม่หมดเวลา แสดงปุ่มชำระเงิน -->
							<button 
								class="payment-btn"
								on:click={(e) => {
									e.stopPropagation();
									goto(`/customer/payment/${order.id}`);
								}}
							>
								<span class="material-icons">payment</span>
								<span>ชำระเงิน</span>
							</button>
						{/if}
					{:else if order.payment && order.payment.Method_Payment === 'Qr Code' && order.payment.status === 'Success'}
						<div class="pending-badge">
							<span class="material-icons">check_circle</span>
							<span>ชำระแล้ว</span>
						</div>
					{:else if order.payment && order.payment.Method_Payment === 'Point'}
						<div class="pending-badge point-badge">
							<span class="material-icons">stars</span>
							<span>Point</span>
						</div>
					{/if}
					
					<!-- Review Button (เฉพาะ order ที่เสร็จแล้ว และยังไม่ได้รีวิว) -->
					{#if order.Status === 'Completed'}
						{#if order.hasReviewed}
							<div class="reviewed-badge">
								<span class="material-icons">check_circle</span>
								<span>รีวิวแล้ว</span>
							</div>
						{:else}
							<button 
								class="review-btn"
								on:click={(e) => openReviewModal(order, e)}
							>
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
			{/each}
		</div>
	{/if}
</div>

<!-- Review Modal -->
{#if showReviewModal && selectedOrder}
	<div class="modal-overlay" on:click={closeReviewModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h3>รีวิวร้าน</h3>
				<button class="close-btn" on:click={closeReviewModal}>
					<span class="material-icons">close</span>
				</button>
			</div>
			
			<div class="modal-body">
				<!-- Restaurant Info -->
				<div class="restaurant-review-info">
					<h4>{selectedOrder.expand?.Shop_ID?.name || 'ร้านอาหาร'}</h4>
					<p class="order-id">Order #{selectedOrder.id.slice(-8)}</p>
				</div>
				
				<!-- Rating Stars -->
				<div class="rating-section">
					<label>ให้คะแนน</label>
					<div class="stars">
						{#each [1, 2, 3, 4, 5] as star}
							<button 
								class="star-btn"
								class:active={star <= reviewRating}
								on:click={() => reviewRating = star}
							>
								<span class="material-icons">
									{star <= reviewRating ? 'star' : 'star_border'}
								</span>
							</button>
						{/each}
						<span class="rating-text">{reviewRating} ดาว</span>
					</div>
				</div>
				
				<!-- Comment -->
				<div class="comment-section">
					<label for="reviewComment">แสดงความคิดเห็น</label>
					<textarea 
						id="reviewComment"
						bind:value={reviewComment}
						placeholder="บอกเล่าประสบการณ์ของคุณ..."
						rows="4"
					></textarea>
				</div>
			</div>
			
			<form method="POST" action="?/submitReview" use:enhance={() => {
				isSubmittingReview = true;
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toastStore.success('ส่งรีวิวเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็น! 🌟');
						closeReviewModal();
					} else if (result.type === 'failure') {
						toastStore.error('ไม่สามารถส่งรีวิวได้: ' + (result.data?.error || 'กรุณาลองใหม่'));
					}
					await update();
					isSubmittingReview = false;
				};
			}}>
				<input type="hidden" name="shopId" value={selectedOrder.Shop_ID} />
				<input type="hidden" name="orderId" value={selectedOrder.id} />
				<input type="hidden" name="star" value={reviewRating} />
				<input type="hidden" name="description" value={reviewComment} />
				
				<div class="modal-footer">
					<button type="button" class="btn-cancel-modal" on:click={closeReviewModal} disabled={isSubmittingReview}>
						ยกเลิก
					</button>
					<button type="submit" class="btn-submit-modal" disabled={isSubmittingReview}>
						{isSubmittingReview ? 'กำลังส่ง...' : 'ส่งรีวิว'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

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

	.order-status-section {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
	}

	.order-status {
		font-size: 0.875rem;
		font-weight: 600;
		padding: 4px 12px;
		border-radius: 12px;
		background: rgba(255, 107, 53, 0.1);
		font-family: 'Noto Sans Thai', sans-serif;
	}
	
	.queue-position {
		display: flex;
		align-items: center;
		gap: 4px;
		background: #f8f9fa;
		padding: 4px 8px;
		border-radius: 12px;
		border: 1px solid #e9ecef;
	}
	
	.queue-icon {
		font-size: 12px;
	}
	
	.queue-text {
		font-size: 11px;
		font-weight: 600;
		color: #666;
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

	/* Review Button */
	.review-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px;
		background: linear-gradient(135deg, #ffd700, #ff8c00);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
		transition: all 0.2s ease;
		margin-top: 8px;
	}
	
	.review-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
	}
	
	.review-btn .material-icons {
		font-size: 20px;
	}

	.payment-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px;
		background: linear-gradient(135deg, #3b82f6, #1e40af);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
		transition: all 0.2s ease;
		margin-top: 8px;
	}
	
	.payment-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
	}
	
	.payment-btn .material-icons {
		font-size: 20px;
	}

	.pending-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px;
		background: #fef3c7;
		color: #92400e;
		border: 2px solid #fbbf24;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		font-family: 'Noto Sans Thai', sans-serif;
		margin-top: 8px;
	}

	.pending-badge .material-icons {
		font-size: 20px;
		color: #f59e0b;
	}

	.reviewed-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px;
		background: #e8f5e9;
		color: #2e7d32;
		border: 2px solid #4caf50;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		font-family: 'Noto Sans Thai', sans-serif;
		margin-top: 8px;
	}

	.reviewed-badge .material-icons {
		font-size: 20px;
		color: #4caf50;
	}

	.expired-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px;
		background: linear-gradient(135deg, #fee2e2, #fecaca);
		color: #991b1b;
		border: 2px solid #f87171;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		font-family: 'Noto Sans Thai', sans-serif;
		margin-top: 8px;
	}

	.expired-badge .material-icons {
		font-size: 20px;
		color: #dc2626;
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal-content {
		background: white;
		border-radius: 16px;
		width: 100%;
		max-width: 500px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		border-bottom: 1px solid #e5e5e5;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.close-btn {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
	}

	.close-btn:hover {
		background: #f5f5f5;
	}

	.modal-body {
		padding: 20px;
		overflow-y: auto;
		flex: 1;
		min-height: 0;
	}
	
	.restaurant-review-info {
		text-align: center;
		margin-bottom: 24px;
		padding: 16px;
		background: #f8f9fa;
		border-radius: 12px;
	}
	
	.restaurant-review-info h4 {
		margin: 0 0 8px 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}
	
	.order-id {
		margin: 0;
		font-size: 0.85rem;
		color: #666;
		font-family: 'Noto Sans Thai', sans-serif;
	}
	
	.rating-section {
		margin-bottom: 20px;
	}
	
	.rating-section label {
		display: block;
		margin-bottom: 12px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}
	
	.stars {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	
	.star-btn {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		transition: transform 0.2s;
	}
	
	.star-btn:hover {
		transform: scale(1.2);
	}
	
	.star-btn .material-icons {
		font-size: 32px;
		color: #ddd;
		transition: color 0.2s;
	}
	
	.star-btn.active .material-icons {
		color: #ffd700;
	}
	
	.rating-text {
		margin-left: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #ff8c00;
		font-family: 'Noto Sans Thai', sans-serif;
	}
	
	.comment-section label {
		display: block;
		margin-bottom: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}
	
	.comment-section textarea {
		width: 100%;
		min-height: 100px;
		max-height: 200px;
		padding: 12px;
		border: 2px solid #e5e5e5;
		border-radius: 8px;
		font-size: 0.9rem;
		font-family: 'Noto Sans Thai', sans-serif;
		resize: vertical;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}
	
	.comment-section textarea:focus {
		outline: none;
		border-color: #ff6b35;
	}

	.modal-footer {
		display: flex;
		gap: 12px;
		padding: 20px;
		border-top: 1px solid #e5e5e5;
		flex-shrink: 0;
	}

	.btn-cancel-modal,
	.btn-submit-modal {
		flex: 1;
		padding: 12px;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
		transition: all 0.2s ease;
	}

	.btn-cancel-modal {
		background: #f5f5f5;
		color: #666;
	}

	.btn-cancel-modal:hover:not(:disabled) {
		background: #e5e5e5;
	}

	.btn-submit-modal {
		background: linear-gradient(135deg, #ffd700, #ff8c00);
		color: white;
	}

	.btn-submit-modal:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
	}

	.btn-cancel-modal:disabled,
	.btn-submit-modal:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
		
		.modal-content {
			max-width: 100%;
			max-height: 90vh;
			margin: 0 12px;
			border-radius: 12px;
		}

		.modal-header,
		.modal-body,
		.modal-footer {
			padding: 16px;
		}
		
		.star-btn .material-icons {
			font-size: 28px;
		}

		.comment-section textarea {
			min-height: 80px;
			max-height: 150px;
			font-size: 0.85rem;
		}
	}
</style>