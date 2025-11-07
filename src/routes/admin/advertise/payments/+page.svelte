<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { env } from '$env/dynamic/public';
    import Topbar from '$lib/Components/Topbar.svelte';
    import Sidebar from '$lib/Components/sidebar.svelte';
    
    export let data;
    
    let activeMenu = 'payments';
    let selectedStatus = 'all';
    let selectedMethod = 'all';
    let searchTerm = '';
    
    // Modal state
    let showPaymentModal = false;
    let selectedPayment: any = null;
    
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
        goto(`/admin/restaurant/${restaurantId}`);
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

    // Filter payments
    $: filteredPayments = data.payments.filter(payment => {
        const matchesStatus = selectedStatus === 'all' || 
            payment.status?.toLowerCase() === selectedStatus.toLowerCase();
        const matchesMethod = selectedMethod === 'all' || payment.payment_method === selectedMethod;
        const matchesSearch = !searchTerm || 
            payment.expand?.shop_advertisement_id?.expand?.shop_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesStatus && matchesMethod && matchesSearch;
    });

    // Payment actions
    async function confirmPayment(paymentId) {
        const notes = prompt('กรุณาระบุหมายเหตุ (ถ้ามี):');
        if (notes === null) return; // User cancelled
        
        if (confirm('คุณแน่ใจหรือไม่ที่จะยืนยันการชำระเงินนี้?')) {
            try {
                const formData = new FormData();
                formData.append('paymentId', paymentId);
                formData.append('notes', notes || '');

                const response = await fetch('?/confirmPayment', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('ยืนยันการชำระเงินเรียบร้อยแล้ว');
                    location.reload();
                } else {
                    throw new Error('Failed to confirm payment');
                }
            } catch (error) {
                console.error('Error confirming payment:', error);
                alert('เกิดข้อผิดพลาดในการยืนยันการชำระเงิน');
            }
        }
    }

    async function rejectPayment(paymentId) {
        const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
        if (!reason) return; // User cancelled or empty
        
        if (confirm('คุณแน่ใจหรือไม่ที่จะปฏิเสธการชำระเงินนี้?')) {
            try {
                const formData = new FormData();
                formData.append('paymentId', paymentId);
                formData.append('reason', reason);

                const response = await fetch('?/rejectPayment', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('ปฏิเสธการชำระเงินเรียบร้อยแล้ว');
                    location.reload();
                } else {
                    throw new Error('Failed to reject payment');
                }
            } catch (error) {
                console.error('Error rejecting payment:', error);
                alert('เกิดข้อผิดพลาดในการปฏิเสธการชำระเงิน');
            }
        }
    }

    async function processRefund(paymentId) {
        const reason = prompt('กรุณาระบุเหตุผลในการคืนเงิน:');
        if (!reason) return; // User cancelled or empty
        
        if (confirm('คุณแน่ใจหรือไม่ที่จะคืนเงินรายการนี้?')) {
            try {
                const formData = new FormData();
                formData.append('paymentId', paymentId);
                formData.append('reason', reason);

                const response = await fetch('?/refundPayment', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('ดำเนินการคืนเงินเรียบร้อยแล้ว');
                    location.reload();
                } else {
                    throw new Error('Failed to process refund');
                }
            } catch (error) {
                console.error('Error processing refund:', error);
                alert('เกิดข้อผิดพลาดในการคืนเงิน');
            }
        }
    }

    async function viewPaymentDetails(paymentId: string) {
        const payment = data.payments.find(p => p.id === paymentId);
        if (payment) {
            selectedPayment = payment;
            showPaymentModal = true;
        }
    }

    function closePaymentModal() {
        showPaymentModal = false;
        selectedPayment = null;
    }

    function exportPayments() {
        const csvContent = generateCSV(filteredPayments);
        downloadCSV(csvContent, `payment_report_${new Date().toISOString().split('T')[0]}.csv`);
    }

    function generateCSV(payments: any[]) {
        const headers = ['Transaction ID', 'Restaurant', 'Package', 'Amount', 'Method', 'Status', 'Date', 'Notes'];
        const rows = payments.map(payment => [
            payment.transaction_id || payment.id.slice(-8).toUpperCase(),
            payment.expand?.shop_advertisement_id?.expand?.shop_id?.name || 'Unknown Shop',
            payment.expand?.shop_advertisement_id?.expand?.package_id?.name || 'Unknown Package',
            payment.amount || 0,
            payment.payment_method || 'Unknown',
            payment.status || 'Unknown',
            formatDate(payment.created),
            payment.notes || ''
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

    // Get payment method icon
    function getPaymentMethodIcon(method) {
        switch(method) {
            case 'credit_card': return 'credit_card';
            case 'bank_transfer': return 'account_balance';
            case 'promptpay': return 'qr_code';
            case 'cash': return 'payments';
            default: return 'payment';
        }
    }

    // Get status color
    function getStatusColor(status) {
        switch(status) {
            case 'completed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'failed': return '#ef4444';
            case 'refunded': return '#6b7280';
            default: return '#6b7280';
        }
    }

    // Get payment methods for filter
    $: paymentMethods = [...new Set(data.payments.map(p => p.payment_method).filter(Boolean))];

    onMount(() => {
        console.log('Payments Management data:', data);
    });
</script>

<svelte:head>
    <title>Payment Management - SCQ Admin</title>
</svelte:head>

<!-- Top Navigation -->
<Topbar title="Admin Panel - Payment Management" logoSrc="/SCQ_logo.png" />

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
                <span class="breadcrumb-item current">Payments</span>
            </div>
            <div class="page-title">
                <h1>Payment Management</h1>
                <p>จัดการการชำระเงินสำหรับโฆษณาร้านอาหาร</p>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-section">
            <div class="kpi-grid">
                <!-- Total Payments -->
                <div class="kpi-card">
                    <div class="kpi-icon">
                        <span class="material-icons">payment</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.totalPayments)}</div>
                        <div class="kpi-label">Total Payments</div>
                        <div class="kpi-sublabel">รายการทั้งหมด</div>
                    </div>
                </div>

                <!-- Completed Payments -->
                <div class="kpi-card active">
                    <div class="kpi-icon">
                        <span class="material-icons">check_circle</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.completedPayments)}</div>
                        <div class="kpi-label">Completed</div>
                        <div class="kpi-sublabel">ชำระเรียบร้อย</div>
                    </div>
                </div>

                <!-- Pending Payments -->
                <div class="kpi-card pending">
                    <div class="kpi-icon">
                        <span class="material-icons">schedule</span>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">{formatNumber(data.stats.pendingPayments)}</div>
                        <div class="kpi-label">Pending</div>
                        <div class="kpi-sublabel">รอชำระเงิน</div>
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

        <!-- Revenue Summary -->
        <div class="section">
            <div class="section-header">
                <h2>Revenue Summary</h2>
            </div>
            
            <div class="revenue-grid">
                <div class="revenue-card">
                    <div class="revenue-header">
                        <h3>This Month</h3>
                        <span class="material-icons">trending_up</span>
                    </div>
                    <div class="revenue-amount">{formatCurrency(data.stats.monthlyRevenue)}</div>
                    <div class="revenue-label">รายได้เดือนนี้</div>
                </div>

                <div class="revenue-methods">
                    <h3>Payment Methods</h3>
                    <div class="methods-list">
                        {#each Object.entries(data.stats.paymentMethods || {}) as [method, amount]}
                            <div class="method-item">
                                <div class="method-info">
                                    <span class="material-icons">{getPaymentMethodIcon(method)}</span>
                                    <span class="method-name">{method.replace('_', ' ').toUpperCase()}</span>
                                </div>
                                <div class="method-amount">{formatCurrency(amount)}</div>
                            </div>
                        {:else}
                            <div class="empty-state">
                                <p>ไม่มีข้อมูลการชำระเงิน</p>
                            </div>
                        {/each}
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
                        <option value="all">All Payments</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="method-filter">Method:</label>
                    <select id="method-filter" bind:value={selectedMethod} class="filter-select">
                        <option value="all">All Methods</option>
                        {#each paymentMethods as method}
                            <option value={method}>{method.replace('_', ' ').toUpperCase()}</option>
                        {/each}
                    </select>
                </div>

                <div class="search-group">
                    <span class="material-icons">search</span>
                    <input 
                        type="text" 
                        placeholder="ค้นหาร้านอาหารหรือรหัสธุรกรรม..."
                        bind:value={searchTerm}
                        class="search-input"
                    >
                </div>
            </div>
        </div>

        <!-- Payments Table -->
        <div class="section">
            <div class="section-header">
                <h2>Payment Transactions ({filteredPayments.length})</h2>
                <div class="header-actions">
                    <button class="btn btn-outline" on:click={exportPayments}>
                        <span class="material-icons">download</span>
                        Export ({filteredPayments.length})
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Restaurant</th>
                            <th>Package</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredPayments as payment}
                            <tr>
                                <td>
                                    <div class="transaction-id">
                                        <strong>#{payment.transaction_id || payment.id.slice(-8).toUpperCase()}</strong>
                                        {#if payment.reference_id}
                                            <div class="reference-id">Ref: {payment.reference_id}</div>
                                        {/if}
                                    </div>
                                </td>
                                <td>
                                    <div class="restaurant-info">
                                        <strong>{payment.expand?.shop_advertisement_id?.expand?.shop_id?.name || 'Unknown Shop'}</strong>
                                        <div class="shop-type">{payment.expand?.shop_advertisement_id?.expand?.shop_id?.Type_Shop || ''}</div>
                                    </div>
                                </td>
                                <td>
                                    <div class="package-info">
                                        <strong>{payment.expand?.shop_advertisement_id?.expand?.package_id?.name || 'Unknown Package'}</strong>
                                        <div class="package-duration">{payment.expand?.shop_advertisement_id?.expand?.package_id?.duration_days || 0} วัน</div>
                                    </div>
                                </td>
                                <td>
                                    <div class="amount-display">
                                        {formatCurrency(payment.amount)}
                                    </div>
                                </td>
                                <td>
                                    <div class="payment-method">
                                        <span class="material-icons">{getPaymentMethodIcon(payment.payment_method)}</span>
                                        <span>{payment.payment_method?.replace('_', ' ').toUpperCase() || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span 
                                        class="status-badge" 
                                        style="background-color: {getStatusColor(payment.status)}20; color: {getStatusColor(payment.status)}"
                                    >
                                        {payment.status}
                                    </span>
                                </td>
                                <td>{formatDate(payment.created)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button 
                                            class="btn-icon" 
                                            title="View Details"
                                            on:click={() => viewPaymentDetails(payment.id)}
                                        >
                                            <span class="material-icons">visibility</span>
                                        </button>
                                        
                                        {#if payment.status?.toLowerCase() === 'pending'}
                                            <button 
                                                class="btn-icon success" 
                                                title="Confirm Payment"
                                                on:click={() => confirmPayment(payment.id)}
                                            >
                                                <span class="material-icons">check_circle</span>
                                            </button>
                                            <button 
                                                class="btn-icon danger" 
                                                title="Reject Payment"
                                                on:click={() => rejectPayment(payment.id)}
                                            >
                                                <span class="material-icons">cancel</span>
                                            </button>
                                        {/if}
                                        
                                        {#if payment.status?.toLowerCase() === 'completed'}
                                            <button 
                                                class="btn-icon warning" 
                                                title="Refund"
                                                on:click={() => processRefund(payment.id)}
                                            >
                                                <span class="material-icons">undo</span>
                                            </button>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="8" class="empty-state">
                                    <div class="empty-message">
                                        <span class="material-icons">payment</span>
                                        <p>ไม่มีรายการชำระเงิน</p>
                                        {#if selectedStatus !== 'all' || selectedMethod !== 'all' || searchTerm}
                                            <button class="btn btn-outline" on:click={() => { selectedStatus = 'all'; selectedMethod = 'all'; searchTerm = ''; }}>
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

<!-- Payment Details Modal -->
{#if showPaymentModal && selectedPayment}
    <div class="modal-overlay" on:click={closePaymentModal}>
        <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header">
                <div class="header-content">
                    <div class="header-icon">
                        <span class="material-icons">receipt</span>
                    </div>
                    <h2>รายละเอียดการชำระเงิน</h2>
                </div>
                <button class="modal-close" on:click={closePaymentModal}>
                    <span class="material-icons">close</span>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="payment-details">
                    <div class="detail-section">
                        <h3>ข้อมูลการชำระเงิน</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Transaction ID:</label>
                                <span>#{selectedPayment.transaction_id || selectedPayment.id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div class="detail-item">
                                <label>จำนวนเงิน:</label>
                                <span class="amount">{formatCurrency(selectedPayment.amount)}</span>
                            </div>
                            <div class="detail-item">
                                <label>วิธีการชำระเงิน:</label>
                                <span class="payment-method">
                                    <span class="material-icons">{getPaymentMethodIcon(selectedPayment.payment_method)}</span>
                                    {selectedPayment.payment_method?.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>สถานะ:</label>
                                <span 
                                    class="status-badge" 
                                    style="background-color: {getStatusColor(selectedPayment.status)}20; color: {getStatusColor(selectedPayment.status)}"
                                >
                                    {selectedPayment.status}
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>วันที่ชำระเงิน:</label>
                                <span>{formatDate(selectedPayment.payment_date)}</span>
                            </div>
                            <div class="detail-item">
                                <label>วันที่สร้าง:</label>
                                <span>{formatDate(selectedPayment.created)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>ข้อมูลร้านอาหาร</h3>
                        <div class="restaurant-details">
                            <div class="detail-item">
                                <label>ชื่อร้าน:</label>
                                <span>{selectedPayment.expand?.shop_advertisement_id?.expand?.shop_id?.name || 'Unknown Shop'}</span>
                            </div>
                            <div class="detail-item">
                                <label>ประเภทร้าน:</label>
                                <span>{selectedPayment.expand?.shop_advertisement_id?.expand?.shop_id?.Type_Shop || 'ไม่ระบุ'}</span>
                            </div>
                            <div class="detail-item">
                                <label>ที่อยู่:</label>
                                <span>{selectedPayment.expand?.shop_advertisement_id?.expand?.shop_id?.Addr || 'ไม่ระบุ'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>ข้อมูลแพ็กเกจโฆษณา</h3>
                        <div class="package-details">
                            <div class="detail-item">
                                <label>ชื่อแพ็กเกจ:</label>
                                <span>{selectedPayment.expand?.shop_advertisement_id?.expand?.package_id?.name || 'Unknown Package'}</span>
                            </div>
                            <div class="detail-item">
                                <label>ระยะเวลา:</label>
                                <span>{selectedPayment.expand?.shop_advertisement_id?.expand?.package_id?.duration_days || 0} วัน</span>
                            </div>
                            <div class="detail-item">
                                <label>ราคาแพ็กเกจ:</label>
                                <span>{formatCurrency(selectedPayment.expand?.shop_advertisement_id?.expand?.package_id?.price || 0)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Priority Boost:</label>
                                <span>{selectedPayment.expand?.shop_advertisement_id?.expand?.package_id?.priority_boost || 1}</span>
                            </div>
                        </div>
                    </div>

                    {#if selectedPayment.payment_proof && selectedPayment.payment_proof.length > 0}
                        <div class="detail-section">
                            <h3>หลักฐานการชำระเงิน</h3>
                            <div class="payment-proof">
                                {#each selectedPayment.payment_proof as proof}
                                    <div class="proof-item">
                                        <a href={`${env.PUBLIC_POCKETBASE_URL}/api/files/advertisement_payments/${selectedPayment.id}/${proof}`} target="_blank" class="proof-link">
                                            <span class="material-icons">description</span>
                                            {proof}
                                        </a>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    {#if selectedPayment.notes}
                        <div class="detail-section">
                            <h3>หมายเหตุ</h3>
                            <p class="notes">{selectedPayment.notes}</p>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="modal-footer">
                <div class="footer-left">
                    {#if selectedPayment.status?.toLowerCase() === 'completed'}
                        <button class="btn btn-warning" on:click={() => { processRefund(selectedPayment.id); closePaymentModal(); }}>
                            <span class="material-icons">undo</span>
                            คืนเงิน
                        </button>
                    {/if}
                </div>
                <div class="footer-right">
                    {#if selectedPayment.status?.toLowerCase() === 'pending'}
                        <button class="btn btn-danger" on:click={() => { rejectPayment(selectedPayment.id); closePaymentModal(); }}>
                            <span class="material-icons">close</span>
                            ปฏิเสธ
                        </button>
                        <button class="btn btn-success" on:click={() => { confirmPayment(selectedPayment.id); closePaymentModal(); }}>
                            <span class="material-icons">check</span>
                            ยืนยันการชำระเงิน
                        </button>
                    {/if}
                    <button class="btn btn-outline" on:click={closePaymentModal}>
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

    /* Revenue Section */
    .revenue-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 24px;
    }

    .revenue-card {
        background: #f8fafc;
        border-radius: 16px;
        padding: 24px;
        border: 1px solid #e2e8f0;
    }

    .revenue-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .revenue-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
    }

    .revenue-header .material-icons {
        color: #10b981;
        font-size: 24px;
    }

    .revenue-amount {
        font-size: 32px;
        font-weight: 700;
        color: #10b981;
        margin-bottom: 8px;
    }

    .revenue-label {
        font-size: 14px;
        color: #64748b;
    }

    .revenue-methods h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 16px 0;
    }

    .methods-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .method-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }

    .method-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .method-info .material-icons {
        color: #64748b;
        font-size: 20px;
    }

    .method-name {
        font-weight: 500;
        color: #374151;
    }

    .method-amount {
        font-weight: 600;
        color: #10b981;
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
        background: #fee2e2;
        color: #dc2626;
    }

    .btn-icon.danger:hover {
        background: #fecaca;
    }

    .btn-icon.warning {
        background: #fef3c7;
        color: #d97706;
    }

    .btn-icon.warning:hover {
        background: #fde68a;
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

    /* Payment specific styles */
    .transaction-id strong {
        display: block;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
    }

    .reference-id {
        font-size: 12px;
        color: #64748b;
    }

    .restaurant-info strong {
        font-weight: 600;
        color: #1e293b;
    }

    .amount-display {
        font-weight: 600;
        color: #10b981;
        font-size: 16px;
    }

    .payment-method {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .payment-method .material-icons {
        color: #64748b;
        font-size: 18px;
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

        .revenue-grid {
            grid-template-columns: 1fr;
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

    /* Additional styles for shop and package info */
    .shop-type {
        font-size: 12px;
        color: #64748b;
        margin-top: 2px;
    }

    .package-duration {
        font-size: 12px;
        color: #64748b;
        margin-top: 2px;
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
        max-width: 800px;
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

    .payment-details {
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

    .detail-item label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .detail-item span {
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

    .detail-item .payment-method {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .payment-proof {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .proof-item {
        display: flex;
        align-items: center;
    }

    .proof-link {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #3b82f6;
        text-decoration: none;
        padding: 8px 12px;
        border-radius: 8px;
        background: #eff6ff;
        border: 1px solid #dbeafe;
        transition: all 0.2s;
    }

    .proof-link:hover {
        background: #dbeafe;
        transform: translateY(-1px);
    }

    .notes {
        background: white;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        color: #475569;
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

    .btn-success {
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 500;
        font-family: 'Noto Sans Thai', sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
    }

    .btn-success:hover {
        background: linear-gradient(135deg, #15803d 0%, #166534 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(22, 163, 74, 0.3);
    }

    .btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 500;
        font-family: 'Noto Sans Thai', sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
    }

    .btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
    }

    .btn-warning {
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 500;
        font-family: 'Noto Sans Thai', sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
    }

    .btn-warning:hover {
        background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(249, 115, 22, 0.3);
    }

    .modal-footer .btn-outline {
        background: white;
        border: 2px solid #e2e8f0;
        color: #64748b;
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 500;
        font-family: 'Noto Sans Thai', sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
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
            gap: 8px;
        }
    }
</style>