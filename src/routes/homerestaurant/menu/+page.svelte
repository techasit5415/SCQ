<script>
    import { goto } from "$app/navigation";
    import TopBar from '$lib/ComponentsShop/Topbar.svelte';
    import RestaurantSidebar from '$lib/ComponentsShop/RestaurantSidebar.svelte';

    export let data;
    export let form;

    let activeMenu = "menu";

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

<!-- on:menuChange={handleMenuChange} -->
 
<!-- หน้า Dashboard ร้านอาหาร -->
<div id="restaurant-layout" class="restaurant-layout">
    <!-- Sidebar -->
    <TopBar title="Restaurant Panel - Menu" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar 
    {activeMenu} 
    
    on:viewRestaurant={handleViewRestaurant}
    on:logout={handleLogout}
/>
    <!-- Main Content -->
    <main class="main-content">
        <!-- Dashboard -->
        <div class="page-header">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Menu</span>
            </nav>
            <h2>Menu</h2>
        </div>
        <div class="menu-content">
            <div class="menu-item">
                <div class="item-btn-content">
                    <button type="button" class="add-item-btn">
                        <span class="material-symbols-outlined" style="color: white;"> add_2 </span>
                        <span class="btn-text" style="color: white; font-size: 20px">Add Item</span>
                    </button>
                    <input type="text" 
                        placeholder="Search"
                        name="search"
                        class="search-item-btn"
                    />
                </div>
                <div class="item-header-title">
                    <span class="title-name">#</span>
                    <span class="title-name">Image</span>
                    <span class="title-name">Name</span>
                    <span class="title-name">Category</span>
                    <span class="title-name">Price</span>
                    <span class="title-name">Status</span>
                    <span class="title-name">Action</span>
                </div>
                <div class="line1"></div>
            </div>
            
            <div class="menu-category">
                <div class="category-btn-content">
                    <button type="button" class="add-category-btn">
                        <span class="material-symbols-outlined" style="color: white;"> add_2 </span>
                        <span class="btn-text" style="color: white; font-size: 20px">Add Category</span>
                    </button>
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
        padding-left: 30px;
        padding-top: 30px;
        padding-right: 22px;
        /* min-height: calc(100vh - 60px); */
    }

    /* Page Header */
    .page-header {
        margin: -30px;
        margin-left: -40px;
        padding: 30px 40px;
        background-color: white;
        margin-bottom: 30px;
        border-bottom: 1px solid #e0e0e0;
    }

    .breadcrumb {
        font-size: 13px;
        color: #888;
        margin-bottom: 8px;
    }

    .breadcrumb-item.current {
        color: #333;
    }

    .breadcrumb-separator {
        margin: 0 8px;
    }
    
    .page-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #333;
    }

    /* หน้า Menu */
    .menu-content {
        display: flex;
        gap: 24px;
        
    }

    /* หมวด Item */
    .menu-item {
        display: flex;
        flex-direction: column;
        width: 1000px;
        height: 700px;
        margin-top: 20px;
        padding-right: 16px;
        padding-bottom: 20px;
        padding-left: 16px;
        background-color: rgb(255, 255, 255);
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 16px;
        gap: 16px;
    }
    .item-btn-content {
        display: flex;
        justify-content: space-between;
        background-color: #ffffff;
    }
    .add-item-btn {
        display: flex;
        width: 200px;
        height: 48px;
        margin-top: 20px;
        background-color: orange;
        border-radius: 16px;
        align-items: center;
        justify-content: center;          /*  จัดแนวนอน */
        border: none;
        gap: 16px;
    }
    .search-item-btn {
        display: flex;
        width: 200px;
        height: 48px;
        margin-top: 20px;
        padding-left: 10px;
        border-radius: 16px;
        border: 1px solid #ccc;
    }
    .item-header-title {
        display: flex;
        gap:10px;
        justify-content: space-between;
    }
    .title-name {
        width: 90px;
        height: 45px;
        font-size: 16px;
        align-content: center;
        text-align: center;
    }
    .line1 {
        height: 1px;
        background-color: #494A50;
    }

    /* หมวด category */
    .menu-category {
        width: 1000px;
        height: 700px;
        margin-top: 20px;
        padding-right: 16px;
        padding-bottom: 20px;
        padding-left: 16px;
        background-color: rgb(255, 255, 255);
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 16px;
    }
    .category-btn-content {
        display: flex;
        justify-content: left;
        background-color: #ffffff;
    }
    .add-category-btn {
        display: flex;
        width: 200px;
        height: 48px;
        margin-top: 20px;
        background-color: orange;
        border-radius: 16px;
        align-items: center;
        justify-content: center;          /*  จัดแนวนอน */
        border: none;
        gap: 16px;
    }
</style>