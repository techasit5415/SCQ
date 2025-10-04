<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
    import { enhance } from '$app/forms';
    import TopBar from "$lib/Components/restaurant/Topbar.svelte";
    import RestaurantSidebar from "$lib/Components/restaurant/RestaurantSidebar.svelte";
    import PocketBase from "pocketbase";

    const pb = new PocketBase("http://10.1.1.113:8080");

    export let data;

    let activeMenu = "menu";
    let showAddItem = false;
    let showEditItem = false;
    let showDeleteItem = false;
    let addingItem = null;
    let editingItem = null;
    let deletingItem = null;
    let searchItem = "";

    async function handleLogout() {
        try {
            await fetch("/logout");
            window.location.href = "/admin";
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/admin";
        }
    }

    $: filteredItem = data.menus.filter((menu) => {
        // const matchesRole = selectedRole === 'all' ||
        //                   (user.expand?.Role?.name?.toLowerCase() === selectedRole.toLowerCase());
        const matchesSearch =
            searchItem === "" ||
            menu.name?.toLowerCase().includes(searchItem.toLowerCase());
        return matchesSearch;
    });

    async function handleSwitchAvailable(index, newStatus) {
        // ดึง record id ของรายการที่ต้องการอัปเดต
        const item = data.menus[index];
        try {
            // เรียก API ของ PocketBase เพื่ออัปเดต
            const updated = await pb.collection("Menu").update(item.id, {
                Available: newStatus,
            });
            // อัปเดตใน UI ด้วยค่าที่กลับมาจากฐานข้อมูล (optional)
            data.menus[index] = updated;
            console.log("อัปเดตสำเร็จ:", updated);
        } catch (error) {
            console.error("อัปเดตล้มเหลว:", error);
            // แนะนำ: rollback UI หรือแสดงข้อความ error ให้ผู้ใช้
        }
    }

    // Item management functions
    function handleAddItem() {
        showAddItem = true;
    }
    function closeAddItem() {
        showAddItem = false;
        addingItem = null;
    }
    function handleAddItemSuccess() {
        showAddItem = false;
        addingItem = null;
    }

    function handleEditItem(item) {
        // alert(`Edit user functionality for ID: ${menuId} (Coming soon...)`);
        editingItem = {
            ...item,
        };
        showEditItem = true;
    }
    function closeEditItem() {
        showEditItem = false;
        editingItem = null
    }
    function handleUpdateItemSuccess() {
        showEditItem = false;
        editingItem = null;
        // Refresh page to show updated data
        setTimeout(() => window.location.reload(), 1000);
    }

    function handleDeleteItem(item) {
        deletingItem = item;
        showDeleteItem = true;
    }
    function closeDeleteItem() {
        showDeleteItem = false;
        deletingItem = null;
    }
    function handleDeleteItemSuccess() {
        showDeleteItem = false;
        deletingItem = null;
        // Refresh page to show updated data
        setTimeout(() => window.location.reload(), 1000);
    }

    // Category management function


</script>

