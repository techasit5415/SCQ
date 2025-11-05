<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import type { PageData } from './$types';

	export let data: PageData;
	
	const pbUrl = PUBLIC_POCKETBASE_URL;
	const { restaurant, reviews, averageRating, totalReviews, starCounts } = data;

	function goBack() {
		goto(`/customer/restaurant/${restaurant.id}`);
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('th-TH', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getStarPercentage(count: number): number {
		return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
	}
</script>

<svelte:head>
	<title>รีวิว {restaurant.name} - SCQ</title>
</svelte:head>

<div class="reviews-page">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" on:click={goBack} aria-label="กลับหน้าร้าน">
			<span class="material-icons">arrow_back</span>
		</button>
		<h1 class="title">รีวิวและความคิดเห็น</h1>
	</div>

	<!-- Restaurant Info -->
	<div class="restaurant-info">
		<h2 class="restaurant-name">{restaurant.name}</h2>
		<div class="rating-summary">
			<div class="overall-rating">
				<span class="rating-number">{averageRating || 0}</span>
				<div class="stars">
					{#each Array(5) as _, i}
						<span class="star {i < Math.round(averageRating) ? 'filled' : 'empty'}">★</span>
					{/each}
				</div>
				<span class="total-reviews">{totalReviews} รีวิว</span>
			</div>
		</div>
	</div>

	<!-- Rating Breakdown -->
	{#if totalReviews > 0}
		<div class="rating-breakdown">
			<h3>การให้คะแนน</h3>
			{#each [5, 4, 3, 2, 1] as starLevel}
				<div class="rating-bar">
					<span class="star-label">{starLevel} ดาว</span>
					<div class="bar-container">
						<div 
							class="bar-fill" 
							style="width: {getStarPercentage(starCounts[starLevel])}%"
						></div>
					</div>
					<span class="count">{starCounts[starLevel]}</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Reviews List -->
	<div class="reviews-section">
		<h3>รีวิวทั้งหมด ({totalReviews})</h3>
		
		{#if reviews && reviews.length > 0}
			<div class="reviews-list">
				{#each reviews as review}
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
											<span class="star {i < (review.Star || 0) ? 'filled' : 'empty'}">★</span>
										{/each}
									</div>
									<span class="review-date">{formatDate(review.created)}</span>
								</div>
							</div>
						</div>
						
						{#if review.Description}
							<div class="review-content">
								<p class="review-comment">{review.Description}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-reviews">
				<div class="empty-icon">📝</div>
				<h3>ยังไม่มีรีวิว</h3>
				<p>เป็นคนแรกที่รีวิวร้านนี้!</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.reviews-page {
		min-height: 100vh;
		background: #f8f9fa;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.header {
		display: flex;
		align-items: center;
		padding: 16px 20px;
		background: white;
		border-bottom: 1px solid #e5e5e5;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.back-btn {
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
	}

	.restaurant-info {
		background: white;
		padding: 24px 20px;
		border-bottom: 8px solid #f8f9fa;
		text-align: center;
	}

	.restaurant-name {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #333;
	}

	.overall-rating {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.rating-number {
		font-size: 3rem;
		font-weight: 700;
		color: #ff6b35;
	}

	.stars {
		display: flex;
		gap: 4px;
	}

	.star {
		font-size: 1.5rem;
		transition: all 0.2s ease;
	}

	.star.filled {
		color: #FFD700;
		filter: brightness(1.2);
	}

	.star.empty {
		color: #ddd;
	}

	.total-reviews {
		font-size: 1rem;
		color: #666;
	}

	.rating-breakdown {
		background: white;
		padding: 20px;
		margin-bottom: 8px;
	}

	.rating-breakdown h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #333;
	}

	.rating-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	.star-label {
		font-size: 0.9rem;
		color: #666;
		width: 50px;
		flex-shrink: 0;
	}

	.bar-container {
		flex: 1;
		height: 8px;
		background: #e9ecef;
		border-radius: 4px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: #ff6b35;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.count {
		font-size: 0.9rem;
		color: #666;
		width: 30px;
		text-align: right;
		flex-shrink: 0;
	}

	.reviews-section {
		background: white;
		padding: 20px;
	}

	.reviews-section h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 20px 0;
		color: #333;
	}

	.reviews-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.review-item {
		padding: 20px 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.review-item:last-child {
		border-bottom: none;
	}

	.review-header {
		margin-bottom: 12px;
	}

	.reviewer-info {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}

	.reviewer-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		overflow: hidden;
		background: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.reviewer-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.default-avatar {
		font-size: 20px;
		color: #999;
	}

	.reviewer-details {
		flex: 1;
	}

	.reviewer-name {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 4px 0;
		color: #333;
	}

	.review-stars {
		display: flex;
		gap: 2px;
		margin-bottom: 4px;
	}

	.review-stars .star {
		font-size: 0.9rem;
	}

	.review-date {
		font-size: 0.8rem;
		color: #999;
	}

	.review-content {
		margin-left: 60px;
	}

	.review-comment {
		font-size: 0.95rem;
		line-height: 1.5;
		color: #444;
		margin: 0;
	}

	.empty-reviews {
		text-align: center;
		padding: 60px 20px;
		color: #999;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 20px;
	}

	.empty-reviews h3 {
		font-size: 1.3rem;
		font-weight: 600;
		color: #333;
		margin: 0 0 8px 0;
	}

	.empty-reviews p {
		font-size: 1rem;
		margin: 0;
	}

	/* Material Icons Support */
	@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');
</style>