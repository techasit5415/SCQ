<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';

    export let data;

    // Active menu state - this should be restaurant detail view
    let activeMenu = `restaurant-${data.restaurant?.id}`;
    
    // Reactive statement to update activeMenu when data changes
    $: if (data.restaurant?.id) {
        activeMenu = `restaurant-${data.restaurant.id}`;
    }
    
    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        // Handle special cases that sidebar doesn't handle
        console.log('Menu change:', menu);
    }
    
    function handleViewRestaurant(event) {
        const shopId = event.detail;
        // This is now handled by sidebar component
        console.log('View restaurant:', shopId);
    }
    
    async function handleLogout() {
        try {
            await fetch('/logout');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }
    
    function handleDeleteRestaurant(restaurantId) {
        console.log('Delete restaurant:', restaurantId);
        // Implement restaurant delete functionality
    }

    function handlePrintReport() {
        // Create a printable version of the restaurant report
        const printWindow = window.open('', '_blank');
        const restaurant = data.restaurant;
        const totalSales = data.totalSales || 0;
        const analytics = data.analytics || {};
        const recentOrders = data.recentOrders || [];
        const popularMenus = data.popularMenus || [];
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Restaurant Report - ${restaurant.name}</title>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: 'Noto Sans Thai', Arial, sans-serif; 
                        margin: 20px; 
                        color: #333;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #FF8C00; 
                        padding-bottom: 20px; 
                        margin-bottom: 30px;
                    }
                    .restaurant-name { 
                        color: #FF8C00; 
                        font-size: 28px; 
                        font-weight: bold; 
                    }
                    .section { 
                        margin-bottom: 30px; 
                        page-break-inside: avoid;
                    }
                    .section h3 { 
                        color: #FF8C00; 
                        border-bottom: 1px solid #ddd; 
                        padding-bottom: 5px;
                    }
                    .info-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 20px; 
                        margin-bottom: 20px;
                    }
                    .info-item { 
                        margin-bottom: 10px; 
                    }
                    .info-label { 
                        font-weight: bold; 
                        color: #666; 
                    }
                    .analytics-grid { 
                        display: grid; 
                        grid-template-columns: repeat(4, 1fr); 
                        gap: 15px; 
                        margin-bottom: 20px;
                    }
                    .analytics-card { 
                        border: 1px solid #ddd; 
                        padding: 15px; 
                        text-align: center; 
                        border-radius: 8px;
                    }
                    .analytics-value { 
                        font-size: 24px; 
                        font-weight: bold; 
                        color: #FF8C00; 
                    }
                    .order-item, .menu-item { 
                        border: 1px solid #eee; 
                        padding: 10px; 
                        margin-bottom: 10px; 
                        border-radius: 5px;
                    }
                    .print-date { 
                        text-align: right; 
                        color: #666; 
                        font-size: 12px; 
                        margin-top: 30px;
                    }
                    @media print {
                        body { margin: 0; }
                        .section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="restaurant-name">${restaurant.name}</div>
                    <div>Restaurant Detail Report</div>
                </div>

                <div class="section">
                    <h3>Basic Information</h3>
                    <div class="info-grid">
                        <div>
                            <div class="info-item">
                                <span class="info-label">Restaurant ID:</span> ${restaurant.id}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Type:</span> ${restaurant.Type_Shop || 'N/A'}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Phone:</span> ${restaurant.Phone || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div class="info-item">
                                <span class="info-label">Address:</span> ${restaurant.Addr || 'N/A'}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Created:</span> ${new Date(restaurant.created).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Description:</span> ${restaurant.Details || 'No description provided'}
                    </div>
                </div>

                <div class="section">
                    <h3>Analytics Overview</h3>
                    <div class="analytics-grid">
                        <div class="analytics-card">
                            <div>Total Sales</div>
                            <div class="analytics-value">฿${totalSales.toLocaleString()}</div>
                        </div>
                        <div class="analytics-card">
                            <div>Total Orders</div>
                            <div class="analytics-value">${analytics.totalOrders || 0}</div>
                        </div>
                        <div class="analytics-card">
                            <div>Completed Orders</div>
                            <div class="analytics-value">${analytics.completedOrders || 0}</div>
                        </div>
                        <div class="analytics-card">
                            <div>Total Menus</div>
                            <div class="analytics-value">${data.menus?.length || 0}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3>Recent Orders</h3>
                    ${recentOrders.length > 0 ? 
                        recentOrders.slice(0, 10).map(order => `
                            <div class="order-item">
                                <strong>Order #${order.id.slice(-8)}</strong> - 
                                Status: ${order.Status} - 
                                Amount: ฿${order.Total_Amount?.toLocaleString() || '0'} - 
                                Date: ${new Date(order.created).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        `).join('') : 
                        '<p>No recent orders</p>'
                    }
                </div>

                <div class="section">
                    <h3>Popular Menus</h3>
                    ${popularMenus.length > 0 ? 
                        popularMenus.map(menu => `
                            <div class="menu-item">
                                <strong>${menu.menuName}</strong> - 
                                Orders: ${menu.totalOrdered} - 
                                ${menu.price ? `Price: ฿${menu.price}` : 'Price: N/A'}
                            </div>
                        `).join('') : 
                        '<p>No popular menus data</p>'
                    }
                </div>

                <div class="print-date">
                    Report generated on: ${new Date().toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
</script>

<!-- Admin Layout -->
<div class="admin-layout">
    <TopBar title="Admin Panel - Restaurant Detail" logoSrc="/SCQ_logo.png" />
    
    <AdminSidebar 
        {activeMenu} 
        shops={data.shops || []}
        on:menuChange={handleMenuChange}
        on:viewRestaurant={handleViewRestaurant}
        on:logout={handleLogout}
    />

    <!-- Main Content -->
    <main class="main-content">
        <!-- Header Section -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home / </span>
                <span class="breadcrumb-item">Manage Restaurant / </span>
                <span class="breadcrumb-item current">Restaurant Detail</span>
            </div>
            <div class="page-title">
                <h1>{data.restaurant.name} - Details</h1>
                <p>รายละเอียดและข้อมูลของร้านอาหาร</p>
            </div>
        </div>

        <!-- Restaurant Detail Page -->
        {#if data.restaurant}

            <div class="restaurant-detail-section">
                <div class="detail-card">
                    <div class="detail-header">
                        <div class="restaurant-avatar">
                            <span class="material-symbols-outlined">storefront</span>
                        </div>
                        <div class="restaurant-info">
                            <h3>{data.restaurant.name}</h3>
                            <p class="restaurant-type">{data.restaurant.Type_Shop}</p>
                        </div>
                        <div class="detail-actions">
                            <button class="btn-edit" on:click={() => goto(`/admin/restaurant/${data.restaurant.id}/edit`)}>
                                <span class="material-symbols-outlined">edit</span>
                                Edit
                            </button>
                        </div>
                    </div>

                    <div class="detail-content">
                        <div class="detail-row">
                            <div class="detail-item">
                                <label>Restaurant ID</label>
                                <p>{data.restaurant.id}</p>
                            </div>
                            <div class="detail-item">
                                <label>Phone Number</label>
                                <p>{data.restaurant.Phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div class="detail-row">
                            <div class="detail-item">
                                <label>Owner</label>
                                <p>
                                    {#if data.users}
                                        {#each data.users as user}
                                            {#if user.id === data.restaurant.User_Owner_ID}
                                                {user.name} ({user.email})
                                            {/if}
                                        {/each}
                                    {/if}
                                </p>
                            </div>
                            <div class="detail-item">
                                <label>Date Added</label>
                                <p>{new Date(data.restaurant.created).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                            </div>
                        </div>

                        <div class="detail-item full-width">
                            <label>Address</label>
                            <p>{data.restaurant.Addr || 'No address provided'}</p>
                        </div>

                        <div class="detail-item full-width">
                            <label>Description</label>
                            <p>{data.restaurant.Details || 'No description provided'}</p>
                        </div>
                    </div>
                </div>

                <!-- Analytics Section - Separate Card -->
                <div class="detail-card">
                    <div class="section-header">
                        <h3>Analytics Overview</h3>
                    </div>
                    <div class="analytics-grid">
                        <div class="analytics-card sales">
                            <div class="analytics-icon">
                                <span class="material-symbols-outlined">payments</span>
                            </div>
                            <div class="analytics-content">
                                <h4>Total Sales</h4>
                                <div class="analytics-value">฿{data.totalSales?.toLocaleString() || '0'}</div>
                            </div>
                        </div>
                        
                        <div class="analytics-card orders">
                            <div class="analytics-icon">
                                <span class="material-symbols-outlined">receipt_long</span>
                            </div>
                            <div class="analytics-content">
                                <h4>Total Orders</h4>
                                <div class="analytics-value">{data.analytics?.totalOrders || 0}</div>
                            </div>
                        </div>
                        
                        <div class="analytics-card completed">
                            <div class="analytics-icon">
                                <span class="material-symbols-outlined">check_circle</span>
                            </div>
                            <div class="analytics-content">
                                <h4>Completed Orders</h4>
                                <div class="analytics-value">{data.analytics?.completedOrders || 0}</div>
                            </div>
                        </div>
                        
                        <div class="analytics-card menus">
                            <div class="analytics-icon">
                                <span class="material-symbols-outlined">restaurant_menu</span>
                            </div>
                            <div class="analytics-content">
                                <h4>Total Menus</h4>
                                <div class="analytics-value">{data.menus?.length || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Popular Menus Section - Separate Card (moved up before Recent Orders) -->
                <div class="detail-card">
                    <div class="section-header">
                        <h3>Popular Menus</h3>
                        {#if data.popularMenus && data.popularMenus.length === 0}
                            <span class="section-subtitle">No data available</span>
                        {:else}
                            <span class="section-subtitle">{data.popularMenus?.length || 0} items</span>
                        {/if}
                    </div>
                    <div class="menus-container">
                        {#if data.popularMenus && data.popularMenus.length > 0}
                            {#each data.popularMenus as menu}
                                <div class="menu-card">
                                    <div class="menu-info">
                                        <h4>{menu.menuName || 'Unknown Menu'}</h4>
                                        <div class="menu-details">
                                            {#if menu.price && menu.price > 0}
                                                <span class="menu-price">฿{menu.price}</span>
                                            {:else}
                                                <span class="menu-price">Price not set</span>
                                            {/if}
                                            <span class="menu-id">ID: {menu.menuId}</span>
                                        </div>
                                    </div>
                                    <div class="menu-stats">
                                        <div class="orders-count">
                                            <span class="material-symbols-outlined">shopping_cart</span>
                                            {menu.totalOrdered} orders
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <div class="no-menus">
                                <span class="material-symbols-outlined">restaurant_menu</span>
                                <p>No popular menus data</p>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Recent Orders Section - Separate Card (moved down after Popular Menus) -->
                <div class="detail-card">
                    <div class="section-header">
                        <h3>Recent Orders</h3>
                    </div>
                    <div class="orders-container">
                        {#if data.recentOrders && data.recentOrders.length > 0}
                            {#each data.recentOrders.slice(0, 5) as order}
                                <div class="order-card">
                                    <div class="order-header">
                                        <div class="order-id">#{order.id.slice(-8)}</div>
                                        <div class="order-status status-{order.Status?.toLowerCase()}">
                                            {order.Status}
                                        </div>
                                    </div>
                                    <div class="order-details">
                                        <div class="order-amount">฿{order.Total_Amount?.toLocaleString() || '0'}</div>
                                        <div class="order-date">
                                            {new Date(order.created).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    {#if order.Menu_ID && order.Menu_ID.length > 0}
                                        <div class="order-items">
                                            Items: {order.Menu_ID.length}
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        {:else}
                            <div class="no-orders">
                                <span class="material-symbols-outlined">receipt</span>
                                <p>No recent orders</p>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Action Buttons - Separate Card -->
                <div class="detail-card">
                    <div class="detail-footer">
                        <button class="btn-back" on:click={() => goto('/admin/restaurant/')}>
                            <span class="material-symbols-outlined">arrow_back</span>
                            Back to Restaurants
                        </button>
                        
                        <button class="btn-print" on:click={handlePrintReport}>
                            <span class="material-symbols-outlined">print</span>
                            Print Report
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="page-header">
                <nav class="breadcrumb">
                    <span class="breadcrumb-item">Home</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item">Manage Restaurant</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item active">Restaurant Not Found</span>
                </nav>
                <h2>Restaurant Not Found</h2>
            </div>

            <div class="error-section">
                <div class="error-card">
                    <div class="error-icon">
                        <span class="material-symbols-outlined">error</span>
                    </div>
                    <h3>Restaurant Not Found</h3>
                    <p>The restaurant you're looking for doesn't exist or has been removed.</p>
                    
                    <button class="btn-back" on:click={() => goto('/admin/restaurant/')}>
                        <span class="material-symbols-outlined">arrow_back</span>
                        Back to Restaurants
                    </button>
                </div>
            </div>
        {/if}
    </main>
</div>

<style>
    /* Reset and Base */
    * {
        box-sizing: border-box;
    }
    .admin-layout {
        min-height: 100vh;
        background: #f5f5f5;
        font-family: 'Noto Sans Thai', sans-serif;
    }
    /* Main Content */
    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 30px;
        min-height: calc(100vh - 60px);
    }

    /* Page Header */
    .page-header {
        margin-bottom: 30px;
    }

    .breadcrumb {
        font-size: 13px;
        color: #888;
        margin-bottom: 8px;
    }

    .breadcrumb-item.active {
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

    /* Restaurant Detail Styles */
    .restaurant-detail-section {
        margin: 20px 0;
    }

    .detail-card {
        background: white;
        border-radius: 16px;
        padding: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .detail-header {
        display: flex;
        align-items: center;
        padding: 30px;
        background: linear-gradient(135deg, #ff8c00 0%, #ffb347 100%);
        color: white;
    }

    .restaurant-avatar {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
    }

    .restaurant-avatar .material-symbols-outlined {
        font-size: 36px;
        color: white;
    }

    .restaurant-info h3 {
        margin: 0 0 5px 0;
        font-size: 24px;
        font-weight: 600;
    }

    .restaurant-type {
        margin: 0;
        opacity: 0.9;
        font-size: 16px;
    }

    .detail-actions {
        margin-left: auto;
    }

    .btn-edit {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .btn-edit:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .detail-content {
        padding: 30px;
    }

    .detail-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 25px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
    }

    .detail-item.full-width {
        grid-column: 1 / -1;
    }

    .detail-item label {
        font-weight: 600;
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .detail-item p {
        margin: 0;
        color: #333;
        font-size: 16px;
        line-height: 1.5;
    }

    .detail-footer {
        padding: 20px 30px;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
    }

    .btn-back {
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .btn-back:hover {
        background: #5a6268;
    }

    /* Error Section */
    .error-section {
        margin: 20px 0;
        display: flex;
        justify-content: center;
    }

    .error-card {
        background: white;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 500px;
    }

    .error-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #dc3545 0%, #ff6b7a 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
    }

    .error-icon .material-symbols-outlined {
        font-size: 36px;
        color: white;
    }

    .error-card h3 {
        margin: 0 0 10px 0;
        font-size: 24px;
        color: #333;
    }

    .error-card p {
        margin: 0 0 30px 0;
        color: #666;
        font-size: 16px;
        line-height: 1.5;
    }

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
        }

        .detail-row {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .detail-header {
            flex-direction: column;
            text-align: center;
        }

        .restaurant-avatar {
            margin-right: 0;
            margin-bottom: 15px;
        }

        .detail-actions {
            margin-left: 0;
            margin-top: 15px;
        }
    }

    

    .stat-label {
        font-size: 14px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .welcome-btn {
        background: #ff8c00;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 auto;
        transition: all 0.2s;
    }

    .welcome-btn:hover {
        background: #e67e00;
        transform: translateY(-1px);
    }

    /* Add Restaurant Form Styles */
    .add-restaurant-section {
        margin: 20px 0;
    }

    .add-restaurant-form {
        background: white;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-width: 800px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group.full-width {
        grid-column: 1 / -1;
    }

    .form-group label {
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        color: #333;
        transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #ff8c00;
        box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 80px;
    }

    .form-actions {
        display: flex;
        gap: 15px;
        margin-top: 30px;
        justify-content: flex-end;
    }

    .btn-cancel,
    .btn-submit {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }

    .btn-cancel {
        background: #f8f9fa;
        color: #6c757d;
        border: 1px solid #dee2e6;
    }

    .btn-cancel:hover {
        background: #e9ecef;
    }

    .btn-submit {
        background: #ff8c00;
        color: white;
    }

    .btn-submit:hover {
        background: #e67e00;
    }

    /* Restaurant Detail Styles */
    .restaurant-detail-section {
        margin: 20px 0;
    }

    .detail-card {
        background: white;
        border-radius: 16px;
        padding: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .detail-header {
        display: flex;
        align-items: center;
        padding: 30px;
        background: linear-gradient(135deg, #ff8c00 0%, #ffb347 100%);
        color: white;
    }

    .restaurant-avatar {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
    }

    .restaurant-avatar .material-symbols-outlined {
        font-size: 36px;
        color: white;
    }

    .restaurant-info h3 {
        margin: 0 0 5px 0;
        font-size: 24px;
        font-weight: 600;
    }

    .restaurant-type {
        margin: 0;
        opacity: 0.9;
        font-size: 16px;
    }

    .detail-actions {
        margin-left: auto;
    }

    .btn-edit {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .btn-edit:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .detail-content {
        padding: 30px;
    }

    .detail-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin-bottom: 25px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
    }

    .detail-item.full-width {
        grid-column: 1 / -1;
    }

    .detail-item label {
        font-weight: 600;
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .detail-item p {
        margin: 0;
        color: #333;
        font-size: 16px;
        line-height: 1.5;
    }

    .detail-footer {
        padding: 20px 30px;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
    }

    .btn-back {
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
    }

    .btn-back:hover {
        background: #5a6268;
    }

    /* Error Section */
    .error-section {
        margin: 20px 0;
        display: flex;
        justify-content: center;
    }

    .error-card {
        background: white;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 500px;
    }

    .error-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #dc3545 0%, #ff6b7a 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
    }

    .error-icon .material-symbols-outlined {
        font-size: 36px;
        color: white;
    }

    .error-card h3 {
        margin: 0 0 10px 0;
        font-size: 24px;
        color: #333;
    }

    .error-card p {
        margin: 0 0 30px 0;
        color: #666;
        font-size: 16px;
        line-height: 1.5;
    }

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .detail-row {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .detail-header {
            flex-direction: column;
            text-align: center;
        }

        .restaurant-avatar {
            margin-right: 0;
            margin-bottom: 15px;
        }

        .detail-actions {
            margin-left: 0;
            margin-top: 15px;
        }
    }

    /* Section Headers */
    .section-header {
        padding: 24px 30px 20px 30px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .section-header h3 {
        color: #333;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
    }

    .section-subtitle {
        color: #666;
        font-size: 14px;
    }

    /* Analytics Section */
    .analytics-section {
        margin: 30px 0;
        background: white;
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        padding: 0 30px 30px 30px;
    }

    .analytics-card {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        border: 1px solid #e9ecef;
        transition: all 0.2s;
    }

    .analytics-card:hover {
        transform: translateY(-2px);
    }

    .analytics-card.sales {
        border-left: 4px solid #28a745;
    }

    .analytics-card.orders {
        border-left: 4px solid #007bff;
    }

    .analytics-card.completed {
        border-left: 4px solid #17a2b8;
    }

    .analytics-card.menus {
        border-left: 4px solid #ffc107;
    }

    .analytics-icon {
        flex-shrink: 0;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        background: rgba(255, 140, 0, 0.1);
        color: #ff8c00;
    }

    .analytics-content h4 {
        color: #666;
        font-size: 14px;
        margin: 0 0 8px 0;
        font-weight: 500;
    }

    .analytics-value {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 0;
    }

    /* Recent Orders Section */
    .recent-orders-section {
        margin: 30px 0;
        background: white;
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .orders-container {
        display: grid;
        gap: 12px;
        padding: 0 30px 30px 30px;
    }

    .order-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #e9ecef;
        transition: all 0.2s;
    }

    .order-card:hover {
        transform: translateY(-1px);
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .order-id {
        font-family: 'Courier New', monospace;
        font-weight: bold;
        color: #333;
    }

    .order-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .status-completed {
        background: rgba(40, 167, 69, 0.1);
        color: #28a745;
    }

    .status-pending {
        background: rgba(255, 193, 7, 0.1);
        color: #ffc107;
    }

    .status-in-progress {
        background: rgba(0, 123, 255, 0.1);
        color: #007bff;
    }

    .status-canceled {
        background: rgba(220, 53, 69, 0.1);
        color: #dc3545;
    }

    .order-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .order-amount {
        font-size: 18px;
        font-weight: bold;
        color: #28a745;
    }

    .order-date {
        color: #666;
        font-size: 14px;
    }

    .order-items {
        color: #666;
        font-size: 14px;
    }

    .no-orders, .no-menus {
        text-align: center;
        padding: 40px 20px;
        color: #666;
        background: white;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }

    .no-orders span, .no-menus span {
        font-size: 48px;
        color: #ddd;
        margin-bottom: 16px;
        display: block;
    }

    /* Popular Menus Section */
    .popular-menus-section {
        margin: 30px 0;
        background: white;
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .menus-container {
        display: grid;
        gap: 12px;
        padding: 0 30px 30px 30px;
    }

    .menu-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s;
    }

    .menu-card:hover {
        transform: translateY(-1px);
    }

    .menu-info h4 {
        color: #333;
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
    }

    .menu-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .menu-price {
        color: #28a745;
        font-weight: bold;
        font-size: 14px;
    }

    .menu-id {
        color: #666;
        font-size: 12px;
        font-family: 'Courier New', monospace;
    }

    .menu-stats {
        text-align: right;
    }

    .orders-count {
        display: flex;
        align-items: center;
        color: #666;
        font-size: 14px;
    }

    .orders-count span {
        margin-right: 8px;
        font-size: 18px;
    }

    /* Print Button */
    .btn-print {
        background: #17a2b8;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .btn-print:hover {
        background: #138496;
    }

    .detail-footer {
        display: flex;
        gap: 16px;
        justify-content: space-between;
        align-items: center;
    }

    /* Card Spacing */
    .restaurant-detail-section .detail-card {
        margin-bottom: 24px;
    }

    .restaurant-detail-section .detail-card:last-child {
        margin-bottom: 0;
    }

    @media (max-width: 768px) {
        .analytics-grid {
            grid-template-columns: 1fr;
        }
        
        .detail-footer {
            flex-direction: column;
            gap: 12px;
        }
        
        .btn-print, .btn-back {
            width: 100%;
            justify-content: center;
        }
    }

    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 24px;
        min-height: calc(100vh - 60px);
        overflow-y: auto;
        background: #f5f7fa !important;
    }

    /* Header Section */
    .header-section {
        width: calc(100% + 48px);
        padding: 20px 24px;
        background: white;
        border-bottom: 1px #B4B5B7 solid;
        margin: -24px -24px 24px -24px;
        position: relative;
        box-sizing: border-box;
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
</style>