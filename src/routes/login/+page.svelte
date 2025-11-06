<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from './$types';
  
  export let data: PageData;
  export let form;

  let email = "";
  let password = "";
  let showPassword = false;
  let isSubmitting = false;

  $: if (form?.error) {
    alert(form.error);
    isSubmitting = false;
  }
</script>

<form method="POST" use:enhance={() => {
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
</style>