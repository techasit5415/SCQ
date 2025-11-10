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

    $: selectedOrder = orders[selectedOrderIndex];
    $: orderNumber = selectedOrder?.id || "N/A";
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
        goto(`/restaurant/${shopId}/order/${tab}`);
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
            toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
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

    function handlePrintReceipt() {
        if (!selectedOrder) return;
        
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) return;

        const currentDateTime = new Date().toLocaleString('th-TH');
        const shopName = (data.shop && data.shop.name) ? data.shop.name : 'ร้านอาหาร';
        const shopPhone = (data.shop && data.shop.Phone) ? data.shop.Phone : '';

        let menuDetailsHtml = '';
        Object.values(menuCount).forEach(function(item) {
            const menuItem = item.item;
            const count = item.count;
            
            let optionsHtml = '';
            if (menuItem.option && Array.isArray(menuItem.option) && menuItem.option.length > 0) {
                menuItem.option.forEach(function(opt) {
                    optionsHtml += '<div style="font-size: 11px; color: #666; margin-left: 15px;">- ' + opt + '</div>';
                });
            }
            
            menuDetailsHtml += '<div style="padding: 8px 0; border-bottom: 1px dashed #ddd;">';
            menuDetailsHtml += '<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">';
            menuDetailsHtml += '<div style="font-weight: 500; font-size: 13px;">' + menuItem.name + '</div>';
            menuDetailsHtml += '<div style="font-weight: 600; font-size: 13px;">฿' + (menuItem.Price * count).toFixed(2) + '</div>';
            menuDetailsHtml += '</div>';
            menuDetailsHtml += '<div style="font-size: 11px; color: #666;">จำนวน: ' + count + '</div>';
            menuDetailsHtml += optionsHtml;
            menuDetailsHtml += '</div>';
        });

        let html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
        html += '<title>ใบเสร็จรับเงิน - Order #' + orderNumber + '</title>';
        html += '<style>';
        html += '* { margin: 0; padding: 0; box-sizing: border-box; }';
        html += 'body { font-family: "Courier New", monospace, "Noto Sans Thai", sans-serif; background: white; }';
        html += '.receipt { width: 80mm; max-width: 100%; margin: 0 auto; padding: 10mm; background: white; }';
        html += '.logo-container { text-align: center; margin-bottom: 15px; }';
        html += '.logo { width: 80px; height: 80px; margin: 0 auto; }';
        html += '.header { text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #333; }';
        html += '.header h1 { font-size: 18px; font-weight: 700; margin: 8px 0 5px 0; color: #333; }';
        html += '.header p { font-size: 12px; color: #666; margin: 2px 0; line-height: 1.4; }';
        html += '.info-row { display: flex; justify-content: space-between; font-size: 11px; margin: 5px 0; }';
        html += '.info-label { color: #666; }';
        html += '.info-value { font-weight: 600; color: #333; }';
        html += '.divider { border-top: 1px dashed #333; margin: 10px 0; }';
        html += '.section-title { font-size: 12px; font-weight: 700; margin: 10px 0 8px 0; text-align: center; text-transform: uppercase; }';
        html += '.total-section { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #333; }';
        html += '.total-row { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; }';
        html += '.total-row.grand-total { font-size: 16px; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px solid #333; }';
        html += '.payment-section { margin-top: 10px; padding: 8px; background: #f5f5f5; text-align: center; font-size: 11px; }';
        html += '.payment-status { font-weight: 700; color: #2e7d32; margin-bottom: 5px; }';
        html += '.footer { margin-top: 15px; padding-top: 10px; border-top: 1px dashed #333; text-align: center; }';
        html += '.footer p { font-size: 10px; color: #666; margin: 3px 0; }';
        html += '.footer .thank-you { font-size: 12px; font-weight: 600; color: #333; margin-bottom: 5px; }';
        html += '@media print { ';
        html += 'body { margin: 0; padding: 0; }';
        html += '.receipt { width: 80mm; padding: 5mm; }';
        html += '@page { size: 80mm auto; margin: 0; }';
        html += '}';
        html += '</style></head><body><div class="receipt">';
        
        // Logo
        html += '<div class="logo-container">';
        html += '<img src="/SCQ_logo.png" alt="SCQ Logo" class="logo" onerror="this.style.display=\'none\'">';
        html += '</div>';
        
        // Header
        html += '<div class="header">';
        html += '<h1>SCQ</h1>';
        html += '<p>ใบเสร็จรับเงิน</p>';
        html += '<p style="font-size: 11px; margin-top: 5px;">' + shopName + '</p>';
        if (shopPhone && shopPhone !== '') {
            html += '<p style="font-size: 11px;">โทร: ' + shopPhone + '</p>';
        }
        html += '</div>';
        
        // Order Info
        html += '<div class="info-row"><span class="info-label">เลขที่:</span><span class="info-value">' + selectedOrder.id + '</span></div>';
        html += '<div class="info-row"><span class="info-label">วันที่:</span><span class="info-value">' + orderDate + '</span></div>';
        html += '<div class="info-row"><span class="info-label">ลูกค้า:</span><span class="info-value">' + customerName + '</span></div>';
        
        if (preparationStart) {
            html += '<div class="info-row"><span class="info-label">เริ่มเตรียม:</span><span class="info-value">' + preparationStart + '</span></div>';
        }
        
        // Customer Notes
        if (selectedOrder.notes && selectedOrder.notes.length > 0) {
            html += '<div class="divider"></div>';
            html += '<div style="margin: 10px 0; padding: 8px; background: #f9f9f9; border-radius: 4px;">';
            html += '<div style="font-weight: 700; font-size: 12px; margin-bottom: 5px; color: #333;">หมายเหตุจากลูกค้า:</div>';
            selectedOrder.notes.forEach(function(note) {
                html += '<div style="font-size: 11px; color: #555; line-height: 1.4; margin: 3px 0; font-weight: 500;">• ' + note.Details + '</div>';
            });
            html += '</div>';
        }
        
        html += '<div class="divider"></div>';
        
        // Menu Items
        html += '<div class="section-title">รายการอาหาร</div>';
        html += menuDetailsHtml;
        
        // Total
        html += '<div class="total-section">';
        html += '<div class="total-row"><span>รวมเงิน</span><span>฿' + totalAmount.toFixed(2) + '</span></div>';
        html += '<div class="total-row"><span>ส่วนลด</span><span>฿0.00</span></div>';
        html += '<div class="total-row grand-total"><span>ยอดรวมทั้งสิ้น</span><span>฿' + totalAmount.toFixed(2) + '</span></div>';
        html += '</div>';
        
        // Payment Info
        html += '<div class="payment-section">';
        html += '<div class="payment-status">✓ ชำระเงินแล้ว / PAID</div>';
        html += '<div>วิธีชำระ: QR Code</div>';
        html += '<div>สถานะ: กำลังเตรียมอาหาร</div>';
        html += '</div>';
        
        // Footer
        html += '<div class="footer">';
        html += '<p class="thank-you">ขอบคุณที่ใช้บริการ</p>';
        html += '<p>SCQ - Student Canteen Queue</p>';
        html += '<p style="margin-top: 8px;">พิมพ์: ' + currentDateTime + '</p>';
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
    <TopBar title="Active Orders - {data.shop?.name || 'Restaurant'}" logoSrc="/SCQ_logo.png" />
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
                
                <div class="order-list-scroll">
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
                                        <div class="menu-name">{item.name} x{count}</div>
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
