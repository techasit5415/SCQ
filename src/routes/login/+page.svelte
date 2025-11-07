<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import PocketBase from "pocketbase";
  import { PUBLIC_POCKETBASE_URL, PUBLIC_POCKETBASE_OAUTH_URL } from "$env/static/public";
  import type { PageData } from './$types';
  
  export let data: PageData;
  export let form;

  const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
  const pbOAuth = new PocketBase(PUBLIC_POCKETBASE_OAUTH_URL || PUBLIC_POCKETBASE_URL);

  let email = "";
  let password = "";
  let showPassword = false;
  let isSubmitting = false;
  let isOAuthLoading = false;

  $: if (form?.error) {
    alert(form.error);
    isSubmitting = false;
  }

  async function handleOAuthLogin(provider: 'google' | 'facebook' | 'github') {
    isOAuthLoading = true;
    try {
      console.log('🔐 Starting OAuth login with:', provider);
      
      // Clear any existing auth before starting OAuth
      pb.authStore.clear();
      pbOAuth.authStore.clear();
      
      // Clear cookies client-side
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('🧹 Cleared all auth data');
      
      // Start OAuth2 authentication flow - บังคับให้เลือก account ใหม่
      const authData = await pbOAuth.collection('users').authWithOAuth2({ 
        provider,
        // บังคับให้แสดงหน้าเลือก account
        urlCallback: (url) => {
          // เพิ่ม prompt=select_account เข้าไปใน URL
          const authUrl = new URL(url);
          authUrl.searchParams.set('prompt', 'select_account');
          // เปิด OAuth ใน popup window
          window.open(authUrl.toString(), 'oauth-window', 'width=600,height=700');
        }
      });
      
      console.log('✅ OAuth authentication successful');
      console.log('User:', authData.record.email);
      
      // Sync token to main PocketBase instance
      pb.authStore.save(authData.token, authData.record);
      
      // Get user's role
      const user = authData.record;
      let role = 'customer'; // Default role
      
      if (user.Role) {
        try {
          const roleRecord = await pbOAuth.collection('Role').getOne(user.Role);
          role = roleRecord.name?.toLowerCase() || 'customer';
          console.log('👤 User role:', role);
        } catch (e) {
          console.error('Error fetching role:', e);
        }
      }
      
      // ส่งข้อมูลไปให้ server ตั้ง cookie ผ่าน form action
      const formElement = document.createElement('form');
      formElement.method = 'POST';
      formElement.action = '/login?/oauthCallback'; // ต้องระบุ full path
      
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token';
      tokenInput.value = authData.token;
      formElement.appendChild(tokenInput);
      
      const recordInput = document.createElement('input');
      recordInput.type = 'hidden';
      recordInput.name = 'record';
      recordInput.value = JSON.stringify(authData.record);
      formElement.appendChild(recordInput);
      
      const roleInput = document.createElement('input');
      roleInput.type = 'hidden';
      roleInput.name = 'role';
      roleInput.value = role;
      formElement.appendChild(roleInput);
      
      document.body.appendChild(formElement);
      formElement.submit();
      
    } catch (error) {
      console.error('❌ OAuth login failed:', error);
      alert('เข้าสู่ระบบด้วย OAuth ไม่สำเร็จ');
      isOAuthLoading = false;
    }
  }
</script>

