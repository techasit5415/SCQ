<script>
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';
    import TopBar from '$lib/Components/Topbar.svelte';
    import AdminSidebar from '$lib/Components/sidebar.svelte';

    export let data;
    export let form;

    // Active menu state
    let activeMenu = "manageUsers";
    
    // Filter and modal states
    let selectedRole = 'all';
    let searchQuery = '';
    let showEditModal = false;
    let showDeleteModal = false;
    let editingUser = null;
    let deletingUser = null;
    
    // Reactive filtered users
    $: filteredUsers = data.users.filter(user => {
        const matchesRole = selectedRole === 'all' || 
                          (user.expand?.Role?.name?.toLowerCase() === selectedRole.toLowerCase());
        const matchesSearch = searchQuery === '' || 
                            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.Lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    // Event Handlers for Components
    function handleMenuChange(event) {
        const menu = event.detail;
        if (menu !== "manageUsers") {
            // Navigate to different pages based on menu selection
            switch(menu) {
                case "dashboard":
                    goto('/admin/dashboard');
                    break;
                case "systemLog":
                    goto('/admin/systemlog');
                    break;
                case "settings":
                    goto('/admin/settings');
                    break;
                // Add other navigation cases as needed
                default:
                    console.log('Navigation to', menu, 'not implemented yet');
            }
        }
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
    
    // User management functions
    function handleEditUser(user) {
        editingUser = {
            ...user,
            roleId: user.Role || user.expand?.Role?.id || ''
        };
        showEditModal = true;
    }
    
    function handleDeleteUser(user) {
        deletingUser = user;
        showDeleteModal = true;
    }
    
    function closeEditModal() {
        showEditModal = false;
        editingUser = null;
    }
    
    function closeDeleteModal() {
        showDeleteModal = false;
        deletingUser = null;
    }
    
    // Handle form submissions with proper feedback
    function handleUpdateSuccess() {
        showEditModal = false;
        editingUser = null;
        // Refresh page to show updated data
        setTimeout(() => window.location.reload(), 1000);
    }
    
    function handleDeleteSuccess() {
        showDeleteModal = false;
        deletingUser = null;
        // Refresh page to show updated data
        setTimeout(() => window.location.reload(), 1000);
    }
    
    function getRoleColor(roleName) {
        switch (roleName?.toLowerCase()) {
            case 'admin':
                return '#e74c3c';
            case 'restaurant':
                return '#f39c12';
            case 'user':
            default:
                return '#3498db';
        }
    }
    
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

<!-- Admin Layout -->
<div class="admin-layout">
    <TopBar title="Admin Panel - Manage Users" logoSrc="/SCQ_logo.png" />
    
    <AdminSidebar 
        {activeMenu} 
        on:menuChange={handleMenuChange}
        on:logout={handleLogout}
    />

    <!-- Main Content -->
    <main class="main-content">
        <!-- Breadcrumb and Title -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home / </span>
                <span class="breadcrumb-item current">Manage Users</span>
            </div>
            <div class="page-title">
                <h1>Manage Users</h1>
                <p>จัดการข้อมูลผู้ใช้งานในระบบ</p>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                    <span class="material-symbols-outlined">people</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">{data.userStats?.totalUsers || 0}</div>
                    <div class="kpi-label">Total Users</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)">
                    <span class="material-symbols-outlined">admin_panel_settings</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">{data.userStats?.adminUsers || 0}</div>
                    <div class="kpi-label">Admin Users</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%)">
                    <span class="material-symbols-outlined">person</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">{data.userStats?.regularUsers || 0}</div>
                    <div class="kpi-label">Regular Users</div>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-icon" style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%)">
                    <span class="material-symbols-outlined">restaurant</span>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">{data.userStats?.restaurantUsers || 0}</div>
                    <div class="kpi-label">Restaurant Users</div>
                </div>
            </div>
        </div>

        <!-- Filters and Search -->
        <div class="filter-section">
            <div class="filter-controls">
                <div class="search-box">
                    <span class="material-symbols-outlined">search</span>
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        bind:value={searchQuery}
                    />
                </div>
                
                <div class="role-filter">
                    <label for="roleFilter">Filter by Role:</label>
                    <select id="roleFilter" bind:value={selectedRole}>
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="restaurant">Restaurant</option>
                    </select>
                </div>
            </div>
            
            <div class="results-info">
                Showing {filteredUsers.length} of {data.users?.length || 0} users
            </div>
        </div>

        <!-- Users Table -->
        <div class="users-section">
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

            <div class="users-table-container">
                <div class="table-header">
                    <h3>User Management</h3>
                </div>
                
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Date Added</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if filteredUsers && filteredUsers.length > 0}
                            {#each filteredUsers as user, index}
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div class="user-info">
                                            <div class="user-name">{user.name || 'N/A'} {user.Lastname || ''}</div>
                                        </div>
                                    </td>
                                    <td>{user.email || 'N/A'}</td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td>
                                        <span class="role-badge" style="background-color: {getRoleColor(user.expand?.Role?.name)}">
                                            {user.expand?.Role?.name || 'User'}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-badge" class:active={user.verified !== false}>
                                            {user.verified !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.created)}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="action-btn edit" on:click={() => handleEditUser(user)}>
                                                <span class="material-symbols-outlined">edit</span>
                                                Edit
                                            </button>
                                            <button class="action-btn delete" on:click={() => handleDeleteUser(user)}>
                                                <span class="material-symbols-outlined">delete</span>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        {:else}
                            <tr>
                                <td colspan="8" class="no-data">
                                    <div class="no-data-content">
                                        <span class="material-symbols-outlined">people_off</span>
                                        <div>No users found</div>
                                    </div>
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</div>

