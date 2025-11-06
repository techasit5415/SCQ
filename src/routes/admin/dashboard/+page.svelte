<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';
    import { onMount } from 'svelte';

    export let data;

    // Active menu state
    let activeMenu = "dashboard";
    
    // Chart data reactive statements
    $: kpis = data?.kpis || {};
    $: charts = data?.charts || {};
    
    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        if (menu !== "dashboard") {
            // Navigate to different pages based on menu selection
            switch(menu) {
                case "manageUsers":
                    goto('/admin/manageUser');
                    break;
                case "manageRestaurant":
                case "addRestaurant":
                    goto('/admin/restaurant');
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
                    console.log('Navigation to', menu, 'not implemented yet');
            }
        }
    }
    
    function handleViewRestaurant(event) {
        const restaurantId = event.detail;
        goto(`/admin/Restaurant/${restaurantId}`);
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

    // Format number with commas
    function formatNumber(num) {
        return num ? num.toLocaleString() : '0';
    }

    // Format currency
    function formatCurrency(amount) {
        return `฿${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    // Get status color
    function getStatusColor(status) {
        const colors = {
            'Completed': '#4CAF50',
            'In-progress': '#FF9800', 
            'Pending': '#2196F3',
            'Canceled': '#F44336'
        };
        return colors[status] || '#9E9E9E';
    }

    // Generate hourly labels
    function getHourLabel(hour) {
        if (hour === 0) return '12 AM';
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    }

    onMount(() => {
        console.log('Dashboard data:', data);
    });
</script>

<svelte:head>
    <title>Dashboard - SCQ Admin</title>
</svelte:head>

<!-- Top Navigation -->
<TopBar title="Admin Panel - Dashboard" logoSrc="/SCQ_logo.png" />

<!-- Sidebar -->
<AdminSidebar 
    {activeMenu} 
    shops={data.shops || []}
    on:menuChange={handleMenuChange}
    on:viewRestaurant={handleViewRestaurant}
    on:logout={handleLogout}
/>

<!-- Main Content -->
    <main class="main-content">
        <!-- Breadcrumb and Title -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home / </span>
                <span class="breadcrumb-item current">Dashboard</span>
            </div>
            <div class="page-title">
                <h1>Dashboard</h1>
                <p>ภาพรวมของระบบ SCQ</p>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-section">
            <div class="kpi-grid">
                <!-- Active Orders -->
                <div class="kpi-card active">
                    <div class="kpi-icon">
                        <span class="material-icons">local_shipping</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{kpis.activeOrders || 0}</div>
                        <div class="kpi-label">Active Orders</div>
                        <div class="kpi-sublabel">กำลังเตรียม</div>
                    </div>
                </div>

                <!-- Orders Today -->
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <span class="material-icons">today</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{kpis.ordersToday || 0}</div>
                        <div class="kpi-label">Orders Today</div>
                        <div class="kpi-sublabel">วันนี้</div>
                    </div>
                </div>

                <!-- Orders MTD -->
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <span class="material-icons">calendar_month</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{kpis.ordersMTD || 0}</div>
                        <div class="kpi-label">Orders MTD</div>
                        <div class="kpi-sublabel">เดือนนี้</div>
                    </div>
                </div>

                <!-- Revenue Today -->
                <div class="kpi-card revenue">
                    <div class="kpi-icon">
                        <span class="material-icons">attach_money</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatCurrency(kpis.revenueToday)}</div>
                        <div class="kpi-label">Revenue Today</div>
                        <div class="kpi-sublabel">รายได้วันนี้</div>
                    </div>
                </div>

                <!-- Revenue MTD -->
                <div class="kpi-card revenue">
                    <div class="kpi-icon">
                        <span class="material-icons">trending_up</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatCurrency(kpis.revenueMTD)}</div>
                        <div class="kpi-label">Revenue MTD</div>
                        <div class="kpi-sublabel">รายได้เดือนนี้</div>
                    </div>
                </div>

                <!-- Average Order Value -->
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <span class="material-icons">shopping_basket</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatCurrency(kpis.avgOrderValue)}</div>
                        <div class="kpi-label">Avg Order Value</div>
                        <div class="kpi-sublabel">ค่าเฉลี่ย/ออเดอร์</div>
                    </div>
                </div>

                <!-- Cancel Rate -->
                <div class="kpi-card {parseFloat(kpis.cancelRate) > 10 ? 'warning' : ''}">
                    <div class="kpi-icon">
                        <span class="material-icons">cancel</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{kpis.cancelRate || 0}%</div>
                        <div class="kpi-label">Cancel Rate</div>
                        <div class="kpi-sublabel">อัตราการยกเลิก</div>
                    </div>
                </div>

                <!-- Avg Preparation Time -->
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <span class="material-icons">timer</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{kpis.avgPreparationTime || 0}</div>
                        <div class="kpi-label">Avg Prep Time</div>
                        <div class="kpi-sublabel">นาที</div>
                    </div>
                </div>

                <!-- Avg Fulfillment Time -->
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <span class="material-icons">schedule</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{kpis.avgFulfillmentTime || 0}</div>
                        <div class="kpi-label">Avg Fulfillment</div>
                        <div class="kpi-sublabel">นาที</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
            <div class="charts-grid">
                <!-- Hourly Heatmap -->
                <div class="chart-card large">
                    <div class="chart-header">
                        <h3>Hourly Orders Heatmap</h3>
                        <p>แสดงยอดการสั่งซื้อตามชั่วโมง</p>
                    </div>
                    <div class="chart-content">
                        <div class="heatmap">
                            {#each (charts.hourlyHeatmap || []) as item, index}
                                <div 
                                    class="heatmap-item" 
                                    style="height: {Math.max(item.count * 3, 5)}px; background-color: hsl({Math.max(220 - item.count * 10, 0)}, 70%, 60%)"
                                    title="{getHourLabel(item.hour)}: {item.count} orders"
                                >
                                    <span class="hour-label">{item.hour}</span>
                                    <span class="count-label">{item.count}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Top 5 Restaurants -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Top 5 Restaurants</h3>
                        <p>ร้านอาหารที่มีออเดอร์มากที่สุด</p>
                    </div>
                    <div class="chart-content">
                        <div class="bar-chart horizontal">
                            {#each (charts.topRestaurants || []) as restaurant, index}
                                <div class="bar-item">
                                    <div class="bar-label">{restaurant.name}</div>
                                    <div class="restaurant-bar-container">
                                        <div 
                                            class="restaurant-bar" 
                                            style="width: {(restaurant.count / (charts.topRestaurants[0]?.count || 1)) * 100}%; background-color: hsl({200 + index * 30}, 70%, 60%)"
                                        ></div>
                                        <span class="restaurant-bar-value">{restaurant.count}</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Orders by Status -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Orders by Status</h3>
                        <p>สถานะของออเดอร์ทั้งหมด</p>
                    </div>
                    <div class="chart-content">
                        <div class="donut-chart">
                            <div class="donut-center">
                                <div class="donut-total">{data.totalOrders || 0}</div>
                                <div class="donut-label">Total Orders</div>
                            </div>
                            
                            <div class="status-legend">
                                {#each (charts.ordersByStatus || []) as status}
                                    <div class="legend-item">
                                        <div 
                                            class="legend-color" 
                                            style="background-color: {getStatusColor(status.status)}"
                                        ></div>
                                        <span class="legend-label">{status.status}</span>
                                        <span class="legend-value">{status.count} ({status.percentage}%)</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Top 5 Dishes Section -->
        <div class="top-dishes-section">
            <div class="section-header">
                <h2>Top 5 Dishes</h2>
                <p>เมนูที่ขายดีที่สุดของแต่ละร้าน (ตามจำนวนออเดอร์)</p>
            </div>
            
            <div class="dishes-chart">
                <div class="chart-bars">
                    {#each (charts.topDishes || []) as dish, index}
                        <div class="bar-container">
                            <div class="bar-wrapper">
                                <div 
                                    class="dish-bar-vertical"
                                    style="height: {(dish.sales / (charts.topDishes[0]?.sales || 1)) * 200}px; background: linear-gradient(135deg, hsl({200 + index * 30}, 70%, 60%), hsl({200 + index * 30}, 70%, 45%))"
                                    title="{dish.name}: {dish.sales} ออเดอร์, {formatCurrency(dish.revenue)}"
                                >
                                    <div class="bar-value-top">{dish.sales}</div>
                                </div>
                            </div>
                            <div class="bar-info">
                                <div class="bar-rank">#{index + 1}</div>
                                <div class="bar-name">{dish.name}</div>
                                <div class="bar-revenue">{formatCurrency(dish.revenue)}</div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="recent-orders-section">
            <div class="section-header">
                <h2>Recent Orders</h2>
                <a href="/admin/reports" class="view-all-btn">View All</a>
            </div>
            
            <div class="table-container">
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Restaurant</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each (data.recentOrders || []) as order}
                            <tr>
                                <td>#{order.id.slice(-8).toUpperCase()}</td>
                                <td>{order.expand?.Shop_ID?.name || 'Unknown'}</td>
                                <td>{formatCurrency(order.Total_Amount)}</td>
                                <td>
                                    <span 
                                        class="status-badge" 
                                        style="background-color: {getStatusColor(order.Status)}20; color: {getStatusColor(order.Status)}"
                                    >
                                        {order.Status}
                                    </span>
                                </td>
                                <td>{new Date(order.created).toLocaleString('th-TH')}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </main>

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

    :global(body) {
        background: #f5f7fa !important;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 24px;
        min-height: calc(100vh - 60px);
        overflow-y: auto;
        background: #f5f7fa !important;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .header-section {
        width: calc(100% + 48px);
        padding: 20px 24px;
        background: white;
        border-bottom: 1px #B4B5B7 solid;
        margin: -24px -24px 24px -24px;
        position: relative;
        box-sizing: border-box;
    }

    .breadcrumb {
        margin-bottom: 10px;
    }

    .breadcrumb-item {
        color: #95969A;
        font-size: 13px;
        font-weight: 400;
    }

    .breadcrumb-item.current {
        color: #333438;
    }

    .page-title h1 {
        color: #333438;
        font-size: 20px;
        font-weight: 400;
        margin: 0 0 5px 0;
    }

    .page-title p {
        color: #68696E;
        font-size: 14px;
        margin: 0;
    }

    /* KPI Cards */
    .kpi-section {
        margin-bottom: 32px;
    }

    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
    }

    .kpi-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .kpi-card.active {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .kpi-card.revenue {
        border-color: #10b981;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .kpi-card.warning {
        border-color: #f59e0b;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    }

    .kpi-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        flex-shrink: 0;
    }

    .kpi-card.active .kpi-icon {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .kpi-card.revenue .kpi-icon {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .kpi-card.warning .kpi-icon {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .kpi-icon .material-icons {
        color: white;
        font-size: 28px;
    }

    .kpi-content {
        flex: 1;
    }

    .kpi-value {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 4px;
        line-height: 1;
    }

    .kpi-label {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
    }

    .kpi-sublabel {
        font-size: 14px;
        color: #6b7280;
    }

    /* Charts */
    .charts-section {
        margin-bottom: 32px;
    }

    .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
    }

    .chart-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    .chart-card.large {
        grid-column: span 2;
    }

    .chart-header {
        margin-bottom: 20px;
    }

    .chart-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 4px 0;
    }

    .chart-header p {
        font-size: 14px;
        color: #64748b;
        margin: 0;
    }

    /* Heatmap */
    .heatmap {
        display: flex;
        align-items: end;
        gap: 4px;
        height: 200px;
        padding: 20px 0;
    }

    .heatmap-item {
        flex: 1;
        position: relative;
        border-radius: 4px 4px 0 0;
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: center;
        min-height: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .heatmap-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .hour-label {
        font-size: 10px;
        color: white;
        font-weight: 500;
        margin-bottom: 4px;
    }

    .count-label {
        font-size: 10px;
        color: white;
        font-weight: 600;
    }

    /* Bar Charts */
    .bar-chart {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .bar-chart.horizontal .bar-item {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .bar-label {
        min-width: 120px;
        font-size: 14px;
        color: #374151;
        font-weight: 500;
    }

    .bar-container {
        flex: 1;
        position: relative;
        height: 32px;
        background: #f1f5f9;
        border-radius: 16px;
        display: flex;
        align-items: center;
    }

    .bar {
        height: 100%;
        border-radius: 16px;
        position: relative;
        transition: width 0.8s ease;
    }

    .bar-value {
        position: absolute;
        right: 12px;
        font-size: 12px;
        font-weight: 600;
        color: #1e293b;
    }

    /* Restaurant Bar Styles */
    .restaurant-bar-container {
        flex: 1;
        position: relative;
        height: 32px;
        background: #f1f5f9;
        border-radius: 16px;
        display: flex;
        align-items: center;
    }

    .restaurant-bar {
        height: 100%;
        border-radius: 16px;
        position: relative;
        transition: width 0.8s ease;
    }

    .restaurant-bar-value {
        position: absolute;
        right: 12px;
        font-size: 12px;
        font-weight: 600;
        color: #1e293b;
    }

    /* Vertical Bar Chart */
    .bar-chart:not(.horizontal) {
        flex-direction: row;
        align-items: end;
        height: 200px;
        gap: 16px;
        padding: 20px 0;
    }

    .bar-item.vertical {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .bar.vertical {
        width: 40px;
        border-radius: 4px 4px 0 0;
        transition: height 0.8s ease;
    }

    .bar-label.vertical {
        font-size: 12px;
        text-align: center;
        color: #374151;
        font-weight: 500;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .bar-value.vertical {
        font-size: 11px;
        font-weight: 600;
        color: #10b981;
    }

    /* Donut Chart */
    .donut-chart {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
    }

    .donut-center {
        text-align: center;
        margin-bottom: 16px;
    }

    .donut-total {
        font-size: 32px;
        font-weight: 700;
        color: #1e293b;
    }

    .donut-label {
        font-size: 14px;
        color: #64748b;
        margin-top: 4px;
    }

    .status-legend {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: #f8fafc;
        border-radius: 8px;
    }

    .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        flex-shrink: 0;
    }

    .legend-label {
        flex: 1;
        font-size: 14px;
        color: #374151;
        font-weight: 500;
    }

    .legend-value {
        font-size: 14px;
        color: #64748b;
        font-weight: 600;
    }

    /* Top Dishes Section */
    .top-dishes-section {
        background: white;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    .top-dishes-section .section-header {
        margin-bottom: 24px;
    }

    .top-dishes-section .section-header p {
        color: #64748b;
        font-size: 14px;
        margin: 4px 0 0 0;
    }

    .dishes-chart {
        padding: 20px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }

    .chart-bars {
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        gap: 20px;
        min-height: 280px;
        padding: 20px 10px;
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .bar-container {
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        flex: 1;
        max-width: 150px;
    }

    .bar-wrapper {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        height: 220px;
        width: 100%;
        position: relative;
    }

    .dish-bar-vertical {
        width: 60px;
        min-height: 20px;
        border-radius: 6px 6px 0 0;
        transition: all 0.5s ease;
        position: relative;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 8px;
    }

    .dish-bar-vertical:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .bar-value-top {
        color: white;
        font-weight: 700;
        font-size: 14px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .bar-info {
        margin-bottom: 12px;
        text-align: center;
        width: 100%;
    }

    .bar-rank {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        font-weight: 600;
        font-size: 12px;
        margin-bottom: 8px;
    }

    .bar-name {
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
        line-height: 1.3;
        margin-bottom: 4px;
        word-break: break-word;
        max-height: 2.6em;
        overflow: hidden;
    }

    .bar-revenue {
        font-size: 14px;
        font-weight: 700;
        color: #059669;
    }

    /* Recent Orders */
    .recent-orders-section {
        background: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .section-header h2 {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
    }

    .view-all-btn {
        color: #3b82f6;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .view-all-btn:hover {
        background-color: #eff6ff;
    }

    .table-container {
        overflow-x: hidden;
    }

    .orders-table {
        width: 100%;
        border-collapse: collapse;
    }

    .orders-table th,
    .orders-table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
    }

    .orders-table th {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        background: #f8fafc;
    }

    .orders-table td {
        font-size: 14px;
        color: #1e293b;
    }

    .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
        .main-content {
            margin-left: 0;
            padding: 16px;
        }

        .kpi-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
        }

        .charts-grid {
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .chart-card.large {
            grid-column: span 1;
        }
    }

    @media (max-width: 640px) {
        .kpi-grid {
            grid-template-columns: 1fr;
        }

        .kpi-card {
            padding: 20px;
        }

        .kpi-value {
            font-size: 24px;
        }

        .heatmap {
            height: 150px;
        }

        .bar-chart:not(.horizontal) {
            height: 150px;
        }
    }
</style>