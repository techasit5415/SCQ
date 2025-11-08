<script>
    import CustomerHeader from '$lib/Components/customer/TopbarCustomer.svelte';
    import RestaurantList from '$lib/Components/customer/RestaurantList.svelte';
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { startNotificationPolling, stopNotificationPolling, fetchUnreadCount } from '$lib/stores/notifications';
    import { showToast } from '$lib/stores/toast';
    
    export let data;
    
    let isMobile = false;
    
    // Notification popup state
    let showOrderCompletePopup = false;
    let completedOrderData = null;
    
    // Handle order completed notification
    function handleOrderCompleted(order) {
        console.log('🎉 Order completed notification:', order);
        console.log('Setting showOrderCompletePopup to TRUE');
        
        completedOrderData = order;
        showOrderCompletePopup = true;
        
        console.log('Popup state:', { showOrderCompletePopup, completedOrderData });
        
        // แสดง toast notification
        showToast(`ออเดอร์จาก ${order.shopName} เสร็จแล้ว! ${order.queueNumber ? `คิวที่ ${order.queueNumber}` : ''}`, 'success');
        
        // เล่นเสียงแจ้งเตือน (ถ้ามี)
        playNotificationSound();
        
        // อัปเดต unread count
        fetchUnreadCount();
        
        // ไม่ปิด popup อัตโนมัติ - ให้ user ปิดเองเพื่อยืนยันว่าเห็นแล้ว
    }
    
    function playNotificationSound() {
        // TODO: Add notification sound file to /static/notification.mp3
        // Uncomment when sound file is ready:
        /*
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Cannot play sound:', err));
        } catch (err) {
            console.log('Notification sound not available');
        }
        */
    }
    
    function closePopup() {
        showOrderCompletePopup = false;
    }
    
    function viewCompletedOrder() {
        showOrderCompletePopup = false;
        goto('/customer/orders');
    }
    
    // Check if device is mobile
    onMount(() => {
        const checkMobile = () => {
            isMobile = window.innerWidth < 768;
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // เริ่ม polling notifications และ completed orders
        startNotificationPolling(handleOrderCompleted);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    });
    
    onDestroy(() => {
        // หยุด polling เมื่อออกจากหน้า
        stopNotificationPolling();
    });
    
    // Event handlers
    function handleNotification() {
        console.log('Notification clicked');
        // Navigate to notifications page
        goto('/customer/notifications');
    }
    
    function handleBookmark() {
        console.log('View orders clicked');
        // Navigate to orders history page
        goto('/customer/orders');
    }
    
    function handleProfile() {
        console.log('Profile clicked');
        // Navigate to profile page
        goto('/customer/profile');
    }
    
    function handleLogout() {
        console.log('Logout clicked');
        // ไปหน้า logout โดยตรง ไม่ต้อง confirm
        goto('/logout');
    }
    
    function handleRestaurantSelect(event) {
        const { restaurant } = event.detail;
        console.log('Selected restaurant:', restaurant);
        
        // Navigate to restaurant detail page
        if (restaurant.id) {
            goto(`/customer/restaurant/${restaurant.id}`);
        }
    }
    
    function handleRetry() {
        // Reload the page to retry loading data
        window.location.reload();
    }
</script>

<div class="customer-layout" class:mobile={isMobile}>
    <CustomerHeader 
        {isMobile}
        on:notification={handleNotification}
        on:bookmark={handleBookmark}
        on:profile={handleProfile}
        on:logout={handleLogout}
    />
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="content-container">
            <!-- Restaurant List -->
            <RestaurantList 
                restaurants={data.restaurants || []}
                promotedShopIds={data.promotedShopIds || []}
                loading={false}
                error={data.success === false ? data.error : null}
                on:restaurantSelect={handleRestaurantSelect}
                on:retry={handleRetry}
            />
        </div>
    </main>
</div>

<!-- Order Completed Popup -->
{#if showOrderCompletePopup && completedOrderData}
    <div class="popup-overlay" on:click={closePopup}>
        <div class="popup-content order-complete-popup" on:click|stopPropagation>
            <button class="popup-close" on:click={closePopup}>
                <span class="material-symbols-outlined">close</span>
            </button>
            
            <div class="popup-icon success">
                <span class="material-symbols-outlined">check_circle</span>
            </div>
            
            <h2 class="popup-title">ออเดอร์เสร็จแล้ว!</h2>
            
            <div class="popup-body">
                <p class="shop-name">{completedOrderData.shopName}</p>
                
                {#if completedOrderData.queueNumber}
                    <div class="queue-number">
                        <span class="label">คิวที่</span>
                        <span class="number">{completedOrderData.queueNumber}</span>
                    </div>
                {/if}
                
                <div class="order-details">
                    <div class="detail-item">
                        <span class="material-symbols-outlined">restaurant</span>
                        <span>{completedOrderData.menuCount} รายการ</span>
                    </div>
                    <div class="detail-item">
                        <span class="material-symbols-outlined">payments</span>
                        <span>฿{completedOrderData.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
                
                <p class="popup-message">
                    สามารถไปรับอาหารได้แล้วค่ะ
                </p>
            </div>
            
            <div class="popup-actions">
                <button class="btn-secondary" on:click={closePopup}>
                    ปิด
                </button>
                <button class="btn-primary" on:click={viewCompletedOrder}>
                    ดูรายละเอียด
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .customer-layout {
        min-height: 100vh;
        background: #f9f9f9;
        font-family: 'Noto Sans Thai', sans-serif;
    }
    
    .main-content {
        padding-top: 70px; /* Account for fixed header */
        padding: 90px 20px 20px;
        max-width: 1200px;
        margin: 0 auto;
        min-height: calc(100vh - 70px);
    }
    
    /* Queue Section Styles */
    .queue-section {
        margin-bottom: 25px;
    }
    
    .queue-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 25px;
        color: white;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        margin-bottom: 20px;
    }
    
    .queue-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
    }
    
    .queue-icon {
        font-size: 28px;
    }
    
    .queue-header h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
    }
    
    .queue-stats {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .stat-item {
        text-align: center;
        flex: 1;
    }
    
    .stat-number {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 5px;
        color: #fff;
    }
    
    .stat-label {
        font-size: 12px;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .stat-divider {
        width: 1px;
        height: 40px;
        background: rgba(255, 255, 255, 0.3);
        margin: 0 15px;
    }
    
    .user-orders {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 20px;
        backdrop-filter: blur(10px);
    }
    
    .user-orders h4 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: 600;
    }
    
    .order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .order-item:last-child {
        border-bottom: none;
    }
    
    .order-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .order-id {
        font-family: monospace;
        font-size: 14px;
        font-weight: 600;
    }
    
    .order-shop {
        font-size: 12px;
        opacity: 0.8;
    }
    
    .order-status {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-pending {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
        border: 1px solid rgba(255, 193, 7, 0.3);
    }
    
    .status-in-progress {
        background: rgba(0, 123, 255, 0.2);
        color: #007bff;
        border: 1px solid rgba(0, 123, 255, 0.3);
    }
    
    .status-completed {
        background: rgba(40, 167, 69, 0.2);
        color: #28a745;
        border: 1px solid rgba(40, 167, 69, 0.3);
    }
    
    .content-container {
        width: 100%;
    }
    
    /* Welcome Section */
    .welcome-section {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .welcome-section h2 {
        font-size: 28px;
        color: #333;
        margin: 0 0 10px 0;
        font-weight: 600;
    }
    
    .welcome-section p {
        font-size: 16px;
        color: #ff8c00;
        margin: 0;
    }
    
    /* Mobile Responsive */
    .customer-layout.mobile .main-content {
        padding: 80px 15px 20px;
    }
    
    /* Tablet Responsive */
    @media (max-width: 768px) {
        .main-content {
            padding: 80px 15px 20px;
        }
        
        .welcome-section {
            margin-bottom: 30px;
            padding: 25px 15px;
        }
        
        .welcome-section h2 {
            font-size: 24px;
        }
        
        .welcome-section p {
            font-size: 15px;
        }
    }
    
    /* Mobile Responsive */
    @media (max-width: 480px) {
        .main-content {
            padding: 75px 10px 15px;
        }
        
        .welcome-section {
            margin-bottom: 25px;
            padding: 20px 15px;
            border-radius: 8px;
        }
        
        .welcome-section h2 {
            font-size: 22px;
            margin-bottom: 8px;
        }
        
        .welcome-section p {
            font-size: 14px;
        }
    }
    
    .content-container {
        width: 100%;
    }
    
    /* Welcome Section */
    .welcome-section {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .welcome-section h2 {
        font-size: 28px;
        color: #333;
        margin: 0 0 10px 0;
        font-weight: 600;
    }
    
    .welcome-section p {
        font-size: 16px;
        color: #ff8c00;
        margin: 0;
    }
    
    /* Mobile Responsive */
    .customer-layout.mobile .main-content {
        padding: 80px 15px 20px;
    }
    
    /* Tablet Responsive */
    @media (max-width: 768px) {
        .main-content {
            padding: 80px 15px 20px;
        }
        
        .welcome-section {
            margin-bottom: 30px;
            padding: 25px 15px;
        }
        
        .welcome-section h2 {
            font-size: 24px;
        }
        
        .welcome-section p {
            font-size: 15px;
        }
        
        .content-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .content-card {
            padding: 25px 20px;
        }
        
        .content-card h3 {
            font-size: 18px;
        }
    }
    
    /* Mobile Responsive */
    @media (max-width: 480px) {
        .main-content {
            padding: 75px 10px 15px;
        }
        
        .welcome-section {
            margin-bottom: 25px;
            padding: 20px 15px;
            border-radius: 8px;
        }
        
        .welcome-section h2 {
            font-size: 22px;
            margin-bottom: 8px;
        }
        
        .welcome-section p {
            font-size: 14px;
        }
        
        .content-grid {
            gap: 12px;
        }
        
        .content-card {
            padding: 20px 15px;
            border-radius: 8px;
        }
        
        .content-card h3 {
            font-size: 16px;
            margin-bottom: 12px;
        }
        
        .content-card p {
            font-size: 13px;
        }
    }
    
    /* Extra Small Mobile */
    @media (max-width: 360px) {
        .main-content {
            padding: 70px 8px 15px;
        }
        
        .welcome-section {
            padding: 18px 12px;
        }
        
        .content-card {
            padding: 18px 12px;
        }
    }
    
    /* Touch-friendly interactions on mobile */
    @media (hover: none) and (pointer: coarse) {
        .content-card:hover {
            transform: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .content-card:active {
            transform: scale(0.98);
            transition: transform 0.1s ease;
        }
    }

    /* Notification Popup Styles */
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .popup-content {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        width: 90%;
        animation: slideUp 0.3s ease;
        position: relative;
    }

    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .order-complete-popup {
        padding: 30px;
    }

    .popup-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        color: #999;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .popup-close:hover {
        background: #f0f0f0;
        color: #333;
    }

    .popup-icon {
        font-size: 64px;
        text-align: center;
        margin-bottom: 15px;
    }

    .popup-icon.success {
        color: #10b981;
    }

    .popup-title {
        font-size: 24px;
        font-weight: 600;
        text-align: center;
        color: #333;
        margin-bottom: 20px;
    }

    .popup-body {
        text-align: center;
    }

    .shop-name {
        font-size: 18px;
        color: #666;
        margin-bottom: 15px;
    }

    .queue-number {
        display: inline-block;
        background: linear-gradient(135deg, #f5a662 0%, #d97700 100%);
        color: white;
        font-size: 32px;
        font-weight: 700;
        padding: 15px 30px;
        border-radius: 12px;
        margin-bottom: 20px;
    }

    .order-details {
        background: #f9f9f9;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }

    .detail-item:last-child {
        border-bottom: none;
    }

    .detail-label {
        color: #666;
        font-size: 14px;
    }

    .detail-value {
        color: #333;
        font-weight: 600;
        font-size: 14px;
    }

    .order-message {
        color: #10b981;
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 20px;
    }

    .popup-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
    }

    .btn-primary, .btn-secondary {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .btn-primary {
        background: linear-gradient(135deg, #f5a662 0%, #d97700 100%);
        color: white;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245, 166, 98, 0.4);
    }

    .btn-secondary {
        background: #f0f0f0;
        color: #666;
    }

    .btn-secondary:hover {
        background: #e0e0e0;
    }

    /* Mobile responsive for popup */
    @media (max-width: 480px) {
        .popup-content {
            max-width: 90%;
        }

        .order-complete-popup {
            padding: 25px 20px;
        }

        .popup-title {
            font-size: 20px;
        }

        .shop-name {
            font-size: 16px;
        }

        .queue-number {
            font-size: 28px;
            padding: 12px 24px;
        }

        .popup-actions {
            flex-direction: column;
        }

        .btn-primary, .btn-secondary {
            width: 100%;
        }
    }
</style>