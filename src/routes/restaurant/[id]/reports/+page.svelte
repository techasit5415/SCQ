<script>
    import { goto } from "$app/navigation";
    import TopBar from '$lib/Components/restaurant/Topbar.svelte';
    import RestaurantSidebar from '$lib/Components/restaurant/RestaurantSidebar.svelte';

    export let data;
    export let form;

    $: shopId = data.shopId;
    let activeMenu = "reports";

    // Chart colors
    const chartColors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D00', '#46BDC6'];

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
    <TopBar title="Reports - {data.shop?.name || 'Restaurant'}" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar 
    {shopId}
    {activeMenu} 
    
    on:viewRestaurant={handleViewRestaurant}
    on:logout={handleLogout}
/>
    <!-- Main Content -->
    <main class="main-content">
        <!-- Header Section -->
        <div class="header-section">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Reports</span>
            </nav>
            <h1 class="page-title">Reports</h1>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stats-card sales">
                <div class="stat-header">
                    <span class="stat-icon">฿</span>
                    <h3>Total Sales</h3>
                </div>
                <div class="stat-number">฿{data.reports?.totalSales?.toLocaleString() || 0}</div>
                <div class="stat-label">ยอดขายรวมทั้งหมด</div>
            </div>

            <div class="stats-card orders">
                <div class="stat-header">
                    <span class="stat-icon">📦</span>
                    <h3>Total Orders</h3>
                </div>
                <div class="stat-number">{data.reports?.totalOrders || 0}</div>
                <div class="stat-label">ออร์เดอร์ทั้งหมด</div>
            </div>

            <div class="stats-card dishes">
                <div class="stat-header">
                    <span class="stat-icon">🍽️</span>
                    <h3>Total Dishes</h3>
                </div>
                <div class="stat-number">{data.reports?.totalDishes || 0}</div>
                <div class="stat-label">เมนูทั้งหมด</div>
            </div>

            <div class="stats-card customers">
                <div class="stat-header">
                    <span class="stat-icon">👥</span>
                    <h3>Total Customers</h3>
                </div>
                <div class="stat-number">{data.reports?.totalCustomers || 0}</div>
                <div class="stat-label">ลูกค้าทั้งหมด</div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-container">
            <!-- Monthly Revenue Chart -->
            <div class="chart-card wide">
                <div class="chart-header">
                    <h3>Monthly Revenue Trend (6 Months)</h3>
                    <div class="chart-subtitle">รายได้รายเดือน</div>
                </div>
                <div class="chart-content">
                    <div class="revenue-chart">
                        {#each data.reports?.monthlyRevenue || [] as month, index}
                            {@const maxRevenue = Math.max(...(data.reports?.monthlyRevenue || []).map(m => m.revenue), 1)}
                            {@const barHeight = month.revenue > 0 ? Math.max((month.revenue / maxRevenue) * 200, 20) : 12}
                            <div class="revenue-bar-item">
                                <div class="revenue-bar-container">
                                    <div class="revenue-bar" 
                                         style="height: {barHeight}px; 
                                                background: linear-gradient(135deg, {chartColors[index % chartColors.length]}, {chartColors[(index + 1) % chartColors.length]});">
                                    </div>
                                    <div class="revenue-tooltip">
                                        <div class="tooltip-content">
                                            <strong>฿{month.revenue?.toLocaleString() || 0}</strong>
                                            <div>{month.orders} ออร์เดอร์</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="revenue-label">{month.month}</div>
                                <div class="revenue-value">฿{month.revenue?.toLocaleString() || 0}</div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Payment Methods Chart -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Payment Methods</h3>
                    <div class="chart-subtitle">วิธีการชำระเงิน</div>
                </div>
                <div class="chart-content">
                    <div class="payment-chart">
                        <div class="pie-container">
                            <svg viewBox="0 0 200 200" class="pie-svg">
                                {#each data.reports?.paymentMethods || [] as payment, index}
                                    {@const startAngle = (data.reports?.paymentMethods || [])
                                        .slice(0, index)
                                        .reduce((sum, p) => sum + (p.percentage * 3.6), 0)}
                                    {@const endAngle = startAngle + (payment.percentage * 3.6)}
                                    {@const largeArc = payment.percentage > 50 ? 1 : 0}
                                    {@const x1 = 100 + 90 * Math.cos((startAngle - 90) * Math.PI / 180)}
                                    {@const y1 = 100 + 90 * Math.sin((startAngle - 90) * Math.PI / 180)}
                                    {@const x2 = 100 + 90 * Math.cos((endAngle - 90) * Math.PI / 180)}
                                    {@const y2 = 100 + 90 * Math.sin((endAngle - 90) * Math.PI / 180)}
                                    <path
                                        d="M 100 100 L {x1} {y1} A 90 90 0 {largeArc} 1 {x2} {y2} Z"
                                        fill="{chartColors[index % chartColors.length]}"
                                        class="pie-slice"
                                    />
                                {/each}
                                <circle cx="100" cy="100" r="60" fill="white"/>
                                <text x="100" y="95" text-anchor="middle" class="pie-total-label">Total</text>
                                <text x="100" y="110" text-anchor="middle" class="pie-total-value">
                                    {(data.reports?.paymentMethods || []).reduce((sum, p) => sum + p.count, 0)}
                                </text>
                            </svg>
                        </div>
                        <div class="payment-legend">
                            {#each data.reports?.paymentMethods || [] as payment, index}
                                <div class="legend-item">
                                    <span class="legend-color" style="background: {chartColors[index % chartColors.length]};"></span>
                                    <div class="legend-details">
                                        <div class="legend-name">{payment.method}</div>
                                        <div class="legend-stats">
                                            <span class="legend-count">{payment.count} transactions</span>
                                            <span class="legend-percent">{payment.percentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Customers -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Top Customers</h3>
                    <div class="chart-subtitle">ลูกค้าที่สั่งมากที่สุด</div>
                </div>
                <div class="chart-content">
                    <div class="customers-list">
                        {#each data.reports?.topCustomers || [] as customer, index}
                            <div class="customer-item" style="animation-delay: {index * 0.1}s;">
                                <div class="customer-rank rank-{index + 1}">
                                    #{index + 1}
                                </div>
                                <div class="customer-info">
                                    <div class="customer-name">{customer.name}</div>
                                    <div class="customer-progress">
                                        <div class="progress-bar-bg">
                                            <div class="progress-bar-fill" 
                                                 style="width: {Math.round((customer.count / (data.reports?.topCustomers?.[0]?.count || 1)) * 100)}%; 
                                                        background: linear-gradient(90deg, {chartColors[index % chartColors.length]}, {chartColors[(index + 1) % chartColors.length]});">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="customer-stats">
                                    <div class="customer-orders">{customer.count}</div>
                                    <div class="customer-amount">฿{customer.totalAmount?.toLocaleString() || 0}</div>
                                </div>
                            </div>
                        {/each}
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

    .restaurant-layout {
        background: #f8f9fa;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        min-height: 100vh;
    }

    /* Main Content */
    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 24px;
        min-height: calc(100vh - 60px);
    }

    /* Page Header */
    /* Header Section */
    .header-section {
        background: white;
        padding: 20px 24px;
        border-radius: 12px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .breadcrumb {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 8px;
    }

    .breadcrumb-item.current {
        color: #111827;
        font-weight: 500;
    }

    .breadcrumb-separator {
        margin: 0 8px;
    }
    
    .page-title {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #111827;
    }

    /* Stats Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
    }

    .stats-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .stats-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #ff8c00, #ffb84d);
    }

    .stats-card.sales::before {
        background: linear-gradient(90deg, #10b981, #34d399);
    }

    .stats-card.orders::before {
        background: linear-gradient(90deg, #3b82f6, #60a5fa);
    }

    .stats-card.dishes::before {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }

    .stats-card.customers::before {
        background: linear-gradient(90deg, #8b5cf6, #a78bfa);
    }

    .stats-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .stat-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }

    .stat-icon {
        font-size: 32px;
    }

    .stat-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .stat-number {
        font-size: 36px;
        font-weight: 800;
        background: linear-gradient(135deg, #ff8c00, #ffb84d);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 4px;
    }

    .sales .stat-number {
        background: linear-gradient(135deg, #10b981, #34d399);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .orders .stat-number {
        background: linear-gradient(135deg, #3b82f6, #60a5fa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .dishes .stat-number {
        background: linear-gradient(135deg, #f59e0b, #fbbf24);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .customers .stat-number {
        background: linear-gradient(135deg, #8b5cf6, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .stat-label {
        font-size: 13px;
        color: #9ca3af;
        font-weight: 500;
    }

    /* Charts Container */
    .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
        gap: 24px;
    }

    .chart-card {
        background: white;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .chart-card.wide {
        grid-column: 1 / -1;
    }

    .chart-header {
        padding: 20px 24px;
        border-bottom: 1px solid #f3f4f6;
    }

    .chart-header h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
    }

    .chart-subtitle {
        font-size: 13px;
        color: #6b7280;
    }

    .chart-content {
        padding: 24px;
    }

    /* Revenue Chart */
    .revenue-chart {
        display: flex;
        align-items: end;
        justify-content: space-around;
        height: 280px;
        gap: 16px;
        padding: 16px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 12px;
    }

    .revenue-bar-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        max-width: 100px;
    }

    .revenue-bar-container {
        position: relative;
        width: 100%;
        height: 220px;
        display: flex;
        align-items: end;
        justify-content: center;
    }

    .revenue-bar {
        width: 70%;
        border-radius: 8px 8px 0 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        animation: barGrow 1s ease-out forwards;
        transform-origin: bottom;
    }

    @keyframes barGrow {
        from {
            transform: scaleY(0);
            opacity: 0;
        }
        to {
            transform: scaleY(1);
            opacity: 1;
        }
    }

    .revenue-bar:hover {
        transform: scaleY(1.05) scaleX(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .revenue-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        margin-bottom: 8px;
        z-index: 10;
    }

    .revenue-bar-container:hover .revenue-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(-4px);
    }

    .tooltip-content {
        background: linear-gradient(135deg, #1f2937, #374151);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .revenue-label {
        font-size: 12px;
        color: #6b7280;
        margin-top: 12px;
        font-weight: 600;
    }

    .revenue-value {
        font-size: 14px;
        font-weight: 700;
        color: #111827;
        margin-top: 4px;
    }

    /* Payment Chart */
    .payment-chart {
        display: flex;
        gap: 40px;
        align-items: center;
    }

    .pie-container {
        flex-shrink: 0;
        width: 200px;
        height: 200px;
    }

    .pie-svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
    }

    .pie-slice {
        transition: opacity 0.3s ease;
    }

    .pie-slice:hover {
        opacity: 0.8;
    }

    .pie-total-label {
        font-size: 12px;
        fill: #6b7280;
        font-weight: 600;
    }

    .pie-total-value {
        font-size: 20px;
        fill: #111827;
        font-weight: 700;
    }

    .payment-legend {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f9fafb;
        transition: all 0.3s ease;
    }

    .legend-item:hover {
        background: #f3f4f6;
        transform: translateX(4px);
    }

    .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        flex-shrink: 0;
    }

    .legend-details {
        flex: 1;
    }

    .legend-name {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 4px;
    }

    .legend-stats {
        display: flex;
        gap: 12px;
        font-size: 12px;
    }

    .legend-count {
        color: #6b7280;
    }

    .legend-percent {
        color: #ff8c00;
        font-weight: 600;
    }

    /* Top Customers */
    .customers-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .customer-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border-radius: 12px;
        background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
        animation: slideIn 0.6s ease-out forwards;
        opacity: 0;
    }

    @keyframes slideIn {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .customer-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        border-color: #ff8c00;
    }

    .customer-rank {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        background: linear-gradient(135deg, #ff8c00, #ffb84d);
        color: white;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
    }

    .customer-rank.rank-1 {
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #1f2937;
    }

    .customer-rank.rank-2 {
        background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
        color: #1f2937;
    }

    .customer-rank.rank-3 {
        background: linear-gradient(135deg, #cd7f32, #d4af37);
        color: white;
    }

    .customer-info {
        flex: 1;
        min-width: 0;
    }

    .customer-name {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .customer-progress {
        width: 100%;
    }

    .progress-bar-bg {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .customer-stats {
        text-align: right;
        flex-shrink: 0;
    }

    .customer-orders {
        font-size: 24px;
        font-weight: 700;
        color: #111827;
        line-height: 1;
    }

    .customer-amount {
        font-size: 13px;
        color: #10b981;
        font-weight: 600;
        margin-top: 4px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
        .charts-container {
            grid-template-columns: 1fr;
        }

        .payment-chart {
            flex-direction: column;
        }

        .revenue-chart {
            gap: 8px;
        }
    }

    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
            padding: 16px;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .revenue-chart {
            height: 200px;
        }

        .revenue-bar-container {
            height: 140px;
        }
    }
</style>