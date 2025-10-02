<script>
    import { goto } from "$app/navigation";
    import TopBar from "$lib/Components/restaurant/Topbar.svelte";
    import RestaurantSidebar from "$lib/Components/restaurant/RestaurantSidebar.svelte";

    export let data;
    export let form;

    let activeMenu = "menu";

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

    // User management functions
    function handleEditItem(menuId) {
        alert(`Edit user functionality for ID: ${menuId} (Coming soon...)`);
    }

    function handleDeleteItem(menuId) {
        if (confirm("Are you sure you want to delete this user?")) {
            alert(
                `Delete user functionality for ID: ${menuId} (Coming soon...)`,
            );
        }
    }

    // // สมมุติว่า item.Available เป็น Boolean เช่น true หรือ false
    // const item = { Available: true }; // หรือ false ก็ได้

    // const checkbox = document.getElementById("toggleSwitch");
    // checkbox.checked = data.menus.Available; // ตั้งค่าตาม item.Available

    // // ถ้าคุณต้องการให้ทำอะไรบางอย่างเมื่อสลับสถานะ
    // checkbox.addEventListener('change', function () {
    //     if (checkbox.checked) {
    //     console.log("เปิดใช้งาน");
    //     } else {
    //     console.log("ปิดใช้งาน");
    //     }
    // });

</script>

<!-- on:menuChange={handleMenuChange} -->

