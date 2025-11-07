<script lang="ts">
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import { cart } from '$lib/stores/cart';
	import { toast } from 'svelte-sonner';

	export let menuItem: {
		id: string;
		name: string;
		price?: number;
		Price?: number;  // PocketBase ใช้ตัวใหญ่
		Photo?: string;
		Details?: string;
		category?: string;
		Available?: boolean;
	};

	export let restaurantId: string;
	export let restaurantName: string;
	export let isRestaurantOpen: boolean = true;

	// เช็คว่าเมนูพร้อมขายหรือไม่
	$: isAvailable = (menuItem.Available ?? true) && isRestaurantOpen;
	
	// รองรับทั้ง Price (PocketBase) และ price (lowercase)
	$: actualPrice = menuItem.Price || menuItem.price || 50;

	// ใช้ reactive statement เพื่อให้ URL อัปเดตเมื่อ menuItem เปลี่ยน
	$: imageUrl = menuItem.Photo 
		? `${PUBLIC_POCKETBASE_URL}/api/files/Menu/${menuItem.id}/${menuItem.Photo}`
		: '/Photo/Icon.png';

	function handleAddToCart() {
		if (!isAvailable) {
			toast.warning(isRestaurantOpen ? 'เมนูนี้ไม่พร้อมขายในขณะนี้' : 'ร้านปิดทำการ');
			return;
		}
		
		cart.addItem({
			id: menuItem.id,
			name: menuItem.name,
			price: actualPrice,
			Photo: menuItem.Photo,
			Details: menuItem.Details,
			category: menuItem.category,
			restaurantId,
			restaurantName
		});
		
		// Show feedback
		toast.success(`เพิ่ม ${menuItem.name} ลงตะกร้าแล้ว`);
	}
</script>

<div class="menu-card" class:unavailable={!isAvailable}>
	{#if !isAvailable}
		<div class="unavailable-overlay">
			<span class="unavailable-icon">🚫</span>
			<span class="unavailable-text">{isRestaurantOpen ? 'ไม่พร้อมขาย' : 'ร้านปิด'}</span>
		</div>
	{/if}
	<div class="menu-image" class:grayscale={!isAvailable}>
		<img src={imageUrl} alt={menuItem.name || 'เมนูอาหาร'} loading="lazy" />
	</div>
	<div class="menu-content">
		<h3 class="menu-name">{menuItem.name || 'เมนูไม่ระบุชื่อ'}</h3>
		{#if menuItem.Details}
			<p class="menu-description">{menuItem.Details}</p>
		{/if}
		{#if menuItem.category}
			<p class="menu-category">หมวด: {menuItem.category}</p>
		{/if}
		<div class="menu-footer">
			<p class="menu-price">฿{actualPrice}</p>
			<button 
				class="add-btn"
				on:click={handleAddToCart}
				disabled={!isAvailable}
				aria-label="เพิ่ม {menuItem.name} ลงตะกร้า"
			>
				{isAvailable ? 'เพิ่ม' : 'ไม่พร้อมขาย'}
			</button>
		</div>
	</div>
</div>

<style>
	.menu-card {
		display: flex;
		gap: 12px;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
	}

	.menu-card.unavailable {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.menu-card:not(.unavailable):hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.unavailable-overlay {
		position: absolute;
		top: 8px;
		right: 8px;
		background: rgba(0, 0, 0, 0.85);
		color: white;
		padding: 4px 10px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 600;
		z-index: 10;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	.unavailable-icon {
		font-size: 12px;
	}

	.unavailable-text {
		font-size: 10px;
		letter-spacing: 0.3px;
	}

	.menu-image {
		width: 80px;
		height: 80px;
		flex-shrink: 0;
		background: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		transition: filter 0.3s ease;
	}

	.menu-image.grayscale {
		filter: grayscale(100%);
	}

	.menu-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.menu-content {
		flex: 1;
		padding: 16px 16px 16px 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
	}

	.menu-name {
		font-size: 1rem;
		font-weight: 500;
		margin: 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.menu-description {
		font-size: 0.875rem;
		color: #666;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.menu-category {
		font-size: 0.75rem;
		color: #ff6b35;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
		font-weight: 500;
	}

	.menu-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 8px;
	}

	.menu-price {
		font-size: 1rem;
		font-weight: 600;
		color: #ff6b35;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.add-btn {
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 6px 16px;
		font-size: 0.875rem;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.add-btn:hover:not(:disabled) {
		background: #e55a2b;
		transform: scale(1.02);
	}

	.add-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.add-btn:disabled {
		background: #ccc;
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Keyboard accessibility */
	.menu-card:focus {
		outline: 2px solid #ff6b35;
		outline-offset: 2px;
	}
</style>