<script>
    import { createEventDispatcher } from 'svelte';
    
    export let logoSrc = '/SCQ_logo.png';
    export let title = 'SCQ';
    export let subtitle = 'คณะวิทยาศาตร์';
    export let showNotifications = true;
    export let showBookmarks = true;
    export let showProfile = true;
    
    const dispatch = createEventDispatcher();
    
    function handleNotificationClick() {
        dispatch('notification');
    }
    
    function handleBookmarkClick() {
        dispatch('bookmark');
    }
    
    function handleProfileClick() {
        dispatch('profile');
    }
</script>

<header class="customer-header">
    <div class="header-content">
        <!-- Logo and Title -->
        <div class="brand-section">
            {#if logoSrc}
                <img src={logoSrc} alt="SCQ Logo" class="logo" />
            {/if}
            <div class="brand-text">
                <h1 class="title">{title}</h1>
                <p class="subtitle">{subtitle}</p>
            </div>
        </div>
        
        <!-- Navigation Icons -->
        <nav class="nav-icons">
            {#if showNotifications}
                <button 
                    class="nav-icon notification-btn"
                    on:click={handleNotificationClick}
                    aria-label="การแจ้งเตือน"
                    title="การแจ้งเตือน"
                >
                    <span class="material-symbols-outlined">notifications</span>
                </button>
            {/if}
            
            {#if showBookmarks}
                <button 
                    class="nav-icon bookmark-btn"
                    on:click={handleBookmarkClick}
                    aria-label="คำสั่งซื้อ"
                    title="ประวัติคำสั่งซื้อ"
                >
                    <span class="material-symbols-outlined">bookmark</span>
                </button>
            {/if}
            
            {#if showProfile}
                <button 
                    class="nav-icon profile-btn"
                    on:click={handleProfileClick}
                    aria-label="โปรไฟล์"
                    title="โปรไฟล์ของฉัน"
                >
                    <span class="material-symbols-outlined">account_circle</span>
                </button>
            {/if}
        </nav>
    </div>
</header>

<style>
    .customer-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        height: 70px;
    }
    
    .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0 20px;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .brand-section {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
    }
    
    .logo {
        width: 40px;
        height: 40px;
        object-fit: contain;
        flex-shrink: 0;
    }
    
    .brand-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }
    
    .title {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin: 0;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .subtitle {
        font-size: 12px;
        color: #ff8c00;
        margin: 0;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .nav-icons {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
    }
    
    .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border: none;
        background: #f5f5f5;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .nav-icon:hover {
        background: #e0e0e0;
        transform: translateY(-1px);
    }
    
    .nav-icon .material-symbols-outlined {
        font-size: 22px;
        color: #666;
    }
    
    .notification-btn:hover .material-symbols-outlined {
        color: #ff8c00;
    }
    
    .bookmark-btn:hover .material-symbols-outlined {
        color: #2196f3;
    }
    
    .profile-btn:hover .material-symbols-outlined {
        color: #4caf50;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .customer-header {
            height: 65px;
        }
        
        .header-content {
            padding: 0 15px;
        }
        
        .brand-section {
            gap: 8px;
        }
        
        /* แสดง brand-text ใน tablet/mobile แต่ปรับขนาด */
        .title {
            font-size: 18px;
        }
        
        .subtitle {
            font-size: 10px;
        }
        
        .logo {
            width: 32px;
            height: 32px;
        }
        
        .nav-icon {
            width: 38px;
            height: 38px;
        }
        
        .nav-icon .material-symbols-outlined {
            font-size: 18px;
        }
    }
    
    @media (max-width: 480px) {
        .customer-header {
            height: 60px;
        }
        
        .header-content {
            padding: 0 12px;
        }
        
        .brand-section {
            gap: 6px;
        }
        
        /* ปรับขนาดให้เล็กลงใน mobile */
        .title {
            font-size: 16px;
        }
        
        .subtitle {
            font-size: 9px;
        }
        
        .logo {
            width: 28px;
            height: 28px;
        }
        
        .nav-icons {
            gap: 4px;
        }
        
        .nav-icon {
            width: 36px;
            height: 36px;
        }
        
        .nav-icon .material-symbols-outlined {
            font-size: 16px;
        }
    }
    
    /* สำหรับหน้าจอเล็กมาก - ซ่อนเฉพาะ subtitle */
    @media (max-width: 360px) {
        .subtitle {
            display: none;
        }
        
        .title {
            font-size: 14px;
        }
        
        .logo {
            width: 26px;
            height: 26px;
        }
    }
</style>