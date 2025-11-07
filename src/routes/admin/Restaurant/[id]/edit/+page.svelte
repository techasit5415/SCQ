<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';
    import { enhance } from '$app/forms';
    import { env } from '$env/dynamic/public';

    export let data;
    export let form;

    const PUBLIC_POCKETBASE_URL = env.PUBLIC_POCKETBASE_URL || 'http://localhost:8080';

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
            window.location.href = '/admin';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/admin';
        }
    }

    function handleCancel() {
        goto('/admin/Restaurant');
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
    <!-- Header Section -->
    <div class="header-section">
        <h1>แก้ไขข้อมูลร้านอาหาร</h1>
        <p>ร้าน: {data.restaurant?.name || 'ไม่ระบุชื่อร้าน'}</p>
    </div>

    <!-- Content Container -->
    <div class="content-wrapper">
        {#if form?.error}
            <div class="alert alert-error">
                <span class="material-symbols-outlined">error</span>
                <span>{form.error}</span>
            </div>
        {/if}

        {#if form?.success}
            <div class="alert alert-success">
                <span class="material-symbols-outlined">check_circle</span>
                <span>{form.message || 'แก้ไขข้อมูลร้านอาหารสำเร็จ!'}</span>
            </div>
        {/if}

        <!-- Edit Form Card -->
        <div class="form-card">
            <form 
                method="POST" 
                action="?/updateRestaurant" 
                enctype="multipart/form-data"
                use:enhance={() => {
                    console.log('Form submitting...');
                    return async ({ result, update }) => {
                        console.log('Form result:', result);
                        if (result.type === 'success') {
                            await update();
                            setTimeout(() => {
                                goto('/admin/Restaurant');
                            }, 1500);
                        } else {
                            await update();
                        }
                    };
                }}
            >
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

                    <div class="form-group">
                        <label for="image">Restaurant Image (Optional)</label>
                        <input 
                            type="file" 
                            id="image" 
                            name="image"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                        />
                        <small style="color: #666; display: block; margin-top: 4px;">
                            JPG, PNG หรือ WebP (ไม่เกิน 5MB)
                        </small>
                        {#if data.restaurant?.Pic_Shop}
                            <div style="margin-top: 12px;">
                                <p style="font-size: 14px; color: #666;">รูปภาพปัจจุบัน:</p>
                                <img 
                                    src={`${PUBLIC_POCKETBASE_URL}/api/files/Shop/${data.restaurant.id}/${data.restaurant.Pic_Shop}`}
                                    alt="Current restaurant"
                                    style="max-width: 200px; border-radius: 8px; margin-top: 8px; border: 1px solid #ddd;"
                                    on:error={(e) => {
                                        if (e.target) {
                                            e.target.style.display = 'none';
                                        }
                                    }}
                                />
                            </div>
                        {/if}
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
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

    :global(body) {
        background: #f5f7fa !important;
        margin: 0;
        padding: 0;
        overflow: hidden !important;
    }

    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        height: calc(100vh - 60px);
        overflow-y: auto;
        overflow-x: hidden;
        background: #f5f7fa;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .header-section {
        background: white;
        padding: 32px 40px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin-bottom: 24px;
    }

    .header-section h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
        color: #1f2937;
    }

    .header-section p {
        margin: 0;
        font-size: 16px;
        color: #6b7280;
    }

    .content-wrapper {
        padding: 32px 40px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .alert {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        margin-bottom: 24px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateY(-10px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .alert-error {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        color: white;
    }

    .alert-success {
        background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
        color: white;
    }

    .alert .material-symbols-outlined {
        font-size: 24px;
    }

    .form-card {
        background: white;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group label {
        font-weight: 600;
        margin-bottom: 10px;
        color: #2c3e50;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 14px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 15px;
        font-family: 'Noto Sans Thai', sans-serif;
        transition: all 0.3s ease;
        background: #fafafa;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #667eea;
        background: white;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .form-group input[type="file"] {
        padding: 12px;
        border: 2px dashed #c7d2fe;
        background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
        cursor: pointer;
        border-radius: 10px;
    }

    .form-group input[type="file"]:hover {
        border-color: #667eea;
        background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 100px;
    }

    .form-group small {
        margin-top: 6px;
        font-size: 13px;
        color: #6b7280;
    }

    .form-actions {
        display: flex;
        gap: 16px;
        justify-content: flex-end;
        margin-top: 40px;
        padding-top: 30px;
        border-top: 2px solid #f0f0f0;
    }

    .btn-cancel,
    .btn-submit {
        padding: 14px 32px;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Noto Sans Thai', sans-serif;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .btn-cancel {
        background: #f3f4f6;
        color: #6b7280;
        border: 2px solid #e5e7eb;
    }

    .btn-cancel:hover {
        background: #e5e7eb;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .btn-submit {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-submit:active,
    .btn-cancel:active {
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
            margin-top: 60px;
        }

        .content-wrapper {
            padding: 20px;
        }

        .form-card {
            padding: 24px;
        }

        .form-row {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .header-section {
            padding: 24px 20px;
        }

        .page-title h1 {
            font-size: 24px;
        }
    }
</style>