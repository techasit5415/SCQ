<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import { cart } from '$lib/stores/cart';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	$: cartItems = $cart.items;
	$: total = $cart.total;
	$: cartCount = $cart.count;
	$: restaurantName = cartItems.length > 0 ? cartItems[0].restaurantName : 'ตะกร้าสินค้า';
	$: userPoints = data.userPoints || 0;
	
	// Debug: แสดงข้อมูล Point ใน console
	$: console.log('🎨 Frontend - data:', data);
	$: console.log('🎨 Frontend - userPoints:', userPoints);

	function goBack() {
		goto('/customer');
	}

	function getImageUrl(item: any): string {
		if (item.Photo) {
			return `${PUBLIC_POCKETBASE_URL}/api/files/Menu/${item.id}/${item.Photo}`;
		}
		return '/Photo/Icon.png';
	}

	function updateQuantity(itemId: string, quantity: number) {
		cart.updateQuantity(itemId, quantity);
	}

	function removeItem(itemId: string) {
		cart.removeItem(itemId);
	}

	// เลือกวิธีการจ่ายเงิน
	let selectedPayment = 'cash';
	$: paymentMethods = [
		{ id: 'cash', name: 'ชำระเงินสด (Cash)', icon: '💵' },
		{ id: 'qr', name: 'QR Code', icon: '📱' },
		{ id: 'credit', name: `SCQ Point (คงเหลือ ${userPoints})`, icon: '💳' }
	];

	let isSubmitting = false;
	let orderNote = '';

	function proceedToOrder() {
		if (cartItems.length === 0 || isSubmitting) return;
		
		// ส่งข้อมูลผ่าน form
		const form = document.getElementById('orderForm') as HTMLFormElement;
		if (form) {
			form.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>{restaurantName}</title>
</svelte:head>

<!-- Header -->
<div class="header">
	<button class="back-btn" on:click={goBack} aria-label="กลับหน้าก่อน">
		<span class="material-icons">arrow_back</span>
	</button>
	<h1 class="title">{restaurantName}</h1>
</div>

<!-- Menu Items -->
<div class="content">
	<div class="section">
		<h2 class="section-title">สรุปคำสั่งซื้อ</h2>
		<div class="items-count">เพิ่มรายการ</div>
		
		{#if cartItems.length > 0}
			<div class="menu-items">
				{#each cartItems as item}
					<div class="menu-item">
						<div class="item-image">
							<img src={getImageUrl(item)} alt={item.name} />
						</div>
						<div class="item-details">
							<h3 class="item-name">{item.name}</h3>
							<div class="item-meta">
								<span class="item-category">{item.category}</span>
								{#if item.Details}
									<span class="item-description">{item.Details}</span>
								{/if}
							</div>
							<div class="item-price">฿{item.price}</div>
						</div>
						<div class="item-actions">
							<div class="quantity-controls">
								<button 
									class="qty-btn"
									on:click={() => updateQuantity(item.id, item.quantity - 1)}
									disabled={item.quantity <= 1}
								>
									-
								</button>
								<span class="quantity">{item.quantity}</span>
								<button 
									class="qty-btn"
									on:click={() => updateQuantity(item.id, item.quantity + 1)}
								>
									+
								</button>
							</div>
							<button 
								class="remove-btn"
								on:click={() => removeItem(item.id)}
								aria-label="ลบ {item.name}"
							>
								🗑️
							</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-cart">
				<p>ไม่มีรายการในตะกร้า</p>
				<button class="browse-btn" on:click={goBack}>เลือกเมนู</button>
			</div>
		{/if}
	</div>

	{#if cartItems.length > 0}
		<!-- Payment Methods -->
		<div class="section">
			<h2 class="section-title">ช่างทางการชำระเงิน</h2>
			<div class="payment-methods">
				{#each paymentMethods as method}
					<label class="payment-option">
						<input 
							type="radio" 
							bind:group={selectedPayment} 
							value={method.id}
							name="payment"
						/>
						<div class="payment-content">
							<span class="payment-icon">{method.icon}</span>
							<span class="payment-name">{method.name}</span>
						</div>
						<div class="radio-indicator"></div>
					</label>
				{/each}
			</div>
		</div>

		<!-- Order Summary -->
		<div class="section">
			<div class="summary-row">
				<span>ค่าบริการ</span>
				<span>฿5.00</span>
			</div>
			<div class="summary-row total">
				<span>รวมทั้งหมด</span>
				<span>฿{total + 5}.00</span>
			</div>
		</div>

		<!-- Note Section -->
		<div class="section">
			<h3 class="section-title">หมายเหตุ (ถ้ามี)</h3>
			<textarea 
				bind:value={orderNote}
				placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย..."
				class="note-input"
				rows="3"
			></textarea>
		</div>

		<!-- Hidden Form for Order Submission -->
		<form 
			id="orderForm"
			method="POST" 
			action="?/createOrder"
			use:enhance={() => {
				isSubmitting = true;
				
				// Debug: ตรวจสอบข้อมูลก่อนส่ง
				console.log('🔍 Cart items:', cartItems);
				console.log('🔍 Restaurant ID:', cartItems[0]?.restaurantId);
				console.log('🔍 Menu IDs:', cartItems.map(item => item.id));
				
				return async ({ result }) => {
					console.log('📝 Form result:', result);
					if (result.type === 'success') {
						alert('สั่งอาหารเรียบร้อยแล้ว!');
						cart.clear();
						goto('/customer');
					} else {
						console.error('❌ Form error:', result);
						console.error('❌ Error details:', result.data?.details);
						const errorMsg = result.data?.details || result.data?.error || 'ไม่สามารถสร้างคำสั่งซื้อได้';
						alert('เกิดข้อผิดพลาด: ' + errorMsg);
					}
					isSubmitting = false;
				};
			}}
			style="display: none;"
		>
			<input 
				type="hidden" 
				name="orderData" 
				value={JSON.stringify({
					restaurantId: cartItems[0]?.restaurantId,
					restaurantName: cartItems[0]?.restaurantName,
					items: cartItems,
					total: total,
					paymentMethod: selectedPayment,
					note: orderNote
				})}
			/>
		</form>

		<!-- Order Button -->
		<div class="order-section">
			<button 
				class="order-btn" 
				on:click={proceedToOrder}
				disabled={isSubmitting}
			>
				{isSubmitting ? 'กำลังสั่ง...' : 'สั่งอาหาร'}
			</button>
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
		padding: 0 16px 100px;
		max-width: 600px;
		margin: 0 auto;
	}

	.section {
		margin: 24px 0;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.items-count {
		color: #ff6b35;
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 16px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.menu-items {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.menu-item {
		display: flex;
		gap: 12px;
		background: white;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.item-image {
		width: 60px;
		height: 60px;
		flex-shrink: 0;
		border-radius: 8px;
		overflow: hidden;
		background: #f5f5f5;
	}

	.item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.item-name {
		font-size: 1rem;
		font-weight: 500;
		margin: 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.item-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.item-category {
		font-size: 0.75rem;
		color: #ff6b35;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.item-description {
		font-size: 0.8rem;
		color: #666;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.item-price {
		font-size: 0.9rem;
		font-weight: 600;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.item-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		background: #f8f8f8;
		border-radius: 20px;
		padding: 4px 8px;
	}

	.qty-btn {
		background: none;
		border: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 14px;
		font-weight: bold;
		color: #ff6b35;
	}

	.qty-btn:hover:not(:disabled) {
		background: #e5e5e5;
	}

	.qty-btn:disabled {
		color: #ccc;
		cursor: not-allowed;
	}

	.quantity {
		font-size: 0.9rem;
		font-weight: 500;
		min-width: 20px;
		text-align: center;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		padding: 4px;
		border-radius: 4px;
	}

	.remove-btn:hover {
		background: #fee;
	}

	.empty-cart {
		text-align: center;
		padding: 40px 20px;
		color: #999;
	}

	.browse-btn {
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 10px 20px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 16px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.payment-methods {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.payment-option {
		display: flex;
		align-items: center;
		padding: 16px;
		border: 2px solid #e5e5e5;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.payment-option:has(input:checked) {
		border-color: #ff6b35;
		background: #fff8f5;
	}

	.payment-option input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.payment-content {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
	}

	.payment-icon {
		font-size: 24px;
	}

	.payment-name {
		font-size: 0.9rem;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.radio-indicator {
		width: 20px;
		height: 20px;
		border: 2px solid #ccc;
		border-radius: 50%;
		position: relative;
	}

	.payment-option:has(input:checked) .radio-indicator {
		border-color: #ff6b35;
	}

	.payment-option:has(input:checked) .radio-indicator::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 10px;
		height: 10px;
		background: #ff6b35;
		border-radius: 50%;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 0;
		border-bottom: 1px solid #e5e5e5;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.summary-row.total {
		font-size: 1.1rem;
		font-weight: 600;
		border-bottom: none;
		color: #333;
	}

	.order-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 16px;
		background: white;
		border-top: 1px solid #e5e5e5;
		z-index: 100;
	}

	.order-btn {
		width: 100%;
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 12px;
		padding: 16px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: 'Noto Sans Thai', sans-serif;
		max-width: 600px;
		margin: 0 auto;
		display: block;
	}

	.order-btn:hover {
		background: #e55a2b;
		transform: translateY(-1px);
	}

	.order-btn:active {
		transform: translateY(0);
	}

	.order-btn:disabled {
		background: #ccc;
		cursor: not-allowed;
		transform: none;
	}

	.note-input {
		width: 100%;
		padding: 12px;
		border: 2px solid #e5e5e5;
		border-radius: 8px;
		font-family: 'Noto Sans Thai', sans-serif;
		font-size: 0.9rem;
		resize: vertical;
		min-height: 80px;
	}

	.note-input:focus {
		outline: none;
		border-color: #ff6b35;
	}
</style>