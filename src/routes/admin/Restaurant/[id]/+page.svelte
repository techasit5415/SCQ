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

    function handlePrintReport() {
        // Create a professional printable version of the restaurant report
        const printWindow = window.open('', '_blank');
        const restaurant = data.restaurant;
        const totalSales = data.totalSales || 0;
        const analytics = data.analytics || {};
        const recentOrders = data.recentOrders || [];
        const popularMenus = data.popularMenus || [];
        const menus = data.menus || [];
        
        // คำนวณข้อมูลเพิ่มเติม
        const completedOrders = recentOrders.filter(o => o.Status === 'Completed').length;
        const pendingOrders = recentOrders.filter(o => o.Status === 'Pending').length;
        const canceledOrders = recentOrders.filter(o => o.Status === 'Canceled').length;
        const avgOrderValue = completedOrders > 0 ? (totalSales / completedOrders) : 0;
        
        // วันที่ออกรายงาน
        const reportDate = new Date();
        const thaiDate = reportDate.toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const thaiTime = reportDate.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const printContent = `
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <title>รายงานข้อมูลร้านอาหาร - ${restaurant.name}</title>
                <meta charset="UTF-8">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body { 
                        font-family: 'Sarabun', 'Noto Sans Thai', Arial, sans-serif; 
                        line-height: 1.6;
                        color: #333;
                        background: white;
                    }
                    
                    .page {
                        max-width: 210mm;
                        margin: 0 auto;
                        padding: 20mm;
                    }
                    
                    /* Header Styles */
                    .report-header {
                        text-align: center;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #f97316;
                    }
                    
                    .system-title {
                        font-size: 14px;
                        color: #666;
                        font-weight: 400;
                        margin-bottom: 5px;
                    }
                    
                    .report-title { 
                        color: #f97316; 
                        font-size: 32px; 
                        font-weight: 700; 
                        margin: 10px 0;
                        letter-spacing: -0.5px;
                    }
                    
                    .restaurant-name-header {
                        font-size: 24px;
                        color: #2d3748;
                        font-weight: 600;
                        margin-top: 10px;
                    }
                    
                    .report-meta {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 15px;
                        padding-top: 15px;
                        border-top: 1px solid #e2e8f0;
                        font-size: 13px;
                        color: #718096;
                    }
                    
                    /* Section Styles */
                    .section { 
                        margin-bottom: 35px; 
                        page-break-inside: avoid;
                        background: #fff7ed;
                        padding: 20px;
                        border-radius: 8px;
                        border-left: 4px solid #f97316;
                    }
                    
                    .section-title { 
                        color: #2d3748; 
                        font-size: 20px;
                        font-weight: 600;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .section-icon {
                        width: 32px;
                        height: 32px;
                        background: #f97316;
                        color: white;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                    }
                    
                    /* Info Grid */
                    .info-grid { 
                        display: grid; 
                        grid-template-columns: repeat(2, 1fr); 
                        gap: 20px; 
                        background: white;
                        padding: 20px;
                        border-radius: 6px;
                    }
                    
                    .info-item { 
                        padding: 12px 0;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    
                    .info-item:last-child {
                        border-bottom: none;
                    }
                    
                    .info-label { 
                        font-weight: 600; 
                        color: #4a5568;
                        display: block;
                        margin-bottom: 5px;
                        font-size: 13px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .info-value {
                        color: #2d3748;
                        font-size: 15px;
                    }
                    
                    /* Analytics Cards */
                    .analytics-grid { 
                        display: grid; 
                        grid-template-columns: repeat(4, 1fr); 
                        gap: 15px; 
                    }
                    
                    .analytics-card { 
                        background: white;
                        padding: 20px; 
                        text-align: center; 
                        border-radius: 8px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    
                    .analytics-label {
                        font-size: 13px;
                        color: #718096;
                        margin-bottom: 10px;
                        font-weight: 500;
                    }
                    
                    .analytics-value { 
                        font-size: 28px; 
                        font-weight: 700; 
                        color: #f97316;
                        display: block;
                    }
                    
                    .analytics-subtext {
                        font-size: 12px;
                        color: #a0aec0;
                        margin-top: 5px;
                    }
                    
                    /* Table Styles */
                    .data-table {
                        width: 100%;
                        border-collapse: collapse;
                        background: white;
                        border-radius: 6px;
                        overflow: hidden;
                    }
                    
                    .data-table thead {
                        background: #f97316;
                        color: white;
                    }
                    
                    .data-table th {
                        padding: 12px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .data-table td {
                        padding: 12px;
                        border-bottom: 1px solid #e2e8f0;
                        font-size: 14px;
                    }
                    
                    .data-table tbody tr:hover {
                        background: #f7fafc;
                    }
                    
                    .data-table tbody tr:last-child td {
                        border-bottom: none;
                    }
                    
                    /* Status Badge */
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                    }
                    
                    .status-completed {
                        background: #c6f6d5;
                        color: #22543d;
                    }
                    
                    .status-pending {
                        background: #fed7aa;
                        color: #9a3412;
                    }
                    
                    .status-canceled {
                        background: #fed7d7;
                        color: #742a2a;
                    }
                    
                    /* Menu Item Card */
                    .menu-list {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }
                    
                    .menu-card {
                        background: white;
                        padding: 15px;
                        border-radius: 6px;
                        border: 1px solid #e2e8f0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .menu-info {
                        flex: 1;
                    }
                    
                    .menu-name {
                        font-weight: 600;
                        color: #2d3748;
                        margin-bottom: 5px;
                    }
                    
                    .menu-details {
                        font-size: 13px;
                        color: #718096;
                    }
                    
                    .menu-orders {
                        background: #f97316;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-weight: 600;
                        text-align: center;
                        min-width: 80px;
                    }
                    
                    /* Footer */
                    .report-footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #e2e8f0;
                        text-align: center;
                    }
                    
                    .footer-text {
                        color: #718096;
                        font-size: 13px;
                        margin-bottom: 10px;
                    }
                    
                    .signature-section {
                        margin-top: 60px;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 40px;
                    }
                    
                    .signature-box {
                        text-align: center;
                    }
                    
                    .signature-line {
                        border-top: 1px solid #2d3748;
                        margin: 60px auto 10px;
                        width: 200px;
                    }
                    
                    .signature-label {
                        font-size: 14px;
                        color: #4a5568;
                    }
                    
                    /* Print Styles */
                    @media print {
                        body { 
                            margin: 0;
                            background: white;
                        }
                        .page {
                            margin: 0;
                            padding: 15mm;
                        }
                        .section { 
                            page-break-inside: avoid;
                        }
                        .analytics-grid {
                            page-break-inside: avoid;
                        }
                    }
                    
                    @page {
                        size: A4;
                        margin: 0;
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <!-- Report Header -->
                    <div class="report-header">
                        <div class="system-title">ระบบจัดการร้านอาหาร SCQ (Student Canteen Queue)</div>
                        <div class="report-title">รายงานข้อมูลร้านอาหาร</div>
                        <div class="restaurant-name-header">${restaurant.name}</div>
                        <div class="report-meta">
                            <div>รหัสร้าน: ${restaurant.id}</div>
                            <div>วันที่ออกรายงาน: ${thaiDate} เวลา ${thaiTime} น.</div>
                        </div>
                    </div>

                    <!-- Section 1: ข้อมูลพื้นฐาน -->
                    <div class="section">
                        <div class="section-title">
                            <div class="section-icon">📋</div>
                            <span>ข้อมูลพื้นฐานร้านอาหาร</span>
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">ชื่อร้าน</span>
                                <span class="info-value">${restaurant.name}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">ประเภทร้าน</span>
                                <span class="info-value">${restaurant.Type_Shop || 'ไม่ระบุ'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">เบอร์โทรศัพท์</span>
                                <span class="info-value">${restaurant.Phone || 'ไม่ระบุ'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">วันที่ลงทะเบียน</span>
                                <span class="info-value">${new Date(restaurant.created).toLocaleDateString('th-TH', { 
                                    day: 'numeric',
                                    month: 'long', 
                                    year: 'numeric'
                                })}</span>
                            </div>
                            <div class="info-item" style="grid-column: 1 / -1;">
                                <span class="info-label">ที่อยู่</span>
                                <span class="info-value">${restaurant.Addr || 'ไม่ระบุ'}</span>
                            </div>
                            <div class="info-item" style="grid-column: 1 / -1;">
                                <span class="info-label">รายละเอียด</span>
                                <span class="info-value">${restaurant.Details || 'ไม่มีรายละเอียด'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: สรุปผลการดำเนินงาน -->
                    <div class="section">
                        <div class="section-title">
                            <div class="section-icon">📊</div>
                            <span>สรุปผลการดำเนินงาน</span>
                        </div>
                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <div class="analytics-label">ยอดขายรวม</div>
                                <span class="analytics-value">฿${totalSales.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                                <div class="analytics-subtext">จากคำสั่งซื้อที่ชำระแล้ว</div>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-label">ค่าเฉลี่ยต่อออเดอร์</div>
                                <span class="analytics-value">฿${avgOrderValue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
                                <div class="analytics-subtext">Average Order Value</div>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-label">จำนวนเมนู</div>
                                <span class="analytics-value">${menus.length}</span>
                                <div class="analytics-subtext">เมนูทั้งหมดในระบบ</div>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-label">คำสั่งซื้อสำเร็จ</div>
                                <span class="analytics-value">${completedOrders}</span>
                                <div class="analytics-subtext">Completed Orders</div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 3: สถิติคำสั่งซื้อ -->
                    <div class="section">
                        <div class="section-title">
                            <div class="section-icon">📈</div>
                            <span>สถิติคำสั่งซื้อ</span>
                        </div>
                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <div class="analytics-label">รอดำเนินการ</div>
                                <span class="analytics-value" style="color: #f59e0b;">${pendingOrders}</span>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-label">สำเร็จแล้ว</div>
                                <span class="analytics-value" style="color: #10b981;">${completedOrders}</span>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-label">ยกเลิก</div>
                                <span class="analytics-value" style="color: #ef4444;">${canceledOrders}</span>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-label">ทั้งหมด</div>
                                <span class="analytics-value">${recentOrders.length}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Section 4: เมนูยอดนิยม -->
                    <div class="section">
                        <div class="section-title">
                            <div class="section-icon">⭐</div>
                            <span>เมนูยอดนิยม (Top 10)</span>
                        </div>
                        ${popularMenus.length > 0 ? `
                            <div class="menu-list">
                                ${popularMenus.slice(0, 10).map((menu, index) => `
                                    <div class="menu-card">
                                        <div class="menu-info">
                                            <div class="menu-name">${index + 1}. ${menu.menuName}</div>
                                            <div class="menu-details">
                                                ราคา: ฿${menu.price ? menu.price.toLocaleString('th-TH') : 'N/A'}
                                            </div>
                                        </div>
                                        <div class="menu-orders">
                                            <div style="font-size: 11px; opacity: 0.9;">สั่งซื้อ</div>
                                            <div style="font-size: 20px;">${menu.totalOrdered}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p style="text-align: center; color: #718096;">ยังไม่มีข้อมูลเมนูยอดนิยม</p>'}
                    </div>

                    <!-- Section 5: รายการคำสั่งซื้อล่าสุด -->
                    <div class="section">
                        <div class="section-title">
                            <div class="section-icon">🛒</div>
                            <span>รายการคำสั่งซื้อล่าสุด (10 รายการ)</span>
                        </div>
                        ${recentOrders.length > 0 ? `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>รหัสออเดอร์</th>
                                        <th>วันที่</th>
                                        <th>สถานะ</th>
                                        <th style="text-align: right;">ยอดเงิน</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentOrders.slice(0, 10).map(order => `
                                        <tr>
                                            <td><strong>#${order.id.slice(-8)}</strong></td>
                                            <td>${new Date(order.created).toLocaleDateString('th-TH', { 
                                                day: 'numeric',
                                                month: 'short', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</td>
                                            <td>
                                                <span class="status-badge status-${order.Status.toLowerCase()}">
                                                    ${order.Status === 'Completed' ? 'สำเร็จ' : 
                                                      order.Status === 'Pending' ? 'รอดำเนินการ' : 
                                                      order.Status === 'Canceled' ? 'ยกเลิก' : order.Status}
                                                </span>
                                            </td>
                                            <td style="text-align: right; font-weight: 600;">
                                                ฿${(order.Total_Amount || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p style="text-align: center; color: #718096;">ยังไม่มีรายการคำสั่งซื้อ</p>'}
                    </div>

                    <!-- Report Footer -->
                    <div class="report-footer">
                        <div class="footer-text">
                            รายงานนี้ออกโดยระบบ SCQ (Student Canteen Queue) เพื่อใช้เป็นข้อมูลในการวิเคราะห์และพัฒนาธุรกิจ
                        </div>
                        <div class="footer-text">
                            หากพบข้อผิดพลาดหรือมีข้อสงสัย กรุณาติดต่อฝ่ายบริหารระบบ
                        </div>
                        
                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-label">ผู้จัดทำรายงาน</div>
                                <div class="signature-label" style="font-size: 12px; color: #a0aec0; margin-top: 5px;">
                                    (ระบบ SCQ)
                                </div>
                            </div>
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-label">ผู้รับรายงาน / เจ้าของร้าน</div>
                                <div class="signature-label" style="font-size: 12px; color: #a0aec0; margin-top: 5px;">
                                    (ลงชื่อ)
                                </div>
                            </div>
                        </div>
                    </div>
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
                            <button class="btn-edit" on:click={() => goto(`/admin/Restaurant/${data.restaurant.id}/edit`)}>
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
                        <button class="btn-back" on:click={() => goto('/admin/Restaurant/')}>
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
                    
                    <button class="btn-back" on:click={() => goto('/admin/Restaurant/')}>
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