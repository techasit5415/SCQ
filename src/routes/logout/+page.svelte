<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { toastStore } from '$lib/stores/toast';
    
    // ฟังก์ชันลบ cookie ทุกตัว
    function deleteAllCookies() {
        const cookies = document.cookie.split(";");
        
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            
            // ลบ cookie ด้วยการ set หมดอายุในอดีต
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + window.location.hostname;
            
            console.log('🗑️ Deleted cookie:', name);
        }
    }
    
    onMount(async () => {
        console.log('🔓 Logout page mounted');
        
        // 1. ลบ cookies ฝั่ง client
        deleteAllCookies();
        
        // 2. เคลียร์ localStorage และ sessionStorage
        try {
            localStorage.clear();
            sessionStorage.clear();
            console.log('✅ Cleared localStorage and sessionStorage');
        } catch (e) {
            console.error('❌ Error clearing storage:', e);
        }
        
        // 3. เรียก logout API เพื่อลบ cookies ฝั่ง server
        try {
            await fetch('/logout', {
                method: 'GET',
                credentials: 'include'
            });
            console.log('✅ Server-side logout completed');
        } catch (e) {
            console.error('❌ Error calling logout API:', e);
        }
        
        // 4. ป้องกันการย้อนกลับหลัง logout
        history.pushState(null, '', location.href);
        
        window.addEventListener('popstate', function() {
            history.pushState(null, '', location.href);
            toastStore.warning('คุณได้ออกจากระบบแล้ว กรุณาเข้าสู่ระบบใหม่');
            goto('/', { replaceState: true });
        });
        
        // 5. แสดง toast ว่า logout สำเร็จ
        toastStore.success('ออกจากระบบสำเร็จ');
        
        // 6. Redirect ไป login หลังจาก 1 วินาที
        setTimeout(() => {
            goto('/', { replaceState: true });
        }, 1000);
    });
</script>

<div class="logout-container">
    <div class="logout-message">
        <div class="spinner"></div>
        <p>กำลังออกจากระบบ...</p>
    </div>
</div>

<style>
    .logout-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #f5f5f5;
    }
    
    .logout-message {
        text-align: center;
        padding: 40px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto 20px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #ff8c00;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .logout-message p {
        color: #666;
        font-size: 16px;
        margin: 0;
    }
</style>
