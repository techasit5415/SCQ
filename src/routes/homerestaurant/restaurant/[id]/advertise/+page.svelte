<script>
    import { goto } from "$app/navigation";
    import TopBar from '$lib/Components/restaurant/Topbar.svelte';
    import RestaurantSidebar from '$lib/Components/restaurant/RestaurantSidebar.svelte';

    export let data;
    export let form;

    let activeMenu = "advertise";

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
        // Navigate to restaurant page
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
    <TopBar title="Restaurant Panel - Advertise" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar 
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
                <span class="breadcrumb-item current">Advertise</span>
            </nav>
            <h1 class="page-title">Advertise</h1>
        </div>
        <div class="promote-content">

        </div>
    </main>
</div>

<body></body>

<style>
    /* Reset and Base */
    * {
        box-sizing: border-box;
    }

    body {
        background-color: #f5f5f5;
    }

    .restaurant-layout {
        /* min-height: 100vh; */
        background: #f5f5f5;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .logout {
        margin-top: auto;
        color: #d32f2f !important;
    }

    /* Main Content */
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

    /* Advertise หมวด */
    .promote-content {
        display: flex;
        flex-direction: column;
        width: 1500px;
        height: 700px;
        background-color: white;
        gap: 16px;
    }
</style>