<form method="POST" action="?/login" use:enhance={() => {
  isSubmitting = true;
  return async ({ result, update }) => {
    console.log('Form result:', result);
    
    // ให้ update handle redirect โดยอัตโนมัติ
    await update({ reset: false });
    
    // ถ้าไม่ redirect (มี error) ให้ reset isSubmitting
    if (result.type !== 'redirect') {
      isSubmitting = false;
    }
  };
}}>
  <div class="login-container">
    <h2>เข้าสู่ระบบ</h2>
    <div class="photo">
      <img src="/Photo/Icon.png" alt="icon" />
    </div>

    {#if data.redirectTo}
      <input type="hidden" name="redirectTo" value={data.redirectTo} />
    {/if}

    <div class="form-group">
      <span class="icon material-symbols-outlined"> email </span>
      <label>
        <input
          name="email"
          type="email"
          placeholder="อีเมล"
          bind:value={email}
          required
          disabled={isSubmitting}
          class="border rounded px-2 py-1 w-full"
        />
      </label>
    </div>

    <div class="form-group">
      <span class="icon material-symbols-outlined"> lock </span>
      <label>
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="รหัสผ่าน"
          bind:value={password}
          required
          disabled={isSubmitting}
          class="border rounded px-2 py-1 w-full"
        />
        <span
          class="passwordicon material-symbols-outlined"
          on:click={() => (showPassword = !showPassword)}
          style="cursor:pointer;"
          >{showPassword ? "visibility" : "visibility_off"}</span
        >
      </label>
    </div>

    <button
      type="submit"
      class="px-4 py-2 rounded bg-blue-600 text-white w-full"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
    </button>

    <div class="divider">
      <span>หรือ</span>
    </div>

    <div class="oauth-buttons">
      <button
        type="button"
        class="oauth-btn google-btn"
        on:click={() => handleOAuthLogin('google')}
        disabled={isOAuthLoading || isSubmitting}
      >
        <svg class="oauth-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        เข้าสู่ระบบด้วย Google
      </button>

      <button
        type="button"
        class="oauth-btn facebook-btn"
        on:click={() => handleOAuthLogin('facebook')}
        disabled={isOAuthLoading || isSubmitting}
      >
        <svg class="oauth-icon" viewBox="0 0 24 24">
          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        เข้าสู่ระบบด้วย Facebook
      </button>

      <button
        type="button"
        class="oauth-btn github-btn"
        on:click={() => handleOAuthLogin('github')}
        disabled={isOAuthLoading || isSubmitting}
      >
        <svg class="oauth-icon" viewBox="0 0 24 24">
          <path fill="#181717" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        เข้าสู่ระบบด้วย GitHub
      </button>
    </div>
  </div>
</form>

<style>
  .login-container {
    width: 300px; /* กำหนดความกว้างตายตัว */
    max-width: 300px;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    background: white;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  h2 {
    text-align: center;
    color: #333;
    font-family: "Noto Sans Thai";
    font-size: 24px;
    font-weight: 400;
    /* margin-bottom: 2rem; */
  }

  .form-group {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative; /* เพื่อให้ icon อยู่ในตำแหน่งที่ถูกต้อง */
  }

  label {
    width: 100%;
    display: flex;
    flex-direction: column;
    color: #555;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
    font-family: "Noto Sans Thai";
    font-size: 14px;
    font-weight: 400;
  }

  input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
  }

  button {
    width: 100%;
    padding: 1rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .photo {
    display: flex;
    justify-content: center; /* จัดให้อยู่กลาง */
    margin-bottom: 1rem;
  }

  .photo img {
    width: 150px;
    height: auto;
  }

  button:hover {
    background-color: #357abd;
  }
  .form-group .icon {
    position: absolute;
    left: 10px;
    top: 42%; /* ปรับตำแหน่งให้เหมาะสม */
    transform: translateY(-50%);
    color: #888;
    pointer-events: none;
  }

  .form-group input {
    width: 100%;
    padding: 10px 10px 10px 40px; /* padding-left เผื่อที่ให้ icon */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    outline: none;
  }
  .form-group .passwordicon {
    position: absolute;
    right: 10px;
    top: 44%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #888;
  }

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.5rem 0;
    color: #888;
    font-size: 0.9rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  .divider span {
    padding: 0 1rem;
  }

  .oauth-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .oauth-btn {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    font-family: "Noto Sans Thai";
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: white;
    color: #333;
  }

  .oauth-btn:hover:not(:disabled) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  .oauth-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .oauth-icon {
    width: 20px;
    height: 20px;
  }

  .google-btn:hover:not(:disabled) {
    border-color: #4285F4;
  }

  .facebook-btn:hover:not(:disabled) {
    border-color: #1877F2;
  }

  .github-btn:hover:not(:disabled) {
    border-color: #181717;
  }
</style>