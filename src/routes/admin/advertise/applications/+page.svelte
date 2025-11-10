<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import Topbar from '$lib/Components/TopBar.svelte';
    import Sidebar from '$lib/Components/sidebar.svelte';
    
    export let data;
    
    let activeMenu = 'applications';
    let selectedStatus = 'all';
    let searchTerm = '';
    
    // Modal and action states
    let showApplicationModal = false;
    let selectedApplication: any = null;
    
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

    // Filter applications
    $: filteredApplications = data.applications.filter(app => {
        const matchesStatus = selectedStatus === 'all' || 
            app.status?.toLowerCase() === selectedStatus.toLowerCase();
        const matchesSearch = !searchTerm || 
            app.expand?.shop_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.expand?.package_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesStatus && matchesSearch;
    });

    // Application actions
    async function approveApplication(applicationId) {
        if (confirm('คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอนี้?')) {
            try {
                const formData = new FormData();
                formData.append('applicationId', applicationId);
                
                const result = await fetch('?/approve', {
                    method: 'POST',
                    body: formData
                });
                
                if (result.ok) {
                    alert('อนุมัติคำขอเรียบร้อยแล้ว');
                    location.reload();
                } else {
                    alert('เกิดข้อผิดพลาดในการอนุมัติคำขอ');
                }
            } catch (error) {
                console.error('Error approving application:', error);
                alert('เกิดข้อผิดพลาดในการอนุมัติคำขอ');
            }
        }
    }

    async function rejectApplication(applicationId) {
        const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธคำขอ:');
        if (reason) {
            try {
                const formData = new FormData();
                formData.append('applicationId', applicationId);
                formData.append('reason', reason);
                
                const result = await fetch('?/reject', {
                    method: 'POST',
                    body: formData
                });
                
                if (result.ok) {
                    alert('ปฏิเสธคำขอเรียบร้อยแล้ว');
                    location.reload();
                } else {
                    alert('เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
                }
            } catch (error) {
                console.error('Error rejecting application:', error);
                alert('เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
            }
        }
    }

    async function updateApplicationStatus(applicationId, newStatus) {
        const statusText = {
            'active': 'เปิดใช้งาน',
            'expired': 'หมดอายุ',
            'cancelled': 'ยกเลิก',
            'pending': 'รอดำเนินการ'
        };
        
        const confirmMessage = `คุณต้องการเปลี่ยนสถานะเป็น "${statusText[newStatus]}" หรือไม่?`;
        
        if (confirm(confirmMessage)) {
            try {
                const formData = new FormData();
                formData.append('applicationId', applicationId);
                formData.append('status', newStatus);
                
                const result = await fetch('?/updateStatus', {
                    method: 'POST',
                    body: formData
                });
                
                if (result.ok) {
                    alert('เปลี่ยนสถานะเรียบร้อยแล้ว');
                    location.reload();
                } else {
                    alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
                }
            } catch (error) {
                console.error('Error updating status:', error);
                alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
            }
        }
    }

    async function viewApplicationDetails(applicationId: string) {
        const application = data.applications.find(app => app.id === applicationId);
        if (application) {
            selectedApplication = application;
            showApplicationModal = true;
        }
    }

    function closeApplicationModal() {
        showApplicationModal = false;
        selectedApplication = null;
    }

    function exportApplications() {
        const csvContent = generateApplicationCSV(filteredApplications);
        downloadCSV(csvContent, `applications_report_${new Date().toISOString().split('T')[0]}.csv`);
    }

    function generateApplicationCSV(applications: any[]) {
        const headers = ['Restaurant', 'Package', 'Duration', 'Price', 'Priority', 'Status', 'Applied Date', 'Start Date', 'End Date'];
        const rows = applications.map(app => [
            app.expand?.shop_id?.name || 'Unknown Shop',
            app.expand?.package_id?.name || 'Unknown Package',
            `${app.expand?.package_id?.duration_days || 0} วัน`,
            app.expand?.package_id?.price || 0,
            `P${app.priority_level || 0}`,
            app.status || 'Unknown',
            formatDate(app.created),
            formatDate(app.start_date),
            formatDate(app.end_date)
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    function downloadCSV(content: string, filename: string) {
        const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Get status color
    function getStatusColor(status: string) {
        switch(status?.toLowerCase()) {
            case 'pending': return '#f59e0b';
            case 'approved': return '#10b981';
            case 'rejected': return '#ef4444';
            case 'active': return '#10b981'; // เปลี่ยนเป็นสีเขียว
            case 'cancelled': return '#ef4444';
            case 'expired': return '#6b7280';
            default: return '#6b7280';
        }
    }

    // Get priority color - กำหนดสีตาม priority level
    function getPriorityColor(priority: number | string) {
        // แปลงเป็นตัวเลขถ้าเป็น string
        const priorityNum = typeof priority === 'string' ? parseInt(priority) : priority;
        
        // กำหนดสีตาม priority level (เลขยิ่งมากยิ่งสำคัญ)
        if (priorityNum >= 8) return '#ef4444'; // Red - สูงสุด (P8-P10)
        else if (priorityNum >= 6) return '#f59e0b'; // Amber - ปานกลาง (P5-P7)  
         else if (priorityNum >= 4) return '#10b981';
        else if (priorityNum >= 2) return '#000000'; // Green - ต่ำ (P2-P4)
        else return '#6b7280'; // Gray - Default
    }

    onMount(() => {
        console.log('Applications Management data:', data);
    });
</script>

<svelte:head>
    <title>Applications Review - SCQ Admin</title>
</svelte:head>

<!-- Top Navigation -->
<Topbar title="Admin Panel - Application Review" logoSrc="/SCQ_logo.png" />

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
                <span class="breadcrumb-item current">Applications</span>
            </div>
            <div class="page-title">
                <h1>Application Review</h1>
                <p>ตรวจสอบและอนุมัติคำขอโฆษณาจากร้านอาหาร</p>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-section">
            <div class="kpi-grid">
                <!-- Total Applications -->
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <span class="material-icons">assignment</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.totalApplications)}</div>
                        <div class="kpi-label">Total Applications</div>
                        <div class="kpi-sublabel">คำขอทั้งหมด</div>
                    </div>
                </div>

                <!-- Pending Applications -->
                <div class="kpi-card pending">
                    <div class="kpi-icon">
                        <span class="material-icons">pending_actions</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.pendingApplications)}</div>
                        <div class="kpi-label">Pending Review</div>
                        <div class="kpi-sublabel">รอการพิจารณา</div>
                    </div>
                </div>

                <!-- Active Applications -->
                <div class="kpi-card active">
                    <div class="kpi-icon">
                        <span class="material-icons">check_circle</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.activeApplications)}</div>
                        <div class="kpi-label">Active Ads</div>
                        <div class="kpi-sublabel">โฆษณาที่ใช้งาน</div>
                    </div>
                </div>

                <!-- Approval Rate -->
                <div class="kpi-card revenue">
                    <div class="kpi-icon">
                        <span class="material-icons">analytics</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{data.stats.approvalRate}%</div>
                        <div class="kpi-label">Approval Rate</div>
                        <div class="kpi-sublabel">อัตราการอนุมัติ</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters and Search -->
        <div class="section">
            <div class="filters-section">
                <div class="filter-group">
                    <label for="status-filter">Status:</label>
                    <select id="status-filter" bind:value={selectedStatus} class="filter-select">
                        <option value="all">All Applications</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div class="search-group">
                    <span class="material-icons">search</span>
                    <input 
                        type="text" 
                        placeholder="ค้นหาร้านอาหารหรือแพ็กเกจ..."
                        bind:value={searchTerm}
                        class="search-input"
                    >
                </div>
            </div>
        </div>

        <!-- Applications Table -->
        <div class="section">
            <div class="section-header">
                <h2>Advertisement Applications ({filteredApplications.length})</h2>
                <div class="header-actions">
                    <button class="btn btn-outline" on:click={exportApplications}>
                        <span class="material-icons">download</span>
                        Export ({filteredApplications.length})
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Restaurant</th>
                            <th>Package</th>
                            <th>Duration</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Applied Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredApplications as app}
                            <tr>
                                <td>
                                    <div class="restaurant-info">
                                        <strong>{app.expand?.shop_id?.name || 'Unknown Shop'}</strong>
                                        <div class="restaurant-details">
                                            {app.expand?.shop_id?.Addr || 'ไม่ได้ระบุที่อยู่'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="package-info">
                                        <strong>{app.expand?.package_id?.name || 'Unknown Package'}</strong>
                                        <div class="package-price">
                                            {formatCurrency(app.expand?.package_id?.price || 0)}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="duration-badge">
                                        {app.expand?.package_id?.duration_days || 0} วัน
                                    </span>
                                </td>
                                <td>
                                    <span 
                                        class="priority-badge" 
                                        style="background-color: {getPriorityColor(app.priority_level)}20; color: {getPriorityColor(app.priority_level)}"
                                    >
                                        P{app.priority_level || 1}
                                    </span>
                                </td>
                                <td>
                                    <span 
                                        class="status-badge" 
                                        style="background-color: {getStatusColor(app.status)}20; color: {getStatusColor(app.status)}"
                                    >
                                        {app.status}
                                    </span>
                                </td>
                                <td>{formatDate(app.created)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button 
                                            class="btn-icon" 
                                            title="View Details"
                                            on:click={() => viewApplicationDetails(app.id)}
                                        >
                                            <span class="material-icons">visibility</span>
                                        </button>
                                        
                                        {#if app.status === 'pending'}
                                            <button 
                                                class="btn-icon success" 
                                                title="Approve Application"
                                                on:click={() => approveApplication(app.id)}
                                            >
                                                <span class="material-icons">check</span>
                                            </button>
                                            <button 
                                                class="btn-icon danger" 
                                                title="Reject Application"
                                                on:click={() => rejectApplication(app.id)}
                                            >
                                                <span class="material-icons">close</span>
                                            </button>
                                        {:else if app.status === 'active'}
                                            <button 
                                                class="btn-icon warning" 
                                                title="Mark as Expired"
                                                on:click={() => updateApplicationStatus(app.id, 'expired')}
                                            >
                                                <span class="material-icons">schedule</span>
                                            </button>
                                            <button 
                                                class="btn-icon danger" 
                                                title="Cancel Advertisement"
                                                on:click={() => updateApplicationStatus(app.id, 'cancelled')}
                                            >
                                                <span class="material-icons">cancel</span>
                                            </button>
                                        {:else if app.status === 'expired'}
                                            <button 
                                                class="btn-icon success" 
                                                title="Reactivate"
                                                on:click={() => updateApplicationStatus(app.id, 'active')}
                                            >
                                                <span class="material-icons">refresh</span>
                                            </button>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="7" class="empty-state">
                                    <div class="empty-message">
                                        <span class="material-icons">assignment</span>
                                        <p>ไม่มีคำขอโฆษณา</p>
                                        {#if selectedStatus !== 'all' || searchTerm}
                                            <button class="btn btn-outline" on:click={() => { selectedStatus = 'all'; searchTerm = ''; }}>
                                                Clear Filters
                                            </button>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>


    </main>

<!-- Application Details Modal -->
{#if showApplicationModal && selectedApplication}
    <div class="modal-overlay" role="dialog" aria-modal="true" on:click={closeApplicationModal} on:keydown={(e) => e.key === 'Escape' && closeApplicationModal()}>
        <div class="modal-content" on:click|stopPropagation role="document">
            <div class="modal-header">
                <div class="header-content">
                    <div class="header-icon">
                        <span class="material-icons">store</span>
                    </div>
                    <h2>รายละเอียดใบสมัครโฆษณา</h2>
                </div>
                <button class="modal-close" on:click={closeApplicationModal}>
                    <span class="material-icons">close</span>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="application-details">
                    <div class="detail-section">
                        <h3>ข้อมูลใบสมัคร</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Application ID:</span>
                                <span>#{selectedApplication.id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">สถานะ:</span>
                                <span 
                                    class="status-badge" 
                                    style="background-color: {getStatusColor(selectedApplication.status)}20; color: {getStatusColor(selectedApplication.status)}"
                                >
                                    {selectedApplication.status?.toUpperCase()}
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ระดับความสำคัญ:</span>
                                <span 
                                    class="priority-badge" 
                                    style="background-color: {getPriorityColor(selectedApplication.priority_level)}20; color: {getPriorityColor(selectedApplication.priority_level)}"
                                >
                                    P{selectedApplication.priority_level || 1}
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">วันที่สมัคร:</span>
                                <span>{formatDate(selectedApplication.created)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">วันที่เริ่มต้น:</span>
                                <span>{formatDate(selectedApplication.start_date) || 'ยังไม่กำหนด'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">วันที่สิ้นสุด:</span>
                                <span>{formatDate(selectedApplication.end_date) || 'ยังไม่กำหนด'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>ข้อมูลร้านอาหาร</h3>
                        <div class="restaurant-details">
                            <div class="detail-item">
                                <span class="detail-label">ชื่อร้าน:</span>
                                <span>{selectedApplication.expand?.shop_id?.name || 'Unknown Shop'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ประเภทร้าน:</span>
                                <span>{selectedApplication.expand?.shop_id?.Type_Shop || 'ไม่ระบุ'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ที่อยู่:</span>
                                <span>{selectedApplication.expand?.shop_id?.Addr || 'ไม่ได้ระบุที่อยู่'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">เบอร์โทร:</span>
                                <span>{selectedApplication.expand?.shop_id?.Phone || 'ไม่ระบุ'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>ข้อมูลแพ็กเกจโฆษณา</h3>
                        <div class="package-details">
                            <div class="detail-item">
                                <span class="detail-label">ชื่อแพ็กเกจ:</span>
                                <span>{selectedApplication.expand?.package_id?.name || 'Unknown Package'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ระยะเวลา:</span>
                                <span>{selectedApplication.expand?.package_id?.duration_days || 0} วัน</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ราคา:</span>
                                <span class="amount">{formatCurrency(selectedApplication.expand?.package_id?.price || 0)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Priority Boost:</span>
                                <span>{selectedApplication.expand?.package_id?.priority_boost || 1}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">รายละเอียด:</span>
                                <span>{selectedApplication.expand?.package_id?.description || 'ไม่มีรายละเอียด'}</span>
                            </div>
                        </div>
                    </div>

                    {#if selectedApplication.expand?.package_id?.features}
                        <div class="detail-section">
                            <h3>คุณสมบัติแพ็กเกจ</h3>
                            <div class="features-list">
                                {#each Object.entries(selectedApplication.expand.package_id.features) as [key, value]}
                                    <div class="feature-item">
                                        <span class="material-icons">check_circle</span>
                                        <span>{key}: {value}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="modal-footer">
                <div class="footer-left">
                    {#if selectedApplication.status?.toLowerCase() === 'active'}
                        <button class="btn btn-warning" on:click={() => { updateApplicationStatus(selectedApplication.id, 'expired'); closeApplicationModal(); }}>
                            <span class="material-icons">schedule</span>
                            ทำให้หมดอายุ
                        </button>
                    {/if}
                </div>
                <div class="footer-right">
                    {#if selectedApplication.status?.toLowerCase() === 'pending'}
                        <button class="btn btn-danger" on:click={() => { rejectApplication(selectedApplication.id); closeApplicationModal(); }}>
                            <span class="material-icons">close</span>
                            ปฏิเสธ
                        </button>
                        <button class="btn btn-success" on:click={() => { approveApplication(selectedApplication.id); closeApplicationModal(); }}>
                            <span class="material-icons">check</span>
                            อนุมัติ
                        </button>
                    {/if}
                    <button class="btn btn-outline" on:click={closeApplicationModal}>
                        <span class="material-icons">close</span>
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

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

    /* Filters */
    .filters-section {
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .filter-group label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
    }

    .filter-select {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        color: #374151;
    }

    .search-group {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f9fafb;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        flex: 1;
        max-width: 300px;
    }

    .search-group .material-icons {
        color: #6b7280;
        font-size: 20px;
    }

    .search-input {
        border: none;
        background: transparent;
        flex: 1;
        font-size: 14px;
        color: #374151;
    }

    .search-input:focus {
        outline: none;
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



    .btn-outline {
        background: transparent;
        border: 1px solid #d1d5db;
        color: #374151;
    }

    .btn-outline:hover {
        background: #f9fafb;
        border-color: #9ca3af;
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

    /* Application specific styles */
    .restaurant-info strong {
        display: block;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
    }

    .restaurant-details {
        font-size: 12px;
        color: #64748b;
    }

    .package-info strong {
        display: block;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
    }

    .package-price {
        font-size: 12px;
        color: #10b981;
        font-weight: 500;
    }

    .duration-badge {
        background: #eff6ff;
        color: #1d4ed8;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }

    .priority-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
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



    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #94a3b8;
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

        .filters-section {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
        }

        .search-group {
            max-width: none;
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

    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }

    .modal-content {
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 900px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        color: white;
        border-radius: 16px 16px 0 0;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .header-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    }

    .header-icon .material-icons {
        font-size: 20px;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .modal-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .modal-body {
        padding: 24px;
        background: #f8fafc;
    }

    .application-details {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .detail-section {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
    }

    .detail-section:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
    }

    .detail-section h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Noto Sans Thai', sans-serif;
        padding-bottom: 12px;
        border-bottom: 2px solid #f1f5f9;
    }

    .detail-section h3::before {
        content: '●';
        color: #f97316;
        font-size: 16px;
        font-weight: bold;
    }

    .detail-grid, .restaurant-details, .package-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .detail-label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .detail-item span:not(.detail-label) {
        font-size: 16px;
        font-weight: 500;
        color: #1e293b;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .detail-item .amount {
        font-size: 20px;
        font-weight: 700;
        color: #16a34a;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .features-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #f0fdf4;
        border-radius: 8px;
        border: 1px solid #bbf7d0;
    }

    .feature-item .material-icons {
        color: #16a34a;
        font-size: 20px;
    }

    .modal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
        border-radius: 0 0 16px 16px;
    }

    .footer-left, .footer-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .modal-footer .btn {
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 500;
        font-family: 'Noto Sans Thai', sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
    }

    .modal-footer .btn-success {
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        color: white;
        box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
    }

    .modal-footer .btn-success:hover {
        background: linear-gradient(135deg, #15803d 0%, #166534 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(22, 163, 74, 0.3);
    }

    .modal-footer .btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
    }

    .modal-footer .btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
    }

    .modal-footer .btn-warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
    }

    .modal-footer .btn-warning:hover {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
    }

    .modal-footer .btn-outline {
        background: white;
        border: 2px solid #e2e8f0;
        color: #64748b;
    }

    .modal-footer .btn-outline:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;
        transform: translateY(-1px);
    }

    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            margin: 20px;
        }

        .detail-grid, .restaurant-details, .package-details {
            grid-template-columns: 1fr;
        }

        .modal-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
        }

        .footer-left, .footer-right {
            flex-direction: column;
            gap: 8px;
        }
    }
</style>