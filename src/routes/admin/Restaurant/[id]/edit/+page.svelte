<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';
    import { enhance } from '$app/forms';

    export let data;
    export let form;

    let activeMenu = "manageRestaurant";
    
    // Restaurant form data - pre-populate with existing data
    let editRestaurant = {
        name: data.restaurant?.name || '',
        type: data.restaurant?.Type_Shop || '',
        ownerId: data.restaurant?.User_Owner_ID || '',
        phone: data.restaurant?.Phone || '',
        address: data.restaurant?.Addr || '',
        description: data.restaurant?.Details || ''
    };

    async function handleLogout() {
        try {
            await fetch('/logout');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }

    function handleCancel() {
        goto('/admin/restaurant');
    }
</script>

<svelte:head>
    <title>Edit Restaurant - SCQ Admin</title>
</svelte:head>

<!-- Top Navigation -->
<TopBar title="Admin Panel - Edit Restaurant" logoSrc="/SCQ_logo.png" />

<!-- Side Navigation -->
<AdminSidebar activeMenu="manageRestaurant" />

<!-- Main Content -->
    <main class="main-content">
        <!-- Breadcrumb and Title -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home / </span>
                <span class="breadcrumb-item">Manage Restaurant / </span>
                <span class="breadcrumb-item current">Edit Restaurant</span>
            </div>
            <div class="page-title">
                <h1>Edit Restaurant</h1>
                <p>แก้ไขข้อมูลร้านค้า: {data.restaurant?.name || 'ไม่ระบุชื่อร้าน'}</p>
            </div>
        </div>

        <!-- Restaurant Content -->
        <div class="restaurant-container">
            {#if form?.error}
                <div class="error-message">
                    <span class="material-symbols-outlined">error</span>
                    {form.error}
                </div>
            {/if}

            {#if form?.success}
                <div class="success-message">
                    <span class="material-symbols-outlined">check_circle</span>
                    {form.message || 'แก้ไขข้อมูลร้านอาหารสำเร็จ!'}
                </div>
            {/if}

            <div class="edit-restaurant-form">
                <form method="POST" action="?/updateRestaurant" use:enhance={{
                    result: ({ result }) => {
                        if (result.type === 'success') {
                            setTimeout(() => {
                                goto('/admin/restaurant');
                            }, 1500);
                        }
                    }
                }}>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="restaurantName">Restaurant Name</label>
                            <input 
                                type="text" 
                                id="restaurantName" 
                                name="name"
                                bind:value={editRestaurant.name}
                                placeholder="Enter restaurant name"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="restaurantType">Restaurant Type</label>
                            <select id="restaurantType" name="type" bind:value={editRestaurant.type} required>
                                <option value="">Select type</option>
                                <option value="อาหารเกาหลี">อาหารเกาหลี</option>
                                <option value="อาหารญี่ปุ่น">อาหารญี่ปุ่น</option>
                                <option value="อาหารอีสาน">อาหารอีสาน</option>
                                <option value="อาหารตามสั่ง">อาหารตามสั่ง</option>
                                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="ownerEmail">Owner Email</label>
                            <select id="ownerEmail" name="ownerId" bind:value={editRestaurant.ownerId} required>
                                <option value="">Select owner</option>
                                {#if data.users}
                                    {#each data.users as user}
                                        <option value={user.id}>{user.email} ({user.name})</option>
                                    {/each}
                                {/if}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone"
                                bind:value={editRestaurant.phone}
                                placeholder="Enter phone number"
                                required
                            />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="address">Address</label>
                        <textarea 
                            id="address" 
                            name="address"
                            bind:value={editRestaurant.address}
                            placeholder="Enter restaurant address"
                            rows="3"
                            required
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea 
                            id="description" 
                            name="description"
                            bind:value={editRestaurant.description}
                            placeholder="Enter restaurant description"
                            rows="4"
                        ></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" on:click={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" class="btn-submit">
                            Update Restaurant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>

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

    .restaurant-container {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        max-height: calc(100vh - 140px);
    }

    .error-message, .success-message {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        margin-bottom: 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
    }

    .error-message {
        background-color: #fdeaea;
        color: #d32f2f;
        border: 1px solid #ffcccb;
    }

    .success-message {
        background-color: #e7f5e7;
        color: #2d5a2d;
        border: 1px solid #b8e6b8;
    }

    .edit-restaurant-form {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

    .form-group label {
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }

    .btn-cancel,
    .btn-submit {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Noto Sans Thai', sans-serif;
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
        background: #007bff;
        color: white;
    }

    .btn-submit:hover {
        background: #0056b3;
    }

    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
    }
</style>