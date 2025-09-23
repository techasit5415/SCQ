<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/components/Topbar.svelte';
    import AdminSidebar from '$lib/components/sidebar.svelte';

    export let data;
    export let form;


    // Active menu state
    let activeMenu = "dashboard";
    
    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        if (menu !== "dashboard") {
            // Navigate to different pages based on menu selection
            switch(menu) {
                case "manageUsers":
                    goto('/homeadmin/manageUser');
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
    <TopBar title="Admin Panel - Dashboard" logoSrc="/SCQ_logo.png" />
    <AdminSidebar 
    {activeMenu} 
    shops={data.shops || []}
    on:menuChange={handleMenuChange}
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
    .users-table-container {
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

    .users-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
    }

    .users-table th {
        background: #f8f9fa;
        padding: 15px;
        text-align: center;
        font-weight: 600;
        color: #333438;
        font-size: 16px;
        border-bottom: 1px solid #dee2e6;
    }

    .users-table td {
        padding: 20px 15px;
        text-align: center;
        border-bottom: 1px solid #e9ecef;
        color: #333438;
        font-size: 16px;
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
        color: #333438;
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

    /* Restaurant Submenu Styles */
    .restaurant-item {
        background: rgba(255, 140, 0, 0.1);
        border-left: 3px solid #ff8c00;
        margin-left: 10px;
        padding-left: 15px !important;
    }

    .restaurant-item:hover {
        background: rgba(255, 140, 0, 0.15);
    }

    .restaurant-item.active {
        background: rgba(255, 140, 0, 0.2);
        border-left-color: #e67e00;
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
        padding: 20px;
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