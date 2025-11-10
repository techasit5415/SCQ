<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';
    import { onMount } from 'svelte';
    
    export let data;
    
    // Active menu state
    let activeMenu = "advertise";
    
    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        if (menu !== "advertise") {
            // Navigate to different pages based on menu selection
            switch(menu) {
                case "dashboard":
                    goto('/admin/dashboard');
                    break;
                case "manageUsers":
                    goto('/admin/manageUser');
                    break;
                case "manageRestaurant":
                case "addRestaurant":
                    goto('/admin/restaurant');
                    break;
                case "reports":
                    goto('/admin/reports');
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
    
    function handleViewRestaurant(event) {
        const restaurantId = event.detail;
        goto(`/admin/restaurant/${restaurantId}`);
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
    
    // Navigation functions
    function goToPackages() {
        goto('/admin/advertise/packages');
    }
    
    function goToApplications() {
        goto('/admin/advertise/applications');
    }
    
    function goToPayments() {
        goto('/admin/advertise/payments');
    }
    
    // Format number with commas
    function formatNumber(num) {
        return num ? num.toLocaleString() : '0';
    }

    // Format currency
    function formatCurrency(amount) {
        return `฿${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    
    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    onMount(() => {
        console.log('Advertise Management data:', data);
    });
</script>

<svelte:head>
    <title>Advertise Management - SCQ Admin</title>
</svelte:head>

<!-- Top Navigation -->
<TopBar title="Admin Panel - Advertise Management" logoSrc="/SCQ_logo.png" />

<!-- Sidebar -->
<AdminSidebar 
    {activeMenu} 
    shops={data.shops || []}
    on:menuChange={handleMenuChange}
    on:viewRestaurant={handleViewRestaurant}
    on:logout={handleLogout}
/>

<!-- Main Content -->
<main class="main-content">
        <!-- Breadcrumb and Title -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home / </span>
                <span class="breadcrumb-item current">Advertise Management</span>
            </div>
            <div class="page-title">
                <h1>Advertise Management</h1>
                <p>จัดการระบบโฆษณาร้านค้า แพ็กเกจ และการชำระเงิน</p>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-section">
            <div class="kpi-grid">
                <!-- Total Packages -->
                <div class="kpi-card packages">
                    <div class="kpi-icon">
                        <span class="material-icons">inventory_2</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.totalPackages)}</div>
                        <div class="kpi-label">Total Packages</div>
                        <div class="kpi-sublabel">{data.stats.activePackages} ใช้งานได้</div>
                    </div>
                </div>

                <!-- Pending Applications -->
                <div class="kpi-card pending">
                    <div class="kpi-icon">
                        <span class="material-icons">pending_actions</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.pendingApplications)}</div>
                        <div class="kpi-label">Pending Apps</div>
                        <div class="kpi-sublabel">รอพิจารณา</div>
                    </div>
                </div>

                <!-- Active Advertisements -->
                <div class="kpi-card active">
                    <div class="kpi-icon">
                        <span class="material-icons">campaign</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.activeAdvertisements)}</div>
                        <div class="kpi-label">Active Ads</div>
                        <div class="kpi-sublabel">กำลังแสดง</div>
                    </div>
                </div>

                <!-- Total Revenue -->
                <div class="kpi-card revenue">
                    <div class="kpi-icon">
                        <span class="material-icons">attach_money</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatCurrency(data.stats.totalRevenue)}</div>
                        <div class="kpi-label">Total Revenue</div>
                        <div class="kpi-sublabel">รายได้ทั้งหมด</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-section">
            <h2>Quick Actions</h2>
            <div class="quick-actions-grid">
                <button class="quick-action-card" on:click={goToPackages}>
                    <span class="material-symbols-outlined">add_box</span>
                    <h3>Create Package</h3>
                    <p>สร้างแพ็กเกจโฆษณาใหม่</p>
                </button>

                <button class="quick-action-card" on:click={goToApplications}>
                    <span class="material-symbols-outlined">approval</span>
                    <h3>Review Applications</h3>
                    <p>ตรวจสอบคำขอโฆษณา</p>
                </button>

                <button class="quick-action-card" on:click={goToPayments}>
                    <span class="material-symbols-outlined">account_balance_wallet</span>
                    <h3>Payment Management</h3>
                    <p>จัดการการชำระเงิน</p>
                </button>
            </div>
        </div>

        <!-- Recent Activities -->
        <div class="activities-section">
            <div class="activities-grid">
                <!-- Recent Applications -->
                <div class="activity-card">
                    <div class="activity-header">
                        <h3>Recent Applications</h3>
                        <button class="view-all-btn" on:click={goToApplications}>ดูทั้งหมด</button>
                    </div>
                    <div class="activity-list">
                        {#if data.recentApplications && data.recentApplications.length > 0}
                            {#each data.recentApplications.slice(0, 5) as application}
                                <div class="activity-item">
                                    <div class="activity-info">
                                        <h4>{application.shopName}</h4>
                                        <p>{application.packageName}</p>
                                        <span class="activity-date">{formatDate(application.created)}</span>
                                    </div>
                                    <div class="activity-status status-{application.status?.toLowerCase()}">
                                        {application.status}
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <div class="empty-state">
                                <span class="material-symbols-outlined">inbox</span>
                                <p>ไม่มีคำขอใหม่</p>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Recent Payments -->
                <div class="activity-card">
                    <div class="activity-header">
                        <h3>Recent Payments</h3>
                        <button class="view-all-btn" on:click={goToPayments}>ดูทั้งหมด</button>
                    </div>
                    <div class="activity-list">
                        {#if data.recentPayments && data.recentPayments.length > 0}
                            {#each data.recentPayments.slice(0, 5) as payment}
                                <div class="activity-item">
                                    <div class="activity-info">
                                        <h4>{payment.shopName}</h4>
                                        <p>{formatCurrency(payment.amount)}</p>
                                        <span class="activity-date">{formatDate(payment.created)}</span>
                                    </div>
                                    <div class="activity-status status-{payment.status?.toLowerCase()}">
                                        {payment.status}
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <div class="empty-state">
                                <span class="material-symbols-outlined">payment</span>
                                <p>ไม่มีการชำระเงินใหม่</p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </main>

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

    :global(body) {
        background: #f5f7fa !important;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 24px;
        min-height: calc(100vh - 60px);
        overflow-y: auto;
        background: #f5f7fa !important;
        font-family: 'Noto Sans Thai', sans-serif;
    }

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

    /* KPI Cards */
    .kpi-section {
        margin-bottom: 32px;
    }

    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
    }

    .kpi-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .kpi-card.active {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .kpi-card.revenue {
        border-color: #10b981;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }



    .kpi-card.pending {
        border-color: #f59e0b;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    }

    .kpi-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        flex-shrink: 0;
    }

    .kpi-card.active .kpi-icon {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .kpi-card.revenue .kpi-icon {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .kpi-card.pending .kpi-icon {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .kpi-icon .material-icons {
        color: white;
        font-size: 28px;
    }

    .kpi-content {
        flex: 1;
    }

    .kpi-value {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 4px;
        line-height: 1;
    }

    .kpi-label {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 2px;
    }

    .kpi-sublabel {
        font-size: 14px;
        color: #6b7280;
    }

    /* Quick Actions */
    .quick-actions-section {
        margin-bottom: 32px;
    }

    .quick-actions-section h2 {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 20px 0;
    }

    .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .quick-action-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
    }

    .quick-action-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .quick-action-card .material-symbols-outlined {
        font-size: 48px;
        color: #3b82f6;
        margin-bottom: 16px;
    }

    .quick-action-card h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
    }

    .quick-action-card p {
        margin: 0;
        color: #64748b;
        font-size: 14px;
    }

    /* Activities */
    .activities-section {
        background: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        margin-bottom: 32px;
    }

    .activities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
    }

    .activity-card {
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
    }

    .activity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        background: white;
        border-bottom: 1px solid #e2e8f0;
    }

    .activity-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
    }

    .view-all-btn {
        color: #3b82f6;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 8px;
        transition: background-color 0.2s;
        background: none;
        border: none;
        cursor: pointer;
    }

    .view-all-btn:hover {
        background-color: #eff6ff;
    }

    .activity-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .activity-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e2e8f0;
        background: white;
    }

    .activity-item:last-child {
        border-bottom: none;
    }

    .activity-info h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 500;
        color: #1e293b;
    }

    .activity-info p {
        margin: 0 0 4px 0;
        color: #64748b;
        font-size: 14px;
    }

    .activity-date {
        font-size: 12px;
        color: #94a3b8;
    }

    .activity-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .status-pending {
        background-color: #fef3c7;
        color: #92400e;
    }

    .status-active {
        background-color: #dcfce7;
        color: #166534;
    }

    .status-completed {
        background-color: #dcfce7;
        color: #166534;
    }

    .status-failed {
        background-color: #fef2f2;
        color: #991b1b;
    }

    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #94a3b8;
    }

    .empty-state .material-symbols-outlined {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }

    /* Responsive */
    @media (max-width: 1024px) {
        .main-content {
            margin-left: 0;
            padding: 16px;
        }

        .kpi-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
        }

        .activities-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 640px) {
        .kpi-grid {
            grid-template-columns: 1fr;
        }

        .kpi-card {
            padding: 20px;
        }

        .kpi-value {
            font-size: 24px;
        }

        .quick-actions-grid {
            grid-template-columns: 1fr;
        }
    }
</style>