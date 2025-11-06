<script lang="ts">
    import type { PageData } from './$types';
    import RestaurantSidebar from '$lib/Components/restaurant/RestaurantSidebar.svelte';
    import Topbar from '$lib/Components/restaurant/Topbar.svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

    export let data: PageData;

    $: shopId = $page.params.id;
    $: currentFilter = data.currentFilter || 'all';
    
    const pbUrl = PUBLIC_POCKETBASE_URL;

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

    function renderStars(rating: number) {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    function getUserAvatarUrl(user: any) {
        if (!user?.avatar) return null;
        const url = `${pbUrl}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`;
        console.log('Avatar URL:', url);
        return url;
    }

    function filterByStar(star: number | string) {
        const url = new URL(window.location.href);
        if (star === 'all') {
            url.searchParams.delete('star');
        } else {
            url.searchParams.set('star', star.toString());
        }
        goto(url.pathname + url.search);
    }

    function getStarPercentage(count: number) {
        if (data.totalReviews === 0) return 0;
        return Math.round((count / data.totalReviews) * 100);
    }

    // Debug: Log review data
    $: if (data.reviews && data.reviews.length > 0) {
        console.log('=== Review Debug Info ===');
        console.log('Total reviews:', data.reviews.length);
        console.log('First review:', data.reviews[0]);
        console.log('User data:', data.reviews[0]?.expand?.User_ID);
        console.log('PocketBase URL:', pbUrl);
    }
</script>

<svelte:head>
    <title>Reviews - {data.restaurant.name}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</svelte:head>

<div class="layout">
    <RestaurantSidebar activeMenu="reviews" shopId={shopId} />
    
    <div class="main-content">
        <Topbar title="Reviews - {data.restaurant.name}" />
        
        <div class="content">
            <div class="header-section">
                <h2>รีวิวร้านค้า</h2>
                
                <!-- สถิติรีวิว -->
                <div class="review-stats">
                    <div class="rating-summary">
                        <div class="average-rating">
                            <h1>{data.averageRating}</h1>
                            <div class="stars">{renderStars(Math.round(data.averageRating))}</div>
                            <p>{data.totalReviews} รีวิว</p>
                        </div>
                        
                        <div class="rating-bars">
                            {#each [5, 4, 3, 2, 1] as star}
                                <div class="rating-bar">
                                    <span class="star-label">{star} ★</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: {getStarPercentage(data.starCounts[star])}%"></div>
                                    </div>
                                    <span class="count">{data.starCounts[star]}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- ฟิลเตอร์ดาว -->
                <div class="filter-section">
                    <button 
                        class="filter-btn"
                        class:active={currentFilter === 'all'}
                        on:click={() => filterByStar('all')}
                    >
                        ทั้งหมด ({data.totalReviews})
                    </button>
                    {#each [5, 4, 3, 2, 1] as star}
                        <button 
                            class="filter-btn"
                            class:active={currentFilter === star.toString()}
                            on:click={() => filterByStar(star)}
                        >
                            {star} ★ ({data.starCounts[star]})
                        </button>
                    {/each}
                </div>
            </div>

            <!-- รายการรีวิว -->
            <div class="reviews-section">
                {#if data.reviews.length === 0}
                    <div class="no-reviews">
                        <span class="material-symbols-outlined">rate_review</span>
                        <p>ยังไม่มีรีวิว</p>
                    </div>
                {:else}
                    <div class="reviews-list">
                        {#each data.reviews as review}
                            <div class="review-card">
                                <div class="review-header">
                                    <div class="user-info">
                                        <div class="user-avatar">
                                            {#if review.expand?.User_ID?.avatar}
                                                <img 
                                                    src="{getUserAvatarUrl(review.expand.User_ID)}"
                                                    alt={review.expand.User_ID.name || 'User avatar'}
                                                    on:error={(e) => {
                                                        console.error('Failed to load avatar:', e.currentTarget.src);
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement?.querySelector('.material-symbols-outlined')?.classList.remove('hidden');
                                                    }}
                                                />
                                                <span class="material-symbols-outlined hidden">account_circle</span>
                                            {:else}
                                                <span class="material-symbols-outlined">account_circle</span>
                                            {/if}
                                        </div>
                                        <div class="user-details">
                                            <h4>{review.expand?.User_ID?.name || 'ผู้ใช้ไม่ระบุชื่อ'}</h4>
                                            <p class="review-date">{formatDate(review.created)}</p>
                                        </div>
                                    </div>
                                    <div class="review-rating">
                                        <span class="stars">{renderStars(review.Star)}</span>
                                        <span class="rating-number">{review.Star}.0</span>
                                    </div>
                                </div>

                                {#if review.expand?.Order_ID}
                                    <div class="order-info">
                                        <span class="material-symbols-outlined">receipt</span>
                                        <span>Order ID: {review.expand.Order_ID.id}</span>
                                    </div>
                                {/if}

                                {#if review.Description}
                                    <div class="review-content">
                                        <p>{review.Description}</p>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .layout {
        display: flex;
        min-height: 100vh;
        background: #f5f5f5;
    }

    .main-content {
        flex: 1;
        margin-left: 250px;
        margin-top: 60px;
    }

    .content {
        padding: 30px;
    }

    .header-section {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 24px;
    }

    h2 {
        margin: 0 0 24px 0;
        color: #333;
        font-size: 24px;
        font-weight: 600;
    }

    .review-stats {
        margin-bottom: 30px;
    }

    .rating-summary {
        display: flex;
        gap: 48px;
        align-items: center;
    }

    .average-rating {
        text-align: center;
        min-width: 150px;
    }

    .average-rating h1 {
        font-size: 64px;
        margin: 0;
        color: #ff8c00;
        font-weight: 700;
    }

    .average-rating .stars {
        color: #ffa500;
        font-size: 24px;
        margin: 8px 0;
    }

    .average-rating p {
        color: #666;
        margin: 0;
        font-size: 14px;
    }

    .rating-bars {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .rating-bar {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .star-label {
        width: 40px;
        font-size: 14px;
        color: #666;
    }

    .bar-container {
        flex: 1;
        height: 8px;
        background: #f0f0f0;
        border-radius: 4px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #ffa500, #ff8c00);
        transition: width 0.3s ease;
    }

    .count {
        width: 40px;
        text-align: right;
        font-size: 14px;
        color: #666;
    }

    .filter-section {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .filter-btn {
        padding: 10px 20px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #666;
        transition: all 0.2s ease;
    }

    .filter-btn:hover {
        border-color: #ff8c00;
        color: #ff8c00;
    }

    .filter-btn.active {
        background: #ff8c00;
        border-color: #ff8c00;
        color: white;
    }

    .reviews-section {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .no-reviews {
        text-align: center;
        padding: 60px 20px;
        color: #999;
    }

    .no-reviews .material-symbols-outlined {
        font-size: 64px;
        color: #ddd;
        margin-bottom: 16px;
    }

    .no-reviews p {
        font-size: 16px;
        margin: 0;
    }

    .reviews-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .review-card {
        padding: 24px;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        transition: all 0.2s ease;
    }

    .review-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #ff8c00;
    }

    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
    }

    .user-info {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .user-avatar {
        color: #ff8c00;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
    }

    .user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .user-avatar .material-symbols-outlined {
        font-size: 48px;
    }

    .user-avatar .hidden {
        display: none;
    }

    .user-details h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }

    .review-date {
        margin: 0;
        font-size: 13px;
        color: #999;
    }

    .review-rating {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
    }

    .review-rating .stars {
        color: #ffa500;
        font-size: 18px;
    }

    .rating-number {
        font-size: 14px;
        font-weight: 600;
        color: #ff8c00;
    }

    .order-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #f5f5f5;
        border-radius: 6px;
        font-size: 13px;
        color: #666;
        margin-bottom: 12px;
        width: fit-content;
    }

    .order-info .material-symbols-outlined {
        font-size: 18px;
    }

    .review-content {
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;
        border-left: 4px solid #ff8c00;
    }

    .review-content p {
        margin: 0;
        color: #333;
        line-height: 1.6;
        font-size: 15px;
    }

    .material-symbols-outlined {
        font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24;
    }
</style>
