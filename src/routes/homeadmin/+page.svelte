<script>
    import { goto } from '$app/navigation';
    
    export let data;
    
    // Active menu state
    let activeMenu = "dashboard";
    
    // Restaurant form data
    let newRestaurant = {
        name: '',
        type: '',
        ownerId: '',
        phone: '',
        address: '',
        description: ''
    };
    
    // Selected restaurant for detail view
    let selectedRestaurant = null;
    
    // Dummy restaurants data (will be replaced with real data)
    let restaurants = [];
    
    // Functions
    function handleEditUser(userId) {
        console.log('Edit user:', userId);
        // Implement user edit functionality
    }
    
    function handleDeleteUser(userId) {
        console.log('Delete user:', userId);
        // Implement user delete functionality
    }
    
    function handleViewRestaurant(restaurantId) {
        // Find the restaurant in shops data
        selectedRestaurant = data.shops?.find(shop => shop.id === restaurantId);
        if (selectedRestaurant) {
            activeMenu = "restaurantDetail";
        }
    }
    
    function handleDeleteRestaurant(restaurantId) {
        console.log('Delete restaurant:', restaurantId);
        // Implement restaurant delete functionality
    }
    
    async function handleAddRestaurant() {
        try {
            // Here you would normally send data to server
            console.log('Adding restaurant:', newRestaurant);
            
            // Reset form
            newRestaurant = {
                name: '',
                type: '',
                ownerId: '',
                phone: '',
                address: '',
                description: ''
            };
            
            // Go back to restaurant list
            activeMenu = "manageRestaurant";
            
            // Show success message
            alert('Restaurant added successfully!');
            
        } catch (error) {
            console.error('Error adding restaurant:', error);
            alert('Error adding restaurant. Please try again.');
        }
    }
    
    function handleLogout() {
        goto('/logout');
    }
</script>

