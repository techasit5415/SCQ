<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
  
  // Helper function สำหรับฟอร์แมตวันที่
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Helper function สำหรับการจัดการ Edit/Delete
  function handleEdit(userId: string) {
    console.log('Edit user:', userId);
    // TODO: เพิ่มฟังก์ชันแก้ไขผู้ใช้
  }
  
  function handleDelete(userId: string) {
    console.log('Delete user:', userId);
    // TODO: เพิ่มฟังก์ชันลบผู้ใช้
  }
</script>

<svelte:head>
  <title>Manage Users - SCQ Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
</svelte:head>

<div class="manage-users">
    <div class="content">
        <div class="frame-7">
            <div class="frame-15">
                <div class="users"><span class="users_span">Users</span></div>
                <div class="frame-8">
                    <!-- Header Row -->
                    <div class="frame-15_01">
                        <div class="user-id"><span class="userid_span">User ID</span></div>
                        <div class="name"><span class="name_span">Name</span></div>
                        <div class="email"><span class="email_span">Email</span></div>
                        <div class="status"><span class="status_span">Status</span></div>
                        <div class="date-added"><span class="dateadded_span">Date Added</span></div>
                        <div class="action"><span class="action_span">Action</span></div>
                    </div>
                    
                    <!-- Header Divider -->
                    <div data-property-1="Default" class="divider">
                        <div class="line-1"></div>
                    </div>
                    
                    <!-- Users Data Rows -->
                    {#if data.users && data.users.length > 0}
                        {#each data.users as user, index}
                            <div class="frame-15_02">
                                <div class="text-1"><span class="f_span">{index + 1}</span></div>
                                <div class="kantawat-shamshoi">
                                    <span class="kantawatshamshoi_span">
                                        {user.name || `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'N/A'}
                                    </span>
                                </div>
                                <div class="text-66050027kmitlacth">
                                    <span class="f6050027kmitlacth_span">{user.email || 'N/A'}</span>
                                </div>
                                <div class="active">
                                    <span class="active_span">{user.verified ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div class="jul-17-2025">
                                    <span class="jul172025_span">{formatDate(user.created)}</span>
                                </div>
                                <div class="edit-delete">
                                    <button type="button" class="edit-btn" on:click={() => handleEdit(user.id)}>
                                        <span class="editdelete_span_01">Edit</span>
                                    </button>
                                    <span class="editdelete_span_02">  </span>
                                    <button type="button" class="delete-btn" on:click={() => handleDelete(user.id)}>
                                        <span class="editdelete_span_03">Delete</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Row Divider -->
                            {#if index < data.users.length - 1}
                                <div data-property-1="Default" class="divider_01">
                                    <div class="line-1_01"></div>
                                </div>
                            {/if}
                        {/each}
                    {:else}
                        <div class="no-data">
                            <span>No users found</span>
                        </div>
                    {/if}
                    
                    <!-- Final Divider -->
                    <div data-property-1="Default" class="divider_03"></div>
                </div>
            </div>
        </div>
        
        <!-- Breadcrumb -->
        <div class="frame-6">
            <div class="home-manage-users">
                <span class="homemanageusers_span_01">Home /</span>
                <span class="homemanageusers_span_02"> Manage Users</span>
            </div>
            <div class="manage-users_01">
                <span class="manageusers_01_span">Manage Users</span>
            </div>
        </div>
    </div>
    
    <!-- Sidebar Navigation -->
    <div class="side-nav">
        <div class="frame-4">
            <!-- Dashboard -->
            <a href="/homeadmin" class="menu-item" data-property-1="Variant3" data-show-submenu-icon="false">
                <div class="frame-6_01">
                    <div class="frame-5">
                        <div data-property-1="dashboard" class="icons">
                            <span class="material-symbols-outlined">dashboard</span>
                        </div>
                        <div class="dashboard_01"><span class="dashboard_span">Dashboard</span></div>
                    </div>
                </div>
            </a>
            
            <!-- Manage Users - Active -->
            <div data-property-1="Default" data-show-submenu-icon="false" class="menu-item_01 active">
                <div class="frame-6_02">
                    <div class="frame-5_01">
                        <div data-property-1="person" class="icons_01">
                            <span class="material-symbols-outlined">person</span>
                        </div>
                        <div class="dashboard_01"><span class="dashboard_01_span active-text">Manage Users</span></div>
                    </div>
                </div>
            </div>
            
            <!-- Manage Restaurant -->
            <div data-property-1="Variant2" class="dropdown-menu">
                <div data-property-1="Default" data-show-submenu-icon="true" class="menu-item_02">
                    <div class="frame-6_03">
                        <div class="frame-5_02">
                            <div data-property-1="storefront" class="icons_02">
                                <span class="material-symbols-outlined">storefront</span>
                            </div>
                            <div class="dashboard_02"><span class="dashboard_02_span">Manage Restaurant</span></div>
                        </div>
                        <div data-property-1="keyboard_arrow_up" class="icons_03">
                            <span class="material-symbols-outlined">keyboard_arrow_up</span>
                        </div>
                    </div>
                </div>
                <div class="frame-7_01">
                    <div data-property-1="Default" class="sub-menu-item">
                        <div class="frame-6_04">
                            <div class="frame-5_03">
                                <div class="all-restaurants"><span class="allrestaurants_span">All Restaurants</span></div>
                            </div>
                        </div>
                    </div>
                    <div data-property-1="Default" class="sub-menu-item_01">
                        <div class="frame-6_05">
                            <div class="frame-5_04">
                                <div class="all-restaurants_01"><span class="allrestaurants_01_span">All Restaurants</span></div>
                            </div>
                        </div>
                    </div>
                    <div data-property-1="Default" class="sub-menu-item_02">
                        <div class="frame-6_06">
                            <div class="frame-5_05">
                                <div class="all-restaurants_02"><span class="allrestaurants_02_span">All Restaurants</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Reports -->
            <div data-property-1="Default" data-show-submenu-icon="false" class="menu-item_03">
                <div class="frame-6_07">
                    <div class="frame-5_06">
                        <div data-property-1="assignment" class="icons_04">
                            <span class="material-symbols-outlined">assignment</span>
                        </div>
                        <div class="dashboard_03"><span class="dashboard_03_span">Reports</span></div>
                    </div>
                </div>
            </div>
            
            <!-- System Log -->
            <div data-property-1="Default" data-show-submenu-icon="false" class="menu-item_04">
                <div class="frame-6_08">
                    <div class="frame-5_07">
                        <div data-property-1="history" class="icons_05">
                            <span class="material-symbols-outlined">history</span>
                        </div>
                        <div class="dashboard_04"><span class="dashboard_04_span">System Log</span></div>
                    </div>
                </div>
            </div>
            
            <!-- Settings -->
            <div data-property-1="Default" data-show-submenu-icon="false" class="menu-item_05">
                <div class="frame-6_09">
                    <div class="frame-5_08">
                        <div data-property-1="settings" class="icons_06">
                            <span class="material-symbols-outlined">settings</span>
                        </div>
                        <div class="dashboard_05"><span class="dashboard_05_span">Settings</span></div>
                    </div>
                </div>
            </div>
            
            <!-- Logout -->
            <a href="/logout" class="menu-item_06" data-property-1="Default" data-show-submenu-icon="false">
                <div class="frame-6_10">
                    <div class="frame-5_09">
                        <div data-property-1="logout" class="icons_07">
                            <span class="material-symbols-outlined">logout</span>
                        </div>
                        <div class="dashboard_06"><span class="dashboard_06_span">Logout</span></div>
                    </div>
                </div>
            </a>
        </div>
    </div>
    
    <!-- Top Navigation -->
    <div class="top-nav">
        <div class="frame-3">
            <img class="raw-3" src="/SCQ_logo.png" alt="SCQ Logo" />
            <div class="admin-panel"><span class="adminpanel_span">Admin Panel</span></div>
        </div>
    </div>
</div>

<style>
/* ใช้ CSS จาก Figma เดิม พร้อมปรับปรุงเล็กน้อย */
.users_span {
    color: #333438;
    font-size: 20px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 24px;
    word-wrap: break-word;
}

.users {
    align-self: stretch;
}

.status_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 600;
    line-height: 19.20px;
    word-wrap: break-word;
}

.status {
    width: 171.67px;
    height: 45px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.dateadded_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 600;
    line-height: 19.20px;
    word-wrap: break-word;
}

.date-added {
    width: 171.67px;
    height: 45px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.action_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 600;
    line-height: 19.20px;
    word-wrap: break-word;
}

.action {
    width: 171.67px;
    height: 45px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.userid_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 600;
    line-height: 19.20px;
    word-wrap: break-word;
}

.user-id {
    width: 171.67px;
    height: 45px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.name_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 600;
    line-height: 19.20px;
    word-wrap: break-word;
}

.name {
    width: 171.67px;
    height: 45px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.email_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 600;
    line-height: 19.20px;
    word-wrap: break-word;
}

.email {
    width: 171.67px;
    height: 45px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.line-1 {
    width: 1080px;
    height: 0px;
    left: 0px;
    top: 0.49px;
    position: absolute;
    outline: 1px #494A50 solid;
    outline-offset: -0.50px;
}

.f6050027kmitlacth_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.text-66050027kmitlacth {
    width: 171.67px;
    height: 80px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.active_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.active {
    width: 171.67px;
    height: 80px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.jul172025_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.jul-17-2025 {
    width: 171.67px;
    height: 80px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.f_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.text-1 {
    width: 171.67px;
    height: 80px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.editdelete_span_01 {
    color: #2B7FFF;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    text-decoration: underline;
    line-height: 19.20px;
    word-wrap: break-word;
}

.editdelete_span_02 {
    color: #2B7FFF;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.editdelete_span_03 {
    color: #2B7FFF;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    text-decoration: underline;
    line-height: 19.20px;
    word-wrap: break-word;
}

.edit-delete {
    width: 171.67px;
    height: 80px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.edit-btn, .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
}

.edit-btn:hover .editdelete_span_01,
.delete-btn:hover .editdelete_span_03 {
    opacity: 0.7;
}

.kantawatshamshoi_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.kantawat-shamshoi {
    width: 171.67px;
    height: 80px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.line-1_01 {
    width: 1080px;
    height: 0px;
    left: 0px;
    top: 0.49px;
    position: absolute;
    outline: 1px #B4B5B7 solid;
    outline-offset: -0.50px;
}

.homemanageusers_span_01 {
    color: #95969A;
    font-size: 13px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 15.60px;
    word-wrap: break-word;
}

.homemanageusers_span_02 {
    color: #333438;
    font-size: 13px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 15.60px;
    word-wrap: break-word;
}

.home-manage-users {
    align-self: stretch;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.manageusers_01_span {
    color: #333438;
    font-size: 20px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 24px;
    word-wrap: break-word;
}

.manage-users_01 {
    align-self: stretch;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

/* Material Icons Styling */
.material-symbols-outlined {
    font-size: 24px;
    color: #333438;
}

.menu-item.active .material-symbols-outlined,
.menu-item_01.active .material-symbols-outlined {
    color: #FF8C00;
}

.dashboard_span {
    color: #FF8C00;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.dashboard_01 {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.dashboard_01_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.dashboard_01_span.active-text {
    color: #FF8C00;
}

.dashboard_02_span {
    color: #FF8C00;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.dashboard_02 {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.allrestaurants_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.all-restaurants {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.allrestaurants_01_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.all-restaurants_01 {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.allrestaurants_02_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.all-restaurants_02 {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.dashboard_03_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.dashboard_03 {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.dashboard_04_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.dashboard_04 {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.dashboard_05_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.dashboard_05 {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.dashboard_06_span {
    color: #333438;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.dashboard_06 {
    flex: 1 1 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.raw-3 {
    width: 48px;
    height: 48px;
}

.adminpanel_span {
    color: black;
    font-size: 16px;
    font-family: 'Noto Sans Thai', sans-serif;
    font-weight: 400;
    line-height: 19.20px;
    word-wrap: break-word;
}

.admin-panel {
    flex: 1 1 0;
    height: 34px;
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.divider_03 {
    align-self: stretch;
    height: 0.98px;
    position: relative;
}

.frame-15_01 {
    align-self: stretch;
    height: 45px;
    overflow: hidden;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
}

.divider {
    align-self: stretch;
    height: 0.98px;
    position: relative;
}

.frame-15_02 {
    align-self: stretch;
    height: 80px;
    overflow: hidden;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    display: inline-flex;
}

.divider_01 {
    align-self: stretch;
    height: 0.98px;
    position: relative;
}

.frame-6 {
    width: 1184px;
    padding: 20px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: white;
    border-bottom: 1px #B4B5B7 solid;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
}

.frame-5_03 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
}

.frame-5_04 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
}

.frame-5_05 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
}

.icons, .icons_01, .icons_02, .icons_03, .icons_04, .icons_05, .icons_06, .icons_07 {
    width: 24px;
    height: 24px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.frame-3 {
    width: 256px;
    height: 60px;
    padding: 16px;
    left: 0px;
    top: 0px;
    position: absolute;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
}

.frame-8 {
    align-self: stretch;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 20px;
    padding-bottom: 20px;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.20);
    overflow: hidden;
    border-radius: 16px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
}

.frame-6_04, .frame-6_05, .frame-6_06 {
    flex: 1 1 0;
    justify-content: space-between;
    align-items: center;
    display: flex;
}

.frame-5, .frame-5_01, .frame-5_02, .frame-5_06, .frame-5_07, .frame-5_08, .frame-5_09 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
}

.top-nav {
    width: 1440px;
    height: 60px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: white;
    overflow: hidden;
    border-bottom: 1px #B4B5B7 solid;
}

.frame-15 {
    flex: 1 1 0;
    padding: 16px;
    background: white;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.20);
    overflow: hidden;
    border-radius: 16px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
}

.sub-menu-item, .sub-menu-item_01, .sub-menu-item_02 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 48px;
    padding-right: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.frame-6_01, .frame-6_02, .frame-6_03, .frame-6_07, .frame-6_08, .frame-6_09, .frame-6_10 {
    flex: 1 1 0;
    justify-content: space-between;
    align-items: center;
    display: flex;
}

.frame-7 {
    width: 1184px;
    height: 874px;
    padding: 20px;
    left: 0px;
    top: 90px;
    position: absolute;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
    flex-wrap: wrap;
    align-content: flex-start;
}

.frame-7_01 {
    align-self: stretch;
    background: #EDF0F2;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
}

.menu-item, .menu-item_01, .menu-item_02, .menu-item_03, .menu-item_04, .menu-item_05, .menu-item_06 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 8px;
    padding-bottom: 8px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
    text-decoration: none;
    color: inherit;
}

.menu-item:hover, .menu-item_01:hover, .menu-item_02:hover, .menu-item_03:hover, .menu-item_04:hover, .menu-item_05:hover, .menu-item_06:hover {
    background-color: #f5f5f5;
}

.content {
    width: 1184px;
    height: 964px;
    left: 256px;
    top: 60px;
    position: absolute;
    background: #EDF0F2;
    overflow: hidden;
}

.dropdown-menu {
    width: 256px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    display: flex;
}

.frame-4 {
    width: 256px;
    left: 0px;
    top: 80px;
    position: absolute;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
}

.side-nav {
    width: 256px;
    height: 1024px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: white;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.manage-users {
    width: 100%;
    height: 100%;
    position: relative;
    background: white;
    overflow: hidden;
}

.no-data {
    align-self: stretch;
    height: 80px;
    text-align: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    color: #999;
    font-family: 'Noto Sans Thai', sans-serif;
    font-size: 16px;
}
</style>