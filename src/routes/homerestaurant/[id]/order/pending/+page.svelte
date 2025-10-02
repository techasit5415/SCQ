<script>
    import { goto } from "$app/navigation";
    import TopBar from "$lib/ComponentsShop/Topbar.svelte";
    import RestaurantSidebar from "$lib/ComponentsShop/RestaurantSidebar.svelte";
    import Orderbar from "$lib/ComponentsShop/Orderbar.svelte";

    export let data../../order/pending/$types.js;
    export let fromMenu;
    export let activeOrderIdx = 0;

    let activeMenu = "pending";
    let activeOrderMenu = "pending";

    function handleViewRestaurant(event) {
        // Navigate to restaurant page
        goto("/homeadmin/rester");
    }

    async function handleLogout() {
        try {
            await fetch("/logout");
            window.location.href = "/admin";
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/admin";
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

    function getMenuDetails(id) {
        return data.menus.find((menu) => menu.id === id);
    }
</script>

<!-- หน้า Pending Order -->
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
        <Orderbar
            {activeOrderMenu}
            on:viewRestaurant={handleViewRestaurant}
            on:logout={handleLogout}
        />
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
                            {#if data.orders && data.orders.length > 0}
                                {#each data.orders as item, index}
                                    <tr
                                        class:active={activeOrderIdx === index}
                                        on:click={() => handleListClick(index)}
                                    >
                                        <td
                                            >#{item.id || "N/A"}<br
                                            />{listDateTime(item.created)}
                                            {item?.Menu_ID.length || 0} รายการ</td
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
                            <span>Order: </span>
                            <span
                                >{Array.isArray(data.orders) &&
                                data.orders.length > 0
                                    ? data.orders[activeOrderIdx].id
                                    : "-"}</span
                            >
                        </div>
                        <div class="customer-detail">
                            <span>
                                ชื่อลูกค้า {Array.isArray(data.orders) &&
                                    data.orders.length > 0
                                    ? data.orders[activeOrderIdx].User_ID
                                    : "-"}</span
                            >
                            <span>
                                {detailDateTime(data.orders[activeOrderIdx].created)}
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
                            {#if data.orders[activeOrderIdx].Menu_ID && data.orders[activeOrderIdx].Menu_ID.length > 0}
                                {#each data.orders[activeOrderIdx].Menu_ID as menuID, index}
                                    <tr>
                                        <td>{getMenuDetails(menuID).name ||"N/A"}</td>
                                        <td>฿{getMenuDetails(menuID).Price || "0"}</td>
                                        <td>{getMenuDetails(menuID).option || "0"}</td>
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
                <div class="detail-btn">
                    <button type="button" class="cancel-order-btn">
                        <span>ยกเลิกออเดอร์</span>
                    </button>
                    <button type="button" class="accept-order-btn">
                        <span>รับออเดอร์</span>
                    </button>
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
        font-family: "Noto Sans Thai", sans-serif;
    }

    /* .logout {
        margin-top: auto;
        color: #d32f2f !important;
    } */

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
        justify-content: left;
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
        display: flex;
        font-size: 20px;
        justify-content: space-between;
    }
    .line1 {
        height: 1px;
        background-color: #b4b5b7;
    }
    .menu-detail {
        overflow: auto;
        background-color: rgb(255, 255, 255);
        height: 600px;
        font-size: 25px;
    }

    .detail-btn {
        display: flex;
        gap: 16px;
        justify-content: center;
    }
    .cancel-order-btn {
        width: 350px;
        height: 48px;
        border-radius: 16px;
        font-size: 14px;
        font-family: "Noto Sans Thai", sans-serif;
        background-color: white;
        color: #68696e;
        border: 2px solid #68696e;
    }
    .accept-order-btn {
        width: 576px;
        height: 48px;
        border-radius: 16px;
        font-size: 14px;
        font-family: "Noto Sans Thai", sans-serif;
        background-color: orange;
        color: white;
        border: 2px solid white;
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
