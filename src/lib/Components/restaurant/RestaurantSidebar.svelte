<script>
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";

    export let activeMenu = "dashboard";
    export let shopId = "";
    // export let shops = [];

    const dispatch = createEventDispatcher();

    let showRestaurantSubmenu = false;

    // Check if restaurant submenu should be shown
    $: showRestaurantSubmenu =
        activeMenu === "manageRestaurant" ||
        activeMenu === "addRestaurant" ||
        activeMenu.startsWith("restaurant-");

    function handleMenuClick(menu) {
        if (!shopId) {
            console.error("Shop ID is required");
            return;
        }
        
        switch (menu) {
            case "dashboard":
                goto(`/restaurant/${shopId}/dashboard`);
                break;
            case "pending":
                goto(`/restaurant/${shopId}/order/pending`);
                break;
            case "active":
                goto(`/restaurant/${shopId}/order/active`);
                break;
            case "history":
                goto(`/restaurant/${shopId}/order/history`);
                break;
            case "menu":
                goto(`/restaurant/${shopId}/menu`);
                break;
            case "reports":
                goto(`/restaurant/${shopId}/reports`);
                break;
            case "advertise":
                goto(`/restaurant/${shopId}/advertise`);
                break;
            case "reviews":
                goto(`/restaurant/${shopId}/reviews`);
                break;
            case "settings":
                goto(`/restaurant/${shopId}/settings`);
                break;
            default:
                // For other menus that need special handling, dispatch event
                dispatch("menuChange", menu);
        }
    }

    function handleLogout() {
        goto('/logout');
    }
</script>

<nav class="sidebar">
    <div class="sidebar-content">
        <!-- Dashboard -->
        <button
            class="menu-item"
            class:active={activeMenu === "dashboard"}
            on:click={() => handleMenuClick("dashboard")}
        >
            <span class="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
        </button>

        <!-- Order -->
        <button
            class="menu-item"
            class:active={activeMenu === "pending"}
            on:click={() => handleMenuClick("pending")}
        >
            <span class="material-symbols-outlined">storefront</span>
            <span>Order</span>
        </button>

        <!-- Menu -->
        <button
            class="menu-item"
            class:active={activeMenu === "menu"}
            on:click={() => handleMenuClick("menu")}
        >
            <span class="material-symbols-outlined">fork_spoon</span>
            <span>Menu</span>
        </button>

        <!-- Reports -->
        <button
            class="menu-item"
            class:active={activeMenu === "reports"}
            on:click={() => handleMenuClick("reports")}
        >
            <span class="material-symbols-outlined">assignment</span>
            <span>Reports</span>
        </button>

        <!-- Advertise -->
        <button
            class="menu-item"
            class:active={activeMenu === "advertise"}
            on:click={() => handleMenuClick("advertise")}
        >
            <span class="material-symbols-outlined">Campaign</span>
            <span>Advertise</span>
        </button>

        <!-- Reviews -->
        <button
            class="menu-item"
            class:active={activeMenu === "reviews"}
            on:click={() => handleMenuClick("reviews")}
        >
            <span class="material-symbols-outlined">star</span>
            <span>Reviews</span>
        </button>

        <!-- Settings -->
        <button
            class="menu-item"
            class:active={activeMenu === "settings"}
            on:click={() => handleMenuClick("settings")}
        >
            <span class="material-symbols-outlined">settings</span>
            <span>Settings</span>
        </button>

        <!-- Logout -->
        <button class="menu-item logout" on:click={handleLogout}>
            <span class="material-symbols-outlined">logout</span>
            <span>Logout</span>
        </button>
    </div>
</nav>

<style>
    .sidebar {
        position: fixed;
        top: 60px;
        left: 0;
        width: 250px;
        height: calc(100vh - 60px);
        background: white;
        border-right: 1px solid #e0e0e0;
        overflow-y: auto;
        z-index: 90;
    }

    .sidebar-content {
        padding: 20px 0;
    }

    .menu-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 12px 20px;
        border: none;
        background: none;
        text-align: left;
        font-size: 14px;
        color: #666;
        cursor: pointer;
        transition: all 0.2s ease;
        gap: 12px;
    }

    .menu-item:hover {
        background: #f5f5f5;
        color: #333;
    }

    .menu-item.active {
        background: #fff3e0;
        color: #ff8c00;
        font-weight: 500;
    }

    .menu-item.active .material-symbols-outlined {
        color: #ff8c00;
    }

    .logout {
        margin-top: auto;
        color: #d32f2f !important;
    }

    .logout:hover {
        background: #ffebee !important;
    }

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
    }
</style>
