<script>
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";

    export let data;
    export let activeOrderIdx = 0;
</script>

<div class="customer-layout">
    <div style="width: 100; height: 100px;">
        Use this for go any restaurant by ID
    </div>
    <table class="order-list-table">
        <tbody>
            {#if data.shops && data.shops.length > 0}
                {#each data.shops as item, index}
                    <tr>
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
</style>
