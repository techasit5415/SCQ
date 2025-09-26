<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';

    export let data;
    export let form;

    // Active menu state
    let activeMenu = "manageUsers";
    
    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        if (menu !== "manageUsers") {
            // Navigate to different pages based on menu selection
            switch(menu) {
                case "dashboard":
                    goto('/homeadmin/Dashboard');
                    break;
                case "manageRestaurant":
                case "addRestaurant":
                    goto('/homeadmin/rester');
                    break;
                // Add other navigation cases as needed
                default:
                    console.log('Navigation to', menu, 'not implemented yet');
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
    
    // User management functions
    function handleEditUser(userId) {
        alert(`Edit user functionality for ID: ${userId} (Coming soon...)`);
    }
    
    function handleDeleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            alert(`Delete user functionality for ID: ${userId} (Coming soon...)`);
        }
    }
</script>

<!-- Admin Layout -->
<div class="admin-layout">
    <TopBar title="Admin Panel - Manage Users" logoSrc="/SCQ_logo.png" />
    
    <AdminSidebar 
        {activeMenu} 
        shops={data.shops || []}
        on:menuChange={handleMenuChange}
        on:viewRestaurant={handleViewRestaurant}
        on:logout={handleLogout}
    />

    <!-- Main Content -->
    <main class="main-content">
        <!-- Manage Users -->
        <div class="page-header">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Manage Users</span>
            </nav>
            <h2>Manage Users</h2>
        </div>

        <div class="users-section">
            <!-- Success/Error Messages -->
            {#if form?.success}
                <div class="alert alert-success">
                    <span class="material-symbols-outlined">check_circle</span>
                    {form.message}
                </div>
            {/if}
            
            {#if form?.error}
                <div class="alert alert-error">
                    <span class="material-symbols-outlined">error</span>
                    {form.error}
                </div>
            {/if}

            <div class="users-table-container">
                <div class="table-header">
                    <h3>User Management</h3>
                </div>
                
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

    /* Users Table */
    .users-section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .table-header {
        margin-bottom: 20px;
    }

    .table-header h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
        font-weight: 500;
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

    .users-table tbody tr:hover {
        background: #f8f9fa;
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

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
        }

        .users-table {
            font-size: 12px;
        }

        .users-table th,
        .users-table td {
            padding: 8px 4px;
        }
    }
</style>