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

    $: selectedOrder = orders[selectedOrderIndex];
    $: orderNumber = selectedOrder?.id?.slice(-10) || "N/A";
    $: customerName = selectedOrder?.expand?.User_ID?.name || "ไม่ระบุ";
    $: menuItems = selectedOrder?.expand?.Menu_ID || [];
    $: totalAmount = selectedOrder?.Total_Amount || 0;
    $: orderDate = selectedOrder?.created ? formatDateTime(selectedOrder.created) : "";
    $: preparationStart = selectedOrder?.preparation_start_time ? formatDateTime(selectedOrder.preparation_start_time) : "";

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

    async function handleCompleteOrder() {
        if (!selectedOrder) return;
        
        try {
            await pb.collection("Order").update(selectedOrder.id, {
                Status: "Completed"
            });
            
            window.location.reload();
        } catch (error) {
            console.error("Error completing order:", error);
            alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        }
    }

    async function handleCancelOrder() {
        if (!selectedOrder) return;
        
        if (!confirm("ต้องการยกเลิกออร์เดอร์นี้ใช่หรือไม่?")) return;
        
        try {
            await pb.collection("Order").update(selectedOrder.id, {
                Status: "Canceled"
            });
            
            window.location.reload();
        } catch (error) {
            console.error("Error canceling order:", error);
            alert("เกิดข้อผิดพลาดในการยกเลิกออร์เดอร์");
        }
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

    function handlePrintReceipt() {
        if (!selectedOrder) return;
        
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) return;

        const currentDateTime = new Date().toLocaleString('th-TH');
        const shopName = data.shop ? data.shop.Shop_Name : 'N/A';
        const shopPhone = data.shop ? data.shop.Phone : 'N/A';

        let menuDetailsHtml = '';
        Object.values(menuCount).forEach(function(item) {
            const menuItem = item.item;
            const count = item.count;
            
            let optionsHtml = '';
            if (menuItem.option && Array.isArray(menuItem.option) && menuItem.option.length > 0) {
                menuItem.option.forEach(function(opt) {
                    optionsHtml += '<li>' + opt + '</li>';
                });
                optionsHtml = '<ul style="margin: 5px 0 0 20px; padding: 0; list-style: disc;">' + optionsHtml + '</ul>';
            }
            
            menuDetailsHtml += '<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">';
            menuDetailsHtml += '<div>';
            menuDetailsHtml += '<div style="font-weight: 500; margin-bottom: 4px;">' + menuItem.name + ' x' + count + '</div>';
            menuDetailsHtml += optionsHtml;
            menuDetailsHtml += '</div>';
            menuDetailsHtml += '<div style="font-weight: 600;">฿' + (menuItem.Price * count).toFixed(2) + '</div>';
            menuDetailsHtml += '</div>';
        });

        let html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
        html += '<title>ใบเสร็จรับเงิน - Order #' + orderNumber + '</title>';
        html += '<style>';
        html += 'body { font-family: Arial, "Noto Sans Thai", sans-serif; padding: 40px; background: white; }';
        html += '.receipt { max-width: 800px; margin: 0 auto; background: white; padding: 40px; }';
        html += '.header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }';
        html += '.header h1 { font-size: 36px; font-weight: 700; margin-bottom: 10px; color: #333; }';
        html += '.header p { font-size: 16px; color: #666; margin-top: 5px; }';
        html += '.order-info { display: flex; justify-content: space-between; margin-bottom: 25px; padding: 20px; background: #f9f9f9; border-radius: 8px; }';
        html += '.info-section { flex: 1; }';
        html += '.info-label { font-size: 13px; color: #666; margin-bottom: 6px; font-weight: 500; }';
        html += '.info-value { font-size: 16px; font-weight: 600; color: #333; }';
        html += '.items-section { margin-bottom: 30px; }';
        html += '.section-title { font-size: 20px; font-weight: 700; margin-bottom: 15px; color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }';
        html += '.total-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }';
        html += '.total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; }';
        html += '.total-row.grand-total { font-size: 28px; font-weight: 700; color: #4caf50; margin-top: 15px; padding-top: 15px; border-top: 2px dashed #999; }';
        html += '.payment-info { margin-top: 30px; padding: 25px; background: #f0f8f0; border-radius: 8px; border-left: 5px solid #4caf50; }';
        html += '.payment-status { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #2e7d32; margin-bottom: 10px; }';
        html += '.payment-details { font-size: 15px; color: #555; line-height: 1.8; }';
        html += '.footer { margin-top: 50px; padding-top: 20px; border-top: 1px dashed #ccc; text-align: center; color: #666; font-size: 14px; }';
        html += '.shop-info { margin-top: 10px; font-size: 14px; color: #888; }';
        html += '@media print { body { padding: 0; } .receipt { padding: 20px; } @page { margin: 15mm; } }';
        html += '</style></head><body><div class="receipt">';
        html += '<div class="header">';
        html += '<h1>SCQ</h1>';
        html += '<p>ใบเสร็จรับเงิน / Receipt</p>';
        html += '<div class="shop-info">' + shopName;
        if (shopPhone && shopPhone !== 'N/A') {
            html += ' | โทร: ' + shopPhone;
        }
        html += '</div>';
        html += '</div>';
        html += '<div class="order-info">';
        html += '<div class="info-section"><div class="info-label">เลขที่ออเดอร์ / Order ID</div><div class="info-value">#' + selectedOrder.id + '</div></div>';
        html += '<div class="info-section"><div class="info-label">ชื่อลูกค้า / Customer</div><div class="info-value">' + customerName + '</div></div>';
        html += '<div class="info-section" style="text-align: right;"><div class="info-label">วันที่ / Date</div><div class="info-value">' + orderDate + '</div></div>';
        html += '</div>';
        
        if (preparationStart) {
            html += '<div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff9800;">';
            html += '<div style="font-size: 14px; color: #e65100;"><strong>เริ่มเตรียมอาหาร:</strong> ' + preparationStart + '</div>';
            html += '</div>';
        }
        
        html += '<div class="items-section">';
        html += '<div class="section-title">รายการอาหาร / Menu Items</div>';
        html += menuDetailsHtml;
        html += '</div>';
        html += '<div class="total-section">';
        html += '<div class="total-row"><span>รวมเงิน / Subtotal</span><span>฿' + totalAmount.toFixed(2) + '</span></div>';
        html += '<div class="total-row"><span>ส่วนลด / Discount</span><span>฿0.00</span></div>';
        html += '<div class="total-row"><span>ค่าธรรมเนียม / Service Fee</span><span>฿0.00</span></div>';
        html += '<div class="total-row grand-total"><span>ยอดรวมทั้งสิ้น / Total Amount</span><span>฿' + totalAmount.toFixed(2) + '</span></div>';
        html += '</div>';
        html += '<div class="payment-info">';
        html += '<div class="payment-status"><span style="font-size: 24px;">✓</span><span>ชำระเงินแล้ว / PAID</span></div>';
        html += '<div class="payment-details">';
        html += 'วิธีการชำระเงิน: <strong>QR Code</strong><br>';
        html += 'สถานะ: <strong style="color: #f57c00;">กำลังเตรียมอาหาร</strong>';
        html += '</div>';
        html += '</div>';
        html += '<div class="footer">';
        html += '<p style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">ขอบคุณที่ใช้บริการ / Thank you for your order!</p>';
        html += '<p>SCQ - Student Canteen Queue System</p>';
        html += '<p style="margin-top: 15px; font-size: 12px;">พิมพ์เมื่อ: ' + currentDateTime + '</p>';
        html += '</div>';
        html += '</div>';
        html += '<' + 'script>window.onload = function() { setTimeout(function() { window.print(); }, 250); };<' + '/script>';
        html += '</body></html>';

        printWindow.document.write(html);
        printWindow.document.close();
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
            <button class="tab active" on:click={() => handleOrderTab('active')}>
                Active Orders ({orders.length})
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
                
                {#if orders.length === 0}
                    <div class="empty-state">
                        <p>ไม่มีออเดอร์ที่กำลังทำในขณะนี้</p>
                    </div>
                {:else}
                    {#each orders as order, index}
                        <button
                            class="order-item"
                            class:active={selectedOrderIndex === index}
                            on:click={() => selectedOrderIndex = index}
                        >
                            <div class="order-info">
                                <div class="order-id">#{order.id.slice(-10)}</div>
                                <div class="order-time">{formatTime(order.created)} {order.expand?.Menu_ID?.length || 0} รายการ</div>
                            </div>
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
                            <span class="status-active">กำลังทำ</span>
                        </div>
                        {#if preparationStart}
                            <div class="order-meta">
                                <span>เริ่มเตรียม: {preparationStart}</span>
                            </div>
                        {/if}
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

                        <div class="action-buttons">
                            <button class="btn-cancel" on:click={handleCancelOrder}>
                                ยกเลิกออเดอร์
                            </button>
                            <button class="btn-print" on:click={handlePrintReceipt}>
                                พิมพ์ใบเสร็จ
                            </button>
                        </div>
                        <div class="action-buttons-complete">
                            <button class="btn-complete" on:click={handleCompleteOrder}>
                                พร้อมรับอาหาร
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
        display: flex;
        justify-content: space-between;
        padding: 16px 20px;
        background: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
        font-weight: 600;
        font-size: 14px;
        color: #666;
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

    .status-active {
        color: #f57c00;
        font-weight: 600;
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
        color: #4caf50;
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

    .action-buttons-complete {
        display: flex;
        margin-top: 12px;
    }

    .btn-cancel,
    .btn-print {
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

    .btn-print {
        background: #666;
        color: white;
    }

    .btn-print:hover {
        background: #555;
    }

    .btn-complete {
        width: 100%;
        padding: 14px 24px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        cursor: pointer;
        transition: all 0.2s;
        background: #4caf50;
        color: white;
    }

    .btn-complete:hover {
        background: #45a049;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    /* Responsive */
    @media (max-width: 1400px) {
        .orders-container {
            grid-template-columns: 1fr;
        }
    }
</style>
