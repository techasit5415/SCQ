<script>
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";

    export let activeOrderMenu = "pending";
    const dispatch = createEventDispatcher();
    let data;

    function handleOrderClick(menu) {
        if (menu !== activeOrderMenu) {
            activeOrderMenu = menu;
            dispatch("menuChange", { menu });
            switch (menu) {
                case "pending":
                    goto("/homerestaurant/order/pending");
                    break;
                case "active":
                    goto("/homerestaurant/order/active");
                    break;
                case "history":
                    goto("/homerestaurant/order/history");
                    break;
            }
        }
    }

    function handleLogout() {
        dispatch("logout");
    }
</script>

<nav class="orderbar">
    <div class="orderbar-content">
        <div class="btn-content">
            <!-- Pending Orders -->
            <button
                class="order-btn"
                class:active={activeOrderMenu === "pending"}
                on:click={() => handleOrderClick("pending")}
            >
                <span>Pending Orders</span>
                <span class="numberOrder">(</span>
                <!-- <div class="orderNumber">{data.stats?.canceled || 0}</div> -->
                <span class="numberOrder">)</span>
            </button>

            <!-- Active Orders -->
            <button
                class="order-btn"
                class:active={activeOrderMenu === "active"}
                on:click={() => handleOrderClick("active")}
            >
                <span>Orders Active</span>
                <span class="numberOrder">()</span>
                <!-- <div class="orderNumber">{data.restaurant?.canceled || 0}</div> -->
            </button>

            <!-- Order History -->
            <button
                class="order-btn"
                class:active={activeOrderMenu === "history"}
                on:click={() => handleOrderClick("history")}
            >
                <span>History Order</span>
                <span class="numberOrder">(</span>
                <!-- <div class="numberOrder">{data.stats?.canceled || 0}</div> -->
                <span class="numberOrder">)</span>
            </button>
        </div>
        <div class="line-content">
            <div class="line" class:active={activeOrderMenu === "pending"}></div>
            <div class="line" class:active={activeOrderMenu === "active"}></div>
            <div class="line" class:active={activeOrderMenu === "history"}></div>
            <div class="line4"></div>
        </div>
    </div>
</nav>

<style>
    .btn-content {
        display: flex;
        gap: 40px;
        margin-bottom: 8px;
    }
    .numberOrder {
        color: #2b7fff;
    }
    .order-btn {
        border: none;
        background: none;
        align-items: left;
        font-size: 19px;
        color: #333438;
        cursor: pointer;
    }

    .order-btn:hover {
        color: #333;
    }

    .order-btn.active {
        color: #2b7fff;
        font-weight: 500;
    }

    .line-content {
        display: flex;
    }

    .line {
        width: 190px;
        height: 0px;
        border: 2px solid #95969a;
    }
    .line.active {
        border: 2px solid #2b7fff;
    }
    .line4 {
        width: 1030px;
        height: 0px;
        border: 2px solid #95969a;
    }
</style>
