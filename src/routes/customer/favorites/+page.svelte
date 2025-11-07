<script lang="ts">
	import { goto } from '$app/navigation';
	import RestaurantCard from '$lib/Components/customer/RestaurantCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: favoriteShops = data?.favoriteShops || [];
	$: console.log('Favorite shops:', favoriteShops);

	function goBack() {
		goto('/customer/profile');
	}

	function handleRestaurantSelect(event: CustomEvent) {
		const restaurant = event.detail.restaurant || event.detail;
		console.log('🎯 Restaurant selected:', restaurant);
		console.log('🆔 Restaurant ID:', restaurant?.id);
		
		if (restaurant?.id) {
			console.log('✅ Navigating to:', `/customer/restaurant/${restaurant.id}`);
			goto(`/customer/restaurant/${restaurant.id}`);
		} else {
			console.error('❌ No restaurant ID found:', restaurant);
		}
	}
</script>

<svelte:head>
	<title>ร้านโปรด - SCQ</title>
</svelte:head>

<div class="favorites-page">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" on:click={goBack} aria-label="กลับหน้าก่อน">
			<span class="material-icons">arrow_back</span>
		</button>
		<h1 class="title">ร้านโปรด</h1>
	</div>

	<!-- Content -->
	<div class="content">
		{#if favoriteShops.length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<span class="material-icons">favorite_border</span>
				</div>
				<h2>ยังไม่มีร้านโปรด</h2>
				<p>เพิ่มร้านโปรดของคุณเพื่อเข้าถึงได้ง่ายขึ้น</p>
				<button class="btn-browse" on:click={() => goto('/customer')}>
					เลือกดูร้านอาหาร
				</button>
			</div>
		{:else}
			<div class="favorites-count">
				{favoriteShops.length} ร้าน
			</div>
			<div class="restaurant-grid">
				{#each favoriteShops as restaurant, index}
					<RestaurantCard
						{restaurant}
						{index}
						isPromoted={false}
						on:select={handleRestaurantSelect}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.favorites-page {
		min-height: 100vh;
		background: #f8f9fa;
		padding-bottom: 80px;
	}

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
	}

	.favorites-count {
		font-size: 0.875rem;
		color: #666;
		margin-bottom: 16px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.restaurant-grid {
		display: grid;
		gap: 16px;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-icon {
		width: 100px;
		height: 100px;
		margin: 0 auto 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
		border-radius: 50%;
	}

	.empty-icon .material-icons {
		font-size: 48px;
		color: #999;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #333;
		margin: 0 0 8px 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.empty-state p {
		font-size: 1rem;
		color: #666;
		margin: 0 0 24px 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.btn-browse {
		background: #ff6b35;
		color: white;
		border: none;
		padding: 12px 32px;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
		transition: all 0.2s ease;
	}

	.btn-browse:hover {
		background: #e55a2b;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
	}

	/* Material Icons Support */
	@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');
</style>
