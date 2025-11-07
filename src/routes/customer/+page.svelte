<script>
    import CustomerHeader from '$lib/Components/customer/TopbarCustomer.svelte';
    import RestaurantList from '$lib/Components/customer/RestaurantList.svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    export let data;
    

    
    let isMobile = false;
    
    // Check if device is mobile
    onMount(() => {
        const checkMobile = () => {
            isMobile = window.innerWidth < 768;
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
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
</style>