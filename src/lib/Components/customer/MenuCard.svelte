<script lang="ts">
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

	export let menuItem: {
		id: string;
		name: string;
		price?: number;
		Photo?: string;
		Details?: string;
		category?: string;
	};

	// ใช้ reactive statement เพื่อให้ URL อัปเดตเมื่อ menuItem เปลี่ยน
	$: imageUrl = menuItem.Photo 
		? `${PUBLIC_POCKETBASE_URL}/api/files/Menu/${menuItem.id}/${menuItem.Photo}`
		: '/Photo/Icon.png';

	function handleCardClick() {
		// สามารถเพิ่ม logic สำหรับคลิกเมนูได้ เช่น เพิ่มลงตะกร้า
		console.log('Menu item clicked:', menuItem.name);
	}
</script>

<div class="menu-card" 
	on:click={handleCardClick} 
	on:keydown={(e) => e.key === 'Enter' && handleCardClick()}
	role="button" 
	tabindex="0"
	aria-label="เมนู {menuItem.name}"
>
	<div class="menu-image">
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
		<p class="menu-price">฿{menuItem.price || '50'}</p>
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
	}

	.menu-card:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
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

	.menu-price {
		font-size: 1rem;
		font-weight: 600;
		color: #ff6b35;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	/* Keyboard accessibility */
	.menu-card:focus {
		outline: 2px solid #ff6b35;
		outline-offset: 2px;
	}
</style>