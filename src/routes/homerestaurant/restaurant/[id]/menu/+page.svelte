<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
    import { enhance } from "$app/forms";
    import TopBar from "$lib/Components/restaurant/Topbar.svelte";
    import RestaurantSidebar from "$lib/Components/restaurant/RestaurantSidebar.svelte";
    import PocketBase from "pocketbase";

    const pb = new PocketBase("http://10.1.1.113:8080");
    const pbUrl = PUBLIC_POCKETBASE_URL;

    export let data;

    let activeMenu = "menu";
    let showAddItem = false;
    let showEditItem = false;
    let showDeleteItem = false;
    let showAddCategory = false;
    let showEditCategory = false;
    let showDeleteCategory = false;
    let addingItem = null;
    let editingItem = null;
    let deletingItem = null;
    let addingCategory = null;
    let editingCategory = null;
    let deletingCategory = null;
    let searchItem = "";
    let imagePreview = null;

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
        const matchesSearch =
            searchItem === "" ||
            menu.name?.toLowerCase().includes(searchItem.toLowerCase());
        return matchesSearch;
    });

    async function handleSwitchAvailable(index, newStatus) {
        const item = data.menus[index];
        try {
            const updated = await pb.collection("Menu").update(item.id, {
                Available: newStatus,
            });
            data.menus[index] = updated;
            console.log("อัปเดตสำเร็จ:", updated);
        } catch (error) {
            console.error("อัปเดตล้มเหลว:", error);
        }
    }

    // Item management functions
    let file = null;

    function handleFileChange(event) {
        const target = event.target;
        const files = target.files;
        if (files && files[0]) {
            const selectedFile = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target) {
                    imagePreview = e.target.result;
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    }
    
    function handleAddItem() {
        showAddItem = true;
        imagePreview = null;
        // Reset file input
        const input = document.getElementById('photo-upload-add');
        if (input) input.value = '';
    }
    
    function closeAddItem() {
        showAddItem = false;
        addingItem = null;
        imagePreview = null;
        // Reset file input
        const input = document.getElementById('photo-upload-add');
        if (input) input.value = '';
    }
    
    function handleAddItemSuccess() {
        showAddItem = false;
        addingItem = null;
        imagePreview = null;
        // Reset file input
        const input = document.getElementById('photo-upload-add');
        if (input) input.value = '';
        setTimeout(() => window.location.reload(), 1000);
    }

    function handleEditItem(item) {
        editingItem = {
            ...item,
        };
        imagePreview = getRestaurantImageUrl(item);
        showEditItem = true;
    }
    
    function closeEditItem() {
        showEditItem = false;
        editingItem = null;
        imagePreview = null;
    }
    
    function handleUpdateItemSuccess() {
        showEditItem = false;
        editingItem = null;
        imagePreview = null;
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
        setTimeout(() => window.location.reload(), 1000);
    }

    // Category management functions
    function handleAddCategory() {
        showAddCategory = true;
        addingCategory = { category: "" };
    }
    
    function closeAddCategory() {
        showAddCategory = false;
        addingCategory = null;
    }
    
    function handleAddCategorySuccess() {
        showAddCategory = false;
        addingCategory = null;
        setTimeout(() => window.location.reload(), 1000);
    }

    function handleEditCategory(categoryName) {
        editingCategory = { category: categoryName };
        showEditCategory = true;
    }
    
    function closeEditCategory() {
        showEditCategory = false;
        editingCategory = null;
    }
    
    function handleUpdateCategorySuccess() {
        showEditCategory = false;
        editingCategory = null;
        setTimeout(() => window.location.reload(), 1000);
    }

    function handleDeleteCategory(categoryName) {
        deletingCategory = { category: categoryName };
        showDeleteCategory = true;
    }
    
    function closeDeleteCategory() {
        showDeleteCategory = false;
        deletingCategory = null;
    }
    
    function handleDeleteCategorySuccess() {
        showDeleteCategory = false;
        deletingCategory = null;
        setTimeout(() => window.location.reload(), 1000);
    }

    function getRestaurantImageUrl(item) {
        if (item && item.Photo) {
            return pbUrl + "/api/files/Menu/" + item.id + "/" + item.Photo;
        }
        return "/Photo/Icon.png";
    }
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
                    <button type="button" class="add-item-btn" on:click={handleAddItem}>
                        <span class="material-symbols-outlined" style="color: white;">add</span>
                        <span class="btn-text" style="color: white; font-size: 16px;">Add Item</span>
                    </button>
                    <input
                        type="text"
                        placeholder="Search..."
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
                                        <div class="image-container">
                                            <img src={getRestaurantImageUrl(item)} alt={item.name || "Menu"} />
                                        </div>
                                    </td>
                                    <td class="text-left">{item.name || "N/A"}</td>
                                    <td>{item.category || "N/A"}</td>
                                    <td>{item.Price ? item.Price + " ฿" : "N/A"}</td>
                                    <td>
                                        <label class="switch">
                                            <input
                                                type="checkbox"
                                                bind:checked={item.Available}
                                                on:change={() => handleSwitchAvailable(index, item.Available)}
                                            />
                                            <span class="slider round"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="item-btn-edit" on:click={() => handleEditItem(item)} title="Edit">
                                                <span class="material-symbols-outlined">edit</span>
                                            </button>
                                            <button class="item-btn-delete" on:click={() => handleDeleteItem(item)} title="Delete">
                                                <span class="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        {:else}
                            <tr>
                                <td colspan="7" class="no-data">No item found</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- ส่วนของ Category -->
            <div class="menu-category">
                <div class="category-btn-content">
                    <button type="button" class="add-category-btn" on:click={handleAddCategory}>
                        <span class="material-symbols-outlined" style="color: white;">add</span>
                        <span class="btn-text" style="color: white; font-size: 16px;">Add Category</span>
                    </button>
                </div>
                <div class="line"></div>
                <div class="category-list">
                    {#if Array.isArray(data.cate) && data.cate.length > 0}
                        {#each data.cate as item}
                            <div class="category-item">
                                <span class="category-name">{item.category || "N/A"}</span>
                                <div class="category-actions">
                                    <button class="category-btn-edit" on:click={() => handleEditCategory(item.category)} title="Edit">
                                        <span class="material-symbols-outlined">edit</span>
                                    </button>
                                    <button class="category-btn-delete" on:click={() => handleDeleteCategory(item.category)} title="Delete">
                                        <span class="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <div class="no-data">No category found</div>
                    {/if}
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Add Item -->
{#if showAddItem}
    <div class="item-modal">
        <div class="item-modal-content">
            <div class="header-item-modal">
                <span>Add Menu</span>
                <button type="button" class="close-modal" on:click={closeAddItem}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form
                method="POST"
                action="?/addMenu"
                enctype="multipart/form-data"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            handleAddItemSuccess();
                        }
                    };
                }}
            >
                <input type="hidden" name="field" />
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Upload Image</span>
                    </div>
                    <div class="image-upload-container">
                        <!-- Hidden file input - always present and REQUIRED -->
                        <input type="file" name="photo" accept="image/*" on:change={handleFileChange} style="display: none;" id="photo-upload-add" required />
                        
                        {#if imagePreview}
                            <div class="image-preview">
                                <img src={imagePreview} alt="Preview" />
                                <button type="button" class="remove-image" on:click={() => { 
                                    imagePreview = null;
                                    const input = document.getElementById('photo-upload-add');
                                    if (input) input.value = '';
                                }}>
                                    <span class="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        {:else}
                            <label for="photo-upload-add" class="upload-placeholder">
                                <span class="material-symbols-outlined">add_photo_alternate</span>
                                <span>Click to upload image</span>
                            </label>
                        {/if}
                    </div>
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Name</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter menu name"
                        required
                        name="name"
                        class="item-input"
                    />
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Detail</span>
                    </div>
                    <textarea
                        placeholder="Enter menu description"
                        required
                        name="detail"
                        class="item-textarea"
                        rows="3"
                    ></textarea>
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Select Category</span>
                    </div>
                    <select class="role-select" name="category" required>
                        <option value="" selected hidden>Select category...</option>
                        {#if Array.isArray(data.cate) && data.cate.length > 0}
                            {#each data.cate as item}
                                <option value={item.category}>{item.category}</option>
                            {/each}
                        {/if}
                    </select>
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Price (฿)</span>
                    </div>
                    <input
                        type="number"
                        placeholder="0.00"
                        required
                        name="price"
                        class="item-input"
                        min="0"
                        step="0.01"
                    />
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Status</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" name="status" checked />
                        <span class="slider round"></span>
                    </label>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeAddItem}>
                        <span class="material-symbols-outlined">close</span>
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        <span class="material-symbols-outlined">save</span>
                        Add Menu
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Edit Item -->
{#if showEditItem && editingItem}
    <div class="item-modal">
        <div class="item-modal-content">
            <div class="header-item-modal">
                <span>Edit Menu</span>
                <button type="button" class="close-modal" on:click={closeEditItem}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form
                method="POST"
                action="?/updateMenu"
                enctype="multipart/form-data"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            handleUpdateItemSuccess();
                        }
                    };
                }}
            >
                <input type="hidden" name="menuId" value={editingItem.id} />
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Upload Image</span>
                    </div>
                    <div class="image-upload-container">
                        <!-- Hidden file input - always present -->
                        <input type="file" name="photo" accept="image/*" on:change={handleFileChange} style="display: none;" id="photo-upload-edit" />
                        
                        {#if imagePreview}
                            <div class="image-preview">
                                <img src={imagePreview} alt="Preview" />
                                <button type="button" class="remove-image" on:click={() => { 
                                    imagePreview = getRestaurantImageUrl(editingItem);
                                    const input = document.getElementById('photo-upload-edit');
                                    if (input) input.value = '';
                                }}>
                                    <span class="material-symbols-outlined">refresh</span>
                                </button>
                            </div>
                        {:else}
                            <label for="photo-upload-edit" class="upload-placeholder">
                                <span class="material-symbols-outlined">add_photo_alternate</span>
                                <span>Click to upload new image</span>
                            </label>
                        {/if}
                    </div>
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Name</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter menu name"
                        required
                        name="name"
                        class="item-input"
                        bind:value={editingItem.name}
                    />
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Detail</span>
                    </div>
                    <textarea
                        placeholder="Enter menu description"
                        required
                        name="detail"
                        class="item-textarea"
                        rows="3"
                        bind:value={editingItem.detail}
                    ></textarea>
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Select Category</span>
                    </div>
                    <select class="role-select" name="category" bind:value={editingItem.category} required>
                        <option value="" hidden>Select category...</option>
                        {#if Array.isArray(data.cate) && data.cate.length > 0}
                            {#each data.cate as item}
                                <option value={item.category}>{item.category}</option>
                            {/each}
                        {/if}
                    </select>
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Price (฿)</span>
                    </div>
                    <input
                        type="number"
                        placeholder="0.00"
                        required
                        name="price"
                        class="item-input"
                        bind:value={editingItem.Price}
                        min="0"
                        step="0.01"
                    />
                </div>
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Status</span>
                    </div>
                    <label class="switch">
                        <input type="checkbox" name="status" bind:checked={editingItem.Available} />
                        <span class="slider round"></span>
                    </label>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeEditItem}>
                        <span class="material-symbols-outlined">close</span>
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        <span class="material-symbols-outlined">save</span>
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Delete Item -->
{#if showDeleteItem && deletingItem}
    <div class="item-delete-modal">
        <div class="item-delete-modal-content">
            <div class="modal-header">
                <span>Delete Menu</span>
                <button type="button" class="close-modal" on:click={closeDeleteItem}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div class="item-delete-modal-body">
                <p class="confirm-text">Are you sure you want to delete this menu item?</p>
                <div class="user-details">
                    <div class="user-info-card">
                        <div class="user-info-text">
                            <div class="user-name">
                                <span>{deletingItem.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="warning-box">
                    <span class="material-symbols-outlined">error</span>
                    <p class="warning-text">
                        This action cannot be undone. All data for this menu item will be permanently deleted.
                    </p>
                </div>
            </div>

            <form
                method="POST"
                action="?/deleteMenu"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            handleDeleteItemSuccess();
                        }
                    };
                }}
            >
                <input type="hidden" name="menuId" value={deletingItem.id} />

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeDeleteItem}>
                        <span class="material-symbols-outlined">close</span>
                        Cancel
                    </button>
                    <button type="submit" class="btn-danger">
                        <span class="material-symbols-outlined">delete_forever</span>
                        Delete Menu
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Add Category -->
{#if showAddCategory}
    <div class="category-modal">
        <div class="category-modal-content">
            <div class="header-item-modal">
                <span>Add Category</span>
                <button type="button" class="close-modal" on:click={closeAddCategory}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form
                method="POST"
                action="?/addCategory"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            handleAddCategorySuccess();
                        }
                    };
                }}
            >
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Category Name</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter category name"
                        required
                        name="categoryName"
                        class="item-input"
                    />
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeAddCategory}>
                        <span class="material-symbols-outlined">close</span>
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        <span class="material-symbols-outlined">save</span>
                        Add Category
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Edit Category -->
{#if showEditCategory && editingCategory}
    <div class="category-modal">
        <div class="category-modal-content">
            <div class="header-item-modal">
                <span>Edit Category</span>
                <button type="button" class="close-modal" on:click={closeEditCategory}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <form
                method="POST"
                action="?/updateCategory"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            handleUpdateCategorySuccess();
                        }
                    };
                }}
            >
                <input type="hidden" name="oldCategoryName" value={editingCategory.category} />
                
                <div class="item-field">
                    <div class="header-item-modal-component">
                        <span>Category Name</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter category name"
                        required
                        name="newCategoryName"
                        class="item-input"
                        bind:value={editingCategory.category}
                    />
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeEditCategory}>
                        <span class="material-symbols-outlined">close</span>
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        <span class="material-symbols-outlined">save</span>
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Delete Category -->
{#if showDeleteCategory && deletingCategory}
    <div class="item-delete-modal">
        <div class="item-delete-modal-content">
            <div class="modal-header">
                <span>Delete Category</span>
                <button type="button" class="close-modal" on:click={closeDeleteCategory}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <div class="item-delete-modal-body">
                <p class="confirm-text">Are you sure you want to delete this category?</p>
                <div class="user-details">
                    <div class="user-info-card">
                        <div class="user-info-text">
                            <div class="user-name">
                                <span>{deletingCategory.category}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="warning-box">
                    <span class="material-symbols-outlined">error</span>
                    <p class="warning-text">
                        This action cannot be undone. All menu items in this category will have their category field cleared.
                    </p>
                </div>
            </div>

            <form
                method="POST"
                action="?/deleteCategory"
                use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            handleDeleteCategorySuccess();
                        }
                    };
                }}
            >
                <input type="hidden" name="categoryName" value={deletingCategory.category} />

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeDeleteCategory}>
                        <span class="material-symbols-outlined">close</span>
                        Cancel
                    </button>
                    <button type="submit" class="btn-danger">
                        <span class="material-symbols-outlined">delete_forever</span>
                        Delete Category
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<body></body>

