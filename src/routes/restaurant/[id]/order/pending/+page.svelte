<script>
    import { goto } from "$app/navigation";
    import TopBar from "$lib/Components/restaurant/Topbar.svelte";
    import RestaurantSidebar from "$lib/Components/restaurant/RestaurantSidebar.svelte";
    import PocketBase from "pocketbase";
    import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
    import { toast } from 'svelte-sonner';

    export let data;

    const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
    
    let activeMenu = "pending";
    let selectedOrderIndex = 0;
    let orders = data.orders || [];
    let shopId = data.shopId;

    // Get selected order
    $: selectedOrder = orders[selectedOrderIndex];
    $: orderNumber = selectedOrder?.id || "N/A";
    $: customerName = selectedOrder?.expand?.User_ID?.name || "ไม่ระบุ";
    $: menuItems = selectedOrder?.expand?.Menu_ID || [];
    $: totalAmount = selectedOrder?.Total_Amount || 0;
    $: orderDate = selectedOrder?.created ? formatDateTime(selectedOrder.created) : "";

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
        goto(`/restaurant/${shopId}/order/${tab}`);
    }

    async function handleAcceptOrder() {
        if (!selectedOrder) return;
        
        try {
            await pb.collection("Order").update(selectedOrder.id, {
                Status: "In-progress",
                preparation_start_time: new Date().toISOString()
            });
            
            window.location.reload();
        } catch (error) {
            console.error("Error accepting order:", error);
            toast.error("เกิดข้อผิดพลาดในการรับออร์เดอร์");
        }
    }

    async function handleCancelOrder() {
        if (!selectedOrder) return;
        
        if (!confirm("ต้องการยกเลิกออร์เดอร์นี้ใช่หรือไม่? (จะคืนเป็น Point ให้ลูกค้า)")) return;
        
        try {
            const userId = selectedOrder.User_ID;
            const refundAmount = selectedOrder.Total_Amount;
            
            console.log(`💰 Refunding ${refundAmount} points to user ${userId} (Order Total: ฿${refundAmount})`);
            
            // ดึงข้อมูล Point ของลูกค้า
            const userPointRecords = await pb.collection('Point').getFullList({
                filter: `User_ID = "${userId}"`,
                sort: '-created'
            });
            
            if (userPointRecords.length > 0) {
                // เพิ่ม Point คืนให้ลูกค้า
                const currentPoint = userPointRecords[0];
                const newPointBalance = currentPoint.Point + refundAmount;
                
                await pb.collection('Point').update(currentPoint.id, {
                    Point: newPointBalance
                });
                
                console.log(`✅ Refunded ${refundAmount} points. New balance: ${newPointBalance}`);
            } else {
                // สร้าง Point record ใหม่ถ้ายังไม่มี
                await pb.collection('Point').create({
                    User_ID: userId,
                    Point: refundAmount
                });
                
                console.log(`✅ Created new Point record with ${refundAmount} points`);
            }
            
            // อัปเดตสถานะ Payment (ถ้ามี)
            const payments = await pb.collection("Payment").getFullList({
                filter: `Order_ID = "${selectedOrder.id}"`,
                sort: '-created'
            });
            
            if (payments.length > 0) {
                await pb.collection('Payment').update(payments[0].id, {
                    status: 'Canceled'
                });
            }
            
            // ยกเลิกออร์เดอร์
            await pb.collection("Order").update(selectedOrder.id, {
                Status: "Canceled"
            });
            
            toast.success(`ยกเลิกออร์เดอร์สำเร็จ และคืน ${refundAmount} แต้มให้ลูกค้าแล้ว`);
            window.location.reload();
        } catch (error) {
            console.error("Error canceling order:", error);
            toast.error("เกิดข้อผิดพลาดในการยกเลิกออร์เดอร์");
        }
    }

    async function handleLogout() {
        try {
            await fetch("/logout");
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/";
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

    $: menuCount = getMenuCount(menuItems);
</script>

<div class="restaurant-layout">
    <TopBar title="Pending Orders - {data.shop?.name || 'Restaurant'}" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar {shopId} {activeMenu} on:logout={handleLogout} />

    <main class="main-content">
        <!-- Header Section -->
        <div class="header-section">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Orders</span>
            </nav>
            <h1 class="page-title">Orders</h1>
        </div>

        <div class="order-tabs">
            <button class="tab active" on:click={() => handleOrderTab('pending')}>
                Pending Orders ({orders.length})
            </button>
            <button class="tab" on:click={() => handleOrderTab('active')}>
                Active Orders
            </button>
            <button class="tab" on:click={() => handleOrderTab('history')}>
                Order History
            </button>
        </div>

        <div class="orders-container">
            <div class="order-list">
                <div class="list-header">
                    <span class="header-id">Order ID</span>
                    <span class="header-price">ราคา</span>
                </div>
                
                <div class="order-list-scroll">
                    {#if orders.length === 0}
                        <div class="empty-state">
                            <p>ไม่มีออร์เดอร์ที่รอดำเนินการ</p>
                        </div>
                    {:else}
                        {#each orders as order, index}
                            <button
                                class="order-item"
                                class:active={selectedOrderIndex === index}
                                on:click={() => selectedOrderIndex = index}
                            >
                                <div class="order-info">
                                    <div class="order-id">#{order.id}</div>
                                    <div class="customer-name">{order.expand?.User_ID?.name || "ไม่ระบุ"}</div>
                                    <div class="order-items-count">{order.expand?.Menu_ID?.length || 0} รายการ</div>
                                    <div class="order-date">{formatTime(order.created)}</div>
                                </div>
                                <div class="order-price">฿{order.Total_Amount?.toFixed(2) || '0.00'}</div>
                            </button>
                        {/each}
                    {/if}
                </div>
            </div>

            {#if selectedOrder}
                <div class="order-detail">
                    <div class="detail-header">
                        <h2>ORDER: {orderNumber}</h2>
                        <div class="order-meta">
                            <span>ชื่อลูกค้า {customerName}</span>
                            <span>{orderDate}</span>
                        </div>
                    </div>

                    <div class="detail-content">
                        <h3>รายการอาหาร</h3>
                        
                        <div class="menu-list">
                            {#each Object.values(menuCount) as { item, count }}
                                <div class="menu-item">
                                    <div class="menu-info">
                                        <div class="menu-name">{item.name} x{count}</div>
                                        <ul class="menu-options">
                                            {#if item.option}
                                                {#each (Array.isArray(item.option) ? item.option : [item.option]) as opt}
                                                    <li>{opt}</li>
                                                {/each}
                                            {/if}
                                        </ul>
                                    </div>
                                    <div class="menu-price">฿{(item.Price * count).toFixed(2)}</div>
                                </div>
                            {/each}
                        </div>

                        <div class="order-summary">
                            {#if selectedOrder?.notes && selectedOrder.notes.length > 0}
                                <div class="summary-row notes-section">
                                    <span class="notes-label">หมายเหตุจากลูกค้า:</span>
                                    {#each selectedOrder.notes as note}
                                        <div class="note-item">{note.Details}</div>
                                    {/each}
                                </div>
                            {/if}
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

                        <div class="action-buttons">
                            <button class="btn-cancel" on:click={handleCancelOrder}>
                                ยกเลิกออเดอร์
                            </button>
                            <button class="btn-accept" on:click={handleAcceptOrder}>
                                รับออเดอร์
                            </button>
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
        display: flex;
        justify-content: space-between;
        padding: 16px 20px;
        background: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
        font-weight: 600;
        font-size: 14px;
        color: #666;
    }

    .order-list-scroll {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .order-item {
        display: flex;
        justify-content: space-between;
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

    .order-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .order-id {
        font-weight: 600;
        font-size: 14px;
        color: #1976d2;
    }

    .customer-name {
        font-size: 14px;
        color: #333;
        font-weight: 500;
    }

    .order-items-count {
        font-size: 13px;
        color: #666;
    }

    .order-date {
        font-size: 12px;
        color: #999;
    }

    .order-price {
        font-weight: 700;
        font-size: 16px;
        color: #1976d2;
    }

    .empty-state {
        padding: 60px 20px;
        text-align: center;
        color: #999;
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

    .notes-section {
        flex-direction: column;
        align-items: flex-start;
        padding: 12px 0;
        margin-bottom: 12px;
        border-bottom: 1px solid #e0e0e0;
    }

    .notes-label {
        font-weight: 700;
        color: #333;
        margin-bottom: 8px;
        display: block;
        font-size: 14px;
    }

    .note-item {
        padding: 6px 0;
        color: #555;
        font-size: 14px;
        line-height: 1.6;
        font-weight: 500;
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
        color: #FF8C00;
        font-weight: 700;
    }

    .status-paid {
        color: #4caf50;
        font-weight: 600;
    }

    .action-buttons {
        display: flex;
        gap: 12px;
        margin-top: 24px;
    }

    .btn-cancel,
    .btn-accept {
        flex: 1;
        padding: 14px 24px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-cancel {
        background: white;
        color: #666;
        border: 2px solid #e0e0e0;
    }

    .btn-cancel:hover {
        background: #f5f5f5;
        border-color: #999;
    }

    .btn-accept {
        background: #FF8C00;
        color: white;
    }

    .btn-accept:hover {
        background: #FF7F00;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
    }

    /* Responsive */
    @media (max-width: 1400px) {
        .order-container {
            grid-template-columns: 1fr;
        }
    }
</style>
