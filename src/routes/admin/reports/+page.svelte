<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/components/Topbar.svelte';
    import AdminSidebar from '$lib/components/sidebar.svelte';

    export let data;

    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        switch(menu) {
            case "dashboard":
                goto('/admin/dashboard');
                break;
            case "manageUsers":
                goto('/admin/manageUser');
                break;
            case "manageRestaurant":
                goto('/admin/restaurant');
                break;
            case "reports":
                // Already on reports page
                break;
            default:
                console.log('Navigation to', menu, 'not implemented yet');
        }
    }
    
    async function handleLogout() {
        try {
            await fetch('/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    }

    // Calculate completion percentage
    $: completionPercentage = data.reports.orderStatus.completed + data.reports.orderStatus.canceled > 0 
        ? ((data.reports.orderStatus.completed / (data.reports.orderStatus.completed + data.reports.orderStatus.canceled)) * 100).toFixed(2)
        : 0;
    
    $: canceledPercentage = (100 - completionPercentage).toFixed(2);

    // Generate chart points for line chart
    function generateChartPoints(dataArray, maxHeight = 150) {
        const maxValue = Math.max(...dataArray, 200); // Minimum scale of 200
        return dataArray.map((value, index) => {
            const x = (index * 652.67) / 11; // Distribute across chart width
            const y = maxHeight - (value / maxValue) * maxHeight;
            return { x, y, value };
        });
    }

    $: chart2024Points = generateChartPoints(data.reports.monthlyData[2024]);
    $: chart2025Points = generateChartPoints(data.reports.monthlyData[2025]);
</script>

<div class="reports">
    <!-- Top Navigation -->
    <TopBar title="Admin Panel - Reports" logoSrc="/SCQ_logo.png" />
    
    <!-- Side Navigation -->
    <AdminSidebar 
        activeMenu="reports" 
        shops={[]}
        on:menuChange={handleMenuChange}
        on:logout={handleLogout}
    />

    <!-- Main Content -->
    <div class="content">
        <!-- Breadcrumb Header -->
        <div class="frame-6">
            <div class="home-reports">
                <span class="homereports_span_01">Home / </span>
                <span class="homereports_span_02">Reports</span>
            </div>
            <div class="reports_01">
                <span class="reports_01_span">Reports</span>
            </div>
        </div>

        <!-- Reports Content -->
        <div class="frame-7">
            <!-- Stats Cards Row -->
            <div class="stats-row">
                <!-- Total Sales Card -->
                <div class="frame-10">
                    <div class="frame-84">
                        <div class="total-sales">
                            <span class="totalsales_span">Total Sales</span>
                        </div>
                        <div class="icons">
                            <div class="bounding-box"></div>
                            <div class="keyboard_arrow_down"></div>
                        </div>
                    </div>
                    <div>
                        <span class="f200_span">฿{data.reports.totalSales.toLocaleString()}</span>
                    </div>
                </div>

                <!-- Total Orders Card -->
                <div class="frame-8">
                    <div class="total-orders">
                        <span class="totalorders_span">Total Orders</span>
                    </div>
                    <div>
                        <span class="f51_span">{data.reports.totalOrders}</span>
                    </div>
                </div>

                <!-- Total Dishes Card -->
                <div class="frame-13">
                    <div class="total-dishes">
                        <span class="totaldishes_span">Total Dishes</span>
                    </div>
                    <div>
                        <span class="f51_01_span">{data.reports.totalDishes}</span>
                    </div>
                </div>

                <!-- Total Users Card -->
                <div class="frame-14">
                    <div class="total-dishes_01">
                        <span class="totaldishes_01_span">Total Users</span>
                    </div>
                    <div>
                        <span class="f51_02_span">{data.reports.totalUsers}</span>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="charts-row">
                <!-- Line Chart -->
                <div class="frame-11">
                    <div class="frame-81">
                        <div>
                            <span class="activeusers_span">Active Users</span>
                        </div>
                        <div class="show-by-year">
                            <span class="showbyyear_span_01">Show</span>
                            <span class="showbyyear_span_02"> by Year</span>
                        </div>
                        <div class="icons_01">
                            <div class="bounding-box_01"></div>
                            <div class="keyboard_arrow_down_01"></div>
                        </div>
                    </div>
                    
                    <div class="barlinechart">
                        <div class="chartaxis">
                            <div class="mainchart">
                                <div class="yaxisleft">
                                    <div><span class="f00_span">200</span></div>
                                    <div><span class="f50_span">150</span></div>
                                    <div><span class="f00_span_01">100</span></div>
                                    <div><span class="f0_span">50</span></div>
                                    <div><span class="f_span">0</span></div>
                                </div>
                                <div class="graphigrid">
                                    <!-- Grid Lines -->
                                    <div class="xlines">
                                        <div class="line"></div>
                                        <div class="line_01"></div>
                                        <div class="line_02"></div>
                                        <div class="line_03"></div>
                                        <div class="line_04"></div>
                                    </div>
                                    <div class="ylines">
                                        {#each Array(13) as _, i}
                                            <div class="line_{i + 5}"></div>
                                        {/each}
                                    </div>
                                    
                                    <!-- Chart Lines -->
                                    <div class="linearea">
                                        <!-- 2024 Line (Red) -->
                                        <svg class="chart-svg" viewBox="0 0 712 160">
                                            <polyline
                                                points="{chart2024Points.map(p => `${p.x + 30},${p.y + 5}`).join(' ')}"
                                                fill="none"
                                                stroke="#FF928A"
                                                stroke-width="2"
                                                class="singleline1"
                                            />
                                            {#each chart2024Points as point, i}
                                                <circle
                                                    cx="{point.x + 30}"
                                                    cy="{point.y + 5}"
                                                    r="4"
                                                    fill="white"
                                                    stroke="#FF928A"
                                                    stroke-width="1"
                                                />
                                            {/each}
                                        </svg>

                                        <!-- 2025 Line (Blue) -->
                                        <svg class="chart-svg" viewBox="0 0 712 160">
                                            <polyline
                                                points="{chart2025Points.map(p => `${p.x + 30},${p.y + 2}`).join(' ')}"
                                                fill="none"
                                                stroke="#8979FF"
                                                stroke-width="2"
                                                class="singleline0"
                                            />
                                            {#each chart2025Points as point, i}
                                                <circle
                                                    cx="{point.x + 30}"
                                                    cy="{point.y + 2}"
                                                    r="4"
                                                    fill="white"
                                                    stroke="#8979FF"
                                                    stroke-width="1"
                                                />
                                            {/each}
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div class="xaxis">
                                {#each ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as month}
                                    <div class="xlabelbox">
                                        <div class="jan">
                                            <span class="jan_span">{month}</span>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                        <div class="legends">
                            <div class="linelegends">
                                <div class="legend">
                                    <div class="legendnode">
                                        <div class="line_18"></div>
                                        <div class="basicnode_24">
                                            <div class="ellipseline_24"></div>
                                        </div>
                                    </div>
                                    <div><span class="f024_span">2024</span></div>
                                </div>
                                <div class="legend_01">
                                    <div class="legendnode_01">
                                        <div class="line_19"></div>
                                        <div class="basicnode_25">
                                            <div class="ellipseline_25"></div>
                                        </div>
                                    </div>
                                    <div><span class="f025_span">2025</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pie Chart -->
                <div class="piechart">
                    <div class="mainchart_01">
                        <div class="pielayer">
                            <svg viewBox="0 0 200 200" class="pie-svg">
                                <!-- Completed portion (Green) -->
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="80"
                                    fill="transparent"
                                    stroke="#4CAF50"
                                    stroke-width="40"
                                    stroke-dasharray="{(completionPercentage / 100) * 502.65} 502.65"
                                    stroke-dashoffset="0"
                                    transform="rotate(-90 100 100)"
                                />
                                <!-- Canceled portion (Red) -->
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="80"
                                    fill="transparent"
                                    stroke="#E53935"
                                    stroke-width="40"
                                    stroke-dasharray="{(canceledPercentage / 100) * 502.65} 502.65"
                                    stroke-dashoffset="-{(completionPercentage / 100) * 502.65}"
                                    transform="rotate(-90 100 100)"
                                />
                            </svg>
                        </div>
                        
                        <!-- Center Number -->
                        <div class="text-100_01">
                            <span class="f00_01_span">{data.reports.orderStatus.completed + data.reports.orderStatus.canceled}</span>
                        </div>

                        <!-- Completed Label -->
                        <div class="labelname">
                            <span class="labelname_span">Completed</span>
                        </div>
                        <div class="labelvalue">
                            <span class="labelvalue_span">{data.reports.orderStatus.completed}</span>
                        </div>
                        <div class="labelpercent">
                            <span class="labelpercent_span">{completionPercentage}%</span>
                        </div>

                        <!-- Canceled Label -->
                        <div class="labelname_01">
                            <span class="labelname_01_span">Canceled</span>
                        </div>
                        <div class="labelvalue_01">
                            <span class="labelvalue_01_span">{data.reports.orderStatus.canceled}</span>
                        </div>
                        <div class="labelpercent_01">
                            <span class="labelpercent_01_span">{canceledPercentage}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Import the original CSS with modifications */
    .reports {
        width: 100%;
        height: 100vh;
        position: relative;
        background: white;
        overflow: hidden;
    }



    .content {
        margin-left: 256px;
        margin-top: 60px;
        min-height: calc(100vh - 60px);
        background: #EDF0F2;
        padding: 0;
    }

    .frame-6 {
        width: 100%;
        padding: 20px;
        background: white;
        border-bottom: 1px #B4B5B7 solid;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .frame-7 {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .stats-row {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
    }

    .charts-row {
        display: flex;
        gap: 24px;
        align-items: flex-start;
    }

    /* Stats Cards */
    .frame-10, .frame-8, .frame-13, .frame-14 {
        width: 253px;
        height: 96px;
        padding: 16px;
        background: white;
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.20);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    /* Line Chart */
    .frame-11 {
        flex: 1;
        padding: 16px;
        background: white;
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.20);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .barlinechart {
        height: 266px;
        padding: 32px 16px 16px;
        background: white;
        display: flex;
        flex-direction: column;
    }

    .chart-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    /* Pie Chart */
    .piechart {
        width: 253px;
        height: 332px;
        padding: 24px 8px 8px;
        background: white;
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.20);
        border-radius: 16px;
        position: relative;
    }

    .pie-svg {
        width: 100%;
        height: 200px;
    }

    .mainchart_01 {
        position: relative;
        width: 100%;
        height: 100%;
    }

    /* Text Styles from original CSS */
    .totalsales_span, .totalorders_span, .totaldishes_span, .totaldishes_01_span {
        color: #333438;
        font-size: 13px;
        font-family: 'Noto Sans Thai', sans-serif;
        font-weight: 400;
        line-height: 15.60px;
    }

    .f200_span, .f51_span, .f51_01_span, .f51_02_span {
        color: #FF8C00;
        font-size: 25px;
        font-family: 'Noto Sans Thai', sans-serif;
        font-weight: 500;
        line-height: 30px;
    }

    .activeusers_span {
        color: #333438;
        font-size: 13px;
        font-family: 'Noto Sans Thai', sans-serif;
        font-weight: 400;
        line-height: 15.60px;
    }

    .showbyyear_span_01 {
        color: #68696E;
        font-size: 13px;
        font-family: 'Noto Sans Thai', sans-serif;
        font-weight: 400;
        line-height: 15.60px;
    }

    .showbyyear_span_02 {
        color: #333438;
        font-size: 13px;
        font-family: 'Noto Sans Thai', sans-serif;
        font-weight: 400;
        line-height: 15.60px;
    }

    .homereports_span_01 {
        color: #95969A;
        font-size: 13px;
        font-family: 'Noto Sans Thai', sans-serif;
        font-weight: 400;
        line-height: 15.60px;
    }

    .homereports_span_02 {
        color: #333438;
        font-size: 13px;
        font-family: 'Noto Sans Thai', sans-serif;
        font-weight: 400;
        line-height: 15.60px;
    }

    .reports_01_span {
        color: #333438;
        font-size: 20px;
        font-family: 'Noto Sans Thai', sans-serif;
        font-weight: 400;
        line-height: 24px;
    }

    .f00_span, .f50_span, .f00_span_01, .f0_span, .f_span {
        color: rgba(0, 0, 0, 0.70);
        font-size: 12px;
        font-family: Inter, sans-serif;
        font-weight: 400;
    }

    .jan_span, .f024_span, .f025_span {
        color: rgba(0, 0, 0, 0.70);
        font-size: 12px;
        font-family: Inter, sans-serif;
        font-weight: 400;
    }

    .f00_01_span {
        color: rgba(0, 0, 0, 0.90);
        font-size: 24px;
        font-family: Inter, sans-serif;
        font-weight: 600;
    }

    .labelname_span, .labelname_01_span, .labelpercent_span, .labelpercent_01_span {
        color: black;
        font-size: 12px;
        font-family: Inter, sans-serif;
        font-weight: 400;
    }

    .labelvalue_span, .labelvalue_01_span {
        color: black;
        font-size: 12px;
        font-family: Inter, sans-serif;
        font-weight: 600;
    }

    /* Layout helpers */

    .frame-84, .frame-81 {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
    }

    .total-sales, .total-orders, .total-dishes, .total-dishes_01 {
        flex: 1;
    }

    .show-by-year {
        flex: 1;
        text-align: right;
    }

    .icons, .icons_01 {
        width: 24px;
        height: 24px;
        position: relative;
    }

    .bounding-box, .bounding-box_01 {
        width: 24px;
        height: 24px;
        position: absolute;
        background: #D9D9D9;
        border-radius: 4px;
    }

    .keyboard_arrow_down, .keyboard_arrow_down_01 {
        width: 12px;
        height: 7.40px;
        position: absolute;
        left: 6px;
        top: 8px;
        background: #68696E;
        clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
    }

    /* Chart specific styles */
    .chartaxis {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .mainchart {
        display: flex;
        align-items: center;
        flex: 1;
    }

    .yaxisleft {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 4px;
        height: 173px;
        align-items: flex-end;
    }

    .graphigrid {
        flex: 1;
        position: relative;
        height: 173px;
    }

    .xlines, .ylines {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .xlines {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 6px 1px;
    }

    .ylines {
        display: flex;
        justify-content: space-between;
        padding: 6px 1px;
    }

    .line, .line_01, .line_02, .line_03, .line_04 {
        height: 1px;
        background: rgba(0, 0, 25.50, 0.15);
        width: 100%;
    }

    .line_04 {
        background: rgba(0, 0, 25.50, 0.30);
    }

    .line_05, .line_06, .line_07, .line_08, .line_09, .line_10, .line_11, .line_12, .line_13, .line_14, .line_15, .line_16, .line_17 {
        width: 1px;
        height: 161px;
        background: rgba(0, 0, 25.50, 0.15);
    }

    .linearea {
        position: absolute;
        top: 7px;
        left: 0;
        width: 100%;
        height: 159px;
    }

    .xaxis {
        display: flex;
        padding-bottom: 8px;
        padding-left: 31px;
    }

    .xlabelbox {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .jan {
        text-align: center;
    }

    .legends {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        padding: 8px;
        gap: 8px;
    }

    .linelegends {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .legend, .legend_01 {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
    }

    .legendnode, .legendnode_01 {
        width: 16px;
        height: 16px;
        position: relative;
    }

    .line_18, .line_19 {
        width: 16px;
        height: 2px;
        position: absolute;
        top: 7px;
    }

    .line_18 {
        background: #8979FF;
    }

    .line_19 {
        background: #FF928A;
    }

    .basicnode_24, .basicnode_25 {
        width: 8px;
        height: 8px;
        position: absolute;
        left: 4px;
        top: 4px;
    }

    .ellipseline_24, .ellipseline_25 {
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        border: 1px solid;
    }

    .ellipseline_24 {
        border-color: #8979FF;
    }

    .ellipseline_25 {
        border-color: #FF928A;
    }

    /* Pie Chart Labels */
    .text-100_01 {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .labelname {
        position: absolute;
        left: 130px;
        top: 195px;
        width: 63px;
        height: 31px;
    }

    .labelvalue {
        position: absolute;
        left: 130px;
        top: 230px;
        width: 34px;
        height: 31px;
    }

    .labelpercent {
        position: absolute;
        left: 170px;
        top: 230px;
        width: 42px;
        height: 31px;
    }

    .labelname_01 {
        position: absolute;
        left: 30px;
        top: 18px;
    }

    .labelvalue_01 {
        position: absolute;
        left: 30px;
        top: 35px;
    }

    .labelpercent_01 {
        position: absolute;
        left: 63px;
        top: 35px;
    }

    /* Responsive adjustments */
    @media (max-width: 1200px) {
        .charts-row {
            flex-direction: column;
        }
        
        .frame-11 {
            width: 100%;
        }
    }

    @media (max-width: 768px) {
        .stats-row {
            flex-direction: column;
        }
        
        .frame-10, .frame-8, .frame-13, .frame-14 {
            width: 100%;
        }
    }
</style>