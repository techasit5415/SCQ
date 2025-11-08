<script>
    import { goto } from "$app/navigation";
    import TopBar from '$lib/Components/restaurant/Topbar.svelte';
    import RestaurantSidebar from '$lib/Components/restaurant/RestaurantSidebar.svelte';
    import { onMount } from 'svelte';

    export let data;

    let activeMenu = "dashboard";
    let selectedReportDate = '';
    let showDatePicker = false;
    let isGeneratingReport = false;
    
    // สี theme สำหรับกราฟ
    const chartColors = ['#FF8C00', '#FFB84D', '#FFA500', '#FF7F00', '#FF6600'];

    // สร้างลิสต์วันที่ย้อนหลัง 7 วัน
    let availableDates = [];
    
    onMount(() => {
        generateAvailableDates();
    });
    
    function generateAvailableDates() {
        availableDates = [];
        for (let i = 0; i < 7; i++) {
            // ใช้วันที่ในเวลาท้องถิ่น ไม่ใช้ UTC
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // สร้าง value เป็น YYYY-MM-DD โดยใช้เวลาท้องถิ่น
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateValue = `${year}-${month}-${day}`;
            
            availableDates.push({
                value: dateValue,
                label: date.toLocaleDateString('th-TH', { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                })
            });
        }
        if (availableDates.length > 0) {
            selectedReportDate = availableDates[0].value;
        }
    }
    
    async function downloadDailyReport() {
        if (!selectedReportDate) {
            alert('กรุณาเลือกวันที่');
            return;
        }
        
        isGeneratingReport = true;
        try {
            // ดึงข้อมูลสำหรับวันที่เลือก
            const reportData = await fetchDailyReportData(selectedReportDate);
            
            // สร้างหน้าต่างพิมพ์
            printDailyReport(reportData);
            
            showDatePicker = false;
        } catch (error) {
            console.error('Error generating report:', error);
            alert('เกิดข้อผิดพลาดในการสร้างรายงาน: ' + error.message);
        } finally {
            isGeneratingReport = false;
        }
    }
    
    async function fetchDailyReportData(dateStr) {
        // ส่ง request ไปยัง API เพื่อดึงข้อมูล
        const response = await fetch(`/restaurant/${data.shopId}/dashboard/report?date=${dateStr}`);
        if (!response.ok) {
            throw new Error('Failed to fetch report data');
        }
        return await response.json();
    }
    
    function printDailyReport(reportData) {
        const printWindow = window.open('', '_blank');
        
        const htmlContent = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>รายงานยอดขายประจำวัน - ${reportData.shopName}</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 15mm;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none;
            }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Sarabun', 'Noto Sans Thai', 'Arial', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
        }
        
        .report-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .report-header {
            background: linear-gradient(135deg, #ffe5cc 0%, #ffd4a8 100%);
            color: #333333;
            padding: 40px 30px;
            margin: -20px -20px 35px -20px;
            text-align: center;
            border-radius: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border-bottom: 4px solid #ffb366;
        }
        
        .report-header h1 {
            font-size: 30px;
            font-weight: 700;
            color: #d97700;
            margin-bottom: 12px;
            letter-spacing: 1px;
        }
        
        .report-header h2 {
            font-size: 22px;
            font-weight: 600;
            color: #555555;
            margin-bottom: 8px;
        }
        
        .report-header p {
            font-size: 16px;
            color: #777777;
        }
        
        .summary-section {
            margin-bottom: 35px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #d97700;
            margin-bottom: 18px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ffcc99;
        }
        
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 30px;
        }
        
        .kpi-card {
            background: #ffffff;
            border: 1px solid #ffe0b3;
            border-radius: 8px;
            padding: 22px 18px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }
        
        .kpi-card:hover {
            border-color: #ffcc99;
            box-shadow: 0 4px 12px rgba(255, 140, 0, 0.12);
            transform: translateY(-2px);
        }
        
        .kpi-label {
            font-size: 13px;
            color: #888888;
            margin-bottom: 10px;
            font-weight: 500;
        }
        
        .kpi-value {
            font-size: 28px;
            font-weight: 700;
            color: #d97700;
        }
        
        .kpi-value.success {
            color: #10b981;
        }
        
        .kpi-value.danger {
            color: #ef4444;
        }
        
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 30px;
            background: white;
            font-size: 14px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }
        
        thead {
            background: #f5a662;
            color: white;
        }
        
        th {
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        
        th:first-child {
            border-top-left-radius: 12px;
        }
        
        th:last-child {
            border-top-right-radius: 12px;
        }
        
        td {
            padding: 12px 16px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        tbody tr {
            transition: all 0.2s ease;
        }
        
        tbody tr:nth-child(even) {
            background: #fffbf5;
        }
        
        tbody tr:hover {
            background: #fff5eb;
            transform: scale(1.01);
            box-shadow: 0 2px 8px rgba(255, 140, 0, 0.1);
        }
        
        tbody tr:last-child td {
            border-bottom: none;
        }
        
        tbody tr:last-child td:first-child {
            border-bottom-left-radius: 12px;
        }
        
        tbody tr:last-child td:last-child {
            border-bottom-right-radius: 12px;
        }
        
        .rank-badge {
            display: inline-block;
            width: 28px;
            height: 28px;
            line-height: 28px;
            text-align: center;
            border-radius: 50%;
            font-weight: 700;
            font-size: 13px;
            color: white;
        }
        
        .rank-1 { background: linear-gradient(135deg, #ffd700, #ffed4e); color: #333; }
        .rank-2 { background: linear-gradient(135deg, #c0c0c0, #e5e5e5); color: #333; }
        .rank-3 { background: linear-gradient(135deg, #cd7f32, #d4af37); color: white; }
        .rank-other { background: linear-gradient(135deg, #ff8c00, #ffb84d); color: white; }
        
        .chart-container {
            background: #ffffff;
            border: 1px solid #ffe0b3;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        
        .bar-chart {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            height: 240px;
            gap: 10px;
            margin-top: 25px;
            padding: 20px 15px;
            background: #fafafa;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
        }
        
        .bar-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        
        .bar {
            width: 100%;
            max-width: 24px;
            background: linear-gradient(180deg, #f5a662 0%, #ffc88a 100%);
            border-radius: 4px 4px 0 0;
            position: relative;
            min-height: 8px;
            transition: all 0.3s ease;
        }
        
        .bar:hover {
            background: linear-gradient(180deg, #ff9d42 0%, #ffb366 100%);
            transform: scaleY(1.03);
        }
        
        .bar-label {
            font-size: 11px;
            color: #888888;
            font-weight: 500;
        }
        
        .bar-value {
            font-size: 13px;
            font-weight: 600;
            color: #d97700;
        }
        
        .footer {
            margin-top: 50px;
            padding: 20px;
            background: #f8f8f8;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #888888;
            font-size: 12px;
            margin-left: -20px;
            margin-right: -20px;
            margin-bottom: -20px;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        .footer p:first-child {
            font-weight: 600;
            color: #555555;
        }
        
        .print-button {
            display: inline-block;
            padding: 14px 32px;
            background: #f5a662;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 20px;
            box-shadow: 0 2px 6px rgba(245, 166, 98, 0.3);
            transition: all 0.3s ease;
        }
        
        .print-button:hover {
            background: #ff9d42;
            box-shadow: 0 4px 12px rgba(245, 166, 98, 0.4);
            transform: translateY(-2px);
        }
        
        .print-button:active {
            transform: translateY(0);
        }
        
        .info-text {
            color: #666666;
            font-size: 13px;
            text-align: center;
            margin-top: 15px;
        }
        
        .info-text strong {
            color: #d97700;
        }
        
        @media print {
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <button class="print-button no-print" onclick="window.print()">🖨️ พิมพ์รายงาน</button>
        
        <div class="report-header">
            <h1>รายงานยอดขายประจำวัน</h1>
            <h2>${reportData.shopName}</h2>
            <p>${reportData.reportDate}</p>
        </div>
        
        <div class="summary-section">
            <h3 class="section-title">สรุปยอดขาย</h3>
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-label">จำนวนออเดอร์ทั้งหมด</div>
                    <div class="kpi-value">${reportData.totalOrders}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">ออเดอร์ที่เสร็จสิ้น</div>
                    <div class="kpi-value success">${reportData.completedOrders}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">ออเดอร์ที่ยกเลิก</div>
                    <div class="kpi-value danger">${reportData.canceledOrders}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">ยอดขายรวม</div>
                    <div class="kpi-value">฿${reportData.totalRevenue.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">มูลค่าเฉลี่ยต่อออเดอร์</div>
                    <div class="kpi-value">฿${reportData.avgOrderValue.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
            </div>
        </div>
        
        <div class="summary-section">
            <h3 class="section-title">วิธีการชำระเงิน</h3>
            <table>
                <thead>
                    <tr>
                        <th>วิธีชำระเงิน</th>
                        <th style="text-align: center;">จำนวนออเดอร์</th>
                        <th style="text-align: right;">ยอดขาย (บาท)</th>
                        <th style="text-align: right;">สัดส่วน (%)</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.paymentMethods.map(pm => `
                        <tr>
                            <td><strong>${pm.method === 'Point' ? 'พอยท์' : pm.method === 'Qr Code' ? 'QR Code' : 'เงินสด'}</strong></td>
                            <td style="text-align: center;">${pm.count}</td>
                            <td style="text-align: right;">${pm.revenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                            <td style="text-align: right;">${pm.percentage.toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="summary-section">
            <h3 class="section-title">เมนูขายดี</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 60px; text-align: center;">อันดับ</th>
                        <th>ชื่อเมนู</th>
                        <th style="text-align: center;">จำนวนที่ขาย</th>
                        <th style="text-align: right;">รายได้ (บาท)</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.popularMenus.length > 0 ? reportData.popularMenus.map((menu, idx) => `
                        <tr>
                            <td style="text-align: center;">
                                <span class="rank-badge rank-${idx < 3 ? idx + 1 : 'other'}">${idx + 1}</span>
                            </td>
                            <td>${menu.name}</td>
                            <td style="text-align: center;">${menu.quantity}</td>
                            <td style="text-align: right;">${menu.revenue.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="4" style="text-align: center; color: #6c757d;">ไม่มีข้อมูล</td></tr>'}
                </tbody>
            </table>
        </div>
        
        <div class="chart-container">
            <h3 class="section-title">ยอดออเดอร์แยกตามชั่วโมง</h3>
            <div class="bar-chart">
                ${reportData.hourlyOrders.filter(h => h.orders > 0).slice(0, 12).map(h => {
                    const maxOrders = Math.max(...reportData.hourlyOrders.map(x => x.orders), 1);
                    const height = (h.orders / maxOrders) * 180;
                    return `
                        <div class="bar-item">
                            <div class="bar-value">${h.orders}</div>
                            <div class="bar" style="height: ${height}px;"></div>
                            <div class="bar-label">${h.hour}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            ${(() => {
                const peakHour = reportData.hourlyOrders.reduce((max, h) => h.orders > max.orders ? h : max, reportData.hourlyOrders[0]);
                return `<p class="info-text">ช่วงเวลาที่มีออเดอร์สูงสุด: ${peakHour.hour} (${peakHour.orders} ออเดอร์)</p>`;
            })()}
        </div>
        
        <div class="footer">
            <p><strong>สร้างรายงานเมื่อ:</strong> ${new Date().toLocaleString('th-TH', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
            <p style="margin-top: 8px;">ระบบจัดการร้านอาหาร SCQ - Student Canteen Queue</p>
        </div>
    </div>
</body>
</html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // รอให้โหลดเสร็จแล้วค่อยเปิดหน้าต่างพิมพ์
        printWindow.onload = () => {
            printWindow.focus();
        };
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

<div id="restaurant-layout" class="restaurant-layout">
    <!-- Sidebar -->
    <TopBar title="Dashboard - {data.shop?.name || 'Restaurant'}" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar shopId={data.shopId} {activeMenu} on:logout={handleLogout} />
    
    <!-- Main Content -->
    <main class="main-content">
        <!-- Header Section -->
        <div class="header-section">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Dashboard</span>
            </nav>
            <h1 class="page-title">Dashboard</h1>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card new-orders">
                <div class="kpi-icon">
                    <span class="material-symbols-outlined">shopping_cart</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-number">{data.restaurant?.newOrder || 0}</div>
                    <div class="kpi-label">New Orders</div>
                </div>
            </div>
            
            <div class="kpi-card in-progress">
                <div class="kpi-icon">
                    <span class="material-symbols-outlined">schedule</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-number">{data.restaurant?.inProgressOrder || 0}</div>
                    <div class="kpi-label">In Progress</div>
                </div>
            </div>
            
            <div class="kpi-card completed">
                <div class="kpi-icon">
                    <span class="material-symbols-outlined">check_circle</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-number">{data.restaurant?.completedOrder || 0}</div>
                    <div class="kpi-label">Completed</div>
                </div>
            </div>
            
            <div class="kpi-card today-sales">
                <div class="kpi-icon">
                    <span class="material-symbols-outlined">payments</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-number">฿{(data.restaurant?.todaySale || 0).toLocaleString()}</div>
                    <div class="kpi-label">Today's Sales</div>
                </div>
            </div>
        </div>

        <!-- Charts Section (Top Row) -->
        <div class="charts-grid">
            <!-- Order Status Pie Chart -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Order Status</h3>
                    <div class="chart-subtitle">Distribution of current orders</div>
                </div>
                <div class="chart-content">
                    <div class="pie-chart">
                        <div class="pie-chart-container">
                            <div class="pie-chart-visual">
                                <div class="pie-center">
                                    <div class="pie-total">
                                        {(data.analytics?.orderStatusChart || []).reduce((sum, status) => sum + status.count, 0)}
                                    </div>
                                    <div class="pie-label">Total Orders</div>
                                </div>
                            </div>
                        </div>
                        <div class="pie-legend">
                            {#each data.analytics?.orderStatusChart || [] as status, index}
                                <div class="legend-item modern-legend">
                                    <div class="legend-color-container">
                                        <span class="legend-color" style="background-color: {chartColors[index % chartColors.length]};"></span>
                                    </div>
                                    <div class="legend-content">
                                        <div class="legend-title">{status.status}</div>
                                        <div class="legend-stats">
                                            <span class="legend-count">{status.count} orders</span>
                                            <span class="legend-percentage">{status.percentage}%</span>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Popular Menus -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3>Popular Menus</h3>
                    <div class="chart-subtitle">Top selling items this month</div>
                </div>
                <div class="chart-content">
                    <div class="menu-list">
                        {#each data.analytics?.popularMenus || [] as menu, index}
                            <div class="modern-menu" style="animation-delay: {index * 100}ms">
                                <div class="menu-rank rank-{index + 1}">
                                    {index + 1}
                                    {#if index === 0}
                                        <span class="crown">👑</span>
                                    {/if}
                                </div>
                                <div class="menu-details">
                                    <div class="menu-name">{menu.name}</div>
                                    <div class="menu-progress">
                                        <div class="progress-bar">
                                            <div 
                                                class="progress-fill" 
                                                style="
                                                    width: {Math.round((menu.count / Math.max(...(data.analytics?.popularMenus || []).map(m => m.count))) * 100)}%; 
                                                    background: linear-gradient(90deg, 
                                                        {index === 0 ? '#ffd700, #ffed4e' : 
                                                         index === 1 ? '#c0c0c0, #e5e5e5' : 
                                                         index === 2 ? '#cd7f32, #d4af37' : 
                                                         index === 3 ? '#ff8c00, #ffb84d' : 
                                                         '#3b82f6, #60a5fa'}
                                                    );
                                                "
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="menu-stats">
                                    <div class="menu-count">{menu.count}</div>
                                    <div class="menu-count-label">สั่งซื้อ</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Full Width Charts Section (Bottom Row) -->
        <div class="full-width-charts">
            <!-- Daily Orders Chart (Full Width) -->
            <div class="chart-card full-width">
                <div class="chart-header">
                    <h3>Daily Orders (7 Days)</h3>
                    <div class="chart-subtitle">Orders trend for the past week</div>
                </div>
                <div class="chart-content">
                    <div class="bar-chart-large">
                        {#each data.analytics?.dailyOrders || [] as day, index}  
                            {@const maxOrders = Math.max(...(data.analytics?.dailyOrders || []).map(d => d.orders), 1)}
                            {@const barHeight = day.orders > 0 ? Math.max((day.orders / maxOrders) * 200, 20) : 12}
                            <div class="bar-item-large">
                                <div class="bar-container-large">
                                    <div class="bar-large" 
                                         style="height: {barHeight}px; 
                                                background: {day.orders > 0 ? 'linear-gradient(135deg, #FF8C00 0%, #FFB84D 100%)' : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'};
                                                opacity: {day.orders > 0 ? '1' : '0.6'};
                                                box-shadow: {day.orders > 0 ? '0 6px 20px rgba(255, 140, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'};">
                                    </div>
                                    <div class="bar-tooltip-large">
                                        <div class="tooltip-content">
                                            <strong>{day.orders} ออร์เดอร์</strong>
                                            <div>฿{day.revenue?.toLocaleString() || 0}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="bar-label-large">{day.date}</div>
                                <div class="bar-value-large" style="color: {day.orders > 0 ? '#ff8c00' : '#9ca3af'}">{day.orders}</div>
                            </div>
                        {:else}
                            <div class="no-data">ไม่มีข้อมูล</div>
                        {/each}
                    </div>
                    
                    <!-- Download Report Section -->
                    <div class="download-report-section">
                        <div class="report-header">
                            <div class="report-icon">
                                <span class="material-symbols-outlined">description</span>
                            </div>
                            <div class="report-text">
                                <h4>ดาวน์โหลดรายงานประจำวัน</h4>
                                <p>เลือกวันที่เพื่อดาวน์โหลดรายงานยอดขายแบบละเอียด</p>
                            </div>
                        </div>
                        
                        <div class="report-controls">
                            <div class="date-selector">
                                <label for="reportDate">
                                    <span class="material-symbols-outlined">calendar_today</span>
                                    เลือกวันที่
                                </label>
                                <select id="reportDate" bind:value={selectedReportDate} class="date-select">
                                    {#each availableDates as date}
                                        <option value={date.value}>{date.label}</option>
                                    {/each}
                                </select>
                            </div>
                            
                            <button 
                                class="download-btn"
                                on:click={downloadDailyReport}
                                disabled={isGeneratingReport}
                            >
                                {#if isGeneratingReport}
                                    <span class="spinner"></span>
                                    <span>กำลังโหลดข้อมูล...</span>
                                {:else}
                                    <span class="material-symbols-outlined">print</span>
                                    <span>พิมพ์รายงาน</span>
                                {/if}
                            </button>
                        </div>
                        
                        <div class="report-info">
                            <span class="material-symbols-outlined">info</span>
                            <span>รายงานจะแสดงยอดขายรวม, จำนวนออเดอร์, รายการเมนูขายดี, กราฟการขาย และข้อมูลการชำระเงิน พร้อมพิมพ์ได้ทันที</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hourly Orders -->
            <div class="chart-card full-width">
                <div class="chart-header">
                    <h3>Hourly Orders (Today)</h3>
                    <div class="chart-subtitle">Order volume throughout the day</div>
                </div>
                <div class="chart-content">
                    <div class="line-chart modern-line-chart">
                        {#each data.analytics?.hourlyOrders || [] as hour, index}
                            {@const maxOrders = Math.max(...(data.analytics?.hourlyOrders || []).map(h => h.orders), 1)}
                            {@const barHeight = Math.min((hour.orders / maxOrders) * 150, 160)}
                            <div class="hour-item">
                                <div class="hour-bar-container">
                                    <div class="hour-bar" 
                                         style="height: {Math.max(barHeight, 6)}px; 
                                                background: linear-gradient(180deg, #FF8C00 0%, #FFB84D 100%);
                                                animation-delay: {index * 0.05}s;">
                                    </div>
                                    <div class="hour-tooltip">
                                        <div class="tooltip-content">
                                            <strong>{hour.orders} orders</strong>
                                            <div>at {hour.hour}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="hour-label">{hour.hour}</div>
                            </div>
                        {/each}
                    </div>
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

    .restaurant-layout {
        background: #f8f9fa;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        min-height: 100vh;
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

    /* KPI Cards Grid */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
    }

    .kpi-card {
        background: white;
        padding: 24px;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .kpi-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
    }

    .new-orders .kpi-icon { background: linear-gradient(135deg, #ff8c00, #ffb84d); color: white; }
    .in-progress .kpi-icon { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; }
    .completed .kpi-icon { background: linear-gradient(135deg, #10b981, #34d399); color: white; }
    .today-sales .kpi-icon { background: linear-gradient(135deg, #8b5cf6, #a78bfa); color: white; }

    .kpi-content {
        flex: 1;
    }

    .kpi-number {
        font-size: 32px;
        font-weight: 700;
        color: #111827;
        line-height: 1;
        margin-bottom: 4px;
    }

    .kpi-label {
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
    }

    /* Charts Grid */
    .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
    }

    /* Full Width Charts */
    .full-width-charts {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .chart-card {
        background: white;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: visible;
    }

    .chart-card.full-width {
        width: 100%;
    }

    .chart-card.full-width {
        grid-column: 1 / -1;
    }

    .chart-header {
        padding: 20px 24px;
        border-bottom: 1px solid #f3f4f6;
    }

    .chart-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
    }

    .chart-subtitle {
        font-size: 13px;
        color: #6b7280;
        margin-top: 4px;
        font-weight: 400;
    }

    .chart-content {
        padding: 24px;
        position: relative;
        overflow: visible;
    }

    /* Bar Chart */
    .bar-chart {
        display: flex;
        align-items: end;
        justify-content: space-around;
        height: 220px;
        gap: 12px;
        padding: 16px 8px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 12px;
        position: relative;
        overflow: hidden;
    }

    .bar-chart::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 100%, rgba(255, 140, 0, 0.08) 0%, transparent 70%);
        pointer-events: none;
    }

    .bar-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
    }

    .bar-container {
        position: relative;
        width: 100%;
        max-width: 45px;
    }

    .bar {
        width: 100%;
        border-radius: 6px 6px 0 0;
        margin-bottom: 8px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(255, 140, 0, 0.3);
        animation: barGrow 0.8s ease-out forwards;
        opacity: 1;
        transform: scaleY(1);
        transform-origin: bottom;
        position: relative;
        min-height: 8px;
    }

    .bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
        border-radius: 6px 6px 0 0;
        pointer-events: none;
    }

    @keyframes barGrowIn {
        from {
            opacity: 0;
            transform: scaleY(0);
        }
        to {
            opacity: 1;
            transform: scaleY(1);
        }
    }

    .bar-item:nth-child(1) .bar { animation: barGrowIn 0.8s ease-out 0.1s both; }
    .bar-item:nth-child(2) .bar { animation: barGrowIn 0.8s ease-out 0.2s both; }
    .bar-item:nth-child(3) .bar { animation: barGrowIn 0.8s ease-out 0.3s both; }
    .bar-item:nth-child(4) .bar { animation: barGrowIn 0.8s ease-out 0.4s both; }
    .bar-item:nth-child(5) .bar { animation: barGrowIn 0.8s ease-out 0.5s both; }
    .bar-item:nth-child(6) .bar { animation: barGrowIn 0.8s ease-out 0.6s both; }
    .bar-item:nth-child(7) .bar { animation: barGrowIn 0.8s ease-out 0.7s both; }

    .bar:hover {
        transform: scaleY(1.08) scaleX(1.05);
        box-shadow: 0 4px 16px rgba(255, 140, 0, 0.4);
    }

    .bar-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 10;
        margin-bottom: 8px;
    }

    .bar-container:hover .bar-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(-4px);
    }

    .tooltip-content {
        background: rgba(17, 24, 39, 0.95);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        text-align: center;
        white-space: nowrap;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .tooltip-content::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: rgba(17, 24, 39, 0.95);
    }

    .bar-label {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
        text-align: center;
        font-weight: 500;
    }

    .bar-value {
        font-size: 14px;
        font-weight: 700;
        color: #111827;
        text-align: center;
        background: linear-gradient(135deg, #ff8c00 0%, #ffb84d 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .no-data {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100px;
        color: #6b7280;
        font-size: 16px;
        width: 100%;
    }

    /* Large Bar Chart (Full Width) */
    .bar-chart-large {
        display: flex;
        align-items: end;
        justify-content: space-around;
        height: 300px;
        max-height: 300px;
        gap: 20px;
        padding: 24px 16px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 16px;
        position: relative;
        overflow: hidden;
    }

    .bar-chart-large::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 100%, rgba(255, 140, 0, 0.08) 0%, transparent 70%);
        pointer-events: none;
    }

    .bar-item-large {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
        max-width: 80px;
    }

    .bar-container-large {
        position: relative;
        width: 100%;
        max-width: 60px;
        height: 220px;
        max-height: 220px;
        display: flex;
        align-items: end;
        justify-content: center;
        overflow: hidden;
    }

    .bar-large {
        width: 100%;
        max-height: 220px;
        border-radius: 8px 8px 0 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        animation: barGrowIn 0.8s ease-out forwards;
        transform-origin: bottom;
        position: relative;
    }

    .bar-large::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
        border-radius: 8px 8px 0 0;
        pointer-events: none;
    }

    .bar-large:hover {
        transform: scaleY(1.05) scaleX(1.1);
        box-shadow: 0 8px 32px rgba(255, 140, 0, 0.4) !important;
    }

    .bar-tooltip-large {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10;
        margin-bottom: 12px;
    }

    .bar-container-large:hover .bar-tooltip-large {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(-4px);
    }

    .bar-label-large {
        font-size: 14px;
        color: #6b7280;
        margin-top: 12px;
        text-align: center;
        font-weight: 600;
    }

    .bar-value-large {
        font-size: 18px;
        font-weight: 800;
        text-align: center;
        margin-top: 4px;
        background: linear-gradient(135deg, #ff8c00 0%, #ffb84d 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    /* Pie Chart */
    .pie-chart {
        display: flex;
        align-items: center;
        gap: 40px;
    }

    .pie-chart-container {
        position: relative;
    }

    .pie-chart-visual {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        background: conic-gradient(
            #FF8C00 0deg 71.7deg,
            #3b82f6 71.7deg 154.1deg,
            #10b981 154.1deg 208.9deg,
            #f59e0b 208.9deg 360deg
        );
        position: relative;
        box-shadow: 0 8px 24px rgba(255, 140, 0, 0.3);
        animation: pieRotate 1s ease-out;
    }

    @keyframes pieRotate {
        from {
            transform: rotate(-90deg);
            opacity: 0;
        }
        to {
            transform: rotate(0deg);
            opacity: 1;
        }
    }

    .pie-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        background: white;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .pie-total {
        font-size: 24px;
        font-weight: 700;
        color: #111827;
        line-height: 1;
    }

    .pie-label {
        font-size: 10px;
        color: #6b7280;
        font-weight: 500;
        text-align: center;
    }

    .pie-legend {
        flex: 1;
    }

    .modern-legend {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 10px;
        background: #f9fafb;
        transition: all 0.3s ease;
        animation: legendSlide 0.6s ease-out forwards;
        opacity: 0;
        transform: translateX(-20px);
    }

    .modern-legend:nth-child(1) { animation-delay: 0.1s; }
    .modern-legend:nth-child(2) { animation-delay: 0.2s; }
    .modern-legend:nth-child(3) { animation-delay: 0.3s; }
    .modern-legend:nth-child(4) { animation-delay: 0.4s; }

    @keyframes legendSlide {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .modern-legend:hover {
        background: #f3f4f6;
        transform: translateX(4px);
    }

    .legend-color-container {
        position: relative;
    }

    .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .legend-content {
        flex: 1;
    }

    .legend-title {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 2px;
    }

    .legend-stats {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .legend-count {
        font-size: 12px;
        color: #6b7280;
    }

    .legend-percentage {
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        background: #e5e7eb;
        padding: 2px 6px;
        border-radius: 4px;
    }

    /* Menu List */
    .menu-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .modern-menu {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border-radius: 12px;
        background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
        border: 1px solid #e5e7eb;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        animation: menuSlide 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
        position: relative;
        overflow: hidden;
    }

    @keyframes menuSlide {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .modern-menu::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255, 140, 0, 0.05) 0%, rgba(255, 184, 77, 0.05) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .modern-menu:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(255, 140, 0, 0.2);
        border-color: #ff8c00;
    }

    .modern-menu:hover::before {
        opacity: 1;
    }

    .menu-rank {
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        flex-shrink: 0;
    }

    .rank-1 { background: linear-gradient(135deg, #ffd700, #ffed4e); color: #1f2937; }
    .rank-2 { background: linear-gradient(135deg, #c0c0c0, #e5e5e5); color: #1f2937; }
    .rank-3 { background: linear-gradient(135deg, #cd7f32, #d4af37); color: white; }
    .rank-4 { background: linear-gradient(135deg, #ff8c00, #ffb84d); color: white; }
    .rank-5 { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; }

    .crown {
        position: absolute;
        top: -8px;
        right: -4px;
        font-size: 16px;
        animation: bounce 2s infinite;
    }

    /* Download Report Section */
    .download-report-section {
        margin-top: 30px;
        padding: 24px;
        background: linear-gradient(135deg, #fff5f0 0%, #ffe9dc 100%);
        border-radius: 12px;
        border: 2px solid #ff8c00;
    }

    .report-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
    }

    .report-icon {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #ff8c00, #ffb84d);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 28px;
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
    }

    .report-text h4 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 700;
        color: #111827;
    }

    .report-text p {
        margin: 0;
        font-size: 14px;
        color: #6b7280;
    }

    .report-controls {
        display: flex;
        gap: 16px;
        align-items: flex-end;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }

    .date-selector {
        flex: 1;
        min-width: 300px;
    }

    .date-selector label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
    }

    .date-selector label .material-symbols-outlined {
        font-size: 18px;
        color: #ff8c00;
    }

    .date-select {
        width: 100%;
        padding: 12px 16px;
        font-size: 14px;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        background: white;
        color: #111827;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .date-select:hover {
        border-color: #ff8c00;
    }

    .date-select:focus {
        outline: none;
        border-color: #ff8c00;
        box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
    }

    .download-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 600;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        color: white;
        background: linear-gradient(135deg, #ff8c00, #ff7f00);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
    }

    .download-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #ff7f00, #ff6600);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(255, 140, 0, 0.4);
    }

    .download-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .download-btn .material-symbols-outlined {
        font-size: 20px;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .report-info {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        font-size: 13px;
        color: #6b7280;
        line-height: 1.6;
    }

    .report-info .material-symbols-outlined {
        font-size: 18px;
        color: #3b82f6;
        flex-shrink: 0;
        margin-top: 1px;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-4px); }
        60% { transform: translateY(-2px); }
    }

    .menu-details {
        flex: 1;
        min-width: 0;
    }

    .menu-name {
        font-weight: 600;
        color: #111827;
        font-size: 16px;
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .menu-progress {
        width: 100%;
    }

    .progress-bar {
        width: 100%;
        height: 6px;
        background: #e5e7eb;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    }

    .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    .menu-stats {
        text-align: right;
        flex-shrink: 0;
    }

    .menu-count {
        font-size: 20px;
        font-weight: 700;
        color: #111827;
        line-height: 1;
    }

    .menu-count-label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
    }

    /* Line Chart (Hourly) */
    .line-chart {
        display: flex;
        align-items: end;
        gap: 4px;
        padding: 24px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 16px;
        height: 240px;
        max-height: 240px;
        position: relative;
        overflow: hidden;
    }

    .modern-line-chart::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
            linear-gradient(90deg, transparent 0%, rgba(255, 140, 0, 0.05) 50%, transparent 100%),
            radial-gradient(circle at 50% 100%, rgba(255, 140, 0, 0.1) 0%, transparent 70%);
        pointer-events: none;
    }

    .hour-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        position: relative;
    }

    .hour-bar-container {
        position: relative;
        height: 160px;
        max-height: 160px;
        width: 100%;
        display: flex;
        align-items: end;
        justify-content: center;
        overflow: hidden;
    }

    .hour-bar {
        width: 80%;
        max-width: 20px;
        min-height: 6px;
        max-height: 160px;
        border-radius: 8px 8px 0 0;
        position: relative;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(255, 140, 0, 0.3);
        animation: barGrow 0.8s ease-out forwards;
        transform-origin: bottom;
        transform: scaleY(0);
    }

    @keyframes barGrow {
        to {
            transform: scaleY(1);
        }
    }

    .hour-bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%);
        border-radius: 8px 8px 0 0;
        pointer-events: none;
    }

    .hour-bar::after {
        content: '';
        position: absolute;
        top: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        background: #ff8c00;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(255, 140, 0, 0.6);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .hour-item:hover .hour-bar {
        transform: scaleY(1.05) scaleX(1.1);
        box-shadow: 0 4px 16px rgba(255, 140, 0, 0.4);
    }

    .hour-item:hover .hour-bar::after {
        opacity: 1;
    }

    .hour-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 12px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10;
    }

    .hour-item:hover .hour-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(-4px);
    }

    .tooltip-content {
        background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        position: relative;
    }

    .tooltip-content::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: #1f2937;
    }

    .hour-label {
        font-size: 11px;
        color: #6b7280;
        font-weight: 500;
        text-align: center;
        margin-top: 4px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
        .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .charts-grid {
            grid-template-columns: 1fr;
        }
        
        .modern-menu {
            padding: 12px;
        }
        
        .menu-rank {
            width: 40px;
            height: 40px;
            font-size: 14px;
        }

        .bar-chart-large {
            height: 250px;
            gap: 12px;
            padding: 20px 12px;
        }

        .bar-container-large {
            height: 180px;
            max-width: 50px;
        }

        .bar-value-large {
            font-size: 16px;
        }
    }

    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
            padding: 16px;
        }
        
        .kpi-grid {
            grid-template-columns: 1fr;
        }
        
        .charts-grid {
            grid-template-columns: 1fr;
        }
        
        .pie-chart {
            flex-direction: column;
            text-align: center;
        }

        .bar-chart-large {
            height: 200px;
            gap: 8px;
            padding: 16px 8px;
        }

        .bar-container-large {
            height: 140px;
            max-width: 40px;
        }

        .bar-item-large {
            max-width: 60px;
        }

        .bar-label-large {
            font-size: 12px;
            margin-top: 8px;
        }

        .bar-value-large {
            font-size: 14px;
        }
    }
</style>