<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import RestaurantSidebar from '$lib/Components/restaurant/RestaurantSidebar.svelte';
    import Topbar from '$lib/Components/restaurant/Topbar.svelte';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

    export let data: PageData;
    export let form: ActionData;

    $: shopId = $page.params.id;
    $: isOpen = data.shop?.is_open ?? true;

    let isEditing = false;
    let isSaving = false;
    let statusToggling = false;

    // Form data
    let formData = {
        name: data.shop?.name || '',
        description: data.shop?.Details || '', // ใช้ Details
        address: data.shop?.Addr || '', // ใช้ Addr
        phone: data.shop?.Phone || '', // ใช้ Phone
    };

    let photoPreview = data.shop?.Pic_Shop 
        ? `${PUBLIC_POCKETBASE_URL}/api/files/Shop/${data.shop.id}/${data.shop.Pic_Shop}`
        : '';
    let selectedPhoto: File | null = null;

    function handlePhotoChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
            selectedPhoto = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function toggleEdit() {
        if (isEditing) {
            // ยกเลิก - reset form
            formData = {
                name: data.shop?.name || '',
                description: data.shop?.Details || '', // ใช้ Details
                address: data.shop?.Addr || '', // ใช้ Addr
                phone: data.shop?.Phone || '', // ใช้ Phone
            };
            photoPreview = data.shop?.Pic_Shop 
                ? `${PUBLIC_POCKETBASE_URL}/api/files/Shop/${data.shop.id}/${data.shop.Pic_Shop}`
                : '';
            selectedPhoto = null;
        }
        isEditing = !isEditing;
    }
</script>

<svelte:head>
    <title>Settings - {data.shop?.name}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</svelte:head>

