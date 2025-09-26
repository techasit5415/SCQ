<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';

    export let data;

    // Active menu state
    let activeMenu = "manageRestaurant";
    
    // Selected restaurant for detail view
    let selectedRestaurant = null;
    
    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        // Handle special cases that sidebar doesn't handle
        console.log('Menu change:', menu);
    }
    
    function handleViewRestaurant(event) {
        const shopId = event.detail;
        selectedRestaurant = data.shops?.find(shop => shop.id === shopId);
        if (selectedRestaurant) {
            activeMenu = `restaurant-${shopId}`;
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
    
    function handleDeleteRestaurant(restaurantId) {
        console.log('Delete restaurant:', restaurantId);
        // Implement restaurant delete functionality
    }
</script>

<!-- Admin Layout -->
<div class="admin-layout">
    <TopBar title="Admin Panel - Restaurant Management" logoSrc="/SCQ_logo.png" />
    
    <AdminSidebar 
        {activeMenu} 
        shops={data.shops || []}
        on:menuChange={handleMenuChange}
        on:viewRestaurant={handleViewRestaurant}
        on:logout={handleLogout}
    />

    <!-- Main Content -->
    <main class="main-content">
        <!-- Manage Restaurant Default Page -->
        {#if activeMenu === "manageRestaurant"}
            <div class="page-header">
                <nav class="breadcrumb">
                    <span class="breadcrumb-item">Home</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item active">Manage Restaurant</span>
                </nav>
                <h2>Manage Restaurant</h2>
            </div>

            <div class="welcome-section">
                <div class="welcome-card">
                    <div class="welcome-icon">
                        <span class="material-symbols-outlined">storefront</span>
                    </div>
                    <h3>Restaurant Management</h3>
                    <p>Select a restaurant from the sidebar to view details, or add a new restaurant.</p>
                    
                    <div class="stats-overview">
                        <div class="stat-item">
                            <span class="stat-number">{data.shops?.length || 0}</span>
                            <span class="stat-label">Total Restaurants</span>
                        </div>
                    </div>
                    
                    <button class="welcome-btn" on:click={() => goto('/homeadmin/Restaurant/AddRestaurant')}>
                        <span class="material-symbols-outlined">add</span>
                        Add New Restaurant
                    </button>
                </div>
            </div>

        <!-- Restaurant Detail -->
        {:else if selectedRestaurant && activeMenu.startsWith('restaurant-')}
            <div class="page-header">
                <nav class="breadcrumb">
                    <span class="breadcrumb-item">Home</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item">Manage Restaurant</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item active">Restaurant Detail</span>
                </nav>
                <h2>{selectedRestaurant.name} - Details</h2>
            </div>

            <div class="restaurant-detail-section">
                <div class="detail-card">
                    <div class="detail-header">
                        <div class="restaurant-avatar">
                            <span class="material-symbols-outlined">storefront</span>
                        </div>
                        <div class="restaurant-info">
                            <h3>{selectedRestaurant.name}</h3>
                            <p class="restaurant-type">{selectedRestaurant.Type_Shop}</p>
                        </div>
                        <div class="detail-actions">
                            <button class="btn-edit" on:click={() => activeMenu = "editRestaurant"}>
                                <span class="material-symbols-outlined">edit</span>
                                Edit
                            </button>
                        </div>
                    </div>

                    <div class="detail-content">
                        <div class="detail-row">
                            <div class="detail-item">
                                <label>Restaurant ID</label>
                                <p>{selectedRestaurant.id}</p>
                            </div>
                            <div class="detail-item">
                                <label>Phone Number</label>
                                <p>{selectedRestaurant.Phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div class="detail-row">
                            <div class="detail-item">
                                <label>Owner</label>
                                <p>
                                    {#if data.users}
                                        {#each data.users as user}
                                            {#if user.id === selectedRestaurant.User_Owner_ID}
                                                {user.name} ({user.email})
                                            {/if}
                                        {/each}
                                    {/if}
                                </p>
                            </div>
                            <div class="detail-item">
                                <label>Date Added</label>
                                <p>{new Date(selectedRestaurant.created).toLocaleDateString('en-US', { 
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
                            <p>{selectedRestaurant.Addr || 'No address provided'}</p>
                        </div>

                        <div class="detail-item full-width">
                            <label>Description</label>
                            <p>{selectedRestaurant.Details || 'No description provided'}</p>
                        </div>
                    </div>

                    <div class="detail-footer">
                        <button class="btn-back" on:click={() => activeMenu = "manageRestaurant"}>
                            <span class="material-symbols-outlined">arrow_back</span>
                            Back to Restaurants
                        </button>
                    </div>
                </div>
            </div>

        {:else}
            <div class="page-header">
                <h2>Coming Soon...</h2>
            </div>
            <p>This section is under development.</p>
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

    .breadcrumb-item.current,
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

    /* Alert Messages */
    .alert {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        margin-bottom: 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
    }
    
    .alert-success {
        background-color: #e7f5e7;
        color: #2d5a2d;
        border: 1px solid #b8e6b8;
    }
    
    .alert-error {
        background-color: #fdeaea;
        color: #d32f2f;
        border: 1px solid #ffcccb;
    }
    
    .alert .material-symbols-outlined {
        font-size: 18px;
    }

    /* Welcome Section */
    .welcome-section {
        margin: 20px 0;
        display: flex;
        justify-content: center;
    }

    .welcome-card {
        background: white;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 600px;
    }

    .welcome-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #ff8c00 0%, #ffb347 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
    }

    .welcome-icon .material-symbols-outlined {
        font-size: 36px;
        color: white;
    }

    .welcome-card h3 {
        margin: 0 0 10px 0;
        font-size: 24px;
        color: #333;
    }

    .welcome-card p {
        margin: 0 0 30px 0;
        color: #666;
        font-size: 16px;
        line-height: 1.5;
    }

    .stats-overview {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0 30px;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .stat-number {
        font-size: 28px;
        font-weight: 600;
        color: #ff8c00;
        margin-bottom: 5px;
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
</style>