<!-- Simple Admin Layout -->
<div class="admin-layout">
    <!-- Top Header -->
    <header class="top-header">
        <div class="header-content">
            <img src="/SCQ_logo.png" alt="SCQ Logo" class="logo" />
            <h1>Admin Panel</h1>
        </div>
    </header>

    <!-- Sidebar -->
    <nav class="sidebar">
        <div class="sidebar-content">
            <!-- Dashboard -->
            <button
                class="menu-item"
                class:active={activeMenu === "dashboard"}
                on:click={() => (activeMenu = "dashboard")}
            >
                <span class="material-symbols-outlined">dashboard</span>
                <span>Dashboard</span>
            </button>

            <!-- Manage Users -->
            <button
                class="menu-item"
                class:active={activeMenu === "manageUsers"}
                on:click={() => (activeMenu = "manageUsers")}
            >
                <span class="material-symbols-outlined">person</span>
                <span>Manage Users</span>
            </button>

            <!-- Manage Restaurant -->
            <button
                class="menu-item"
                class:active={activeMenu === "manageRestaurant" || activeMenu === "addRestaurant" || activeMenu === "allRestaurants" || activeMenu === "restaurantDetail"}
                on:click={() => activeMenu = "manageRestaurant"}
            >
                <span class="material-symbols-outlined">storefront</span>
                <span>Manage Restaurant</span>
            </button>

            <!-- Restaurant Submenu -->
            {#if activeMenu === "manageRestaurant" || activeMenu === "addRestaurant" || activeMenu === "allRestaurants" || activeMenu === "restaurantDetail"}
                <div class="submenu">
                    <button 
                        class="submenu-item" 
                        class:active={activeMenu === "manageRestaurant" || activeMenu === "allRestaurants"}
                        on:click={() => (activeMenu = "manageRestaurant")}
                    >
                        <span class="material-symbols-outlined">list</span>
                        <span>All Restaurants</span>
                    </button>
                    <button 
                        class="submenu-item" 
                        class:active={activeMenu === "addRestaurant"}
                        on:click={() => (activeMenu = "addRestaurant")}
                    >
                        <span class="material-symbols-outlined">add</span>
                        <span>Add Restaurant</span>
                    </button>
                </div>
            {/if}

            <!-- Reports -->
            <button class="menu-item">
                <span class="material-symbols-outlined">assignment</span>
                <span>Reports</span>
            </button>

            <!-- System Log -->
            <button class="menu-item">
                <span class="material-symbols-outlined">history</span>
                <span>System Log</span>
            </button>

            <!-- Settings -->
            <button class="menu-item">
                <span class="material-symbols-outlined">settings</span>
                <span>Settings</span>
            </button>

            <!-- Logout -->
            <button class="menu-item logout" on:click={handleLogout}>
                <span class="material-symbols-outlined">logout</span>
                <span>Logout</span>
            </button>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Dashboard -->
        {#if activeMenu === "dashboard"}
            <div class="page-header">
                <nav class="breadcrumb">
                    <span class="breadcrumb-item">Home</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item current">Dashboard</span>
                </nav>
                <h2>Dashboard</h2>
            </div>

            <div class="dashboard-grid">
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="material-symbols-outlined">person</span>
                            <h3>Users</h3>
                        </div>
                        <div class="stat-number">{data.stats?.users || 0}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            <h3>Total Orders</h3>
                        </div>
                        <div class="stat-number">{data.stats?.orders || 0}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="material-symbols-outlined">restaurant</span>
                            <h3>Total Dishes</h3>
                        </div>
                        <div class="stat-number">{data.stats?.dishes || 0}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="material-symbols-outlined">cancel</span>
                            <h3>Canceled</h3>
                        </div>
                        <div class="stat-number">{data.stats?.canceled || 0}</div>
                    </div>
                </div>

                <!-- Chart Section -->
                <div class="chart-section">
                    <div class="chart-header">
                        <h3>Chart Orders</h3>
                        <select class="chart-filter">
                            <option>Show by days</option>
                        </select>
                    </div>
                    <div class="chart-placeholder">
                        <p>Chart will be displayed here</p>
                    </div>
                </div>
            </div>

        <!-- Manage Users -->
        {:else if activeMenu === "manageUsers"}
            <div class="page-header">
                <nav class="breadcrumb">
                    <span class="breadcrumb-item">Home</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item current">Manage Users</span>
                </nav>
                <h2>Manage Users</h2>
            </div>

            <div class="users-section">
                <div class="users-table-container">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Date Added</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if data.users && data.users.length > 0}
                                {#each data.users as user, index}
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>{user.name || 'N/A'}</td>
                                        <td>{user.email || 'N/A'}</td>
                                        <td>
                                            <span class="status-badge" class:active={user.verified}>
                                                {user.verified ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}</td>
                                        <td>
                                            <button class="action-btn edit" on:click={() => handleEditUser(user.id)}>
                                                Edit
                                            </button>
                                            <button class="action-btn delete" on:click={() => handleDeleteUser(user.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr>
                                    <td colspan="6" class="no-data">No users found</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>

        <!-- Manage Restaurant Section -->
        {:else if activeMenu === "manageRestaurant" || activeMenu === "allRestaurants"}
            <div class="page-header">
                <nav class="breadcrumb">
                    <span class="breadcrumb-item">Home</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item">Manage Restaurant</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item active">All Restaurant</span>
                </nav>
                <h2>All Restaurants</h2>
            </div>

            <div class="restaurants-section">
                <div class="restaurants-table-container">
                    <div class="table-header">
                        <h3>Restaurants</h3>
                    </div>
                    <table class="restaurants-table">
                        <thead>
                            <tr>
                                <th>Restaurant ID</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Date Added</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if data.shops && data.shops.length > 0}
                                {#each data.shops as shop, index}
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div class="restaurant-image">
                                                <span class="material-symbols-outlined">broken_image</span>
                                            </div>
                                        </td>
                                        <td>{shop.name || 'N/A'}</td>
                                        <td>
                                            <!-- Get owner email from users data -->
                                            {#if data.users}
                                                {#each data.users as user}
                                                    {#if user.id === shop.User_Owner_ID}
                                                        {user.email || 'N/A'}
                                                    {/if}
                                                {/each}
                                            {:else}
                                                N/A
                                            {/if}
                                        </td>
                                        <td>{new Date(shop.created).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}</td>
                                        <td>
                                            <span class="status-badge active">Active</span>
                                        </td>
                                        <td>
                                            <button class="action-link edit" on:click={() => handleViewRestaurant(shop.id)}>
                                                Edit
                                            </button>
                                            <button class="action-link delete" on:click={() => handleDeleteRestaurant(shop.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr>
                                    <td colspan="7" class="no-data">No restaurants found</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>

        <!-- Add Restaurant Form -->
        {:else if activeMenu === "addRestaurant"}
            <div class="page-header">
                <nav class="breadcrumb">
                    <span class="breadcrumb-item">Home</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item">Manage Restaurant</span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item active">Add Restaurant</span>
                </nav>
                <h2>Add New Restaurant</h2>
            </div>

            <div class="add-restaurant-section">
                <div class="add-restaurant-form">
                    <form on:submit|preventDefault={handleAddRestaurant}>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="restaurantName">Restaurant Name</label>
                                <input 
                                    type="text" 
                                    id="restaurantName" 
                                    bind:value={newRestaurant.name} 
                                    placeholder="Enter restaurant name"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label for="restaurantType">Restaurant Type</label>
                                <select id="restaurantType" bind:value={newRestaurant.type} required>
                                    <option value="">Select type</option>
                                    <option value="อาหารไทย">อาหารไทย</option>
                                    <option value="อาหารจีน">อาหารจีน</option>
                                    <option value="อาหารญี่ปุ่น">อาหารญี่ปุ่น</option>
                                    <option value="อาหารเกาหลี">อาหารเกาหลี</option>
                                    <option value="อาหารฝรั่ง">อาหารฝรั่ง</option>
                                    <option value="อาหารอีสาน">อาหารอีสาน</option>
                                    <option value="อาหารเจ">อาหารเจ</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="ownerEmail">Owner Email</label>
                                <select id="ownerEmail" bind:value={newRestaurant.ownerId} required>
                                    <option value="">Select owner</option>
                                    {#if data.users}
                                        {#each data.users as user}
                                            <option value={user.id}>{user.email} ({user.name})</option>
                                        {/each}
                                    {/if}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    bind:value={newRestaurant.phone} 
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="address">Address</label>
                            <textarea 
                                id="address" 
                                bind:value={newRestaurant.address} 
                                placeholder="Enter restaurant address"
                                rows="3"
                                required
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea 
                                id="description" 
                                bind:value={newRestaurant.description} 
                                placeholder="Enter restaurant description"
                                rows="4"
                            ></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-cancel" on:click={() => activeMenu = "manageRestaurant"}>
                                Cancel
                            </button>
                            <button type="submit" class="btn-submit">
                                Add Restaurant
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        <!-- Restaurant Detail -->
        {:else if activeMenu === "restaurantDetail" && selectedRestaurant}
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

        <!-- Other menu items... -->
        {:else}
            <div class="page-header">
                <h2>Coming Soon...</h2>
            </div>
            <p>This section is under development.</p>
        {/if}
    </main>
</div>

<script>
    import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import PocketBase from 'pocketbase';
    import { env } from '$env/dynamic/public';
    
    export let data;
    
    const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);
    
    let activeMenu = "dashboard";
    let restaurants = [];
    
    onMount(async () => {
        await loadRestaurants();
    });

    async function loadRestaurants() {
        try {
            const records = await pb.collection('Shop').getFullList({
                sort: '-created',
            });
            restaurants = records;
        } catch (error) {
            console.error('Error loading restaurants:', error);
        }
    }

    function restaurantMenu() {
        if (activeMenu === "manageRestaurant") {
            activeMenu = "dashboard";
        } else {
            activeMenu = "manageRestaurant";
        }
    }

    function handleEditUser(userId) {
        alert(`Edit user functionality for ID: ${userId} (Coming soon...)`);
    }
    
    function handleDeleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            alert(`Delete user functionality for ID: ${userId} (Coming soon...)`);
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
</script>

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

    /* Top Header */
    .top-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        z-index: 100;
    }

    .header-content {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 20px;
        gap: 12px;
    }

    .logo {
        width: 40px;
        height: 40px;
        border-radius: 8px;
    }

    .header-content h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: #333;
    }

    /* Sidebar */
    .sidebar {
        position: fixed;
        top: 60px;
        left: 0;
        width: 250px;
        height: calc(100vh - 60px);
        background: white;
        border-right: 1px solid #e0e0e0;
        overflow-y: auto;
        z-index: 90;
    }

    .sidebar-content {
        padding: 20px 0;
    }

    .menu-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 12px 20px;
        border: none;
        background: none;
        text-align: left;
        font-size: 14px;
        color: #666;
        cursor: pointer;
        transition: all 0.2s ease;
        gap: 12px;
    }

    .menu-item:hover {
        background: #f5f5f5;
        color: #333;
    }

    .menu-item.active {
        background: #fff3e0;
        color: #ff8c00;
        font-weight: 500;
    }

    .menu-item.active .material-symbols-outlined {
        color: #ff8c00;
    }

    .submenu {
        margin-left: 20px;
        border-left: 2px solid #e0e0e0;
    }

    .submenu-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 8px 20px;
        border: none;
        background: none;
        text-align: left;
        font-size: 13px;
        color: #888;
        cursor: pointer;
        gap: 8px;
    }

    .submenu-item:hover {
        background: #f5f5f5;
    }

    .logout {
        margin-top: auto;
        color: #d32f2f !important;
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

    /* Dashboard Styles */
    .dashboard-grid {
        display: grid;
        gap: 30px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }

    .stat-header .material-symbols-outlined {
        color: #ff8c00;
        font-size: 24px;
    }

    .stat-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: #666;
    }

    .stat-number {
        font-size: 32px;
        font-weight: 600;
        color: #ff8c00;
    }

    .chart-section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .chart-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
    }

    .chart-filter {
        padding: 6px 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
    }

    .chart-placeholder {
        height: 300px;
        background: #f9f9f9;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
    }

    /* Users Table */
    .users-section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .users-table-container {
        overflow-x: auto;
    }

    .users-table {
        width: 100%;
        border-collapse: collapse;
    }

    .users-table th,
    .users-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
    }

    .users-table th {
        background: #f8f9fa;
        font-weight: 500;
        color: #333;
        font-size: 14px;
    }

    .users-table td {
        font-size: 14px;
        color: #666;
    }

    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        background: #ffebee;
        color: #d32f2f;
    }

    .status-badge.active {
        background: #e8f5e8;
        color: #2e7d32;
    }

    .action-btn {
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        margin-right: 8px;
        text-decoration: underline;
        background: none;
    }

    .action-btn.edit {
        color: #2b7fff;
    }

    .action-btn.delete {
        color: #d32f2f;
    }

    .action-btn:hover {
        opacity: 0.7;
    }

    .no-data {
        text-align: center;
        color: #888;
        font-style: italic;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }

        .main-content {
            margin-left: 0;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .users-table {
            font-size: 12px;
        }

        .users-table th,
        .users-table td {
            padding: 8px 4px;
        }
    }

    /* Restaurant Management Styles */
    .restaurants-section {
        margin: 20px 0;
    }

    .restaurants-table-container {
        background: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .table-header {
        margin-bottom: 20px;
    }

    .table-header h3 {
        margin: 0;
        font-size: 20px;
        color: #333438;
        font-weight: 400;
    }

    .restaurants-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
    }

    .restaurants-table th {
        background: #f8f9fa;
        padding: 15px;
        text-align: center;
        font-weight: 600;
        color: #333438;
        font-size: 16px;
        border-bottom: 1px solid #dee2e6;
    }

    .restaurants-table td {
        padding: 20px 15px;
        text-align: center;
        border-bottom: 1px solid #e9ecef;
        color: #333438;
        font-size: 16px;
    }

    .restaurants-table tbody tr:hover {
        background: #f8f9fa;
    }

    .restaurant-image {
        width: 60px;
        height: 60px;
        background: #e6f0ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }

    .restaurant-image .material-symbols-outlined {
        color: #6ba6ff;
        font-size: 24px;
    }

    .action-link {
        background: none;
        border: none;
        color: #2b7fff;
        text-decoration: underline;
        cursor: pointer;
        margin: 0 5px;
        font-size: 16px;
    }

    .action-link:hover {
        color: #0056cc;
    }

    .action-link.delete {
        color: #dc3545;
    }

    .action-link.delete:hover {
        color: #c82333;
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
        color: #333438;
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

    /* Breadcrumb */
    .breadcrumb {
        margin-bottom: 10px;
        font-size: 13px;
    }

    .breadcrumb-item {
        color: #95969a;
    }

    .breadcrumb-item.current,
    .breadcrumb-item.active {
        color: #333438;
    }

    .breadcrumb-separator {
        margin: 0 8px;
        color: #95969a;
    }

    /* Responsive */
    @media (max-width: 768px) {
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

        .restaurants-table {
            font-size: 12px;
        }

        .restaurants-table th,
        .restaurants-table td {
            padding: 8px 4px;
        }
    }
</style>