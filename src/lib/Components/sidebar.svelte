<script>
    import { createEventDispatcher } from 'svelte';
    import { goto } from '$app/navigation';
    
    export let activeMenu = "dashboard";
    export let shops = [];
    
    const dispatch = createEventDispatcher();
    
    let showRestaurantMenu = false;
    let showAdvertiseSubmenu = false;

    // Check if restaurant submenu should be shown
    $: showRestaurantMenu = activeMenu === "manageRestaurant" || 
                           activeMenu === "addRestaurant" || 
                           activeMenu.startsWith('restaurant-');

    // Check if advertise submenu should be shown
    $: showAdvertiseSubmenu = activeMenu === "advertise" || 
                             activeMenu === "packages" || 
                             activeMenu === "applications" || 
                             activeMenu === "payments";
    
    function handleMenuClick(menu) {
        switch(menu) {
            case "dashboard":
                goto('/admin/dashboard');
                break;
            case "manageUsers":
                goto('/admin/manageUser');
                break;
            case "manageRestaurant":
                goto('/admin/restaurant');
                break;
            case "addRestaurant":
                goto('/admin/restaurant/AddRestaurant');
                break;
            case "advertise":
                goto('/admin/advertise');
                break;
            case "packages":
                goto('/admin/advertise/packages');
                break;
            case "applications":
                goto('/admin/advertise/applications');
                break;
            case "payments":
                goto('/admin/advertise/payments');
                break;
            case "reports":
                goto('/admin/reports');
                break;
            case "systemLog":
                goto('/admin/systemlog');
                break;
            case "settings":
                goto('/admin/settings');
                break;
            default:
                // For other menus that need special handling, dispatch event
                dispatch('menuChange', menu);
        }
    }
    
    function handleLogout() {
        if (confirm('ต้องการออกจากระบบหรือไม่?')) {
            goto('/logout');
        }
    }
    
    function handleViewRestaurant(id) {
        // Navigate to specific restaurant page
        goto(`/admin/restaurant/${id}`);
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

        <!-- Manage Users -->
        <button
            class="menu-item"
            class:active={activeMenu === "manageUsers"}
            on:click={() => handleMenuClick("manageUsers")}
        >
            <span class="material-symbols-outlined">person</span>
            <span>Manage Users</span>
        </button>

        <!-- Manage Restaurant -->
        <button
            class="menu-item"
            class:active={showRestaurantMenu}
            on:click={() => handleMenuClick("manageRestaurant")}
        >
            <span class="material-symbols-outlined">storefront</span>
            <span>Manage Restaurant</span>
        </button>

        <!-- Restaurant Submenu -->
        {#if showRestaurantMenu}
            <div class="submenu">
                <button 
                    class="submenu-item" 
                    class:active={activeMenu === "addRestaurant"}
                    on:click={() => handleMenuClick("addRestaurant")}
                >
                    <span class="material-symbols-outlined">add</span>
                    <span>Add Restaurant</span>
                </button>
                
                <!-- Display actual restaurants from database -->
                {#if shops && shops.length > 0}
                    {#each shops as shop}
                        <button 
                            class="submenu-item restaurant-item" 
                            class:active={activeMenu === `restaurant-${shop.id}`}
                            on:click={() => handleViewRestaurant(shop.id)}
                            title={shop.name}
                        >
                            <span class="material-symbols-outlined">storefront</span>
                            <span class="restaurant-name">{shop.name}</span>
                        </button>
                    {/each}
                {/if}
            </div>
        {/if}

        <!-- Advertise Management -->
        <button 
            class="menu-item"
            class:active={showAdvertiseSubmenu}
            on:click={() => handleMenuClick("advertise")}
        >
            <span class="material-symbols-outlined">campaign</span>
            <span>Advertise Management</span>
        </button>

        <!-- Advertise Submenu -->
        {#if showAdvertiseSubmenu}
            <div class="submenu">
                <button 
                    class="submenu-item" 
                    class:active={activeMenu === "packages"}
                    on:click={() => handleMenuClick("packages")}
                >
                    <span class="material-symbols-outlined">inventory_2</span>
                    <span>Package Management</span>
                </button>
                
                <button 
                    class="submenu-item" 
                    class:active={activeMenu === "applications"}
                    on:click={() => handleMenuClick("applications")}
                >
                    <span class="material-symbols-outlined">rate_review</span>
                    <span>Application Review</span>
                </button>
                
                <button 
                    class="submenu-item" 
                    class:active={activeMenu === "payments"}
                    on:click={() => handleMenuClick("payments")}
                >
                    <span class="material-symbols-outlined">payment</span>
                    <span>Payment Management</span>
                </button>
            </div>
        {/if}

        <!-- Reports -->
        <button 
            class="menu-item"
            class:active={activeMenu === "reports"}
            on:click={() => handleMenuClick("reports")}
        >
            <span class="material-symbols-outlined">assignment</span>
            <span>Reports</span>
        </button>

        <!-- System Log -->
        <button 
            class="menu-item"
            class:active={activeMenu === "systemLog"}
            on:click={() => handleMenuClick("systemLog")}
        >
            <span class="material-symbols-outlined">history</span>
            <span>System Log</span>
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



    .restaurant-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 150px;
    }

    .submenu {
        margin-left: 20px;
        border-left: 2px solid #e0e0e0;
    }

    .submenu-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 8px 20px;
        border: none;
        background: none;
        text-align: left;
        font-size: 13px;
        color: #888;
        cursor: pointer;
        gap: 8px;
        transition: all 0.2s ease;
    }

    .submenu-item:hover {
        background: #f5f5f5;
        color: #333;
    }

    .submenu-item.active {
        background: rgba(255, 140, 0, 0.1);
        color: #ff8c00;
        font-weight: 500;
    }

    .submenu-item.active .material-symbols-outlined {
        color: #ff8c00;
    }

    .restaurant-item {
        background: rgba(255, 140, 0, 0.05);
        border-left: 3px solid transparent;
        margin-left: 10px;
        padding-left: 15px !important;
    }

    .restaurant-item:hover {
        background: rgba(255, 140, 0, 0.1);
        border-left-color: #ff8c00;
    }

    .restaurant-item.active {
        background: rgba(255, 140, 0, 0.15);
        border-left-color: #e67e00;
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
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }
</style>