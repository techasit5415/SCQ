<script>
    import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    
    function restaurantMenu() {
        var x = document.getElementById("hiddenbar-container");
        if (x) {
            if (x.style.display === "none" || x.style.display === "") {
                x.style.display = "block";
            } else {
                x.style.display = "none";
            }
        }
    }
    
    let activeMenu = "dashboard";
    let showAddRestaurantPopup = false;
    let restaurants = [];
    
    // ข้อมูลร้านค้า
    let restaurantData = {
        name: '',
        category: '',
        description: '',
        address: '',
        phone: ''
    };
    
    // โหลดข้อมูลร้านค้าเมื่อเริ่มต้น
    onMount(async () => {
        await loadRestaurants();
    });
    
    async function loadRestaurants() {
        try {
            const response = await fetch('/api/restaurants');
            if (response.ok) {
                restaurants = await response.json();
                console.log('Restaurants loaded:', restaurants);
            }
        } catch (error) {
            console.error('Error loading restaurants:', error);
        }
    }
    
    function openAddRestaurantPopup() {
        activeMenu = "addRestaurant";
        showAddRestaurantPopup = true;
    }
    
    function closeAddRestaurantPopup() {
        showAddRestaurantPopup = false;
        // รีเซ็ตข้อมูล
        restaurantData = {
            name: '',
            category: '',
            description: '',
            address: '',
            phone: ''
        };
    }
    
    async function handleAddRestaurant() {
        console.log('Adding restaurant:', restaurantData);
        
        try {
            const response = await fetch('/api/restaurants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(restaurantData)
            });
            
            if (response.ok) {
                await loadRestaurants(); // โหลดข้อมูลใหม่
                closeAddRestaurantPopup();
                activeMenu = "dashboard"; // กลับไปหน้า dashboard
                alert('เพิ่มร้านค้าสำเร็จ!');
            } else {
                const errorData = await response.json();
                alert(`เกิดข้อผิดพลาด: ${errorData.message || 'ไม่สามารถเพิ่มร้านค้าได้'}`);
            }
        } catch (error) {
            console.error('Error adding restaurant:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    }

    async function handleLogout() {
        console.log("Logout function called");
        try {
            await fetch('/logout');
            window.location.href = '/admin';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/admin';
        }
    }
    
    async function handleDeleteRestaurant(restaurantId, restaurantName) {
        if (!confirm(`คุณต้องการลบร้านค้า "${restaurantName}" ใช่หรือไม่?`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/restaurants?id=${restaurantId}`, {
                method: 'DELETE'
            });
            
            const responseData = await response.json();
            
            if (response.ok) {
                await loadRestaurants(); // โหลดข้อมูลใหม่
                alert('ลบร้านค้าสำเร็จ!');
            } else {
                alert(`เกิดข้อผิดพลาด: ${responseData.message || 'ไม่สามารถลบร้านค้าได้'}`);
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    }
</script>


<div id="menubar" class="menubar">
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "dashboard"}
        on:click={() => (activeMenu = "dashboard")}
    >
        <span class="material-symbols-outlined">dashboard</span>
        <span class="btn-text">Dashboard</span>
    </button>
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "manageUsers"}
        on:click={() => (activeMenu = "manageUsers")}
        ><span class="material-symbols-outlined"> person </span><span
            class="btn-text">Manage Users</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        on:click={restaurantMenu}
        class:active={activeMenu === "manageRestaurant"}
        ><span class="material-symbols-outlined"> storefront </span><span
            class="btn-text">Manage Restaurant</span
        ></button
    >
    <div id="hiddenbar-container" style="display: none;">
        <button
            type="button"
            class="submenu-btn"
            on:click={openAddRestaurantPopup}
            class:active={activeMenu === "addRestaurant"}
        >
            <span class="material-symbols-outlined">add</span>
            <span class="btn-text">Add Restaurant</span>
        </button>
        
        <!-- แสดงร้านค้าที่มีอยู่แทน Restaurant2, Restaurant3 -->
        {#each restaurants as restaurant}
        <button 
            type="button" 
            class="submenu-btn restaurant-item"
            on:click={() => (activeMenu = `restaurant-${restaurant.id}`)}
            class:active={activeMenu === `restaurant-${restaurant.id}`}
        >
            <span class="material-symbols-outlined">restaurant</span>
            <span class="btn-text">{restaurant.name}</span>
        </button>
        {/each}
    </div>
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "report"}
        on:click={() => (activeMenu = "report")}
        ><span class="material-symbols-outlined"> assignment </span><span
            class="btn-text">Report</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "systemLog"}
        on:click={() => (activeMenu = "systemLog")}
        ><span class="material-symbols-outlined"> history </span><span
            class="btn-text">System Log</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "setting"}
        on:click={() => (activeMenu = "setting")}
    >
        <span class="material-symbols-outlined">settings</span>
        <span class="btn-text">setting</span>
    </button>

    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "Logout"}
        on:click={handleLogout}
    >
        <span class="material-symbols-outlined">logout</span>
        <span class="btn-text">Logout</span>
    </button>
</div>

<div class="header">
    <div class="photo">
        <img src="/Photo/Icon.png" alt="icon" />
    </div>
    <div class="headtext">
        <h1>Admin panel</h1>
    </div>
</div>

{#if showAddRestaurantPopup}
<div class="popup-overlay" on:click={closeAddRestaurantPopup}>
    <div class="popup-content" on:click|stopPropagation>
        <div class="popup-header">
            <h2>เพิ่มร้านค้าใหม่</h2>
            <button class="close-btn" on:click={closeAddRestaurantPopup}>×</button>
        </div>
        
        <form on:submit|preventDefault={handleAddRestaurant} class="restaurant-form">
            <div class="form-group">
                <label for="name">ชื่อร้านค้า:</label>
                <input 
                    id="name"
                    type="text" 
                    bind:value={restaurantData.name} 
                    required 
                    placeholder="กรอกชื่อร้านค้า"
                />
            </div>
            
            <div class="form-group">
                <label for="category">ประเภทร้านค้า:</label>
                <select id="category" bind:value={restaurantData.category} required>
                    <option value="">เลือกประเภท</option>
                    <option value="อาหารไทย">อาหารไทย</option>
                    <option value="อาหารจีน">อาหารจีน</option>
                    <option value="อาหารญี่ปุ่น">อาหารญี่ปุ่น</option>
                    <option value="อาหารฝรั่ง">อาหารฝรั่ง</option>
                    <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                    <option value="ขนม/เบเกอรี่">ขนม/เบเกอรี่</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="description">รายละเอียด:</label>
                <textarea 
                    id="description"
                    bind:value={restaurantData.description}
                    placeholder="รายละเอียดเกี่ยวกับร้านค้า"
                    rows="3"
                ></textarea>
            </div>
            
            <div class="form-group">
                <label for="address">ที่อยู่:</label>
                <textarea 
                    id="address"
                    bind:value={restaurantData.address}
                    placeholder="ที่อยู่ร้านค้า"
                    rows="2"
                    required
                ></textarea>
            </div>
            
            <div class="form-group">
                <label for="phone">เบอร์โทรศัพท์:</label>
                <input 
                    id="phone"
                    type="tel" 
                    bind:value={restaurantData.phone}
                    placeholder="0xx-xxx-xxxx"
                    required
                />
            </div>
            
            <div class="form-buttons">
                <button type="button" class="cancel-btn" on:click={closeAddRestaurantPopup}>
                    ยกเลิก
                </button>
                <button type="submit" class="submit-btn">
                    เพิ่มร้านค้า
                </button>
            </div>
        </form>
    </div>
</div>
{/if}

<!-- Main Content Area -->
<div class="main-content">
    {#if activeMenu === "dashboard"}
    <div class="dashboard">
        <h2>
            <span class="material-symbols-outlined">dashboard</span>
            Restaurant Dashboard
        </h2>
        
        {#if restaurants.length === 0}
        <div class="empty-state">
            <span class="material-symbols-outlined empty-icon">storefront</span>
            <p>ยังไม่มีร้านค้าในระบบ</p>
            <button class="add-first-btn" on:click={openAddRestaurantPopup}>
                <span class="material-symbols-outlined">add</span>
                เพิ่มร้านค้าแรก
            </button>
        </div>
        {:else}
        <div class="restaurant-grid">
            {#each restaurants as restaurant}
            <div class="restaurant-card">
                <div class="card-header">
                    <span class="material-symbols-outlined">storefront</span>
                    <h3>{restaurant.name}</h3>
                </div>
                <div class="card-content">
                    <div class="info-row">
                        <span class="material-symbols-outlined">category</span>
                        <span>{restaurant.category || 'ไม่ระบุ'}</span>
                    </div>
                    <div class="info-row">
                        <span class="material-symbols-outlined">phone</span>
                        <span>{restaurant.phone}</span>
                    </div>
                    <div class="info-row">
                        <span class="material-symbols-outlined">location_on</span>
                        <span>{restaurant.address || 'ไม่ระบุที่อยู่'}</span>
                    </div>
                    {#if restaurant.description}
                    <div class="info-row">
                        <span class="material-symbols-outlined">description</span>
                        <span>{restaurant.description}</span>
                    </div>
                    {/if}
                </div>
                <div class="card-actions">
                    <button class="edit-btn">
                        <span class="material-symbols-outlined">edit</span>
                        แก้ไข
                    </button>
                    <button 
                        class="delete-btn" 
                        on:click={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                    >
                        <span class="material-symbols-outlined">delete</span>
                        ลบ
                    </button>
                </div>
            </div>
            {/each}
        </div>
        {/if}
    </div>
    {/if}
</div>

<style>
    /* Icon  */
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
        margin-right: 10px;
        color: black;
    }
    .btn-text {
        font-family: "Noto Sans Thai";
        font-size: 16px;
        font-weight: 400;
        line-height: 19.2px;
        color: black;
    }
    .header {
        display: flex;
        height: 60px;
        width: 100%;
        border-bottom: 2px solid rgb(221, 221, 221);
        background: white;
        position: fixed;
        top: 0;
        left: 0;
        align-items: center;
    }

    /* .icon-menu {
        width: 10px;
        height: 10px;
    } */

    .menubar {
        height: 100vh; /* เต็มความสูงของ viewport */
        width: 30vh;
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        background: white;
        position: fixed;
        top: 0;
        left: 0;
        padding-top: 70px;
    }

    .restaurant {
        background-color: rgb(221, 221, 221);
    }

    label {
        display: none;
    }

    button {
        display: flex;
        align-items: center;
        text-align: left;
        height: 40px;
        width: 100%;
        padding: 1rem;
        background-color: rgb(255, 255, 255);
        border: none;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .submenu-btn {
        display: flex;
        align-items: center;
        text-align: left;
        height: 40px;
        width: 100%;
        padding: 1rem;
        background-color: rgb(238, 237, 237);
        border: none;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    h1 {
        color: #333;
        font-family: "Noto Sans Thai";
        font-size: 16px;
        font-style: regular;
        font-weight: 400;
        line-height: 19.2px;
    }

    button:hover {
        background-color: #f0f0f0;
    }

    /* button:active { */
    /* background: orange; ตอนกด */
    /* } */

    .photo img {
        width: 48px;
        height: auto;
    }

    button.active {
        /* background: orange; */
        color: white;
    }

    button.active .material-symbols-outlined {
        color: orange;
    }
    button.active .btn-text {
        color: orange;
    } 

    /* Popup Styles */
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .popup-content {
        background: white;
        border-radius: 8px;
        padding: 0;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .popup-header h2 {
        margin: 0;
        font-family: "Noto Sans Thai";
        font-size: 18px;
        color: #333;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .close-btn:hover {
        color: #333;
        background-color: #f0f0f0;
        border-radius: 50%;
    }
    
    .restaurant-form {
        padding: 20px;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-family: "Noto Sans Thai";
        font-weight: 500;
        color: #333;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: "Noto Sans Thai";
        font-size: 14px;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: orange;
    }
    
    .form-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    
    .cancel-btn,
    .submit-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-family: "Noto Sans Thai";
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .cancel-btn {
        background-color: #f5f5f5;
        color: #666;
    }
    
    .cancel-btn:hover {
        background-color: #e9e9e9;
    }
    
    .submit-btn {
        background-color: orange;
        color: white;
    }
    
    .submit-btn:hover {
        background-color: #ff8c00;
    }
    
    /* Main Content */
    .main-content {
        margin-left: 30vh;
        margin-top: 70px;
        padding: 20px;
        min-height: calc(100vh - 70px);
        background-color: #f8f9fa;
    }
    
    .dashboard h2 {
        font-family: "Noto Sans Thai";
        color: #333;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .empty-icon {
        font-size: 64px !important;
        color: #ccc;
        margin-bottom: 20px;
    }
    
    .empty-state p {
        font-family: "Noto Sans Thai";
        color: #666;
        font-size: 18px;
        margin-bottom: 30px;
    }
    
    .add-first-btn {
        background: linear-gradient(135deg, #ff6b35, #ff8c42);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: "Noto Sans Thai";
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 auto;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .add-first-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }
    
    /* Restaurant Grid */
    .restaurant-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .restaurant-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .restaurant-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .card-header h3 {
        font-family: "Noto Sans Thai";
        font-size: 18px;
        margin: 0;
    }
    
    .card-content {
        padding: 20px;
    }
    
    .info-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
        font-family: "Noto Sans Thai";
        color: #555;
    }
    
    .info-row:last-child {
        margin-bottom: 0;
    }
    
    .info-row .material-symbols-outlined {
        font-size: 20px !important;
        color: #666;
        margin-top: 2px;
    }
    
    .card-actions {
        padding: 20px;
        display: flex;
        gap: 10px;
        border-top: 1px solid #eee;
    }
    
    .edit-btn, .delete-btn {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-family: "Noto Sans Thai";
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }
    
    .edit-btn {
        background-color: #e3f2fd;
        color: #1976d2;
    }
    
    .edit-btn:hover {
        background-color: #bbdefb;
    }
    
    .delete-btn {
        background-color: #ffebee;
        color: #d32f2f;
    }
    
    .delete-btn:hover {
        background-color: #ffcdd2;
    }
    
    .restaurant-item {
        padding-left: 2rem !important;
    }
    
    /* ...existing popup styles... */
</style>