<style>
    * {
        box-sizing: border-box;
    }

    body {
        background-color: #f5f5f5;
    }

    .restaurant-layout {
        background: #f5f5f5;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
    }

    .logout {
        margin-top: auto;
        color: #d32f2f !important;
    }

    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding-left: 30px;
        padding-top: 30px;
        padding-right: 22px;
    }

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

    .menu-content {
        display: flex;
        gap: 24px;
    }

    /* Menu Item Section */
    .menu-item {
        display: flex;
        flex-direction: column;
        flex: 1;
        margin-top: 20px;
        padding: 24px;
        background-color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        gap: 20px;
    }

    .item-btn-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
    }

    .add-item-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 24px;
        background-color: #FF8C00;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        font-weight: 500;
    }

    .add-item-btn:hover {
        background-color: #e67e00;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
    }

    .search-item-btn {
        flex: 1;
        max-width: 300px;
        height: 44px;
        padding: 0 16px;
        border-radius: 8px;
        border: 1px solid #ddd;
        font-size: 14px;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        transition: border-color 0.2s;
    }

    .search-item-btn:focus {
        outline: none;
        border-color: #2196f3;
    }

    .item-table {
        width: 100%;
        border-collapse: collapse;
    }

    .item-table th {
        padding: 14px 12px;
        text-align: center;
        border-bottom: 2px solid #333;
        background: #ffffff;
        font-weight: 600;
        color: #333;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .item-table td {
        padding: 14px 12px;
        text-align: center;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        color: #666;
    }

    .item-table td.text-left {
        text-align: left;
    }

    .item-table tbody tr:hover {
        background: #f8f9fa;
    }

    .image-container {
        width: 60px;
        height: 60px;
        margin: 0 auto;
        border-radius: 8px;
        overflow: hidden;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    .item-btn-edit,
    .item-btn-delete {
        width: 36px;
        height: 36px;
        border: 1px solid;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: none;
        transition: all 0.2s;
    }

    .item-btn-edit {
        border-color: #666;
        color: #666;
    }

    .item-btn-edit:hover {
        background: #666;
        color: white;
    }

    .item-btn-delete {
        border-color: #d32f2f;
        color: #d32f2f;
    }

    .item-btn-delete:hover {
        background: #d32f2f;
        color: white;
    }

    .no-data {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 40px 20px;
    }

    /* Category Section */
    .menu-category {
        width: 340px;
        margin-top: 20px;
        padding: 24px;
        background-color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
    }

    .category-btn-content {
        margin-bottom: 16px;
    }

    .add-category-btn {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 24px;
        background-color: #FF8C00;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        font-weight: 500;
    }

    .add-category-btn:hover {
        background-color: #e67e00;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
    }

    .line {
        width: 100%;
        height: 2px;
        background-color: #333;
        margin-bottom: 16px;
    }

    .category-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        background-color: #f5f5f5;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .category-item:hover {
        background-color: #ebebeb;
    }

    .category-name {
        flex: 1;
        font-size: 14px;
        color: #333;
        font-weight: 500;
    }

    .category-actions {
        display: flex;
        gap: 8px;
    }

    .category-btn-edit,
    .category-btn-delete {
        width: 32px;
        height: 32px;
        border: 1px solid;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: none;
        transition: all 0.2s;
    }

    .category-btn-edit {
        border-color: #666;
        color: #666;
    }

    .category-btn-edit:hover {
        background: #666;
        color: white;
    }

    .category-btn-delete {
        border-color: #d32f2f;
        color: #d32f2f;
    }

    .category-btn-delete:hover {
        background: #d32f2f;
        color: white;
    }

    /* Toggle Switch */
    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 26px;
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
        transition: 0.3s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
    }

    input:checked + .slider {
        background-color: #4caf50;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #4caf50;
    }

    input:checked + .slider:before {
        transform: translateX(24px);
    }

    .slider.round {
        border-radius: 26px;
    }

    .slider.round:before {
        border-radius: 50%;
    }

    /* Item Modal */
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
        backdrop-filter: blur(4px);
    }

    .item-modal-content {
        background: #ffffff;
        border-radius: 16px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 32px;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .header-item-modal {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        font-size: 20px;
        color: #333;
        font-weight: 600;
    }

    .close-modal {
        border: none;
        background: #f5f5f5;
        cursor: pointer;
        color: #666;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }

    .close-modal:hover {
        background: #e0e0e0;
        color: #333;
    }

    .item-field {
        margin-bottom: 20px;
    }

    .header-item-modal-component {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
        font-weight: 500;
    }

    .item-input,
    .item-textarea,
    .role-select {
        width: 100%;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        transition: border-color 0.2s;
    }

    .item-input:focus,
    .item-textarea:focus,
    .role-select:focus {
        outline: none;
        border-color: #2196f3;
    }

    .item-textarea {
        resize: vertical;
        min-height: 80px;
    }

    .image-upload-container {
        margin-top: 8px;
    }

    .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 40px 20px;
        border: 2px dashed #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: #fafafa;
    }

    .upload-placeholder:hover {
        border-color: #2196f3;
        background: #f0f8ff;
    }

    .upload-placeholder .material-symbols-outlined {
        font-size: 48px;
        color: #999;
    }

    .upload-placeholder span:last-child {
        font-size: 14px;
        color: #666;
    }

    .image-preview {
        position: relative;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .image-preview img {
        width: 100%;
        height: auto;
        display: block;
    }

    .remove-image {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        background: rgba(0, 0, 0, 0.7);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }

    .remove-image:hover {
        background: rgba(0, 0, 0, 0.9);
    }

    /* Category Modal */
    .category-modal {
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
    }

    .category-modal-content {
        background: #ffffff;
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        padding: 32px;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    /* Delete Modal */
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
    }

    .item-delete-modal-content {
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 28px;
        border-bottom: 1px solid #e0e0e0;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-radius: 16px 16px 0 0;
    }

    .modal-header span:first-child {
        font-size: 18px;
        font-weight: 600;
        color: #333;
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

    .user-info-text {
        flex: 1;
    }

    .user-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        text-align: center;
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
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 120px;
        justify-content: center;
        font-family: 'Inter', 'Noto Sans Thai', sans-serif;
    }

    .btn-primary {
        background: linear-gradient(135deg, #FF8C00 0%, #e67e00 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(255, 140, 0, 0.3);
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(255, 140, 0, 0.4);
    }

    .btn-secondary {
        background: white;
        color: #666;
        border: 2px solid #e0e0e0;
    }

    .btn-secondary:hover {
        background: #f5f5f5;
        border-color: #bdbdbd;
        transform: translateY(-1px);
    }

    .btn-danger {
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
    }

    .btn-danger:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(244, 67, 54, 0.4);
    }

    .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
</style>
