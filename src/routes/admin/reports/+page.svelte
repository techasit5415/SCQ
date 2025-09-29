<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';
    import { onMount } from 'svelte';

    export let data;

    // Chart.js import
    let Chart;
    let chartInstances = {};
    
    onMount(async () => {
        console.log('Component mounted, loading Chart.js...');
        
        // Check if Chart.js is already loaded
        if (window.Chart) {
            Chart = window.Chart;
            setTimeout(initializeCharts, 500);
            return;
        }
        
        // Load Chart.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            console.log('Chart.js loaded from CDN');
            Chart = window.Chart;
            // Initialize charts after Chart.js is loaded with longer delay
            setTimeout(initializeCharts, 1000);
        };
        script.onerror = () => {
            console.error('Failed to load Chart.js from CDN');
        };
        document.head.appendChild(script);
    });

    // State for time period selection
    let selectedPeriod = 'monthly';
    let selectedShop = 'all';

    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
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
            case "reports":
                // Already on reports page
                break;
            default:
                console.log('Navigation to', menu, 'not implemented yet');
        }
    }
    
    async function handleLogout() {
        try {
            await fetch('/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    }

    function initializeCharts() {
        console.log('🎯 Initializing charts...', window.Chart);
        console.log('📊 Reports data:', data.reports);
        console.log('💰 Payment methods:', data.reports.paymentMethods);
        console.log('🏪 Shop sales:', data.reports.shopSales);
        console.log('🍽️ Popular menus:', data.reports.popularMenus);
        
        if (!window.Chart) {
            console.error('❌ Chart.js not loaded yet');
            return;
        }
        
        Chart = window.Chart;

        // Payment Methods Pie Chart
        const paymentCtx = document.getElementById('paymentChart')?.getContext('2d');
        if (paymentCtx) {
            console.log('Creating payment chart with data:', data.reports.paymentMethods);
            if (chartInstances.payment) {
                chartInstances.payment.destroy();
            }
            
            try {
                chartInstances.payment = new Chart(paymentCtx, {
                    type: 'doughnut',
                data: {
                    labels: ['เงินสด', 'พอยท์', 'QR Code'],
                    datasets: [{
                        data: [
                            data.reports.paymentMethods.cash || 0,
                            data.reports.paymentMethods.credit_card || 0,
                            data.reports.paymentMethods.promptpay || 1
                        ],
                        backgroundColor: [
                            '#FF8C00',
                            '#4CAF50',
                            '#2196F3'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
                });
                console.log('Payment chart created successfully');
            } catch (error) {
                console.error('Error creating payment chart:', error);
            }
        } else {
            console.error('Payment chart canvas not found');
        }

        // Shop Sales Bar Chart
        const shopSalesCtx = document.getElementById('shopSalesChart')?.getContext('2d');
        console.log('Shop sales data:', data.reports.shopSales);
        if (shopSalesCtx) {
            if (chartInstances.shopSales) {
                chartInstances.shopSales.destroy();
            }
            
            try {
                chartInstances.shopSales = new Chart(shopSalesCtx, {
                type: 'bar',
                data: {
                    labels: data.reports.shopSales.length > 0 ? data.reports.shopSales.map(shop => shop.shopName) : ['ไม่มีข้อมูล'],
                    datasets: [{
                        label: 'ยอดขาย (บาท)',
                        data: data.reports.shopSales.length > 0 ? data.reports.shopSales.map(shop => shop.totalSales) : [0],
                        backgroundColor: '#FF8C00',
                        borderColor: '#e67e00',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '฿' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
                });
                console.log('Shop sales chart created successfully');
            } catch (error) {
                console.error('Error creating shop sales chart:', error);
            }
        } else {
            console.error('Shop sales chart canvas not found');
        }

        // Popular Menus Bar Chart
        const popularMenusCtx = document.getElementById('popularMenusChart')?.getContext('2d');
        if (popularMenusCtx) {
            if (chartInstances.popularMenus) {
                chartInstances.popularMenus.destroy();
            }
            
            try {
                chartInstances.popularMenus = new Chart(popularMenusCtx, {
                    type: 'bar',
                    data: {
                        labels: data.reports.popularMenus.length > 0 ? data.reports.popularMenus.slice(0, 5).map(menu => menu.menuName) : ['ไม่มีข้อมูล'],
                        datasets: [{
                            label: 'จำนวนที่สั่ง',
                            data: data.reports.popularMenus.length > 0 ? data.reports.popularMenus.slice(0, 5).map(menu => menu.totalOrdered) : [0],
                        backgroundColor: '#4CAF50',
                        borderColor: '#45a049',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
                });
                console.log('Popular menus chart created successfully');
            } catch (error) {
                console.error('Error creating popular menus chart:', error);
            }
        } else {
            console.error('Popular menus chart canvas not found');
        }
    }

    // Format number as currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(amount);
    }

    // Format number with commas
    function formatNumber(num) {
        return num.toLocaleString('th-TH');
    }
</script>

<svelte:head>
    <title>Admin Panel - Reports</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
</svelte:head>

<div class="reports">
    <!-- Top Navigation -->
    <TopBar title="Admin Panel - Reports" logoSrc="/SCQ_logo.png" />
    
    <!-- Side Navigation -->
    <AdminSidebar 
        activeMenu="reports" 
        shops={data.reports.shopSales || []}
        on:menuChange={handleMenuChange}
        on:logout={handleLogout}
    />

    <!-- Main Content -->
    <div class="content">
        <!-- Header -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">Reports</span>
            </div>
            <h1 class="page-title">รายงานและสถิติ</h1>
            <p class="page-subtitle">ภาพรวมการดำเนินงานของระบบ</p>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-section">
            <div class="kpi-grid">
                <!-- Total Sales -->
                <div class="kpi-card sales">
                    <div class="kpi-icon">
                        <span class="material-symbols-outlined">payments</span>
                    </div>
                    <div class="kpi-content">
                        <h3>ยอดขายทั้งหมด</h3>
                        <div class="kpi-value">{formatCurrency(data.reports.totalSales)}</div>
                        <div class="kpi-subtitle">Total Sales</div>
                    </div>
                </div>

                <!-- Total Orders -->
                <div class="kpi-card orders">
                    <div class="kpi-icon">
                        <span class="material-symbols-outlined">receipt_long</span>
                    </div>
                    <div class="kpi-content">
                        <h3>จำนวนคำสั่งซื้อ</h3>
                        <div class="kpi-value">{formatNumber(data.reports.totalOrders)}</div>
                        <div class="kpi-subtitle">Total Orders</div>
                    </div>
                </div>

                <!-- Total Dishes -->
                <div class="kpi-card dishes">
                    <div class="kpi-icon">
                        <span class="material-symbols-outlined">restaurant_menu</span>
                    </div>
                    <div class="kpi-content">
                        <h3>จำนวนเมนูทั้งหมด</h3>
                        <div class="kpi-value">{formatNumber(data.reports.totalDishes)}</div>
                        <div class="kpi-subtitle">Total Dishes</div>
                    </div>
                </div>

                <!-- Total Users -->
                <div class="kpi-card users">
                    <div class="kpi-icon">
                        <span class="material-symbols-outlined">group</span>
                    </div>
                    <div class="kpi-content">
                        <h3>จำนวนผู้ใช้งาน</h3>
                        <div class="kpi-value">{formatNumber(data.reports.totalUsers)}</div>
                        <div class="kpi-subtitle">Total Users</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
            <!-- Payment Methods Chart -->
            <div class="chart-container">
                <div class="chart-header">
                    <h3>วิธีการชำระเงิน</h3>
                    <span class="chart-subtitle">Payment Methods</span>
                </div>
                <div class="chart-content">
                    <canvas id="paymentChart"></canvas>
                </div>
            </div>

            <!-- Shop Sales Chart -->
            <div class="chart-container wide">
                <div class="chart-header">
                    <h3>ยอดขายของแต่ละร้าน</h3>
                    <div class="chart-controls">
                        <select bind:value={selectedPeriod} on:change={initializeCharts}>
                            <option value="daily">รายวัน</option>
                            <option value="weekly">รายอาทิตย์</option>
                            <option value="monthly">รายเดือน</option>
                            <option value="yearly">รายปี</option>
                        </select>
                    </div>
                </div>
                <div class="chart-content">
                    <canvas id="shopSalesChart"></canvas>
                </div>
            </div>

            <!-- Popular Menus Chart -->
            <div class="chart-container wide">
                <div class="chart-header">
                    <h3>เมนูยอดนิยม</h3>
                    <div class="chart-controls">
                        <select bind:value={selectedShop} on:change={initializeCharts}>
                            <option value="all">ทุกร้าน</option>
                            {#each data.reports.shopSales as shop}
                                <option value={shop.shopId}>{shop.shopName}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="chart-content">
                    <canvas id="popularMenusChart"></canvas>
                </div>
            </div>

            <!-- Active Users List -->
            <div class="chart-container">
                <div class="chart-header">
                    <h3>ผู้ใช้งานล่าสุด</h3>
                    <span class="chart-subtitle">Active Users</span>
                </div>
                <div class="users-list">
                    {#each data.reports.activeUsers as user}
                        <div class="user-item">
                            <div class="user-avatar">
                                {#if user.avatar}
                                    <img src="http://localhost:8090/api/files/_pb_users_auth_/{user.id}/{user.avatar}" alt={user.name} />
                                {:else}
                                    <span class="material-symbols-outlined">person</span>
                                {/if}
                            </div>
                            <div class="user-info">
                                <div class="user-name">{user.name} {user.Lastname}</div>
                                <div class="user-email">{user.email}</div>
                            </div>
                            <div class="user-status online">
                                <span class="status-dot"></span>
                                Active
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Base Styles */
    * {
        box-sizing: border-box;
    }

    :global(html), :global(body) {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    .reports {
        min-height: 100vh;
        width: 100vw;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        font-family: 'Noto Sans Thai', sans-serif;
    }

    /* Main Content */
    .content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 30px 40px;
        min-height: calc(100vh - 60px);
        width: calc(100vw - 250px);
        overflow-y: auto;
        overflow-x: hidden;
    }

    /* Header */
    .header-section {
        margin-bottom: 40px;
        text-align: center;
    }

    .breadcrumb {
        font-size: 14px;
        color: #888;
        margin-bottom: 10px;
    }

    .breadcrumb-item.active {
        color: #ff8c00;
        font-weight: 600;
    }

    .breadcrumb-separator {
        margin: 0 8px;
    }

    .page-title {
        font-size: 32px;
        font-weight: 700;
        color: #2c3e50;
        margin: 0 0 8px 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .page-subtitle {
        color: #666;
        font-size: 16px;
        margin: 0;
    }

    /* KPI Section */
    .kpi-section {
        margin-bottom: 40px;
    }

    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 25px;
    }

    .kpi-card {
        background: white;
        border-radius: 16px;
        padding: 25px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .kpi-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #ff8c00, #ffa500);
    }

    .kpi-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .kpi-card.sales::before {
        background: linear-gradient(90deg, #4CAF50, #45a049);
    }

    .kpi-card.orders::before {
        background: linear-gradient(90deg, #2196F3, #1976d2);
    }

    .kpi-card.dishes::before {
        background: linear-gradient(90deg, #ff8c00, #ffa500);
    }

    .kpi-card.users::before {
        background: linear-gradient(90deg, #9C27B0, #7B1FA2);
    }

    .kpi-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
    }

    .sales .kpi-icon {
        background: linear-gradient(135deg, #4CAF50, #45a049);
    }

    .orders .kpi-icon {
        background: linear-gradient(135deg, #2196F3, #1976d2);
    }

    .dishes .kpi-icon {
        background: linear-gradient(135deg, #ff8c00, #ffa500);
    }

    .users .kpi-icon {
        background: linear-gradient(135deg, #9C27B0, #7B1FA2);
    }

    .kpi-content h3 {
        font-size: 14px;
        color: #666;
        margin: 0 0 8px 0;
        font-weight: 500;
    }

    .kpi-value {
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 4px;
    }

    .kpi-subtitle {
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Charts Section */
    .charts-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 25px;
    }

    .chart-container {
        background: white;
        border-radius: 16px;
        padding: 25px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }

    .chart-container.wide {
        grid-column: span 2;
    }

    .chart-container:hover {
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
    }

    .chart-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
    }

    .chart-subtitle {
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .chart-controls select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
    }

    .chart-content {
        height: 300px;
        position: relative;
    }

    .chart-content canvas {
        max-height: 100%;
    }

    /* Users List */
    .users-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .user-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 12px;
        transition: all 0.2s ease;
    }

    .user-item:hover {
        background: #e9ecef;
        transform: translateX(5px);
    }

    .user-avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ddd;
        flex-shrink: 0;
    }

    .user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .user-avatar .material-symbols-outlined {
        color: #666;
        font-size: 24px;
    }

    .user-info {
        flex: 1;
    }

    .user-name {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 2px;
    }

    .user-email {
        font-size: 12px;
        color: #666;
    }

    .user-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        color: #4CAF50;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4CAF50;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .content {
            margin-left: 0;
            padding: 20px;
            width: 100vw;
        }

        .kpi-grid {
            grid-template-columns: 1fr;
        }

        .charts-section {
            grid-template-columns: 1fr;
        }

        .chart-container.wide {
            grid-column: span 1;
        }

        .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
    }
</style>