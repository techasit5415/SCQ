<script>
    import { goto } from "$app/navigation";
    import { enhance } from '$app/forms';
    import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
    import TopBar from '$lib/Components/restaurant/Topbar.svelte';
    import RestaurantSidebar from '$lib/Components/restaurant/RestaurantSidebar.svelte';

    export let data;

    let activeMenu = "advertise";
    let selectedPackageId = null;
    let isSubmitting = false;
    let formElement;
    
    // เลือก package แรกเป็น default
    $: if (data.packages && data.packages.length > 0 && !selectedPackageId) {
        selectedPackageId = data.packages[0].id;
    }
    
    $: selectedPackage = data.packages?.find(p => p.id === selectedPackageId);
    $: totalPrice = selectedPackage?.price || 0;
    
    // หา active advertisements - ใช้ status text และ end_date และดึง priority_level
    $: activeAdvertisements = data.advertisements?.filter(ad => {
        const now = new Date();
        const endDate = new Date(ad.end_date);
        // Check if status is "Active" AND payment is "Paid" AND not expired
        return ad.status === 'Active' && ad.payment_status === 'Paid' && endDate > now;
    }).map(ad => ({
        ...ad,
        priority_level: ad.priority_level || 1
    })) || [];
    
    $: hasActiveAd = activeAdvertisements.length > 0;
    
    async function handlePayment() {
        // ตรวจสอบว่ามี active ad อยู่หรือไม่
        if (hasActiveAd) {
            alert('ไม่สามารถซื้อโฆษณาใหม่ได้\nคุณมีโฆษณาที่กำลัง active อยู่แล้ว\nกรุณารอให้โฆษณาปัจจุบันหมดอายุก่อน');
            return;
        }
        
        if (!selectedPackageId) {
            alert('กรุณาเลือกแพ็กเกจ');
            return;
        }
        
        const confirmMsg = `ยืนยันการซื้อโฆษณาร้านอาหาร\n\nแพ็กเกจ: ${selectedPackage?.name}\nระยะเวลา: ${selectedPackage?.duration_days} วัน\nราคา: ฿${totalPrice}`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        isSubmitting = true;
        
        if (formElement) {
            formElement.requestSubmit();
        }
    }

    function listOrder() {
        var x = document.getElementById("hiddenbar-container");
        if (x) {
            if (x.style.display === "none" || x.style.display === "") {
                x.style.display = "block";
            } else {
                x.style.display = "none";
            }
        }
    }
    
    function handleViewRestaurant(event) {
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

<!-- หน้า Dashboard ร้านอาหาร -->
<div id="restaurant-layout" class="restaurant-layout">
    <!-- Sidebar -->
    <TopBar title="Advertise - {data.restaurant?.name || 'Restaurant'}" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar 
        {activeMenu}
        shopId={data.restaurant?.id || ''}
    />
    <!-- Main Content -->
    <main class="main-content">
        <!-- Header Section -->
        <div class="header-section">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Advertise</span>
            </nav>
            <h1 class="page-title">Advertise</h1>
        </div>
        <div class="promote-content">
            <div class="promote-section">
                <h2 class="section-heading">ซื้อโฆษณาร้านอาหาร</h2>
                <p class="section-description">
                    เลือกแพ็กเกจโฆษณาที่ต้องการและชำระเงินเพื่อเริ่มโปรโมทร้านของคุณ
                    {#if hasActiveAd}
                        <span class="promoted-info">
                            ⚡ คุณมีโฆษณาที่กำลังทำงานอยู่ {activeAdvertisements.length} รายการ
                        </span>
                    {/if}
                </p>
                
                <!-- Package Selection -->
                <div class="duration-section">
                    <h3 class="duration-heading">Choose Package</h3>
                    {#if hasActiveAd}
                        <div class="active-ad-notice">
                            <div class="notice-icon">⚠️</div>
                            <div class="notice-content">
                                <h4>มีโฆษณาที่กำลังทำงานอยู่</h4>
                                <p>คุณมีโฆษณาที่ active อยู่ {activeAdvertisements.length} รายการ กรุณารอให้โฆษณาปัจจุบันหมดอายุก่อนซื้อแพ็กเกจใหม่</p>
                                {#if activeAdvertisements[0]}
                                    {@const endDate = new Date(activeAdvertisements[0].end_date)}
                                    <p class="expire-date">
                                        Priority: {activeAdvertisements[0].priority_level} | 
                                        หมดอายุ: {endDate.toLocaleDateString('th-TH', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                {/if}
                            </div>
                        </div>
                    {:else if data.packages && data.packages.length > 0}
                        <div class="duration-options">
                            {#each data.packages as pkg}
                                <label class="duration-option package-card">
                                    <input 
                                        type="radio" 
                                        name="package" 
                                        value={pkg.id}
                                        bind:group={selectedPackageId}
                                    />
                                    <div class="package-info">
                                        <span class="package-name">{pkg.name}</span>
                                        <span class="package-duration">{pkg.duration_days} Day{pkg.duration_days > 1 ? 's' : ''}</span>
                                        <span class="package-price">฿{pkg.price}</span>
                                        {#if pkg.description}
                                            <span class="package-desc">{pkg.description}</span>
                                        {/if}
                                    </div>
                                </label>
                            {/each}
                        </div>
                    {:else}
                        <p class="no-packages">ไม่มีแพ็กเกจในระบบ</p>
                    {/if}
                </div>
                
                <!-- Order Summary -->
                <div class="order-summary">
                    <h3 class="summary-heading">สรุปคำสั่งซื้อ</h3>
                    <div class="summary-content">
                        <div class="summary-row">
                            <span>แพ็กเกจ:</span>
                            <span>{selectedPackage?.name || 'ยังไม่ได้เลือก'}</span>
                        </div>
                        <div class="summary-row">
                            <span>ระยะเวลา:</span>
                            <span>{selectedPackage?.duration_days || 0} วัน</span>
                        </div>
                        {#if selectedPackage?.description}
                            <div class="summary-row">
                                <span>รายละเอียด:</span>
                                <span class="summary-desc">{selectedPackage.description}</span>
                            </div>
                        {/if}
                        <div class="summary-row total">
                            <span>ราคารวม:</span>
                            <span>฿{totalPrice}</span>
                        </div>
                    </div>
                    
                    <button 
                        class="pay-button" 
                        on:click={handlePayment}
                        disabled={!selectedPackageId || isSubmitting || hasActiveAd}
                    >
                        {#if hasActiveAd}
                            ไม่สามารถซื้อได้ (มีโฆษณา Active อยู่)
                        {:else if isSubmitting}
                            กำลังดำเนินการ...
                        {:else}
                            ชำระเงิน
                        {/if}
                    </button>
                </div>
                
                <!-- History Section -->
                <div class="history-section">
                    <h3 class="history-heading">History</h3>
                    {#if data.advertisements && data.advertisements.length > 0}
                        {#each data.advertisements as ad}
                            {@const startDate = new Date(ad.start_date)}
                            {@const endDate = new Date(ad.end_date)}
                            {@const isExpired = endDate < new Date()}
                            {@const statusText = isExpired ? 'หมดอายุ' : (ad.status || 'Active')}
                            {@const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))}
                            
                            <div class="history-item">
                                <div class="history-info-left">
                                    <span class="history-id">ID: {ad.id}</span>
                                    <span class="history-duration">ระยะเวลา: {duration} วัน</span>
                                </div>
                                <div class="history-info">
                                    <span class="history-status {isExpired ? 'expired' : 'active'}">
                                        {statusText}
                                    </span>
                                    <span class="history-payment {ad.payment_status === 'Paid' ? 'paid' : 'unpaid'}">
                                        {ad.payment_status || 'Unpaid'}
                                    </span>
                                    <span class="history-amount">
                                        ฿{ad.total_amount || 0}
                                    </span>
                                </div>
                                <span class="history-date">
                                    {startDate.toLocaleDateString('th-TH', { 
                                        day: 'numeric',
                                        month: 'short'
                                    })} - {endDate.toLocaleDateString('th-TH', { 
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        {/each}
                    {:else}
                        <p class="no-history">ยังไม่มีประวัติโฆษณา</p>
                    {/if}
                </div>
            </div>
            
            <!-- Hidden Form for Submission -->
            <form 
                bind:this={formElement}
                method="POST" 
                action="?/createAdvertisement"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === 'success') {
                            alert('ชำระเงินสำเร็จ! กำลังโหลดข้อมูลใหม่... 🎉');
                            window.location.reload();
                        } else if (result.type === 'failure') {
                            isSubmitting = false;
                            alert('เกิดข้อผิดพลาด: ' + (result.data?.error || 'กรุณาลองใหม่อีกครั้ง'));
                        } else {
                            isSubmitting = false;
                        }
                    };
                }}
            >
                <input type="hidden" name="packageId" value={selectedPackageId || ''} />
            </form>
        </div>
    </main>
</div>

<body></body>

<style>
    /* Reset and Base */
    * {
        box-sizing: border-box;
    }

    body {
        background-color: #f5f5f5;
    }

    .restaurant-layout {
        /* min-height: 100vh; */
        background: #f5f5f5;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .logout {
        margin-top: auto;
        color: #d32f2f !important;
    }

    /* Main Content */
    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 24px;
        min-height: calc(100vh - 60px);
    }

    /* Header Section */
    .header-section {
        background: white;
        padding: 20px 24px;
        border-radius: 12px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .breadcrumb {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 8px;
    }

    .breadcrumb-item.current {
        color: #111827;
        font-weight: 500;
    }

    .breadcrumb-separator {
        margin: 0 8px;
    }
    
    .page-title {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #111827;
    }

    /* Advertise Section */
    .promote-content {
        background-color: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .promote-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .section-heading {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        margin: 0;
    }

    .section-description {
        color: #6b7280;
        font-size: 14px;
        margin: 0;
        line-height: 1.5;
    }

    .promoted-info {
        color: #10b981;
        font-weight: 600;
    }

    /* Active Ad Notice */
    .active-ad-notice {
        display: flex;
        gap: 16px;
        padding: 20px;
        background-color: #fef3c7;
        border: 2px solid #fbbf24;
        border-radius: 8px;
        align-items: flex-start;
    }

    .notice-icon {
        font-size: 32px;
        flex-shrink: 0;
    }

    .notice-content {
        flex: 1;
    }

    .notice-content h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #92400e;
    }

    .notice-content p {
        margin: 0;
        font-size: 14px;
        color: #78350f;
        line-height: 1.5;
    }

    .expire-date {
        margin-top: 12px !important;
        padding: 8px 12px;
        background-color: #fefce8;
        border-radius: 6px;
        font-weight: 600;
        color: #854d0e;
    }

    /* Duration Section */
    .duration-section {
        padding: 20px;
        background-color: #f9fafb;
        border-radius: 8px;
    }

    .duration-heading {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 16px 0;
    }

    .duration-options {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
    }

    .duration-option {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
    }

    .duration-option.package-card {
        padding: 16px;
        background-color: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        transition: all 0.2s;
    }

    .duration-option.package-card:hover {
        border-color: #f97316;
        box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1);
    }

    .duration-option.package-card:has(input:checked) {
        border-color: #f97316;
        background-color: #fff7ed;
    }

    .duration-option input[type="radio"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        margin-top: 2px;
        flex-shrink: 0;
    }

    .package-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }

    .package-name {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
    }

    .package-duration {
        font-size: 13px;
        color: #6b7280;
    }

    .package-price {
        font-size: 18px;
        font-weight: 700;
        color: #f97316;
        margin-top: 4px;
    }

    .package-desc {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
        line-height: 1.4;
    }

    .no-packages {
        color: #6b7280;
        text-align: center;
        padding: 20px;
    }

    .duration-label {
        font-size: 14px;
        color: #374151;
    }

    /* Order Summary */
    .order-summary {
        padding: 20px;
        background-color: #fef3c7;
        border-radius: 8px;
        border: 1px solid #fbbf24;
    }

    .summary-heading {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 16px 0;
    }

    .summary-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #374151;
    }

    .summary-row.total {
        font-weight: 600;
        font-size: 16px;
        color: #111827;
        padding-top: 12px;
        border-top: 1px solid #fbbf24;
    }

    .summary-desc {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
    }

    .pay-button {
        width: 100%;
        padding: 12px;
        background-color: #f97316;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .pay-button:hover:not(:disabled) {
        background-color: #ea580c;
    }

    .pay-button:disabled {
        background-color: #d1d5db;
        cursor: not-allowed;
    }

    /* History Section */
    .history-section {
        padding: 20px;
        background-color: #f9fafb;
        border-radius: 8px;
    }

    .history-heading {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin: 0 0 16px 0;
    }

    .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: white;
        border-radius: 6px;
        margin-bottom: 8px;
        font-size: 14px;
        border: 1px solid #e5e7eb;
    }

    .history-info-left {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .history-id {
        color: #111827;
        font-weight: 600;
        font-size: 13px;
    }

    .history-duration {
        color: #6b7280;
        font-size: 12px;
    }

    .history-info {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .history-amount {
        padding: 4px 12px;
        background-color: #f3f4f6;
        color: #111827;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .history-status {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .history-status.active {
        background-color: #d1fae5;
        color: #065f46;
    }

    .history-status.expired {
        background-color: #fee2e2;
        color: #991b1b;
    }

    .history-payment {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .history-payment.paid {
        background-color: #dbeafe;
        color: #1e40af;
    }

    .history-payment.unpaid {
        background-color: #fef3c7;
        color: #92400e;
    }

    .history-date {
        color: #6b7280;
        font-size: 13px;
        min-width: 120px;
        text-align: right;
    }

    .no-history {
        color: #6b7280;
        font-size: 14px;
        text-align: center;
        padding: 20px;
    }
</style>