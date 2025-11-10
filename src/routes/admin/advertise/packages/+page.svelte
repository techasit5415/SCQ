<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import Topbar from '$lib/Components/Topbar.svelte';
    import Sidebar from '$lib/Components/sidebar.svelte';
    
    export let data;
    export const form = undefined;
    
    let activeMenu = 'packages';
    let showCreateModal = false;
    let isSubmitting = false;
    
    // Form data
    let packageName = '';
    let packageDescription = '';
    let packagePrice = 500;
    let packageDuration = 30;
    let packagePriorityBoost = 1;
    let packageFeatures = ['โฆษณาบนหน้าแรก'];
    
    // Handle menu navigation
    function handleMenuChange(event) {
        const menu = event.detail;
        if (menu !== activeMenu) {
            switch(menu) {
                case "dashboard":
                    goto('/admin/dashboard');
                    break;
                case "manageUsers":
                    goto('/admin/manageUser');
                    break;
                case "manageRestaurant":
                case "addRestaurant":
                    goto('/admin/Restaurant');
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
                case "advertise":
                    goto('/admin/advertise');
                    break;
                default:
                    console.log('Navigation to', menu, 'not implemented yet');
            }
        }
    }
    
    function handleViewRestaurant(event) {
        const restaurantId = event.detail;
        goto(`/admin/Restaurant/${restaurantId}`);
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

    // Format functions
    function formatNumber(num) {
        return num ? num.toLocaleString() : '0';
    }

    function formatCurrency(amount) {
        return `฿${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Package actions
    function createPackage() {
        showCreateModal = true;
        // Reset form
        packageName = '';
        packageDescription = '';
        packagePrice = 500;
        packageDuration = 30;
        packagePriorityBoost = 1;
        packageFeatures = ['โฆษณาบนหน้าแรก'];
    }
    
    function addFeature() {
        packageFeatures = [...packageFeatures, ''];
    }
    
    function removeFeature(index) {
        packageFeatures = packageFeatures.filter((_, i) => i !== index);
    }
    
    async function handleCreateSubmit() {
        if (!packageName.trim() || !packageDescription.trim()) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        
        isSubmitting = true;
        
        try {
            const formData = new FormData();
            formData.append('name', packageName);
            formData.append('description', packageDescription);
            formData.append('price', packagePrice.toString());
            formData.append('duration', packageDuration.toString());
            formData.append('priority_boost', packagePriorityBoost.toString());
            formData.append('features', JSON.stringify(packageFeatures.filter(f => f.trim())));
            
            const result = await fetch('?/create', {
                method: 'POST',
                body: formData
            });
            
            if (result.ok) {
                showCreateModal = false;
                location.reload(); // Refresh to show new package
            } else {
                alert('เกิดข้อผิดพลาดในการสร้างแพ็กเกจ');
            }
        } catch (error) {
            console.error('Error creating package:', error);
            alert('เกิดข้อผิดพลาดในการสร้างแพ็กเกจ');
        } finally {
            isSubmitting = false;
        }
    }
    
    async function handleEditSubmit() {
        if (!packageName.trim() || !packageDescription.trim()) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        
        isSubmitting = true;
        
        try {
            const formData = new FormData();
            formData.append('packageId', editPackageData.id);
            formData.append('name', packageName);
            formData.append('description', packageDescription);
            formData.append('price', packagePrice.toString());
            formData.append('duration', packageDuration.toString());
            formData.append('priority_boost', packagePriorityBoost.toString());
            formData.append('features', JSON.stringify(packageFeatures.filter(f => f.trim())));
            
            const result = await fetch('?/edit', {
                method: 'POST',
                body: formData
            });
            
            if (result.ok) {
                showEditModal = false;
                editPackageData = null;
                location.reload(); // Refresh to show updated package
            } else {
                alert('เกิดข้อผิดพลาดในการแก้ไขแพ็กเกจ');
            }
        } catch (error) {
            console.error('Error editing package:', error);
            alert('เกิดข้อผิดพลาดในการแก้ไขแพ็กเกจ');
        } finally {
            isSubmitting = false;
        }
    }

    let showEditModal = false;
    let editPackageData = null;

    function editPackage(packageData) {
        editPackageData = { ...packageData };
        
        // Set form values for editing
        packageName = packageData.name || '';
        packageDescription = packageData.description || '';
        packagePrice = packageData.price || 500;
        packageDuration = packageData.duration_days || 30;
        packagePriorityBoost = packageData.priority_boost || 1;
        packageFeatures = Array.isArray(packageData.features) ? [...packageData.features] : ['โฆษณาบนหน้าแรก'];
        
        showEditModal = true;
        console.log('Edit package:', packageData.id);
    }

    async function togglePackageStatus(packageId, currentStatus) {
        const newStatus = currentStatus ? 'inactive' : 'active';
        const confirmMessage = currentStatus 
            ? 'คุณต้องการปิดใช้งานแพ็กเกจนี้หรือไม่?' 
            : 'คุณต้องการเปิดใช้งานแพ็กเกจนี้หรือไม่?';
            
        if (!confirm(confirmMessage)) return;
        
        try {
            const formData = new FormData();
            formData.append('packageId', packageId);
            formData.append('status', newStatus);
            
            const result = await fetch('?/toggleStatus', {
                method: 'POST',
                body: formData
            });
            
            if (result.ok) {
                location.reload(); // Refresh to show updated status
            } else {
                alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
        }
    }

    async function deletePackage(packageId, packageName) {
        const confirmMessage = `คุณแน่ใจหรือไม่ที่จะลบแพ็กเกจ "${packageName}"?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้`;
        
        if (!confirm(confirmMessage)) return;
        
        try {
            const formData = new FormData();
            formData.append('packageId', packageId);
            
            const result = await fetch('?/delete', {
                method: 'POST',
                body: formData
            });
            
            if (result.ok) {
                alert('ลบแพ็กเกจเรียบร้อยแล้ว');
                location.reload(); // Refresh to show updated list
            } else {
                alert('เกิดข้อผิดพลาดในการลบแพ็กเกจ');
            }
        } catch (error) {
            console.error('Error deleting package:', error);
            alert('เกิดข้อผิดพลาดในการลบแพ็กเกจ');
        }
    }

    onMount(() => {
        console.log('Packages Management data:', data);
    });
</script>

<svelte:head>
    <title>Packages Management - SCQ Admin</title>
</svelte:head>

<!-- Top Navigation -->
<Topbar title="Admin Panel - Package Management" logoSrc="/SCQ_logo.png" />

<!-- Sidebar -->
<Sidebar 
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
                <span class="breadcrumb-item">Advertise / </span>
                <span class="breadcrumb-item current">Packages</span>
            </div>
            <div class="page-title">
                <h1>Package Management</h1>
                <p>จัดการแพ็กเกจโฆษณาสำหรับร้านอาหาร</p>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-section">
            <div class="kpi-grid">
                <!-- Total Packages -->
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <span class="material-icons">inventory_2</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.totalPackages)}</div>
                        <div class="kpi-label">Total Packages</div>
                        <div class="kpi-sublabel">แพ็กเกจทั้งหมด</div>
                    </div>
                </div>

                <!-- Active Packages -->
                <div class="kpi-card active">
                    <div class="kpi-icon">
                        <span class="material-icons">check_circle</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.activePackages)}</div>
                        <div class="kpi-label">Active Packages</div>
                        <div class="kpi-sublabel">ใช้งานได้</div>
                    </div>
                </div>

                <!-- Inactive Packages -->
                <div class="kpi-card pending">
                    <div class="kpi-icon">
                        <span class="material-icons">pause_circle</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.inactivePackages)}</div>
                        <div class="kpi-label">Inactive Packages</div>
                        <div class="kpi-sublabel">หยุดใช้งาน</div>
                    </div>
                </div>

                <!-- Most Popular Package -->
                <div class="kpi-card revenue">
                    <div class="kpi-icon">
                        <span class="material-icons">trending_up</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value" style="font-size: 18px;">{data.stats.mostPopularPackageName}</div>
                        <div class="kpi-label">Most Popular</div>
                        <div class="kpi-sublabel">{data.stats.mostPopularPackageUsage} การใช้งาน</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Packages Management Section -->
        <div class="section">
            <div class="section-header">
                <h2>Advertisement Packages</h2>
                <button class="btn btn-primary" on:click={createPackage}>
                    <span class="material-icons">add</span>
                    Create Package
                </button>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Package Name</th>
                            <th>Price</th>
                            <th>Duration</th>
                            <th>Features</th>
                            <th>Status</th>
                            <th>Usage Count</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.packages as pkg}
                            <tr>
                                <td>
                                    <div class="package-name">
                                        <strong>{pkg.name}</strong>
                                        {#if pkg.description}
                                            <div class="package-description">{pkg.description}</div>
                                        {/if}
                                    </div>
                                </td>
                                <td>
                                    <span class="price-tag">{formatCurrency(pkg.price)}</span>
                                </td>
                                <td>{pkg.duration_days} วัน</td>
                                <td>
                                    <div class="features-list">
                                        {#each (pkg.features || []) as feature}
                                            <span class="feature-tag">{feature}</span>
                                        {/each}
                                    </div>
                                </td>
                                <td>
                                    <span class="status-badge {pkg.is_active ? 'active' : 'inactive'}">
                                        {pkg.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <span class="usage-count">
                                        {pkg.usageCount || 0}
                                    </span>
                                </td>
                                <td>{formatDate(pkg.created)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button 
                                            class="btn-icon" 
                                            title="แก้ไขแพ็กเกจ"
                                            on:click={() => editPackage(pkg)}
                                        >
                                            <span class="material-icons">edit</span>
                                        </button>
                                        <button 
                                            class="btn-icon {pkg.is_active ? 'warning' : 'success'}" 
                                            title={pkg.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                                            on:click={() => togglePackageStatus(pkg.id, pkg.is_active)}
                                        >
                                            <span class="material-icons">
                                                {pkg.is_active ? 'pause' : 'play_arrow'}
                                            </span>
                                        </button>
                                        <button 
                                            class="btn-icon danger" 
                                            title="ลบแพ็กเกจ"
                                            on:click={() => deletePackage(pkg.id, pkg.name)}
                                        >
                                            <span class="material-icons">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="8" class="empty-state">
                                    <div class="empty-message">
                                        <span class="material-icons">inventory_2</span>
                                        <p>ยังไม่มีแพ็กเกจโฆษณา</p>
                                        <button class="btn btn-primary" on:click={createPackage}>
                                            สร้างแพ็กเกจแรก
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Recent Activities -->
        <div class="section">
            <div class="section-header">
                <h2>Recent Package Activities</h2>
            </div>

            <div class="activity-list">
                {#each data.recentActivities as activity}
                    <div class="activity-item">
                        <div class="activity-info">
                            <h4>{activity.expand?.shop_id?.name || 'Unknown Shop'}</h4>
                            <p>ใช้แพ็กเกจ: {activity.expand?.package_id?.name}</p>
                            <div class="activity-date">{formatDate(activity.created)}</div>
                        </div>
                        <div class="activity-status">
                            <span class="status-badge {activity.status}">
                                {activity.status}
                            </span>
                        </div>
                    </div>
                {:else}
                    <div class="empty-state">
                        <span class="material-icons">history</span>
                        <p>ไม่มีกิจกรรมล่าสุด</p>
                    </div>
                {/each}
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

    /* Sections */
    .section {
        background: white;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .section-header h2 {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
    }

    /* Buttons */
    .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
    }

    .btn-primary {
        background: #3b82f6;
        color: white;
    }

    .btn-primary:hover {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    .btn-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: none;
        background: #f1f5f9;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;
        margin: 0 2px;
    }

    .btn-icon:hover {
        background: #e2e8f0;
        transform: translateY(-1px);
    }

    .btn-icon.success {
        background: #dcfce7;
        color: #16a34a;
    }

    .btn-icon.success:hover {
        background: #bbf7d0;
    }

    .btn-icon.warning {
        background: #fef3c7;
        color: #d97706;
    }

    .btn-icon.warning:hover {
        background: #fde68a;
    }

    .btn-icon.danger {
        background: #fef2f2;
        color: #dc2626;
    }

    .btn-icon.danger:hover {
        background: #fecaca;
    }

    /* Table */
    .table-container {
        overflow-x: hidden;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
    }

    .data-table th {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        background: #f8fafc;
    }

    .data-table td {
        font-size: 14px;
        color: #1e293b;
    }

    /* Package specific styles */
    .package-name strong {
        display: block;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
    }

    .package-description {
        font-size: 12px;
        color: #64748b;
    }

    .price-tag {
        font-weight: 600;
        color: #10b981;
        font-size: 16px;
    }

    .features-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .feature-tag {
        background: #eff6ff;
        color: #1d4ed8;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
    }

    .usage-count {
        font-weight: 600;
        color: #374151;
        background: #f1f5f9;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 12px;
    }

    .action-buttons {
        display: flex;
        gap: 4px;
    }

    /* Status badges */
    .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .status-badge.active {
        background-color: #dcfce7;
        color: #166534;
    }

    .status-badge.inactive {
        background-color: #fef2f2;
        color: #991b1b;
    }

    .status-badge.pending {
        background-color: #fef3c7;
        color: #92400e;
    }

    /* Activity List */
    .activity-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .activity-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
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

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #94a3b8;
    }

    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
    }

    .close-btn:hover {
        background: #f1f5f9;
        color: #1e293b;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #374151;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
        width: 100%;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 80px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .features-list {
        space-y: 8px;
    }

    .feature-item {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .feature-item input {
        flex: 1;
        margin: 0;
    }

    .remove-feature-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .remove-feature-btn:hover {
        background: #dc2626;
    }

    .add-feature-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 8px;
    }

    .add-feature-btn:hover {
        background: #059669;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
    }

    .modal-footer button {
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
    }

    .cancel-btn {
        background: #f1f5f9;
        color: #64748b;
    }

    .cancel-btn:hover {
        background: #e2e8f0;
    }

    .submit-btn {
        background: #10b981;
        color: white;
    }

    .submit-btn:hover:not(:disabled) {
        background: #059669;
    }

    .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .empty-state .material-icons {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }

    .empty-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
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

        .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
        }
    }
</style>

<!-- Create Package Modal -->
{#if showCreateModal}
    <div class="modal-overlay" role="dialog" aria-modal="true" on:click={() => showCreateModal = false} on:keydown={(e) => e.key === 'Escape' && (showCreateModal = false)}>
        <div class="modal" role="document" on:click|stopPropagation>
            <div class="modal-header">
                <h3>สร้างแพ็กเกจโฆษณาใหม่</h3>
                <button class="close-btn" on:click={() => showCreateModal = false}>
                    <span class="material-icons">close</span>
                </button>
            </div>

            <form on:submit|preventDefault={handleCreateSubmit}>
                <div class="form-group">
                    <label for="packageName">ชื่อแพ็กเกจ *</label>
                    <input
                        id="packageName"
                        type="text"
                        bind:value={packageName}
                        placeholder="เช่น แพ็กเกจพรีเมียม"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="packageDescription">รายละเอียด *</label>
                    <textarea
                        id="packageDescription"
                        bind:value={packageDescription}
                        placeholder="อธิบายรายละเอียดแพ็กเกจ..."
                        required
                    ></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="packagePrice">ราคา (บาท) *</label>
                        <input
                            id="packagePrice"
                            type="number"
                            bind:value={packagePrice}
                            min="1"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="packageDuration">ระยะเวลา (วัน) *</label>
                        <input
                            id="packageDuration"
                            type="number"
                            bind:value={packageDuration}
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="packagePriorityBoost">ระดับความสำคัญ (1-10) *</label>
                        <input
                            id="packagePriorityBoost"
                            type="number"
                            bind:value={packagePriorityBoost}
                            min="1"
                            max="10"
                            required
                        />
                        <small style="color: #64748b; font-size: 12px;">1 = ปกติ, 10 = สำคัญมาก</small>
                    </div>

                    <div class="form-group">
                        <label for="packageStatus">สถานะ *</label>
                        <select id="packageStatus" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; width: 100%;">
                            <option value="true">เปิดใช้งาน</option>
                            <option value="false">ปิดใช้งาน</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="package-features">คุณสมบัติแพ็กเกจ</label>
                    <div class="features-list" id="package-features">
                        {#each packageFeatures as feature, index}
                            <div class="feature-item">
                                <input
                                    type="text"
                                    bind:value={packageFeatures[index]}
                                    placeholder="เช่น โฆษณาบนหน้าแรก"
                                    aria-label="คุณสมบัติแพ็กเกจที่ {index + 1}"
                                />
                                {#if packageFeatures.length > 1}
                                    <button
                                        type="button"
                                        class="remove-feature-btn"
                                        on:click={() => removeFeature(index)}
                                    >
                                        <span class="material-icons">remove</span>
                                    </button>
                                {/if}
                            </div>
                        {/each}
                        <button type="button" class="add-feature-btn" on:click={addFeature}>
                            <span class="material-icons">add</span>
                            เพิ่มคุณสมบัติ
                        </button>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="cancel-btn" on:click={() => showCreateModal = false}>
                        ยกเลิก
                    </button>
                    <button type="submit" class="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'กำลังสร้าง...' : 'สร้างแพ็กเกจ'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Edit Package Modal -->
{#if showEditModal && editPackageData}
    <div class="modal-overlay" role="dialog" aria-modal="true" on:click={() => showEditModal = false} on:keydown={(e) => e.key === 'Escape' && (showEditModal = false)}>
        <div class="modal" role="document" on:click|stopPropagation>
            <div class="modal-header">
                <h3>แก้ไขแพ็กเกจโฆษณา</h3>
                <button class="close-btn" on:click={() => showEditModal = false}>
                    <span class="material-icons">close</span>
                </button>
            </div>

            <form on:submit|preventDefault={handleEditSubmit}>
                <div class="form-group">
                    <label for="editPackageName">ชื่อแพ็กเกจ *</label>
                    <input
                        id="editPackageName"
                        type="text"
                        bind:value={packageName}
                        placeholder="เช่น แพ็กเกจพรีเมียม"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="editPackageDescription">รายละเอียด *</label>
                    <textarea
                        id="editPackageDescription"
                        bind:value={packageDescription}
                        placeholder="อธิบายรายละเอียดแพ็กเกจ..."
                        required
                    ></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="editPackagePrice">ราคา (บาท) *</label>
                        <input
                            id="editPackagePrice"
                            type="number"
                            bind:value={packagePrice}
                            min="1"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="editPackageDuration">ระยะเวลา (วัน) *</label>
                        <input
                            id="editPackageDuration"
                            type="number"
                            bind:value={packageDuration}
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="editPackagePriorityBoost">ระดับความสำคัญ (1-10) *</label>
                        <input
                            id="editPackagePriorityBoost"
                            type="number"
                            bind:value={packagePriorityBoost}
                            min="1"
                            max="10"
                            required
                        />
                        <small style="color: #64748b; font-size: 12px;">1 = ปกติ, 10 = สำคัญมาก</small>
                    </div>

                    <div class="form-group">
                        <label>สถานะปัจจุบัน</label>
                        <div style="padding: 12px; background: #f8fafc; border-radius: 8px; color: #64748b;">
                            {editPackageData.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="edit-package-features">คุณสมบัติแพ็กเกจ</label>
                    <div class="features-list" id="edit-package-features">
                        {#each packageFeatures as feature, index}
                            <div class="feature-item">
                                <input
                                    type="text"
                                    bind:value={packageFeatures[index]}
                                    placeholder="เช่น โฆษณาบนหน้าแรก"
                                    aria-label="คุณสมบัติแพ็กเกจที่ {index + 1}"
                                />
                                {#if packageFeatures.length > 1}
                                    <button
                                        type="button"
                                        class="remove-feature-btn"
                                        on:click={() => removeFeature(index)}
                                    >
                                        <span class="material-icons">remove</span>
                                    </button>
                                {/if}
                            </div>
                        {/each}
                        <button type="button" class="add-feature-btn" on:click={addFeature}>
                            <span class="material-icons">add</span>
                            เพิ่มคุณสมบัติ
                        </button>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="cancel-btn" on:click={() => showEditModal = false}>
                        ยกเลิก
                    </button>
                    <button type="submit" class="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}