<div class="layout">
    <RestaurantSidebar activeMenu="settings" shopId={shopId} />
    
    <div class="main-content">
        <Topbar title="Settings - {data.shop?.name}" />
        
        <div class="content">
            <!-- แสดงข้อความสถานะ -->
            {#if form?.message}
                <div class="alert" class:success={form?.success} class:error={!form?.success}>
                    <span class="material-symbols-outlined">
                        {form?.success ? 'check_circle' : 'error'}
                    </span>
                    <span>{form.message}</span>
                </div>
            {/if}

            <!-- สถานะร้าน -->
            <div class="header-section">
                <div class="section-header">
                    <h2>สถานะร้าน</h2>
                    <div class="status-badge" class:open={isOpen} class:closed={!isOpen}>
                        <span class="material-symbols-outlined">
                            {isOpen ? 'store' : 'store_mall_directory'}
                        </span>
                        <span>{isOpen ? 'เปิดรับออเดอร์' : 'ปิดรับออเดอร์'}</span>
                    </div>
                </div>

                <p class="status-description">
                    {isOpen 
                        ? 'ร้านของคุณกำลังเปิดรับออเดอร์ ลูกค้าสามารถสั่งอาหารได้ตามปกติ' 
                        : 'ร้านของคุณปิดรับออเดอร์ชั่วคราว ลูกค้าจะไม่สามารถสั่งอาหารได้'}
                </p>

                <form 
                    method="POST" 
                    action="?/toggleStatus"
                    use:enhance={() => {
                        statusToggling = true;
                        return async ({ update }) => {
                            await update();
                            statusToggling = false;
                            // Reload page to get updated status
                            window.location.reload();
                        };
                    }}
                >
                    <input type="hidden" name="is_open" value={(!isOpen).toString()} />
                    <button 
                        type="submit" 
                        class="toggle-btn"
                        class:open={!isOpen}
                        class:close={isOpen}
                        disabled={statusToggling}
                    >
                        <span class="material-symbols-outlined">
                            {isOpen ? 'pause_circle' : 'play_circle'}
                        </span>
                        <span>{isOpen ? 'ปิดรับออเดอร์' : 'เปิดรับออเดอร์'}</span>
                    </button>
                </form>
            </div>

            <!-- ข้อมูลร้าน -->
            <div class="header-section">
                <div class="section-header">
                    <h2>ข้อมูลร้าน</h2>
                    <button class="edit-btn" on:click={toggleEdit}>
                        <span class="material-symbols-outlined">
                            {isEditing ? 'close' : 'edit'}
                        </span>
                        <span>{isEditing ? 'ยกเลิก' : 'แก้ไข'}</span>
                    </button>
                </div>

                <form 
                    method="POST" 
                    action="?/updateShop"
                    enctype="multipart/form-data"
                    use:enhance={() => {
                        isSaving = true;
                        console.log('=== Submitting Shop Update ===');
                        console.log('Form Data:', formData);
                        console.log('Selected Photo:', selectedPhoto);
                        return async ({ update }) => {
                            await update();
                            isSaving = false;
                            isEditing = false;
                            window.location.reload();
                        };
                    }}
                >
                    <div class="shop-form">
                        <!-- รูปภาพร้าน -->
                        <div class="photo-section">
                            <label>รูปภาพร้าน</label>
                            <div class="photo-preview">
                                {#if photoPreview}
                                    <img src={photoPreview} alt="Shop preview" />
                                {:else}
                                    <div class="no-photo">
                                        <span class="material-symbols-outlined">image</span>
                                        <span>ไม่มีรูปภาพ</span>
                                    </div>
                                {/if}
                            </div>
                            {#if isEditing}
                                <input 
                                    type="file" 
                                    name="photo"
                                    accept="image/*"
                                    on:change={handlePhotoChange}
                                    class="file-input"
                                />
                            {/if}
                        </div>

                        <!-- ชื่อร้าน -->
                        <div class="form-group">
                            <label for="name">ชื่อร้าน</label>
                            {#if isEditing}
                                <input 
                                    type="text" 
                                    id="name"
                                    name="name"
                                    bind:value={formData.name}
                                    required
                                />
                            {:else}
                                <div class="readonly-value">{formData.name}</div>
                            {/if}
                        </div>

                        <!-- คำอธิบาย -->
                        <div class="form-group">
                            <label for="description">คำอธิบาย</label>
                            {#if isEditing}
                                <textarea 
                                    id="description"
                                    name="description"
                                    bind:value={formData.description}
                                    rows="4"
                                ></textarea>
                            {:else}
                                <div class="readonly-value">{formData.description || '-'}</div>
                            {/if}
                        </div>

                        <!-- ที่อยู่ -->
                        <div class="form-group">
                            <label for="address">ที่อยู่</label>
                            {#if isEditing}
                                <textarea 
                                    id="address"
                                    name="address"
                                    bind:value={formData.address}
                                    rows="3"
                                ></textarea>
                            {:else}
                                <div class="readonly-value">{formData.address || '-'}</div>
                            {/if}
                        </div>

                        <!-- เบอร์โทรศัพท์ -->
                        <div class="form-group">
                            <label for="phone">เบอร์โทรศัพท์</label>
                            {#if isEditing}
                                <input 
                                    type="tel" 
                                    id="phone"
                                    name="phone"
                                    bind:value={formData.phone}
                                />
                            {:else}
                                <div class="readonly-value">{formData.phone || '-'}</div>
                            {/if}
                        </div>

                        {#if isEditing}
                            <div class="form-actions">
                                <button type="submit" class="save-btn" disabled={isSaving}>
                                    <span class="material-symbols-outlined">save</span>
                                    <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                                </button>
                            </div>
                        {/if}
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<style>
    .layout {
        display: flex;
        min-height: 100vh;
        background: #f5f5f5;
    }

    .main-content {
        flex: 1;
        margin-left: 250px;
        margin-top: 60px;
    }

    .content {
        padding: 30px;
    }

    .alert {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 24px;
        font-size: 14px;
        font-weight: 500;
    }

    .alert.success {
        background: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #4caf50;
    }

    .alert.error {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #f44336;
    }

    .header-section {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        margin-bottom: 24px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
        font-weight: 600;
    }

    .status-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
    }

    .status-badge.open {
        background: #e8f5e9;
        color: #2e7d32;
    }

    .status-badge.closed {
        background: #ffebee;
        color: #c62828;
    }

    .status-description {
        margin: 0 0 24px 0;
        color: #666;
        line-height: 1.6;
    }

    .toggle-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 28px;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .toggle-btn.open {
        background: #4caf50;
        color: white;
    }

    .toggle-btn.open:hover {
        background: #45a049;
    }

    .toggle-btn.close {
        background: #f44336;
        color: white;
    }

    .toggle-btn.close:hover {
        background: #da190b;
    }

    .toggle-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .edit-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border: 2px solid #ff8c00;
        background: white;
        color: #ff8c00;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .edit-btn:hover {
        background: #ff8c00;
        color: white;
    }

    .shop-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .photo-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .photo-section label {
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }

    .photo-preview {
        width: 200px;
        height: 200px;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
    }

    .photo-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .no-photo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #999;
    }

    .no-photo .material-symbols-outlined {
        font-size: 48px;
    }

    .file-input {
        max-width: 300px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group label {
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }

    .form-group input,
    .form-group textarea {
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #ff8c00;
    }

    .readonly-value {
        padding: 12px 16px;
        background: #f5f5f5;
        border-radius: 8px;
        color: #333;
        min-height: 44px;
        display: flex;
        align-items: center;
    }

    .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 12px;
    }

    .save-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 28px;
        background: #ff8c00;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .save-btn:hover {
        background: #e67e00;
    }

    .save-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24;
    }
</style>