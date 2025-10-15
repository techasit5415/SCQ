<script>
    import { goto } from "$app/navigation";
    import TopBar from "$lib/Components/restaurant/Topbar.svelte";
    import RestaurantSidebar from "$lib/Components/restaurant/RestaurantSidebar.svelte";
    import PocketBase from "pocketbase";
    import { PUBLIC_POCKETBASE_URL } from "$env/static/public";

    export let data;

    const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
    
    let activeMenu = "pending";
    let selectedOrderIndex = 0;
    let orders = data.orders || [];
    let shopId = data.shopId;

    // Get selected order
    $: selectedOrder = orders[selectedOrderIndex];
    $: orderNumber = selectedOrder?.id?.slice(-10) || "N/A";
    $: customerName = selectedOrder?.expand?.User_ID?.name || "ไม่ระบุ";
    $: menuItems = selectedOrder?.expand?.Menu_ID || [];
    $: totalAmount = selectedOrder?.Total_Amount || 0;
    $: orderStatus = selectedOrder?.Status || "Unknown";
    $: orderDate = selectedOrder?.created ? formatDateTime(selectedOrder.created) : "";
    $: completionTime = selectedOrder?.completion_time ? formatDateTime(selectedOrder.completion_time) : "";

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    function formatTime(dateString) {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function handleOrderTab(tab) {
        goto(`/homerestaurant/restaurant/${shopId}/order/${tab}`);
    }

    async function handleLogout() {
        try {
            await fetch("/logout");
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/login";
        }
    }

    // Count menu items
    function getMenuCount(menuArray) {
        if (!Array.isArray(menuArray)) return {};
        
        const count = {};
        menuArray.forEach(menu => {
            if (count[menu.id]) {
                count[menu.id].count++;
            } else {
                count[menu.id] = { item: menu, count: 1 };
            }
        });
        return count;
    }

    function getStatusBadge(status) {
        if (status === "Completed") {
            return { class: "status-completed", text: "เสร็จสิ้น" };
        } else if (status === "Canceled") {
            return { class: "status-canceled", text: "ยกเลิก" };
        }
        return { class: "", text: status };
    }

    $: menuCount = getMenuCount(menuItems);
    $: statusBadge = getStatusBadge(orderStatus);
</script>

<div class="restaurant-layout">
    <TopBar title="SCQ" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar {activeMenu} on:logout={handleLogout} />

    <main class="main-content">
        <div class="page-header">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Orders</span>
            </nav>
            <h1>Orders</h1>
        </div>

        <div class="order-tabs">
            <button class="tab" on:click={() => handleOrderTab('pending')}>
                Pending Orders
            </button>
            <button class="tab" on:click={() => handleOrderTab('active')}>
                Active Orders
            </button>
            <button class="tab active" on:click={() => handleOrderTab('history')}>
                Order History ({orders.length})
            </button>
        </div>

        <div class="orders-container">
            <div class="order-list">
                <div class="list-header">
                    <span class="header-id">Order ID</span>
                    <span class="header-status">สถานะ</span>
                    <span class="header-price">ราคา</span>
                </div>
                
                {#if orders.length === 0}
                    <div class="empty-state">
                        <p>ไม่มีประวัติออเดอร์</p>
                    </div>
                {:else}
                    {#each orders as order, index}
                        <button
                            class="order-item {order.Status === 'Canceled' ? 'canceled' : ''}"
                            class:active={selectedOrderIndex === index}
                            on:click={() => selectedOrderIndex = index}
                        >
                            <div class="order-info">
                                <div class="order-id">#{order.id.slice(-10)}</div>
                                <div class="order-time">{formatTime(order.created)} {order.expand?.Menu_ID?.length || 0} รายการ</div>
                            </div>
                            <span class="status-badge {getStatusBadge(order.Status).class}">
                                {getStatusBadge(order.Status).text}
                            </span>
                            <div class="order-price">฿{order.Total_Amount?.toFixed(2) || '0.00'}</div>
                        </button>
                    {/each}
                {/if}
            </div>

            {#if selectedOrder}
                <div class="order-detail">
                    <div class="detail-header">
                        <h2>ORDER: {orderNumber}</h2>
                        <div class="order-meta">
                            <span>ชื่อลูกค้า {customerName}</span>
                            <span class="status-badge {statusBadge.class}">{statusBadge.text}</span>
                        </div>
                        <div class="order-meta">
                            <span>{orderDate}</span>
                            {#if completionTime}
                                <span>เสร็จสิ้น: {completionTime}</span>
                            {/if}
                        </div>
                    </div>

                    <div class="detail-content">
                        <h3>รายการอาหาร</h3>
                        
                        <div class="menu-list">
                            {#each Object.values(menuCount) as { item, count }}
                                <div class="menu-item">
                                    <div class="menu-info">
                                        <div class="menu-name">{item.Menu_Name} x{count}</div>
                                        {#if item.Options && Array.isArray(item.Options) && item.Options.length > 0}
                                            <ul class="menu-options">
                                                {#each item.Options as option}
                                                    <li>{option}</li>
                                                {/each}
                                            </ul>
                                        {/if}
                                    </div>
                                    <div class="menu-price">฿{(item.Price * count).toFixed(2)}</div>
                                </div>
                            {/each}
                        </div>

                        <div class="order-summary">
                            <div class="summary-row">
                                <span>วิธีการชำระเงิน: QR Code</span>
                            </div>
                            <div class="summary-row">
                                <span>สถานะการชำระเงิน: <span class="status-paid">ชำระเงินแล้ว</span></span>
                            </div>
                            <div class="summary-row total">
                                <span>ราคารวม</span>
                                <span class="total-price">฿{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="order-detail empty">
                    <p>กรุณาเลือกออร์เดอร์</p>
                </div>
            {/if}
        </div>
    </main>
</div>

<style>
    .restaurant-layout {
        background: #f8f9fa;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        min-height: 100vh;
    }

    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 24px;
        min-height: calc(100vh - 60px);
    }

    .page-header {
        margin-bottom: 20px;
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
    }

    .breadcrumb-separator {
        color: #999;
    }

    .breadcrumb-item.current {
        color: #333;
        font-weight: 500;
    }

    .page-header h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0;
    }

    .order-tabs {
        display: flex;
        gap: 4px;
        border-bottom: 2px solid #e0e0e0;
        margin-bottom: 24px;
    }

    .tab {
        padding: 12px 24px;
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        cursor: pointer;
        font-size: 15px;
        font-weight: 500;
        color: #666;
        transition: all 0.2s;
    }

    .tab:hover {
        color: #333;
        background: #f5f5f5;
    }

    .tab.active {
        color: #1976d2;
        border-bottom-color: #1976d2;
    }

    .orders-container {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 24px;
        height: calc(100vh - 240px);
    }

    .order-list {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .list-header {
        display: grid;
        grid-template-columns: 1fr 80px 100px;
        gap: 8px;
        padding: 16px 20px;
        background: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
        font-weight: 600;
        font-size: 14px;
        color: #666;
    }

    .header-status {
        text-align: center;
    }

    .header-price {
        text-align: right;
    }

    .order-item {
        display: grid;
        grid-template-columns: 1fr 80px 100px;
        gap: 8px;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #f0f0f0;
        background: white;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
    }

    .order-item:hover {
        background: #f9f9f9;
    }

    .order-item.active {
        background: #e3f2fd;
        border-left: 4px solid #1976d2;
    }

    .order-item.canceled {
        opacity: 0.7;
    }

    .order-info {
        flex: 1;
    }

    .order-id {
        font-weight: 600;
        font-size: 15px;
        color: #333;
        margin-bottom: 4px;
    }

    .order-time {
        font-size: 13px;
        color: #666;
    }

    .order-price {
        font-weight: 700;
        font-size: 16px;
        color: #1976d2;
        text-align: right;
    }

    .empty-state {
        padding: 60px 20px;
        text-align: center;
        color: #999;
    }

    .status-badge {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
    }

    .status-completed {
        background: #e8f5e9;
        color: #2e7d32;
    }

    .status-canceled {
        background: #ffebee;
        color: #c62828;
    }

    .order-detail {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: auto;
    }

    .order-detail.empty {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
    }

    .detail-header {
        padding: 24px;
        border-bottom: 1px solid #e0e0e0;
    }

    .detail-header h2 {
        font-size: 22px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 8px 0;
    }

    .order-meta {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #666;
        margin-top: 8px;
    }

    .detail-content {
        padding: 24px;
    }

    .detail-content h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: #333;
    }

    .menu-list {
        margin-bottom: 24px;
    }

    .menu-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
    }

    .menu-item:last-child {
        border-bottom: none;
    }

    .menu-info {
        flex: 1;
    }

    .menu-name {
        font-weight: 500;
        font-size: 15px;
        color: #333;
        margin-bottom: 4px;
    }

    .menu-options {
        list-style: none;
        padding: 0;
        margin: 4px 0 0 0;
    }

    .menu-options li {
        font-size: 13px;
        color: #666;
        padding-left: 16px;
        position: relative;
    }

    .menu-options li::before {
        content: "•";
        position: absolute;
        left: 4px;
    }

    .menu-price {
        font-weight: 600;
        font-size: 16px;
        color: #333;
    }

    .order-summary {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        margin-top: 24px;
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;
        color: #666;
    }

    .summary-row.total {
        border-top: 2px solid #e0e0e0;
        margin-top: 12px;
        padding-top: 16px;
        font-weight: 600;
        color: #333;
    }

    .total-price {
        font-size: 20px;
        color: #333;
        font-weight: 700;
    }

    .status-paid {
        color: #4caf50;
        font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 1400px) {
        .orders-container {
            grid-template-columns: 1fr;
        }
    }
</style>
