<script>
    import { goto } from "$app/navigation";
    import TopBar from '$lib/Components/ComponentsShop/Topbar.svelte';
    import RestaurantSidebar from '$lib/Components/ComponentsShop/RestaurantSidebar.svelte';
    import Orderbar from '$lib/Components/ComponentsShop/Orderbar.svelte';

    export let data../../order/history/$types.js;
    export let form../../order/history/$types.js;

    let activeMenu = "pending";
    let activeOrderMenu = "history";

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

<!-- หน้า History Order -->
<div id="restaurant-layout" class="restaurant-layout">
    <TopBar title="Restaurant Panel - Order" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar 
        {activeMenu}
        
        on:viewRestaurant={handleViewRestaurant}
        on:logout={handleLogout}
    />
    
    <!-- Main Content -->
    <main class="main-content">
        <!-- Pending -->
        <div class="page-header">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Order</span>
            </nav>
            <h2>Order</h2>
        </div>
        <Orderbar 
            {activeOrderMenu}
            on:viewRestaurant={handleViewRestaurant}
            on:logout={handleLogout}
        />
        <div class="order-content">
            <div class="orderList">
                <div class="headList">
                    <div class="orderID-list">
                        <span>Order ID</span>
                    </div>
                    <div class="price-list">
                        <span>ราคา</span>
                    </div> 
                </div>
            </div>
            <div class="orderDetail">
                <div class="headDetail">
                    <div class="head-detail">
                        <div class="orderID-detail">
                            <span>Order: </span>
                            <span>{data.stats?.canceled || "-"}</span>
                        </div>
                        <div class="customer-detail">
                            <span>ชื่อลูกค้า </span>
                            <span>{data.stats?.canceled || "-"}</span>
                        </div> 
                        <div class="line1"></div>
                        <div class="list-detail">
                            <span>รายการอาหาร</span>
                        </div>
                    </div> 
                </div>
            </div>
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
        background-color: #f5f5f5;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    /* .logout {
        margin-top: auto;
        color: #d32f2f !important;
    } */

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

    .order-content {
        display: flex;
        gap: 24px;
        justify-content:left;
        margin-top: 10px;
    }
    .orderList {
        width: 666px;
        height: 680px;
        background-color: rgb(255, 255, 255);
        border-radius: 16px;
        gap: 8px;
    }
    .headList {
        display: flex;
        padding-top: 20px;
        padding-right: 16px;
        padding-bottom: 20px;
        padding-left: 16px;
        justify-content: space-between;
        border-bottom: 1px solid #e0e0e0;
        font-size: 20px;
    }
    .orderID-list {
        width: 357px;
    }
    .orderDetail {
        width: 1270px;
        height: 680px;
        background-color: rgb(255, 255, 255);
        padding-top: 20px;
        padding-right: 16px;
        padding-bottom: 20px;
        padding-left: 16px;  
    }
    .head-detail {
        display: flex;
        flex-direction: column;
        gap: 16px;
        justify-content: center;
    }
    .orderID-detail {
        font-size: 25px;
        font-weight: blod;
    }
    .customer-detail {
        font-size: 20px;
    }
    .line1 {
        height: 1px;
        background-color: #B4B5B7;
    }
    .list-detail {
        font-size: 25px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
        }

        .dashboard-components {
            grid-template-columns: 1fr;
        }
    }
</style>