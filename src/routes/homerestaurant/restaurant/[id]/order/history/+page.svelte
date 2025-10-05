<script>
    import { createEventDispatcher } from "svelte";
    import { goto } from "$app/navigation";
    import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
    import TopBar from '$lib/Components/restaurant/Topbar.svelte';
    import RestaurantSidebar from '$lib/Components/restaurant/RestaurantSidebar.svelte';
    import Orderbar from '$lib/Components/restaurant/Orderbar.svelte';
    import PocketBase from "pocketbase"

    const pb = new PocketBase("http://10.1.1.113:8080");
    const pbUrl = PUBLIC_POCKETBASE_URL;
    const dispatch = createEventDispatcher();

    export let data;
    export let activeOrderIdx = 0;

    let activeMenu = "pending";
    let activeOrderMenu = "history";
    let paymentPending =  data.payments?.filter(p => p.expand?.Order_ID?.Status === "Pending");
    let paymentInprogress =  data.payments?.filter(p => p.expand?.Order_ID?.Status === "In-progress");
    let paymentCompleted =  data.payments?.filter(p => p.expand?.Order_ID?.Status === "Completed");


    function handleOrderClick(menu, rest) {
        if (menu !== activeOrderMenu) {
            activeOrderMenu = menu;
            dispatch("menuChange", { menu });
            switch (menu) {
                case "pending":
                    goto(`/homerestaurant/restaurant/${rest}/order/pending`);
                    break;
                case "active":
                    goto(`/homerestaurant/restaurant/${rest}/order/active`);
                    break;
                case "history":
                    goto(`/homerestaurant/restaurant/${rest}/order/history`);
                    break;
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

    function listDateTime(dateString) {
        const date = new Date(dateString);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มที่ 0
        const dd = String(date.getDate()).padStart(2, "0");

        const hh = String(date.getHours()).padStart(2, "0");
        const mi = String(date.getMinutes()).padStart(2, "0");

        return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
    }
    function detailDateTime(dateString) {
        const date = new Date(dateString);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มที่ 0
        const dd = String(date.getDate()).padStart(2, "0");

        const hh = String(date.getHours()).padStart(2, "0");
        const mi = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    function handleListClick(orderList) {
        activeOrderIdx = orderList;
    }

</script>

<!-- หน้า History Order -->
<div id="restaurant-layout" class="restaurant-layout">
    <TopBar title="Restaurant Panel - Order" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar 
        {activeMenu}
        
        on:viewRestaurant={handleViewRestaurant}
        on:logout={handleLogout}
    />
    
    <!-- Main Content -->
    <main class="main-content">
        <!-- Pending -->
        <div class="page-header">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Order</span>
            </nav>
            <h2>Order</h2>
        </div>


        <!-- <Orderbar 
            {activeOrderMenu}
            on:viewRestaurant={handleViewRestaurant}
            on:logout={handleLogout}
        /> -->
        <nav class="orderbar">
            <div class="orderbar-content">
                <div class="btn-content">
                    <!-- Pending Orders -->
                    <button
                        class="order-btn"
                        class:active={activeOrderMenu === "pending"}
                        on:click={() => handleOrderClick("pending", paymentPending[activeOrderIdx].Shop_ID)}
                    >
                        <span>Pending Orders </span>
                        <span style="color: #2b7fff;">({paymentPending.length})</span>
                    </button>

                    <!-- Active Orders -->
                    <button
                        class="order-btn"
                        class:active={activeOrderMenu === "active"}
                        on:click={() => handleOrderClick("active", paymentInprogress[activeOrderIdx].Shop_ID)}
                    >
                        <span>Active Orders </span>
                        <span style="color: #2b7fff;">({paymentInprogress.length})</span>
                    </button>

                    <!-- Order History -->
                    <button
                        class="order-btn"
                        class:active={activeOrderMenu === "history"}
                        on:click={() => handleOrderClick("history", paymentCompleted[activeOrderIdx].Shop_ID)}
                    >
                        <span>History Order</span>
                        <span style="color: #2b7fff;">({paymentCompleted.length})</span>
                    </button>
                </div>
                <div class="line-content">
                    <div class="line" class:active={activeOrderMenu === "pending"}></div>
                    <div class="line" class:active={activeOrderMenu === "active"}></div>
                    <div class="line" class:active={activeOrderMenu === "history"}></div>
                    <div class="line4"></div>
                </div>
            </div>
        </nav>

        <!-- ส่วนของรายการ และรายละเอียด -->
        <div class="order-content">
            <div class="orderList">
                <div class="headList">
                    <div class="orderID-list">
                        <span>Order ID</span>
                    </div>
                    <div class="price-list">
                        <span>ราคา</span>
                    </div> 
                </div>
                <div class="table-part">
                    <table class="order-list-table">
                        <tbody>
                            {#if paymentCompleted && paymentCompleted.length > 0}
                                {#each paymentCompleted as item, index}
                                    <tr
                                        class:active={activeOrderIdx === index}
                                        on:click={() => handleListClick(index)}
                                    >
                                        <td
                                            >#{item.id || "N/A"}<br
                                            />{listDateTime(item.created)}
                                            {item.expand?.Order_ID?.expand?.Menu_ID?.length || 0} รายการ</td
                                        >
                                        <td>฿{item.Total_Amount || "N/A"}</td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr>
                                    <td colspan="6" class="no-data">
                                        No item found
                                    </td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="orderDetail">
                <div class="headDetail">
                    <div class="head-detail">
                        <div class="orderID-detail">
                            <span>
                                Order: {paymentCompleted[activeOrderIdx].Order_ID || "N/A"}
                            </span>
                        </div>
                        <div class="customer-detail">
                            <span>
                                ชื่อลูกค้า: {paymentCompleted[activeOrderIdx].expand?.User_ID?.name}
                            </span>
                            <span>
                                {detailDateTime(paymentCompleted[activeOrderIdx].created)}
                            </span>
                        </div> 
                        <div class="line1"></div>
                    </div> 
                </div>
                <div class="menu-detail">
                    <table>
                        <thead>
                            <tr>
                                <th>รายการอาหาร</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if paymentCompleted[activeOrderIdx].expand.Order_ID.expand.Menu_ID.length > 0}
                                {#each paymentCompleted[activeOrderIdx].expand?.Order_ID?.expand?.Menu_ID as menu}
                                    <tr>
                                        <td>{menu.name}</td>
                                        <td>{menu.option}</td>
                                        <td>{menu.Price}</td>
                                    </tr>
                                {/each}
                            {:else}
                                <tr>
                                    <td colspan="6" class="no-data">
                                        No item found
                                    </td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
                <div class="detail-totalAmount">
                    <span>วิธีชำระเงิน: {paymentCompleted[activeOrderIdx].Method_Payment}</span>
                    <span>สถานะการชำระเงิน: {paymentCompleted[activeOrderIdx].status}</span>
                    <div class="detail-summary-totalAmount">
                        <span>ราคารวม</span>
                        <span style="font-size:30px; color:#FF8C00;">฿{paymentCompleted[activeOrderIdx].Total_Amount}</span>
                    </div>
                </div>
            </div>
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
        background-color: #f5f5f5;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    /* .logout {
        margin-top: auto;
        color: #d32f2f !important;
    } */

    /* ส่วนของ Orderbar */
    .btn-content {
        display: flex;
        gap: 40px;
        margin-bottom: 8px;
    }
    .order-btn {
        border: none;
        background: none;
        align-items: left;
        font-size: 19px;
        color: #333438;
        cursor: pointer;
    }

    .order-btn:hover {
        color: #333;
    }

    .order-btn.active {
        color: #2b7fff;
        font-weight: 500;
    }

    .line-content {
        display: flex;
    }

    .line {
        width: 190px;
        height: 0px;
        border: 2px solid #95969a;
    }
    .line.active {
        border: 2px solid #2b7fff;
    }
    .line4 {
        width: 1030px;
        height: 0px;
        border: 2px solid #95969a;
    }

    /* Main Content */
    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding-left: 30px;
        padding-top: 30px;
        padding-right: 22px;
        /* min-height: calc(100vh - 60px); */
    }

    /* Page Header */
    .page-header {
        margin: -30px;
        margin-left: -40px;
        padding: 30px 40px;
        background-color: white;
        margin-bottom: 30px;
        border-bottom: 1px solid #e0e0e0;
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

    .order-content {
        display: flex;
        gap: 24px;
        justify-content:left;
        margin-top: 10px;
    }

    /* ส่วนของ List */
    .orderList {
        width: 666px;
        height: 680px;
        background-color: rgb(255, 255, 255);
        border-radius: 16px;
        gap: 8px;
    }
    .headList {
        display: flex;
        padding-top: 20px;
        padding-right: 16px;
        padding-bottom: 20px;
        padding-left: 16px;
        justify-items: center;
        justify-content: space-between;
        /* border-bottom: 1px solid #e0e0e0; */
        font-size: 20px;
    }
    .orderID-list {
        width: 357px;
    }

    .table-part {
        /* background-color: green; */
        /* width: 500px; */
        height: 600px;
        overflow: auto;
    }
    .order-list-table {
        border-collapse: collapse;
    }
    .order-list-table td {
        width: 500px;
        padding: 12px;
        text-align: left;
        border-top: 1px solid #e0e0e0;
    }
    /* .order-list-table tr{
        display: flex;
        gap: 10px
    } */
    .order-list-table tbody tr:hover {
        background: #d9d9d9;
        cursor: pointer;
    }

    .order-list-table tbody tr.active {
        background: #D9D9D9;
        font-weight: 500;
    }

    /* ส่วนของ Detail */
    .orderDetail {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 1270px;
        height: 680px;
        background-color: rgb(255, 255, 255);
        padding-top: 20px;
        padding-right: 16px;
        padding-bottom: 20px;
        padding-left: 16px;  
    }
    .head-detail {
        display: flex;
        flex-direction: column;
        gap: 16px;
        justify-content: center;
    }
    .orderID-detail {
        font-size: 25px;
        font-weight: blod;
    }
    .customer-detail {
        font-size: 20px;
    }
    .line1 {
        height: 1px;
        background-color: #B4B5B7;
    }
    
    .menu-detail {
        overflow: auto;
        background-color: rgb(255, 0, 0);
        height: 600px;
        font-size: 25px;
    }
    .detail-totalAmount {
        display: flex;
        flex-direction: column;
        font-size: 20px;
        color: #333438;
    }
    .detail-summary-totalAmount {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
        }

        .dashboard-components {
            grid-template-columns: 1fr;
        }
    }
</style>