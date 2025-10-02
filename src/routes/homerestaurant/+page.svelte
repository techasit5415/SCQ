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
    <div style="width: 100; height: 100px;">
        Use this for go any restaurant by ID
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
        .order-list-table {
        border-collapse: collapse;
    }
    .order-list-table td {
        width: 500px;
        padding: 12px;
        text-align: left;
        border-top: 1px solid #e0e0e0;
    }
    /* .order-list-table tr{
        display: flex;
        gap: 10px
    } */
    .order-list-table tbody tr:hover {
        background: #d9d9d9;
        cursor: pointer;
    }

    .order-list-table tbody tr.active {
        background: #D9D9D9;
        font-weight: 500;
    }
</style>

