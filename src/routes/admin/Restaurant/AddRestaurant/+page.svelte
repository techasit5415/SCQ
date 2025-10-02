<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';

    export let data;
    export let form;

    // Debug log to check data
    console.log('AddRestaurant page data:', data);
    console.log('Users in data:', data?.users);
    console.log('Users count:', data?.users?.length);

    // Active menu state - ตั้งเป็น addRestaurant เสมอ
    let activeMenu = "addRestaurant";
    
    // Restaurant form data
    let newRestaurant = {
        name: '',
        type: '',
        ownerId: '',
        phone: '',
        address: '',
        description: '',
        image: null
    };

    // UI state
    let showSuccessPopup = false;
    let imagePreview = null;
    let fileInput;
    
    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        // Handle special cases that sidebar doesn't handle
        console.log('Menu change:', menu);
    }
    
    function handleViewRestaurant(event) {
        const shopId = event.detail;
        // This is now handled by sidebar component
        console.log('View restaurant:', shopId);
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

    // Handle image upload
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            newRestaurant.image = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Remove image
    function removeImage() {
        newRestaurant.image = null;
        imagePreview = null;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    // Show success popup
    function showSuccess() {
        showSuccessPopup = true;
        setTimeout(() => {
            showSuccessPopup = false;
        }, 5000);
    }

    // Close popup manually
    function closePopup() {
        showSuccessPopup = false;
    }
    
    // Reset form after successful submission
    function resetForm() {
        newRestaurant = {
            name: '',
            type: '',
            ownerId: '',
            phone: '',
            address: '',
            description: '',
            image: null
        };
        imagePreview = null;
        if (fileInput) {
            fileInput.value = '';
        }
    }
    
    // Handle form success
    $: if (form?.success) {
        resetForm();
        showSuccess();
    }
</script>
<!-- Admin Layout -->
<div class="admin-layout">
    <TopBar title="Admin Panel - Add Restaurant" logoSrc="/SCQ_logo.png" />
    
    <AdminSidebar 
        {activeMenu} 
        shops={data.shops || []}
        on:menuChange={handleMenuChange}
        on:viewRestaurant={handleViewRestaurant}
        on:logout={handleLogout}
    />

    <!-- Main Content -->
    <main class="main-content">
        <!-- Header Section -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home / </span>
                <span class="breadcrumb-item">Manage Restaurant / </span>
                <span class="breadcrumb-item current">Add Restaurant</span>
            </div>
            <div class="page-title">
                <h1>Add New Restaurant</h1>
                <p>เพิ่มร้านอาหารใหม่เข้าสู่ระบบ</p>
            </div>
        </div>

        <!-- Success Popup -->
        {#if showSuccessPopup}
            <div class="popup-overlay" on:click={closePopup}>
                <div class="success-popup" on:click|stopPropagation>
                    <div class="popup-header">
                        <div class="popup-icon">
                            <span class="material-symbols-outlined">check_circle</span>
                        </div>
                        <button class="popup-close" on:click={closePopup}>
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="popup-content">
                        <h3>สำเร็จ!</h3>
                        <p>{form?.message || 'เพิ่มร้านอาหารสำเร็จ!'}</p>
                    </div>
                </div>
            </div>
        {/if}

        <div class="add-restaurant-section">
            <!-- Error Messages Only -->
            {#if form?.error}
                <div class="alert alert-error">
                    <span class="material-symbols-outlined">error</span>
                    {form.error}
                </div>
            {/if}
            
            <div class="form-container">
                <div class="add-restaurant-form">
                <form method="POST" action="?/addRestaurant" enctype="multipart/form-data">
                    <!-- Restaurant Image Upload -->
                    <div class="image-upload-section">
                        <label class="image-upload-label">รูปร้านอาหาร</label>
                        <div class="image-upload-container">
                            {#if imagePreview}
                                <div class="image-preview">
                                    <img src={imagePreview} alt="Restaurant preview" />
                                    <button type="button" class="remove-image" on:click={removeImage}>
                                        <span class="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            {:else}
                                <div class="image-upload-placeholder" on:click={() => fileInput.click()}>
                                    <span class="material-symbols-outlined">add_a_photo</span>
                                    <p>คลิกเพื่อเพิ่มรูปร้าน</p>
                                    <small>รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB)</small>
                                </div>
                            {/if}
                            <input 
                                type="file" 
                                bind:this={fileInput}
                                name="image"
                                accept="image/*"
                                on:change={handleImageUpload}
                                style="display: none;"
                            />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="restaurantName">ชื่อร้านอาหาร <span class="required">*</span></label>
                            <div class="input-wrapper">
                                <input 
                                    type="text" 
                                    id="restaurantName" 
                                    name="name"
                                    bind:value={newRestaurant.name}
                                    placeholder="กรอกชื่อร้านอาหาร"
                                    required
                                />
                                <span class="input-icon material-symbols-outlined">restaurant</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="restaurantType">ประเภทร้านอาหาร <span class="required">*</span></label>
                            <div class="select-wrapper">
                                <select id="restaurantType" name="type" bind:value={newRestaurant.type} required>
                                    <option value="">เลือกประเภทร้านอาหาร</option>
                                    {#each data.restaurantTypes || [] as type}
                                        <option value={type}>{type}</option>
                                    {/each}
                                </select>
                                <span class="select-icon material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="ownerEmail">เจ้าของร้าน <span class="required">*</span></label>
                            <div class="select-wrapper">
                                <select id="ownerEmail" name="ownerId" bind:value={newRestaurant.ownerId} required>
                                    <option value="">เลือกเจ้าของร้าน</option>
                                    {#if data.restaurantOwners && data.restaurantOwners.length > 0}
                                        {#each data.restaurantOwners as user}
                                            <option value={user.id}>{user.email} ({user.name} {user.Lastname})</option>
                                        {/each}
                                    {:else if data.users && data.users.length > 0}
                                        {#each data.users as user}
                                            <option value={user.id}>{user.email} ({user.name} {user.Lastname})</option>
                                        {/each}
                                    {:else}
                                        <option value="" disabled>ไม่พบข้อมูลผู้ใช้</option>
                                    {/if}
                                </select>
                                <span class="select-icon material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="phone">เบอร์โทรศัพท์ <span class="required">*</span></label>
                            <div class="input-wrapper">
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    name="phone"
                                    bind:value={newRestaurant.phone}
                                    placeholder="กรอกเบอร์โทรศัพท์"
                                    required
                                />
                                <span class="input-icon material-symbols-outlined">phone</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="address">ที่อยู่ <span class="required">*</span></label>
                        <div class="textarea-wrapper">
                            <textarea 
                                id="address" 
                                name="address"
                                bind:value={newRestaurant.address}
                                placeholder="กรอกที่อยู่ร้านอาหาร"
                                rows="3"
                                required
                            ></textarea>
                            <span class="textarea-icon material-symbols-outlined">location_on</span>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="description">รายละเอียด</label>
                        <div class="textarea-wrapper">
                            <textarea 
                                id="description" 
                                name="description"
                                bind:value={newRestaurant.description}
                                placeholder="กรอกรายละเอียดร้านอาหาร"
                                rows="4"
                            ></textarea>
                            <span class="textarea-icon material-symbols-outlined">description</span>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" on:click={() => goto('/admin/restaurant')}>
                            <span class="material-symbols-outlined">cancel</span>
                            ยกเลิก
                        </button>
                        <button type="submit" class="btn-submit" 
                                on:click={() => console.log('Submit button clicked', newRestaurant)}>
                            <span class="material-symbols-outlined">add_business</span>
                            เพิ่มร้านอาหาร
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    /* Reset and Base */
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }



    :global(html), :global(body) {
        margin: 0;
        padding: 0;
        overflow-x: hidden; /* ป้องกัน horizontal scrollbar */
    }

    .admin-layout {
        min-height: 100vh;
        width: 100vw;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        font-family: 'Noto Sans Thai', sans-serif;
        position: relative;
    }

    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 24px;
        min-height: calc(100vh - 60px);
        overflow-y: auto;
        background: #f5f7fa !important;
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

    /* Success Popup */
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    }

    .success-popup {
        background: white;
        border-radius: 20px;
        padding: 0;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        min-width: 400px;
        max-width: 500px;
        animation: slideIn 0.3s ease-out;
        overflow: hidden;
    }

    .popup-header {
        background: linear-gradient(135deg, #4caf50, #45a049);
        padding: 20px 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
    }

    .popup-icon .material-symbols-outlined {
        font-size: 32px;
        color: white;
    }

    .popup-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background 0.2s;
    }

    .popup-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .popup-close .material-symbols-outlined {
        font-size: 24px;
    }

    .popup-content {
        padding: 30px;
        text-align: center;
    }

    .popup-content h3 {
        margin: 0 0 10px 0;
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
    }

    .popup-content p {
        margin: 0;
        font-size: 16px;
        color: #666;
        line-height: 1.5;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from { 
            opacity: 0;
            transform: scale(0.8) translateY(-50px);
        }
        to { 
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    /* Alert Messages */
    .alert {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        margin-bottom: 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .alert-error {
        background-color: #fdeaea;
        color: #d32f2f;
        border: 1px solid #ffcccb;
    }
    
    .alert .material-symbols-outlined {
        font-size: 18px;
    }

    /* Add Restaurant Form Styles */
    .add-restaurant-section {
        margin: 20px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .form-container {
        width: 100%;
        max-width: 900px;
        display: flex;
        justify-content: center;
    }

    .add-restaurant-form {
        background: white;
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        width: 100%;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        animation: slideUpIn 0.6s ease-out;
    }

    @keyframes slideUpIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .add-restaurant-form:hover {
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
    }

    .add-restaurant-form::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #ff8c00, #ffa500, #ff8c00);
        animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
        0%, 100% { background: linear-gradient(90deg, #ff8c00, #ffa500, #ff8c00); }
        50% { background: linear-gradient(90deg, #ffa500, #ff8c00, #ffa500); }
    }

    /* Image Upload Styles */
    .image-upload-section {
        margin-bottom: 30px;
        text-align: center;
    }

    .image-upload-label {
        display: block;
        font-weight: 600;
        color: #333;
        font-size: 16px;
        margin-bottom: 15px;
    }

    .image-upload-container {
        position: relative;
        display: inline-block;
    }

    .image-upload-placeholder {
        width: 200px;
        height: 200px;
        border: 3px dashed #ddd;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #fafafa;
    }

    .image-upload-placeholder:hover {
        border-color: #ff8c00;
        background: #fff8f0;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 140, 0, 0.1);
    }

    .image-upload-placeholder .material-symbols-outlined {
        font-size: 48px;
        color: #999;
        margin-bottom: 10px;
    }

    .image-upload-placeholder:hover .material-symbols-outlined {
        color: #ff8c00;
    }

    .image-upload-placeholder p {
        margin: 5px 0;
        color: #666;
        font-weight: 500;
    }

    .image-upload-placeholder small {
        color: #999;
        font-size: 12px;
    }

    .image-preview {
        position: relative;
        display: inline-block;
    }

    .image-preview img {
        width: 200px;
        height: 200px;
        object-fit: cover;
        border-radius: 16px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .remove-image {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
        transition: all 0.2s;
    }

    .remove-image:hover {
        background: #ff3838;
        transform: scale(1.1);
    }

    .remove-image .material-symbols-outlined {
        font-size: 18px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-bottom: 25px;
        align-items: end; /* จัดให้ input fields อยู่ในระดับเดียวกัน */
    }

    .form-group {
        display: flex;
        flex-direction: column;
        height: 100%; /* ให้ form group มีความสูงเต็ม */
    }

    .form-group.full-width {
        grid-column: 1 / -1; /* ให้ขยายเต็มความกว้าง */
        margin-bottom: 25px;
    }

    .form-group label {
        margin-bottom: 10px;
        font-weight: 600;
        color: #2c3e50;
        font-size: 15px;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .required {
        color: #ff4757;
        font-weight: 700;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 15px 18px;
        border: 2px solid #e1e8ed;
        border-radius: 12px;
        font-size: 15px;
        color: #333;
        transition: all 0.3s ease;
        background: #fafafa;
        font-family: 'Noto Sans Thai', sans-serif;
        height: 52px; /* กำหนดความสูงให้เท่ากัน */
        width: 100%;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #ff8c00;
        box-shadow: 0 0 0 4px rgba(255, 140, 0, 0.1);
        background: white;
        transform: translateY(-1px);
    }

    .form-group input:hover,
    .form-group select:hover,
    .form-group textarea:hover {
        border-color: #cbd5e0;
        background: white;
    }

    .form-group textarea {
        resize: vertical;
        height: auto; /* Override height for textarea */
        min-height: 100px;
        line-height: 1.6;
    }

    .select-wrapper {
        position: relative;
    }

    .form-group select {
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 45px;
        height: 52px; /* Ensure consistent height */
    }

    .select-icon {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
        pointer-events: none;
        transition: all 0.3s ease;
    }

    .select-wrapper:hover .select-icon {
        color: #ff8c00;
    }

    .form-group select:focus + .select-icon {
        color: #ff8c00;
        transform: translateY(-50%) rotate(180deg);
    }

    .input-wrapper {
        position: relative;
    }

    .input-icon {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
        font-size: 20px;
        pointer-events: none;
        transition: all 0.3s ease;
    }

    .input-wrapper input {
        padding-left: 50px;
        height: 52px; /* Ensure consistent height */
    }

    .input-wrapper:hover .input-icon {
        color: #ff8c00;
    }

    .input-wrapper input:focus ~ .input-icon {
        color: #ff8c00;
    }

    .textarea-wrapper {
        position: relative;
    }

    .textarea-icon {
        position: absolute;
        left: 15px;
        top: 15px;
        color: #999;
        font-size: 20px;
        pointer-events: none;
        transition: all 0.3s ease;
    }

    .textarea-wrapper textarea {
        padding-left: 50px;
    }

    .textarea-wrapper:hover .textarea-icon {
        color: #ff8c00;
    }

    .textarea-wrapper textarea:focus ~ .textarea-icon {
        color: #ff8c00;
    }

    .form-actions {
        display: flex;
        gap: 20px;
        margin-top: 40px;
        justify-content: center;
        padding-top: 30px;
        border-top: 1px solid #e1e8ed;
    }

    .btn-cancel,
    .btn-submit {
        padding: 15px 30px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 160px;
        justify-content: center;
        font-family: 'Noto Sans Thai', sans-serif;
        position: relative;
        overflow: hidden;
    }

    .btn-cancel {
        background: #f8f9fa;
        color: #6c757d;
        border: 2px solid #dee2e6;
    }

    .btn-cancel:hover {
        background: #e9ecef;
        border-color: #adb5bd;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .btn-submit {
        background: linear-gradient(135deg, #ff8c00, #ffa500);
        color: white;
        box-shadow: 0 4px 15px rgba(255, 140, 0, 0.3);
    }

    .btn-submit:hover:not(:disabled) {
        background: linear-gradient(135deg, #e67e00, #ff8c00);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 140, 0, 0.4);
    }

    .btn-submit:disabled {
        background: #ccc;
        color: #666;
        cursor: not-allowed;
        box-shadow: none;
    }

    .btn-submit::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
    }

    .btn-submit:hover::before {
        left: 100%;
    }

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
            padding: 20px;
            width: 100vw;
        }

        .page-header h2 {
            font-size: 24px;
        }

        .form-container {
            max-width: 100%;
        }

        .add-restaurant-form {
            padding: 25px 20px;
        }

        .form-row {
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .form-actions {
            flex-direction: column;
            align-items: stretch;
        }

        .btn-cancel,
        .btn-submit {
            width: 100%;
        }

        .success-popup {
            min-width: 320px;
            margin: 20px;
        }

        .popup-content {
            padding: 20px;
        }
    }

    @media (max-width: 480px) {
        .image-upload-placeholder,
        .image-preview img {
            width: 150px;
            height: 150px;
        }

        .main-content {
            padding: 15px;
        }

        .add-restaurant-form {
            padding: 20px 15px;
        }
    }
</style>