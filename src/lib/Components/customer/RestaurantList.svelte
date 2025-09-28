<script>
    import { createEventDispatcher } from "svelte";
    import RestaurantCard from "./RestaurantCard.svelte";

    export let restaurants = [];
    export let loading = false;
    export let error = null;

    const dispatch = createEventDispatcher();

    function handleRestaurantSelect(event) {
        dispatch("restaurantSelect", event.detail);
    }
</script>

<div class="restaurant-list">
    <div class="list-header">
        <h2>ร้านค้าที่เปิดอยู่</h2>
        <p class="restaurant-count">
            {#if loading}
                กำลังโหลด...
            {:else if error}
                เกิดข้อผิดพลาด
            {/if}
        </p>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>กำลังโหลดรายการร้านค้า...</p>
        </div>
    {:else if error}
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>เกิดข้อผิดพลาด</h3>
            <p>{error}</p>
            <button class="retry-button" on:click={() => dispatch("retry")}>
                ลองใหม่
            </button>
        </div>
    {:else if restaurants.length === 0}
        <div class="empty-state">
            <div class="empty-icon">🏪</div>
            <h3>ไม่พบร้านค้า</h3>
            <p>ขณะนี้ยังไม่มีร้านค้าในระบบ</p>
        </div>
    {:else}
        <div class="restaurant-grid">
            {#each restaurants as restaurant, index}
                <RestaurantCard
                    {restaurant}
                    {index}
                    on:select={handleRestaurantSelect}
                />
            {/each}
        </div>
    {/if}
</div>

<style>
    .restaurant-list {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
    }

    .list-header {
        text-align: center;
        margin-bottom: 24px;
        padding: 0 20px;
    }

    .list-header h2 {
        font-size: 24px;
        color: #333;
        margin: 0 0 8px 0;
        font-weight: 600;
    }

    .restaurant-count {
        font-size: 14px;
        color: #666;
        margin: 0;
    }

    .restaurant-grid {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 0 20px;
    }

    /* Loading State */
    .loading-state {
        text-align: center;
        padding: 60px 20px;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #ff8c00;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .loading-state p {
        color: #666;
        font-size: 16px;
        margin: 0;
    }

    /* Error State */
    .error-state {
        text-align: center;
        padding: 60px 20px;
    }

    .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .error-state h3 {
        font-size: 20px;
        color: #d32f2f;
        margin: 0 0 12px 0;
    }

    .error-state p {
        color: #666;
        font-size: 14px;
        margin: 0 0 24px 0;
        line-height: 1.5;
    }

    .retry-button {
        background: #ff8c00;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .retry-button:hover {
        background: #e67c00;
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 60px 20px;
    }

    .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .empty-state h3 {
        font-size: 20px;
        color: #333;
        margin: 0 0 12px 0;
    }

    .empty-state p {
        color: #666;
        font-size: 14px;
        margin: 0;
        line-height: 1.5;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .list-header {
            margin-bottom: 20px;
        }

        .list-header h2 {
            font-size: 20px;
        }

        .restaurant-count {
            font-size: 13px;
        }

        .restaurant-grid {
            padding: 0 15px;
        }

        .loading-state,
        .error-state,
        .empty-state {
            padding: 40px 20px;
        }

        .loading-spinner {
            width: 32px;
            height: 32px;
            border-width: 3px;
        }

        .error-icon,
        .empty-icon {
            font-size: 40px;
        }

        .error-state h3,
        .empty-state h3 {
            font-size: 18px;
        }

        .retry-button {
            padding: 10px 20px;
            font-size: 13px;
        }
    }

    @media (max-width: 480px) {
        .restaurant-grid {
            padding: 0 12px;
        }

        .list-header {
            padding: 0 12px;
        }
    }
</style>
