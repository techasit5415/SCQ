<script>
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";

    export let data;
    export let activeOrderIdx = 0;

    function handleRestaurantClick(rest) {
        goto(`/homerestaurant/restaurant/${rest}/dashboard`);
    }
</script>

<div class="customer-layout">
    <div class="page-header">
        <h1>เลือกร้านอาหาร</h1>
        <p class="subtitle">Select Restaurant to Manage</p>
    </div>
    <table class="order-list-table">
        <tbody>
            {#if data.shops && data.shops.length > 0}
                {#each data.shops as item, index}
                    <tr 
                        class:active={activeOrderIdx === index}
                        on:click={() => handleRestaurantClick(item.id)}
                    >
                        <td>{item.name || "N/A"}</td>
                    </tr>
                {/each}
            {:else}
                <tr>
                    <td colspan="6" class="no-data"> No item found </td>
                </tr>
            {/if}
        </tbody>
    </table>
</div>

<style>
    .customer-layout {
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
    }

    .page-header {
        margin-bottom: 30px;
        text-align: center;
    }

    .page-header h1 {
        font-size: 32px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 8px;
    }

    .subtitle {
        font-size: 16px;
        color: #666;
        margin: 0;
    }

    .order-list-table {
        border-collapse: collapse;
        width: 100%;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .order-list-table td {
        width: 500px;
        padding: 16px 20px;
        text-align: left;
        border-top: 1px solid #e0e0e0;
        font-size: 16px;
        color: #333;
    }
    
    .order-list-table tbody tr:hover {
        background: #f5f5f5;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .order-list-table tbody tr.active {
        background: #e3f2fd;
        font-weight: 500;
        color: #1976d2;
    }

    .no-data {
        text-align: center;
        color: #999;
        padding: 40px !important;
    }
</style>