<!-- Edit User Modal -->
{#if showEditModal && editingUser}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-overlay" on:click={closeEditModal}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="modal-content edit-modal" on:click|stopPropagation>
            <div class="modal-header">
                <div class="edit-icon">
                    <span class="material-symbols-outlined">edit</span>
                </div>
                <h3>แก้ไขข้อมูลผู้ใช้</h3>
                <button type="button" class="modal-close" on:click={closeEditModal}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <form method="POST" action="?/updateUser" use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success') {
                        handleUpdateSuccess();
                    }
                };
            }}>
                <div class="modal-body">
                    <input type="hidden" name="userId" value={editingUser.id} />
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editName">
                                <span class="material-symbols-outlined">person</span>
                                ชื่อ
                            </label>
                            <input 
                                type="text" 
                                id="editName" 
                                name="name" 
                                bind:value={editingUser.name}
                                placeholder="กรอกชื่อ"
                                required
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="editLastname">
                                <span class="material-symbols-outlined">person</span>
                                นามสกุล
                            </label>
                            <input 
                                type="text" 
                                id="editLastname" 
                                name="lastname" 
                                bind:value={editingUser.Lastname}
                                placeholder="กรอกนามสกุล"
                                required
                            />
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="editEmail">
                            <span class="material-symbols-outlined">email</span>
                            อีเมล
                        </label>
                        <input 
                            type="email" 
                            id="editEmail" 
                            name="email" 
                            bind:value={editingUser.email}
                            placeholder="example@email.com"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="editPhone">
                            <span class="material-symbols-outlined">phone</span>
                            เบอร์โทรศัพท์
                        </label>
                        <input 
                            type="tel" 
                            id="editPhone" 
                            name="phone" 
                            bind:value={editingUser.phone}
                            placeholder="0xx-xxx-xxxx"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="editRole">
                            <span class="material-symbols-outlined">admin_panel_settings</span>
                            บทบาท
                        </label>
                        <select id="editRole" name="roleId" bind:value={editingUser.roleId} required>
                            <option value="">เลือกบทบาท</option>
                            {#each data.roles as role}
                                <option value={role.id}>{role.name}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeEditModal}>
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
{#if showDeleteModal && deletingUser}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-overlay" on:click={closeDeleteModal}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="modal-content delete-modal" on:click|stopPropagation>
            <div class="modal-header">
                <div class="delete-icon">
                    <span class="material-symbols-outlined">warning</span>
                </div>
                <h3>ลบผู้ใช้</h3>
                <button type="button" class="modal-close" on:click={closeDeleteModal}>
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div class="modal-body">
                <p class="confirm-text">คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?</p>
                <div class="user-details">
                    <div class="user-info-card">
                        <div class="user-avatar">
                            <span class="material-symbols-outlined">person</span>
                        </div>
                        <div class="user-info-text">
                            <div class="user-name">{deletingUser.name} {deletingUser.Lastname}</div>
                            <div class="user-email">{deletingUser.email}</div>
                            <div class="user-phone">{deletingUser.phone || 'ไม่มีเบอร์โทร'}</div>
                            <span class="role-badge" style="background-color: {getRoleColor(deletingUser.expand?.Role?.name)}">
                                {deletingUser.expand?.Role?.name || 'User'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="warning-box">
                    <span class="material-symbols-outlined">error</span>
                    <p class="warning-text">การดำเนินการนี้ไม่สามารถยกเลิกได้ ข้อมูลทั้งหมดของผู้ใช้จะถูกลบถาวร</p>
                </div>
            </div>
            
            <form method="POST" action="?/deleteUser" use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success') {
                        handleDeleteSuccess();
                    }
                };
            }}>
                <input type="hidden" name="userId" value={deletingUser.id} />
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" on:click={closeDeleteModal}>
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

