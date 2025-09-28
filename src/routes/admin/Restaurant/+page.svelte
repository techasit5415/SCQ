<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';

    export let data;

    // Active menu state
    let activeMenu = "manageRestaurant";
    
    // Search and filter states
    let searchQuery = '';
    let selectedType = 'all';
    
    // Reactive filtered restaurants
    $: filteredShops = (data?.shops || []).filter(shop => {
        const matchesSearch = searchQuery === '' || 
                            shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            shop.Type_Shop?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || shop.Type_Shop === selectedType;
        return matchesSearch && matchesType;
    });



    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        if (menu !== "manageRestaurant") {
            // Navigate to different pages based on menu selection
            switch(menu) {
                case "dashboard":
                    goto('/admin/dashboard');
                    break;
                case "manageUsers":
                    goto('/admin/manageUser');
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
    
    async function handleLogout() {
        try {
            await fetch('/logout');
            window.location.href = '/admin';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/admin';
        }
    }
    
    function handleViewRestaurant(shopId) {
        goto(`/admin/restaurant/${shopId}`);
    }
    
    function handleEditRestaurant(shopId) {
        goto(`/admin/restaurant/${shopId}/edit`);
    }
    
    function handleAddRestaurant() {
        goto('/admin/restaurant/AddRestaurant');
    }
    
    function getRestaurantTypeIcon(type) {
        switch (type?.toLowerCase()) {
            case 'อาหารญี่ปุ่น':
                return 'ramen_dining';
            case 'อาหารเกาหลี':
                return 'restaurant';
            case 'อาหารไทย':
                return 'rice_bowl';
            case 'อาหารจีน':
                return 'restaurant_menu';
            case 'อาหารฝรั่ง':
                return 'dining';
            case 'เครื่องดื่ม':
                return 'local_cafe';
            default:
                return 'restaurant';
        }
    }
    
    function getRestaurantTypeColor(type) {
        switch (type?.toLowerCase()) {
            case 'อาหารญี่ปุ่น':
                return '#e91e63';
            case 'อาหารเกาหลี':
                return '#f44336';
            case 'อาหารไทย':
                return '#ff9800';
            case 'อาหารจีน':
                return '#ffeb3b';
            case 'อาหารฝรั่ง':
                return '#4caf50';
            case 'เครื่องดื่ม':
                return '#2196f3';
            default:
                return '#9e9e9e';
        }
    }
    
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

<!-- Admin Layout -->
<div class="restaurant-page">
    <!-- Top Navigation -->
    <TopBar />
    
    <!-- Side Navigation -->
    <AdminSidebar activeMenu="manageRestaurant" />
    
    <!-- Main Content -->
    <div class="content">
        <!-- Breadcrumb and Title -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home / </span>
                <span class="breadcrumb-item current">Manage Restaurant</span>
            </div>
            <div class="page-title">
                <h1>Manage Restaurant</h1>
                <p>จัดการข้อมูลร้านค้าในระบบ</p>
            </div>
        </div>

        <!-- Restaurant Content -->
        <div class="restaurant-container">
            <!-- KPI Cards -->
            <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%)">
                    <span class="material-symbols-outlined">storefront</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">{data.restaurantStats?.totalRestaurants || 0}</div>
                    <div class="kpi-label">Total Restaurants</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%)">
                    <span class="material-symbols-outlined">check_circle</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">{data.restaurantStats?.activeRestaurants || 0}</div>
                    <div class="kpi-label">Active Restaurants</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%)">
                    <span class="material-symbols-outlined">new_releases</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">{data.restaurantStats?.newThisMonth || 0}</div>
                    <div class="kpi-label">New This Month</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)">
                    <span class="material-symbols-outlined">receipt_long</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">{data.restaurantStats?.totalOrders || 0}</div>
                    <div class="kpi-label">Total Orders</div>
                </div>
            </div>
        </div>

        <!-- Filters and Search -->
        <div class="filter-section">
            <div class="filter-controls">
                <div class="search-box">
                    <span class="material-symbols-outlined">search</span>
                    <input 
                        type="text" 
                        placeholder="Search restaurants..." 
                        bind:value={searchQuery}
                    />
                </div>
                
                <div class="type-filter">
                    <label for="typeFilter">Filter by Type:</label>
                    <select id="typeFilter" bind:value={selectedType}>
                        <option value="all">All Types</option>
                        <option value="อาหารญี่ปุ่น">อาหารญี่ปุ่น</option>
                        <option value="อาหารเกาหลี">อาหารเกาหลี</option>
                        <option value="อาหารไทย">อาหารไทย</option>
                        <option value="อาหารจีน">อาหารจีน</option>
                        <option value="อาหารฝรั่ง">อาหารฝรั่ง</option>
                        <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                    </select>
                </div>

                <button class="add-btn" on:click={handleAddRestaurant}>
                    <span class="material-symbols-outlined">add</span>
                    Add New Restaurant
                </button>
            </div>
            
            <div class="results-info">
                Showing {filteredShops.length} of {data.shops?.length || 0} restaurants
            </div>
        </div>

        <!-- Restaurant Cards -->
        <div class="restaurants-section">
            {#if filteredShops && filteredShops.length > 0}
                <div class="restaurant-cards">
                    {#each filteredShops as shop}
                        <div class="restaurant-card">
                            <div class="card-header">
                                <div class="restaurant-type" style="background-color: {getRestaurantTypeColor(shop.Type_Shop)}">
                                    <span class="material-symbols-outlined">{getRestaurantTypeIcon(shop.Type_Shop)}</span>
                                </div>
                                <div class="restaurant-status">
                                    <span class="status-badge" class:active={shop.Status !== false}>
                                        {shop.Status !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="card-body">
                                <h3 class="restaurant-name">{shop.name || 'ไม่มีชื่อร้าน'}</h3>
                                <div class="restaurant-type-text">{shop.Type_Shop || 'ไม่ระบุประเภท'}</div>
                                
                                <div class="restaurant-info">
                                    <div class="info-item">
                                        <span class="material-symbols-outlined">person</span>
                                        <span>{shop.expand?.User_Owner_ID?.name || 'ไม่มีข้อมูลเจ้าของ'}</span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="material-symbols-outlined">phone</span>
                                        <span>{shop.Phone || 'ไม่มีเบอร์โทร'}</span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="material-symbols-outlined">location_on</span>
                                        <span class="address-text">{shop.Addr || 'ไม่มีที่อยู่'}</span>
                                    </div>
                                    
                                    <div class="info-item">
                                        <span class="material-symbols-outlined">schedule</span>
                                        <span>เพิ่มเมื่อ {formatDate(shop.created)}</span>
                                    </div>
                                </div>
                                
                                {#if shop.Details}
                                    <div class="restaurant-description">
                                        <p>{shop.Details}</p>
                                    </div>
                                {/if}
                            </div>
                            
                            <div class="card-actions">
                                <button class="action-btn view" on:click={() => handleViewRestaurant(shop.id)}>
                                    <span class="material-symbols-outlined">visibility</span>
                                    View Details
                                </button>
                                <button class="action-btn edit" on:click={() => handleEditRestaurant(shop.id)}>
                                    <span class="material-symbols-outlined">edit</span>
                                    Edit
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="no-restaurants">
                    <div class="no-data-content">
                        <span class="material-symbols-outlined">store_mall_directory</span>
                        <div class="no-data-text">
                            <h3>No restaurants found</h3>
                            <p>There are no restaurants matching your search criteria.</p>
                            <button class="add-btn" on:click={handleAddRestaurant}>
                                <span class="material-symbols-outlined">add</span>
                                Add First Restaurant
                            </button>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
        </div>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

    :global(body) {
        background: #f5f7fa !important;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    :global(html) {
        overflow: hidden;
    }

    .restaurant-page {
        width: 100%;
        height: 100vh;
        position: relative;
        background: white;
        overflow: hidden;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .content {
        width: calc(100% - 256px);
        height: calc(100vh - 60px);
        margin-left: 256px;
        margin-top: 60px;
        background: #f5f7fa;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .header-section {
        width: 100%;
        padding: 20px;
        background: white;
        border-bottom: 1px #B4B5B7 solid;
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

    .restaurant-container {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        max-height: calc(100vh - 140px);
    }

    /* KPI Cards */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .kpi-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .kpi-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .kpi-icon .material-symbols-outlined {
        font-size: 24px;
    }

    .kpi-content {
        flex: 1;
    }

    .kpi-value {
        font-size: 32px;
        font-weight: 700;
        color: #333;
        line-height: 1;
        margin-bottom: 4px;
    }

    .kpi-label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
    }

    /* Filter Section */
    .filter-section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .filter-controls {
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 16px;
    }

    .search-box {
        display: flex;
        align-items: center;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 0 12px;
        min-width: 300px;
        flex: 1;
    }

    .search-box .material-symbols-outlined {
        color: #6c757d;
        margin-right: 8px;
    }

    .search-box input {
        border: none;
        background: none;
        outline: none;
        padding: 12px 0;
        font-size: 14px;
        color: #333;
        width: 100%;
    }

    .type-filter {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .type-filter label {
        font-size: 14px;
        font-weight: 500;
        color: #555;
    }

    .type-filter select {
        padding: 10px 16px;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        background: white;
        font-size: 14px;
        color: #333;
        cursor: pointer;
    }

    .add-btn {
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .add-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .results-info {
        font-size: 14px;
        color: #666;
        font-weight: 500;
    }

    /* Restaurant Cards */
    .restaurants-section {
        margin-bottom: 30px;
    }

    .restaurant-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 24px;
    }

    .restaurant-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border: 1px solid #f0f0f0;
    }

    .restaurant-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        border-bottom: 1px solid #dee2e6;
    }

    .restaurant-type {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
    }

    .restaurant-type .material-symbols-outlined {
        font-size: 24px;
    }

    .restaurant-status {
        display: flex;
        align-items: center;
    }

    .status-badge {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: #dc3545;
        color: white;
    }

    .status-badge.active {
        background: #28a745;
    }

    .card-body {
        padding: 24px;
    }

    .restaurant-name {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin: 0 0 8px 0;
        line-height: 1.3;
    }

    .restaurant-type-text {
        font-size: 14px;
        color: #666;
        font-weight: 500;
        margin-bottom: 20px;
        padding: 4px 12px;
        background: #f8f9fa;
        border-radius: 6px;
        display: inline-block;
    }

    .restaurant-info {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
    }

    .info-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 14px;
        color: #555;
    }

    .info-item .material-symbols-outlined {
        font-size: 18px;
        color: #666;
        margin-top: 1px;
        flex-shrink: 0;
    }

    .address-text {
        line-height: 1.4;
    }

    .restaurant-description {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
    }

    .restaurant-description p {
        margin: 0;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
    }

    .card-actions {
        display: flex;
        gap: 12px;
        padding: 20px;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
    }

    .action-btn {
        flex: 1;
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .action-btn.view {
        background: linear-gradient(135deg, #17a2b8, #138496);
        color: white;
    }

    .action-btn.view:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
    }

    .action-btn.edit {
        background: linear-gradient(135deg, #ffc107, #e0a800);
        color: #333;
    }

    .action-btn.edit:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
    }

    /* No Restaurants State */
    .no-restaurants {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .no-data-content {
        text-align: center;
        max-width: 400px;
        padding: 40px;
    }

    .no-data-content .material-symbols-outlined {
        font-size: 64px;
        color: #dee2e6;
        margin-bottom: 20px;
    }

    .no-data-text h3 {
        font-size: 24px;
        color: #333;
        margin: 0 0 12px 0;
        font-weight: 600;
    }

    .no-data-text p {
        font-size: 16px;
        color: #666;
        margin: 0 0 30px 0;
        line-height: 1.5;
    }

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
        .main-content {
            margin-left: 0;
            padding: 20px;
        }
        
        .restaurant-cards {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }
    }

    @media (max-width: 768px) {
        .filter-controls {
            flex-direction: column;
            align-items: stretch;
        }

        .search-box {
            min-width: auto;
        }

        .type-filter {
            justify-content: space-between;
        }

        .restaurant-cards {
            grid-template-columns: 1fr;
        }

        .kpi-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }

        .card-actions {
            flex-direction: column;
        }
    }

    @media (max-width: 480px) {
        .main-content {
            padding: 16px;
        }

        .page-header h2 {
            font-size: 24px;
        }

        .kpi-grid {
            grid-template-columns: 1fr;
        }

        .restaurant-name {
            font-size: 18px;
        }
    }
</style>