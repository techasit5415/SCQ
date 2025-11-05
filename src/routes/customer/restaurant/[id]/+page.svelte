<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import MenuCard from '$lib/Components/customer/MenuCard.svelte';
	import { cart } from '$lib/stores/cart';
	
	export let data;
	const pbUrl = PUBLIC_POCKETBASE_URL;
	const { restaurant, menuItems, reviews, averageRating, totalReviews } = data;
	
	let searchTerm = '';
	let activeTab = 'เมนูแนะนำ';
	
	// สร้าง tabs แบบ dynamic จาก categories ที่มีจริงใน menuItems
	$: uniqueCategories = [...new Set(menuItems.map((item: any) => item.category).filter(Boolean))];
	$: tabs = ['เมนูแนะนำ', ...uniqueCategories];
	
	// Debug: log categories and active tab
	$: console.log('Available categories:', uniqueCategories);
	$: console.log('Current active tab:', activeTab);
	$: console.log('Filtered menus count:', filteredMenus.length);
	
	// Filter menu items based on search and category
	$: filteredMenus = menuItems.filter((item: any) => {
		const matchesSearch = (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
							 (item.Details && item.Details.toLowerCase().includes(searchTerm.toLowerCase()));
		
		if (activeTab === 'เมนูแนะนำ') {
			return matchesSearch; // Show all for recommended
		}
		
		// Filter by category if not "แนะนำ"
		return matchesSearch && item.category === activeTab;
	});
	
	// Debug: log filtered items when activeTab changes
	$: if (activeTab) {
		console.log(`=== Tab changed to: ${activeTab} ===`);
		console.log('Filtered items:', filteredMenus.map(item => ({
			id: item.id,
			name: item.name,
			category: item.category,
			Photo: item.Photo
		})));
	}
	
	function goBack() {
		goto('/customer');
	}
	
	function getRestaurantImageUrl(): string {
		if (restaurant.field) {
			return `${pbUrl}/api/files/Shop/${restaurant.id}/${restaurant.field}`;
		}
		return '/Photo/Icon.png'; // แก้ path ให้ถูกต้อง
	}
</script>

<!-- Hero Section with Restaurant Background -->
<div class="hero-section" style="background-image: url('{getRestaurantImageUrl()}');">
	<div class="hero-overlay"></div>
	
	<!-- Top Controls -->
	<div class="hero-controls">
		<button class="control-btn" on:click={goBack} aria-label="กลับหน้าก่อน">
			<span class="material-icons">arrow_back</span>
		</button>
		
		<button class="control-btn heart" aria-label="เพิ่มในรายการโปรด">
			<span class="material-icons">favorite_border</span>
		</button>
	</div>
</div>

<!-- Restaurant Info Card -->
<div class="restaurant-info-card">
	<h1>{restaurant.name}</h1>
	<div class="rating-info">
		<div class="stars">
			{#each Array(5) as _, i}
				<span class="star {i < Math.round(averageRating) ? 'filled' : 'empty'}">⭐</span>
			{/each}
		</div>
		<button 
			class="rating-text clickable-rating"
			on:click={() => goto(`/customer/restaurant/${restaurant.id}/reviews`)}
		>
			{averageRating || 0} ({totalReviews || 0} รีวิว)
		</button>
	</div>
</div>

<!-- Search Section -->
<div class="search-section">
	<div class="search-box">
		<span class="material-icons search-icon">search</span>
		<input 
			type="text" 
			placeholder="ค้นหาอาหาร..." 
			bind:value={searchTerm}
			class="search-input"
		>
	</div>
</div>

<!-- Tabs Section -->
<div class="tabs-section">
	{#each tabs as tab}
		<button 
			class="tab-btn"
			class:active={activeTab === tab}
			on:click={() => activeTab = tab}
		>
			{tab}
		</button>
	{/each}
</div>

<!-- Menu Items -->
<div class="menu-section">
	<h2 class="section-title">{activeTab}</h2>
	
	{#if filteredMenus.length > 0}
		<div class="menu-list">
			{#each filteredMenus as menuItem}
				<MenuCard 
					{menuItem} 
					restaurantId={restaurant.id}
					restaurantName={restaurant.name}
				/>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p>ไม่พบเมนูในหมวดหมู่นี้</p>
		</div>
	{/if}
</div>

<!-- Reviews Section -->
<!-- <div class="reviews-section">
	<h2 class="section-title">
		รีวิวและความคิดเห็น
		{#if totalReviews > 0}
			<span class="review-count">({totalReviews})</span>
		{/if}
	</h2>
	
	{#if reviews && reviews.length > 0}
		<div class="reviews-list">
			{#each reviews.slice(0, 5) as review}
				<div class="review-item">
					<div class="review-header">
						<div class="reviewer-info">
							<div class="reviewer-avatar">
								{#if review.expand?.User_ID?.avatar}
									<img 
										src="{pbUrl}/api/files/_pb_users_auth_/{review.expand.User_ID.id}/{review.expand.User_ID.avatar}" 
										alt="รูปผู้รีวิว"
									/>
								{:else}
									<span class="default-avatar">👤</span>
								{/if}
							</div>
							<div class="reviewer-details">
								<h4 class="reviewer-name">
									{review.expand?.User_ID?.name || 'ผู้ใช้ไม่ระบุชื่อ'}
								</h4>
								<div class="review-stars">
									{#each Array(5) as _, i}
										<span class="star {i < (review.Star || 0) ? 'filled' : 'empty'}">⭐</span>
									{/each}
								</div>
							</div>
						</div>
						<div class="review-date">
							{new Date(review.created).toLocaleDateString('th-TH')}
						</div>
					</div>
					
					{#if review.Description}
						<p class="review-comment">{review.Description}</p>
					{/if}
				</div>
			{/each}
			
			{#if reviews.length > 5}
				<button 
					class="view-all-reviews"
					on:click={() => goto(`/customer/restaurant/${restaurant.id}/reviews`)}
				>
					ดูรีวิวทั้งหมด ({reviews.length} รีวิว)
				</button>
			{:else if reviews.length > 0}
				<button 
					class="view-all-reviews"
					on:click={() => goto(`/customer/restaurant/${restaurant.id}/reviews`)}
				>
					ดูรีวิวทั้งหมด
				</button>
			{/if}
		</div>
	{:else}
		<div class="empty-reviews">
			<div class="empty-icon">📝</div>
			<p>ยังไม่มีรีวิว</p>
			<p class="empty-subtitle">เป็นคนแรกที่รีวิวร้านนี้!</p>
		</div>
	{/if}
</div> -->

<!-- Cart Button (Fixed) -->
<button 
	class="cart-button" 
	on:click={() => goto('/customer/cart')}
	aria-label="ดูตะกร้าสินค้า"
>
	<span class="material-icons">shopping_cart</span>
	{#if $cart.count > 0}
		<span class="cart-badge">{$cart.count}</span>
	{/if}
</button>

<style>
	.hero-section {
		position: relative;
		height: 250px;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
	
	.hero-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
	}
	
	.hero-controls {
		position: absolute;
		top: 20px;
		left: 16px;
		right: 16px;
		display: flex;
		justify-content: space-between;
		z-index: 10;
	}
	
	.control-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		color: white;
	}
	
	.control-btn .material-icons {
		font-size: 24px;
		color: white;
	}
	
	.control-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.05);
	}
	
	.restaurant-info-card {
		background: white;
		padding: 20px;
		margin: -20px 16px 20px;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 5;
	}
	
	.restaurant-info-card h1 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: #333;
	}
	
	.rating-info {
		display: flex;
		align-items: center;
		gap: 12px;
		color: #666;
	}
	
	.stars {
		display: flex;
		gap: 2px;
	}
	
	.star {
		font-size: 1rem;
		transition: all 0.2s ease;
	}
	
	.star.filled {
		color: #FFD700;
		filter: brightness(1.2);
	}
	
	.star.empty {
		color: #ddd;
	}
	
	.rating-text {
		font-size: 0.9rem;
		font-weight: 500;
		color: #666;
	}

	.clickable-rating {
		background: none;
		border: none;
		font-size: 0.9rem;
		font-weight: 500;
		color: #666;
		cursor: pointer;
		text-decoration: underline;
		transition: color 0.2s ease;
		padding: 4px 8px;
		border-radius: 4px;
	}

	.clickable-rating:hover {
		color: #ff6b35;
		background: #f8f9fa;
	}
	
	.rating {
		font-weight: 500;
	}
	
	.arrow {
		color: #999;
		font-size: 0.8rem;
	}
	
	.search-section {
		padding: 0 16px 20px;
	}
	
	.search-box {
		position: relative;
		display: flex;
		align-items: center;
		background: #f5f5f5;
		border-radius: 12px;
		padding: 12px 16px;
	}
	
	.search-icon {
		color: #999;
		margin-right: 12px;
		font-size: 20px;
	}
	
	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 1rem;
		color: #333;
		outline: none;
	}
	
	.search-input::placeholder {
		color: #999;
	}
	
	.tabs-section {
		display: flex;
		gap: 8px;
		padding: 0 16px 20px;
		overflow-x: auto;
	}
	
	.tab-btn {
		padding: 8px 16px;
		border-radius: 20px;
		border: none;
		background: #f5f5f5;
		color: #666;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		white-space: nowrap;
	}
	
	.tab-btn.active {
		background: #ff6b35;
		color: white;
	}
	
	.tab-btn:hover:not(.active) {
		background: #e5e5e5;
	}
	
	.menu-section {
		padding: 0 16px 100px;
	}
	
	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #333;
	}
	
	.menu-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	
	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: #999;
	}
	
	.cart-button {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 56px;
		height: 56px;
		background: #ff6b35;
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
		cursor: pointer;
		transition: all 0.3s ease;
		z-index: 1000;
		color: white;
	}
	
	.cart-button .material-icons {
		font-size: 24px;
		color: white;
	}
	
	.cart-button:hover {
		transform: scale(1.1);
	}
	
	/* Reviews Section */
	.reviews-section {
		background: white;
		margin: 20px 16px;
		padding: 20px;
		border-radius: 16px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
	}
	
	.review-count {
		color: #666;
		font-weight: normal;
		font-size: 0.9rem;
	}
	
	.reviews-list {
		margin-top: 16px;
	}
	
	.review-item {
		padding: 16px 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.review-item:last-child {
		border-bottom: none;
	}
	
	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 8px;
	}
	
	.reviewer-info {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	
	.reviewer-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
		background: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.reviewer-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.default-avatar {
		font-size: 18px;
		color: #999;
	}
	
	.reviewer-name {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 4px 0;
		color: #333;
	}
	
	.review-stars {
		display: flex;
		gap: 1px;
	}
	
	.review-stars .star {
		font-size: 0.8rem;
	}
	
	.review-date {
		font-size: 0.8rem;
		color: #999;
		flex-shrink: 0;
	}
	
	.review-comment {
		font-size: 0.9rem;
		line-height: 1.5;
		color: #666;
		margin: 0;
	}
	
	.view-all-reviews {
		width: 100%;
		padding: 12px;
		background: #f8f9fa;
		border: none;
		border-radius: 8px;
		color: #ff6b35;
		font-weight: 500;
		cursor: pointer;
		margin-top: 16px;
		transition: background 0.2s ease;
	}
	
	.view-all-reviews:hover {
		background: #e9ecef;
	}
	
	.empty-reviews {
		text-align: center;
		padding: 40px 20px;
		color: #999;
	}
	
	.empty-icon {
		font-size: 3rem;
		margin-bottom: 16px;
	}
	
	.empty-reviews p {
		margin: 8px 0;
	}
	
	.empty-subtitle {
		font-size: 0.9rem;
		opacity: 0.7;
		box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
	}

	.cart-badge {
		position: absolute;
		top: -8px;
		right: -8px;
		background: #dc2626;
		color: white;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 600;
		border: 2px solid white;
	}
</style>