<style>
    /* Reset and Base */
    * {
        box-sizing: border-box;
    }

    :global(body) {
        background: #f5f7fa !important;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    .admin-layout {
        min-height: 100vh;
        background: #f5f7fa;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    /* Main Content */
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

    /* Users Table */
    .users-section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .table-header {
        margin-bottom: 20px;
    }

    .table-header h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
        font-weight: 500;
    }

    .users-table-container {
        overflow-x: hidden;
    }

    .users-table {
        width: 100%;
        border-collapse: collapse;
    }

    .users-table th,
    .users-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
    }

    .users-table th {
        background: #f8f9fa;
        font-weight: 500;
        color: #333;
        font-size: 14px;
    }

    .users-table td {
        font-size: 14px;
        color: #666;
    }

    .users-table tbody tr:hover {
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

    /* KPI Cards */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .kpi-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .kpi-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .kpi-icon .material-symbols-outlined {
        font-size: 24px;
    }

    .kpi-content {
        flex: 1;
    }

    .kpi-value {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
    }

    .kpi-label {
        font-size: 13px;
        color: #666;
        font-weight: 500;
    }

    /* Filters */
    .filter-section {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    .filter-controls {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }

    .search-box {
        position: relative;
        flex: 1;
        min-width: 250px;
    }

    .search-box .material-symbols-outlined {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
        font-size: 20px;
    }

    .search-box input {
        width: 100%;
        padding: 10px 12px 10px 40px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
    }

    .role-filter {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .role-filter label {
        font-size: 14px;
        color: #333;
        font-weight: 500;
    }

    .role-filter select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
    }

    .results-info {
        font-size: 13px;
        color: #666;
        font-weight: 500;
    }

    /* User Info */
    .user-info .user-name {
        font-weight: 500;
        color: #333;
    }

    .role-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        color: white;
        display: inline-block;
    }

    .action-buttons {
        display: flex;
        gap: 8px;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
    }

    .action-btn.edit {
        background: #e3f2fd;
        color: #1976d2;
    }

    .action-btn.edit:hover {
        background: #bbdefb;
    }

    .action-btn.delete {
        background: #ffebee;
        color: #d32f2f;
    }

    .action-btn.delete:hover {
        background: #ffcdd2;
    }

    .action-btn .material-symbols-outlined {
        font-size: 16px;
    }

    .no-data-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 40px;
        color: #888;
    }

    .no-data-content .material-symbols-outlined {
        font-size: 48px;
        opacity: 0.5;
    }

    /* Modal Styles */
    .modal-overlay {
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

    .modal-content {
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

    .edit-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
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

    .modal-body {
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

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #333;
    }

    .form-group label .material-symbols-outlined {
        font-size: 18px;
        color: #666;
    }

    .form-group input,
    .form-group select {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 14px;
        transition: all 0.2s ease;
        background: #fafafa;
    }

    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #2196f3;
        background: white;
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        transform: translateY(-1px);
    }

    .form-group input::placeholder {
        color: #aaa;
        font-style: italic;
    }

    .form-group select {
        cursor: pointer;
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

    /* Responsive */
    @media (max-width: 768px) {
        .main-content {
            margin-left: 0;
            padding: 20px;
        }

        .kpi-grid {
            grid-template-columns: 1fr;
        }

        .filter-controls {
            flex-direction: column;
            align-items: stretch;
        }

        .search-box {
            min-width: auto;
        }

        .users-table {
            font-size: 12px;
        }

        .users-table th,
        .users-table td {
            padding: 8px 4px;
        }

        .action-buttons {
            flex-direction: column;
            gap: 4px;
        }

        .action-btn {
            font-size: 11px;
            padding: 4px 8px;
        }

        .modal-content {
            width: 95%;
            margin: 10px;
            max-height: 95vh;
        }

        .modal-header {
            padding: 20px;
        }

        .modal-body {
            padding: 20px;
        }

        .modal-actions {
            padding: 20px;
            flex-direction: column;
            gap: 10px;
        }

        .btn-primary,
        .btn-secondary,
        .btn-danger {
            width: 100%;
            min-width: auto;
        }

        .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
        }

        .user-info-card {
            flex-direction: column;
            text-align: center;
            gap: 12px;
        }

        .edit-icon,
        .delete-icon {
            width: 40px;
            height: 40px;
        }

        .modal-header h3 {
            font-size: 16px;
        }

        .form-group input,
        .form-group select {
            padding: 10px 14px;
        }
    }

    /* Extra small screens */
    @media (max-width: 480px) {
        .kpi-card {
            padding: 16px;
        }

        .kpi-value {
            font-size: 20px;
        }

        .users-table th,
        .users-table td {
            padding: 6px 2px;
            font-size: 11px;
        }

        .modal-content {
            width: 98%;
            margin: 5px;
        }

        .action-btn .material-symbols-outlined {
            font-size: 14px;
        }
    }
</style>