<!-- หน้า Dashboard ร้านอาหาร -->
<div id="restaurant-layout" class="restaurant-layout">
    <!-- Sidebar -->
    <TopBar title="Restaurant Panel - Menu" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar
        {activeMenu}
        on:viewRestaurant={handleViewRestaurant}
        on:logout={handleLogout}
    />
    <!-- Main Content -->
    <main class="main-content">
        <!-- Menu -->
        <div class="page-header">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item current">Menu</span>
            </nav>
            <h2>Menu</h2>
        </div>
        <div class="menu-content">
            <!-- ส่วนของ Item -->
            <div class="menu-item">
                <div class="item-btn-content">
                    <button type="button" class="add-item-btn">
                        <span
                            class="material-symbols-outlined"
                            style="color: white;"
                        >
                            add_2
                        </span>
                        <span
                            class="btn-text"
                            style="color: white; font-size: 20px">Add Item</span
                        >
                    </button>
                    <input
                        type="text"
                        placeholder="Search"
                        name="search"
                        class="search-item-btn"
                    />
                </div>
                <table class="item-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if data.menus && data.menus.length > 0}
                            {#each data.menus as item, index}
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{item.photo || "N/A"}</td>
                                    <td>{item.name || "N/A"}</td>
                                    <td>{item.category || "N/A"}</td>
                                    <td>{item.Price || "N/A"}</td>
                                    <td>
                                        <!-- <span
                                            class="status-badge"
                                            class:active={item.Available}
                                        >
                                            {item.Available
                                                ? "Active"
                                                : "Inactive"}
                                        </span> -->
                                        <label class="switch">
                                            <input type="checkbox" id="toggleSwitch">
                                            <span class="slider round">{item.Available}</span>
                                        </label>
                                    </td>
                                    <td>
                                        <button
                                            class="action-btn edit"
                                            on:click={() =>
                                                handleEditItem(item.id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            class="action-btn delete"
                                            on:click={() =>
                                                handleDeleteItem(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
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

            <!-- ส่วนของ Category -->
            <div class="menu-category">
                <div class="category-btn-content">
                    <button type="button" class="add-category-btn">
                        <span
                            class="material-symbols-outlined"
                            style="color: white;"
                        >
                            add_2
                        </span>
                        <span
                            class="btn-text"
                            style="color: white; font-size: 20px"
                            >Add Category</span
                        >
                    </button>
                </div>
                <div class="line"></div>
                <table class="category-table">
                    <thead>
                        <tr>
                        </tr>
                    </thead>
                    <tbody>
                        {#if Array.isArray(data.cate) && data.cate.length > 0}
                            {#each data.cate as item}
                                <tr>
                                    <td class="text-left">{item.category || "N/A"}</td>
                                    <td class="text-right">
                                        <button
                                            class="action-btn edit"
                                            on:click={() =>
                                                handleEditItem(item.id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            class="action-btn delete"
                                            on:click={() =>
                                            handleDeleteItem(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        {:else}
                            <tr>
                                <td colspan="6" class="no-data">
                                    No category found
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
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
        background: #f5f5f5;
        font-family: "Noto Sans Thai", sans-serif;
    }

    .logout {
        margin-top: auto;
        color: #d32f2f !important;
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

    /* หน้า Menu */
    .menu-content {
        display: flex;
        gap: 24px;
    }

    /* หมวด Item */
    .menu-item {
        display: flex;
        flex-direction: column;
        width: 1000px;
        /* height: 1000px; */
        margin-top: 20px;
        padding-right: 16px;
        padding-bottom: 20px;
        padding-left: 16px;
        background-color: rgb(255, 255, 255);
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 16px;
        gap: 16px;
    }
    .item-btn-content {
        display: flex;
        justify-content: space-between;
        background-color: #ffffff;
    }
    .add-item-btn {
        display: flex;
        width: 200px;
        height: 48px;
        margin-top: 20px;
        background-color: orange;
        border-radius: 16px;
        align-items: center;
        justify-content: center; /*  จัดแนวนอน */
        border: none;
        gap: 16px;
    }
    .search-item-btn {
        display: flex;
        width: 200px;
        height: 48px;
        margin-top: 20px;
        padding-left: 10px;
        border-radius: 16px;
        border: 1px solid #ccc;
    }
    .item-table {
        width: 900px;
        border-collapse: collapse;
    }

    .item-table th {
        padding: 12px;
        text-align: center;
        border-bottom: 2px solid #494A50;
    }
    .item-table td {
        padding: 12px;
        text-align: center;
        border-top: 1px solid #e0e0e0;
    }

    .item-table th {
        background: #ffffff;
        font-weight: 500;
        color: #333;
        font-size: 16px;
    }

    .item-table td {
        font-size: 16px;
        color: #666;
    }

    .item-table tbody tr:hover {
        background: #f8f9fa;
    }

    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        background: #ffebee;
        color: #d32f2f;
    }

    .status-badge.active {
        background: #e8f5e8;
        color: #2e7d32;
    }

    .action-btn {
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        margin-right: 8px;
        text-decoration: underline;
        background: none;
    }

    .action-btn.edit {
        color: #2b7fff;
    }

    .action-btn.delete {
        color: #d32f2f;
    }

    .action-btn:hover {
        opacity: 0.7;
    }

    .no-data {
        text-align: center;
        color: #888;
        font-style: italic;
    }

    /* หมวด category */
    .menu-category {
        width: 1000px;
        /* height: 700px; */
        margin-top: 20px;
        padding-right: 16px;
        padding-bottom: 20px;
        padding-left: 16px;
        background-color: rgb(255, 255, 255);
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 16px;
    }
    .category-btn-content {
        display: flex;
        justify-content: left;
        background-color: #ffffff;
        margin-bottom: 8px;
    }
    .add-category-btn {
        display: flex;
        width: 200px;
        height: 48px;
        margin-top: 20px;
        background-color: orange;
        border-radius: 16px;
        align-items: center;
        justify-content: center; /*  จัดแนวนอน */
        border: none;
        gap: 16px;
    }
    .line {
        width: 600px;
        height: 2px;
        border-bottom: 2px solid #494A50;
        margin-bottom: 8px;
    }
    .category-table {
        width: 600px;
        border-collapse: collapse;
    }
    
    .category-table td {
        padding: 12px;
        border: none;
        background-color: #EDF0F2;
        border-top: 8px solid #ffffff;
    }
    .text-left {
        text-align: left;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }
    .text-right {
        text-align: right;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    .category-table td {
        font-size: 16px;
        color: #666;
    }
    .category-table tbody tr:hover {
        background: #f8f9fa;
    }


    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
        }
    .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }
    input:checked + .slider {
        background-color: #4CAF50;
    }
    input:focus + .slider {
        box-shadow: 0 0 1px #4CAF50;
    }
    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }
    /* Rounded sliders */
    .slider.round {
    border-radius: 34px;
    }
    .slider.round:before {
    border-radius: 50%;
}
</style>
