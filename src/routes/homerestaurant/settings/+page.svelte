<script>
    import { goto } from "$app/navigation";
    import TopBar from '$lib/ComponentsShop/Topbar.svelte';
    import RestaurantSidebar from '$lib/ComponentsShop/RestaurantSidebar.svelte';

    export let data;
    export let form;

    let activeMenu = "settings";

    function listOrder() {
        var x = document.getElementById("hiddenbar-container");
        if (x) {
            if (x.style.display === "none" || x.style.display === "") {
                x.style.display = "block";
            } else {
                x.style.display = "none";
            }
        }
    }
    
    function handleViewRestaurant(event) {
        // Navigate to restaurant page
        goto('/homeadmin/rester');
    }
    
    async function handleLogout() {
        try {
            await fetch('/logout');
            window.location.href = '/admin';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/admin';
        }
    }
</script>

<!-- หน้า Dashboard ร้านอาหาร -->
<div id="restaurant-layout" class="restaurant-layout">
    <!-- Top Header -->
    <!-- <header class="top-header">
        <div class="header-content">
            <img src="/SCQ_logo.png" alt="SCQ Logo" class="logo" />
            <h1>Admin Panel</h1>
        </div>
    </header> -->

    <!-- Sidebar -->
    <TopBar title="Restaurant Panel - Settings" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar 
    {activeMenu} 
    on:menuChange={handleMenuChange}
    on:viewRestaurant={handleViewRestaurant}
    on:logout={handleLogout}
/>
    <!-- Main Content -->
    <main class="main-content">
        <!-- Dashboard -->
        <div class="page-header">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Settings</span>
            </nav>
            <h2>Settings</h2>
        </div>
        <div class="dash1">
            <div class="dash1-com1">
                <p style="margin-left: 5px;">New Order</p>
            </div>
            <div class="dash1-com1" style="margin-left: 5%;">
                <p style="margin-left: 5px;">In Progess Order</p>
            </div>
            <div class="dash1-com1" style="margin-left: 5%;">
                <p style="margin-left: 5px;">Completed Order</p>
            </div>
            <div class="dash1-com1" style="margin-left: 5%;">
                <p style="margin-left: 5px;">Today's Sales</p>
            </div>
        </div>
        <div class="dash2">
            <p style="padding-top: 10px; margin-left: 5px;">Order Status</p>
        </div>
    </main>
</div>

<body></body>

<style>
    /* Reset and Base */
    * {
        box-sizing: border-box;
    }

    body {
        background-color: #f5f5f5;
    }
    .restaurant-layout {
        /* min-height: 100vh; */
        background: #f5f5f5;
        font-family: 'Noto Sans Thai', sans-serif;
    }
    
    .logout {
        margin-top: auto;
        color: #d32f2f !important;
    }
    /* Main Content */
    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding-left: 30px;
        padding-top: 30px;
        padding-right: 22px;
        /* min-height: calc(100vh - 60px); */
    }

    /* Page Header */
    .page-header {
        margin: -30px;
        margin-left: -40px;
        padding: 30px 40px;
        background-color: white;
        margin-bottom: 30px;
        border-bottom: 1px solid #e0e0e0;
    }

    .breadcrumb {
        font-size: 13px;
        color: #888;
        margin-bottom: 8px;
    }

    .breadcrumb-item.current {
        color: #333;
    }

    .breadcrumb-separator {
        margin: 0 8px;
    }
    
    .page-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #333;
    }

    .dash1 {
        margin-top: 10px;
        display: flex;
        height: 100%;
        width: 100%;
    }
    .dash1-com1 {
        height: 96px;
        width: 253px;
        background: rgb(255, 255, 255);
        margin-left: 17%;
        border-radius: 15px;
    }
    .dash2 {
        margin-left: 320px;
        width: 1300px;
        height: 200px;
        border-radius: 15px;
        background-color: white;
    }
</style>