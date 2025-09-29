<script>
    import { goto } from '$app/navigation';
    import TopBar from '$lib/components/TopBar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';

    export let data;
    export let form;

    // Active menu state - ตั้งเป็น addRestaurant เสมอ
    let activeMenu = "addRestaurant";
    
    // Restaurant form data
    let newRestaurant = {
        name: '',
        type: '',
        ownerId: '',
        phone: '',
        address: '',
        description: ''
    };
    
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
    
    // Reset form after successful submission
    function resetForm() {
        newRestaurant = {
            name: '',
            type: '',
            ownerId: '',
            phone: '',
            address: '',
            description: ''
        };
    }
    
    // Handle form success
    $: if (form?.success) {
        resetForm();
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
        <!-- Add Restaurant Page -->
        <div class="page-header">
            <nav class="breadcrumb">
                <span class="breadcrumb-item">Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item">Manage Restaurant</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">Add Restaurant</span>
            </nav>
            <h2>Add New Restaurant</h2>
        </div>

        <div class="add-restaurant-section">
            <!-- Success/Error Messages -->
            {#if form?.success}
                <div class="alert alert-success">
                    <span class="material-symbols-outlined">check_circle</span>
                    {form.message}
                </div>
            {/if}
            
            {#if form?.error}
                <div class="alert alert-error">
                    <span class="material-symbols-outlined">error</span>
                    {form.error}
                </div>
            {/if}
            
            <div class="add-restaurant-form">
                <form method="POST" action="?/addRestaurant">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="restaurantName">Restaurant Name</label>
                            <input 
                                type="text" 
                                id="restaurantName" 
                                name="name"
                                bind:value={newRestaurant.name}
                                placeholder="Enter restaurant name"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="restaurantType">Restaurant Type</label>
                            <select id="restaurantType" name="type" bind:value={newRestaurant.type} required>
                                <option value="">Select type</option>
                                <option value="อาหารไทย">อาหารไทย</option>
                                <option value="อาหารญี่ปุ่น">อาหารญี่ปุ่น</option>
                                <option value="อาหารจีน">อาหารจีน</option>
                                <option value="อาหารฝรั่ง">อาหารฝรั่ง</option>
                                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                                <option value="ขนม/เบเกอรี่">ขนม/เบเกอรี่</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="ownerEmail">Owner Email</label>
                            <select id="ownerEmail" name="ownerId" bind:value={newRestaurant.ownerId} required>
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
                                bind:value={newRestaurant.phone}
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
                            bind:value={newRestaurant.address}
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
                            bind:value={newRestaurant.description}
                            placeholder="Enter restaurant description"
                            rows="4"
                        ></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" on:click={() => goto('/homeadmin/Restaurant')}>
                            Cancel
                        </button>
                        <button type="submit" class="btn-submit">
                            Add Restaurant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</div>

<style>
    /* Reset and Base */
    * {
        box-sizing: border-box;
    }

    .admin-layout {
        min-height: 100vh;
        background: #f5f5f5;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    /* Main Content */
    .main-content {
        margin-left: 250px;
        margin-top: 60px;
        padding: 30px;
        min-height: calc(100vh - 60px);
    }

    /* Page Header */
    .page-header {
        margin-bottom: 30px;
    }

    .breadcrumb {
        font-size: 13px;
        color: #888;
        margin-bottom: 8px;
    }

    .breadcrumb-item.active {
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

    /* Alert Messages */
    .alert {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        margin-bottom: 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
    }
    
    .alert-success {
        background-color: #e7f5e7;
        color: #2d5a2d;
        border: 1px solid #b8e6b8;
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
    }

    .add-restaurant-form {
        background: white;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-width: 800px;
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
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        color: #333;
        transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #ff8c00;
        box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 80px;
    }

    .form-actions {
        display: flex;
        gap: 15px;
        margin-top: 30px;
        justify-content: flex-end;
    }

    .btn-cancel,
    .btn-submit {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
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
        background: #ff8c00;
        color: white;
    }

    .btn-submit:hover {
        background: #e67e00;
    }

    /* Material Icons */
    .material-symbols-outlined {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
        }

        .form-row {
            grid-template-columns: 1fr;
        }
    }
</style>