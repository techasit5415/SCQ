<script>
    import { goto } from "$app/navigation";
    import TopBar from '$lib/Components/ComponentsShop/Topbar.svelte';
    import RestaurantSidebar from '$lib/Components/ComponentsShop/RestaurantSidebar.svelte';

    export let data../../reports/$types.js;
    export let form../../reports/$types.js;

    let activeMenu = "reports";

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
    <!-- Sidebar -->
    <TopBar title="Restaurant Panel - Reports" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar 
    {activeMenu} 
    
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
                <span class="breadcrumb-item current">Reports</span>
            </nav>
            <h2>Reports</h2>
        </div>
        <div class="reports-components">
            <div class="stats-grid">
                <div class="stats-box">
                    <div class="stat-header">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            <h3>Toatal Sales</h3>
                        </div>
                    <div class="stat-number">{data.restaurant?.newOrder || 0}</div>
                </div>
                <div class="stats-box">
                    <div class="stat-header">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            <h3>Total Orders</h3>
                        </div>
                    <div class="stat-number">{data.restaurant?.inProgressOrder || 0}</div>
                </div>
                <div class="stats-box">
                    <div class="stat-header">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            <h3>Total Dishes</h3>
                        </div>
                    <div class="stat-number">{data.restaurant?.completedOrder || 0}</div>
                </div>
                <div class="stats-box">
                    <div class="stat-header">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            <h3>Total Customers</h3>
                        </div>
                    <div class="stat-number">฿ {data.restaurant?.todaySale || 0}</div>
                </div>
            </div>
            <!-- <div class="dash2">
                <p style="padding-top: 10px; margin-left: 5px;">Order Status</p>
            </div> -->
            
            <!-- Chart Section -->
            <div class="chart-section">
                <div class="chart-header">
                    <h3>Chart Orders</h3>
                    <select class="chart-filter">
                        <option>Show by days</option>
                    </select>
                </div>
                <div class="chart-placeholder">
                    <p>Chart will be displayed here</p>
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

    /* About Dashboard */
    .reports-components {
        display: grid;
        gap: 30px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .stats-box {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }

    .stat-header .material-symbols-outlined {
        color: #ff8c00;
        font-size: 24px;
    }

    .stat-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: #666;
    }

    .stat-number {
        font-size: 32px;
        font-weight: 600;
        color: #ff8c00;
    }

     .chart-section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .chart-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
    }

    .chart-filter {
        padding: 6px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
    }

    .chart-placeholder {
        height: 300px;
        background: #f9f9f9;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
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