<script>
    import CustomerHeader from '$lib/components/customer/TopbarCustomer.svelte';
    import RestaurantList from '$lib/components/customer/RestaurantList.svelte';
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
    
    function handleRestaurantSelect(event) {
        const { restaurant } = event.detail;
        console.log('Selected restaurant:', restaurant);
        
        // Navigate to restaurant detail page
        if (restaurant.id) {
            goto(`/homerestaurant/${restaurant.id}`);
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
    />
    
    <!-- Main Content -->
    <main class="main-content">
        <div class="content-container">

            
            <!-- Restaurant List -->
            <RestaurantList 
                restaurants={data.restaurants || []}
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