<!-- หน้า Menu ร้านอาหาร -->
<div id="restaurant-layout" class="restaurant-layout">
    <!-- Sidebar -->
    <TopBar title="Restaurant Panel - Menu" logoSrc="/SCQ_logo.png" />
    <RestaurantSidebar {activeMenu} on:logout={handleLogout} />
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
                            style="color: white; font-size: 20px"
                        >
                            Add Item
                        </span>
                    </button>
                    <input
                        type="text"
                        placeholder="Search"
                        class="search-item-btn"
                        bind:value={searchItem}
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
                        {#if filteredItem && filteredItem.length > 0}
                            {#each filteredItem as item, index}
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>
                                        {#if item.Photo}
                                            <!-- <img src={item.Photo} style="width: 10px; height: auto;" /> -->
                                            <!-- <img src={item.Photo} /> -->
                                        {:else}
                                            N/A
                                        {/if}
                                    </td>
                                    <td>{item.name || "N/A"}</td>
                                    <td>{item.category || "N/A"}</td>
                                    <td>{item.Price || "N/A"}</td>
                                    <td>
                                        <label class="switch">
                                            <input
                                                type="checkbox"
                                                id="toggleSwitch"
                                                bind:checked={item.Available}
                                                on:change={() =>
                                                    handleSwitchAvailable(
                                                        index,
                                                        item.Available,
                                                    )}
                                            />
                                            <span class="slider round"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <button
                                            class="item-btn-edit"
                                            on:click={() =>
                                                handleEditItem(item)}
                                        >
                                            <span
                                                class="material-symbols-outlined"
                                                >edit</span
                                            >
                                        </button>
                                        <button
                                            class="item-btn-delete"
                                            on:click={() =>
                                                handleDeleteItem(item)}
                                        >
                                            <span
                                                class="material-symbols-outlined"
                                                >delete</span
                                            >
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
                        <tr> </tr>
                    </thead>
                    <tbody>
                        {#if Array.isArray(data.cate) && data.cate.length > 0}
                            {#each data.cate as item}
                                <tr>
                                    <td class="text-left"
                                        >{item.category || "N/A"}</td
                                    >
                                    <td class="text-right">
                                        <button
                                            class="category-btn-edit"
                                            on:click={() =>
                                                handleEditItem(item.id)}
                                        >
                                            <span
                                                class="material-symbols-outlined"
                                                >edit</span
                                            >
                                        </button>
                                        <button
                                            class="category-btn-delete"
                                            on:click={() =>
                                                handleDeleteItem(item.id)}
                                        >
                                            <span
                                                class="material-symbols-outlined"
                                                >delete</span
                                            >
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

<!-- Add Item -->
<!-- {#if showAddItem && addingItem}
    <div class="item-modal">
        <div class="item-modal-content">
            <div class="header-item-modal">
                <span>Edit Menu</span>
                <button
                    type="button"
                    class="close-modal"
                    on:click={closeAddItem}
                >
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form method="POST" action="?/addMenu" use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success') {
                        handleAddItemSuccess();
                    }
                };
            }}>
                <div class="item-name-field">
                    <div class="header-item-modal-component">
                        <span>Name</span>
                    </div>
                    <input
                        type="text"
                        placeholder="รายละเอียด"
                        required
                        name="name"
                        class="item-input"
                    />
                </div>
                <div class="item-detail-field">
                    <div class="header-item-modal-component">
                        <span>Detail</span>
                    </div>
                    <input
                        type="text"
                        placeholder="รายละเอียด"
                        required
                        name="detail"
                        class="item-input"
                    />
                </div>
                <div class="item-select-field">
                    <div class="header-item-modal-component">
                        <span>Select Category</span>
                    </div>
                    <select class="role-select" name="category">
                        <option value="" disabled selected hidden
                            >เลือก ... </option
                        >
                        {#if Array.isArray(data.cate) && data.cate.length > 0}
                            {#each data.cate as item}
                                <option value={item.category}
                                    >{item.category}</option
                                >
                            {/each}
                        {/if}
                    </select>
                </div>
                <div class="item-price-field">
                    <div class="header-item-modal-component">
                        <span>Price</span>
                    </div>
                    <input
                        type="text"
                        placeholder="รายละเอียด"
                        required
                        name="price"
                        class="item-input"
                    />
                </div>
                <div class="item-price-field">
                    <div class="header-item-modal-component">
                        <span>Status</span>
                    </div>
                    <label class="switch">
                        <input
                            type="checkbox"
                            id="toggleSwitch"
                            name="status"
                        />
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeEditItem}>
                        <span class="material-symbols-outlined">close</span>
                        ยกเลิก
                    </button>
                    <button type="submit" class="btn-primary">
                        <span class="material-symbols-outlined">add</span>
                        บันทึกเพิ่มเมนู
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if} -->

<!-- Edit Item -->
{#if showEditItem && editingItem}
    <div class="item-modal">
        <div class="item-modal-content">
            <div class="header-item-modal">
                <span>Edit Menu</span>
                <button
                    type="button"
                    class="close-modal"
                    on:click={closeEditItem}
                >
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form method="POST" action="?/updateMenu" use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success') {
                        handleUpdateItemSuccess();
                    }
                };
            }}>
                <input type="hidden" name="menuId" value={editingItem.id} />
                <div class="item-name-field">
                    <div class="header-item-modal-component">
                        <span>Name</span>
                    </div>
                    <input
                        type="text"
                        placeholder="รายละเอียด"
                        required
                        name="name"
                        class="item-input"
                        bind:value={editingItem.name}
                    />
                </div>
                <div class="item-detail-field">
                    <div class="header-item-modal-component">
                        <span>Detail</span>
                    </div>
                    <input
                        type="text"
                        placeholder="รายละเอียด"
                        required
                        name="detail"
                        class="item-input"
                        bind:value={editingItem.detail}
                    />
                </div>
                <div class="item-select-field">
                    <div class="header-item-modal-component">
                        <span>Select Category</span>
                    </div>
                    <select class="role-select" name="category">
                        <option value="" disabled selected hidden
                            >{editingItem.category} </option
                        >
                        {#if Array.isArray(data.cate) && data.cate.length > 0}
                            {#each data.cate as item}
                                <option value={item.category}
                                    >{item.category}</option
                                >
                            {/each}
                        {/if}
                    </select>
                </div>
                <div class="item-price-field">
                    <div class="header-item-modal-component">
                        <span>Price</span>
                    </div>
                    <input
                        type="text"
                        placeholder="รายละเอียด"
                        required
                        name="price"
                        class="item-input"
                        bind:value={editingItem.Price}
                    />
                </div>
                <div class="item-price-field">
                    <div class="header-item-modal-component">
                        <span>Status</span>
                    </div>
                    <label class="switch">
                        <input
                            type="checkbox"
                            id="toggleSwitch"
                            name="status"
                            bind:checked={editingItem.Available}
                        />
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeEditItem}>
                        <span class="material-symbols-outlined">close</span>
                        ยกเลิก
                    </button>
                    <button type="submit" class="btn-primary">
                        <span class="material-symbols-outlined">save</span>
                        บันทึกการเปลี่ยนแปลง
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Delete User Modal -->
{#if showDeleteItem && deletingItem}
    <div class="item-delete-modal">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="item-delete-modal-content">
            <div class="modal-header">
                <span>Delete Menu</span>
                <button
                    type="button"
                    class="close-modal"
                    on:click={closeDeleteItem}
                >
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div class="item-delete-modal-body">
                <p class="confirm-text">คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?</p>
                <div class="user-details">
                    <div class="user-info-card">
                        <!-- <div class="user-avatar">
                            <span class="material-symbols-outlined">person</span>
                        </div> -->
                        <div class="user-info-text">
                            <div class="user-name">
                                <span>
                                    {deletingItem.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="warning-box">
                    <span class="material-symbols-outlined">error</span>
                    <p class="warning-text">การดำเนินการนี้ไม่สามารถยกเลิกได้ ข้อมูลทั้งหมดของเมนูนี้จะถูกลบถาวร</p>
                </div>
            </div>
            
            <form method="POST" action="?/deleteMenu" use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success') {
                        handleDeleteItemSuccess();
                    }
                };
            }}>
                <input type="hidden" name="menuId" value={deletingItem.id} />
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeDeleteItem}>
                        <span class="material-symbols-outlined">close</span>
                        ยกเลิก
                    </button>
                    <button type="submit" class="btn-danger">
                        <span class="material-symbols-outlined">delete_forever</span>
                        ลบผู้ใช้
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

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
        border-bottom: 2px solid #494a50;
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

    .item-btn-edit {
        width: 38px;
        height: 38px;
        border: 1px solid #333438;
        border-radius: 50%;
        color: #333438;
        justify-content: center;
        cursor: pointer;
        background: none;
    }

    .item-btn-delete {
        width: 38px;
        height: 38px;
        border: 1px solid #d32f2f;
        border-radius: 50%;
        color: #d32f2f;
        justify-content: center;
        cursor: pointer;
        background: none;
    }
    .item-btn-edit:hover {
        opacity: 0.7;
    }
    .item-btn-delete:hover {
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
        border-bottom: 2px solid #494a50;
        margin-bottom: 8px;
    }
    .category-table {
        width: 600px;
        border-collapse: collapse;
    }

    .category-table td {
        padding: 12px;
        border: none;
        background-color: #edf0f2;
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

    .category-btn-edit {
        width: 38px;
        height: 38px;
        border: 1px solid #333438;
        border-radius: 50%;
        color: #333438;
        justify-content: center;
        cursor: pointer;
        background: none;
    }
    .category-btn-delete {
        width: 38px;
        height: 38px;
        border: 1px solid #d32f2f;
        border-radius: 50%;
        color: #d32f2f;
        justify-content: center;
        background: none;
    }
    .category-btn-edit:hover {
        opacity: 0.7;
    }
    .category-btn-delete:hover {
        opacity: 0.7;
    }

    /* ส่วนของ Switch */
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
        -webkit-transition: 0.4s;
        transition: 0.4s;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: 0.4s;
        transition: 0.4s;
    }
    input:checked + .slider {
        background-color: #4caf50;
    }
    input:focus + .slider {
        box-shadow: 0 0 1px #4caf50;
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

    .item-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .item-modal-content {
        background: rgb(255, 255, 255);
        border-radius: 16px;
        width: 712px;
        height: 866px;
        /* overflow-y: auto; */
        padding: 32px;
        gap: 20px;
        font-family: "Noto Sans Thai", sans-serif;
    }
    .header-item-modal {
        display: flex;
        font-size: 20px;
        color: #494a50;
        font-weight: bold;
        justify-content: space-between;
    }
    .close-modal {
        border: none;
        background: none;
        cursor: pointer;
    }
    .header-item-modal-component {
        font-size: 16px;
        color: Foundation/Grey/G300;
        font-family: "Noto Sans Thai", sans-serif;
    }
    .item-input {
        width: 648px;
        height: 44px;
        border: 1px solid #b4b5b7;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 13px;
        font-family: "Noto Sans Thai", sans-serif;
    }
    .role-select {
        width: 648px;
        height: 44px;
        border: 1px solid #b4b5b7;
        border-radius: 8px;
        padding: 12px 12px 12px 16px;
        font-size: 13px;
        font-family: "Noto Sans Thai", sans-serif;
    }



    /* Modal Styles */
    .item-delete-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .item-delete-modal-content {
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 550px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: scale(0.95);
        animation: slideIn 0.3s ease-out forwards;
    }

    @keyframes slideIn {
        from {
            transform: scale(0.95) translateY(-20px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 28px;
        border-bottom: 1px solid #e0e0e0;
        position: relative;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-radius: 16px 16px 0 0;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
        flex: 1;
    }

    .modal-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: #f5f5f5;
        border: none;
        cursor: pointer;
        color: #666;
        padding: 8px;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .modal-close:hover {
        background: #e0e0e0;
        color: #333;
        transform: scale(1.1);
    }

    .delete-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
    }

    .item-delete-modal-body {
        padding: 28px;
    }

    .confirm-text {
        font-size: 16px;
        color: #333;
        margin-bottom: 20px;
        text-align: center;
        font-weight: 500;
    }

    .user-details {
        margin: 20px 0;
    }

    .user-info-card {
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .user-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
    }

    .user-info-text {
        flex: 1;
    }

    .user-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
    }

    .user-email {
        font-size: 14px;
        color: #666;
        margin-bottom: 2px;
    }

    .user-phone {
        font-size: 13px;
        color: #888;
        margin-bottom: 8px;
    }

    .warning-box {
        background: linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%);
        padding: 16px;
        border-radius: 10px;
        border-left: 4px solid #ff9800;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-top: 20px;
    }

    .warning-box .material-symbols-outlined {
        color: #f57c00;
        font-size: 20px;
        margin-top: 2px;
    }

    .warning-text {
        color: #e65100;
        font-size: 14px;
        margin: 0;
        line-height: 1.4;
        font-weight: 500;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 24px 28px;
        border-top: 1px solid #e0e0e0;
        background: #fafafa;
        border-radius: 0 0 16px 16px;
    }

    .btn-primary,
    .btn-secondary,
    .btn-danger {
        padding: 12px 24px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 120px;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .btn-primary {
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        color: white;
        position: relative;
        overflow: hidden;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
    }

    .btn-primary:active {
        transform: translateY(0);
    }

    .btn-secondary {
        background: white;
        color: #666;
        border: 2px solid #e0e0e0;
        box-shadow: none;
    }

    .btn-secondary:hover {
        background: #f5f5f5;
        border-color: #bdbdbd;
        transform: translateY(-1px);
    }

    .btn-danger {
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        color: white;
        position: relative;
        overflow: hidden;
    }

    .btn-danger:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
    }

    .btn-danger:active {
        transform: translateY(0);
    }

    /* Button ripple effect */
    .btn-primary::before,
    .btn-danger::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transition: width 0.3s, height 0.3s, top 0.3s, left 0.3s;
        transform: translate(-50%, -50%);
    }

    .btn-primary:active::before,
    .btn-danger:active::before {
        width: 200px;
        height: 200px;
    }

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }

</style>
