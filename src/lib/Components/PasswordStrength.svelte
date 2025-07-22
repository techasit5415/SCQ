<script lang="ts">export let strength = 0;</script>
<div class="h-2 bg-gray-200 rounded overflow-hidden">
  <div class="h-full" style="width:{strength * 20}%" class:bg-red-500={strength<=2} class:bg-yellow-500={strength===3} class:bg-green-500={strength>=4}></div>
</div>
<p class="text-xs mt-1">
  {#if strength <= 2}อ่อน{:/if}
  {#if strength === 3}กลาง{:/if}
  {#if strength >= 4}แข็งแรง{:/if}
</p>
```

แล้วใน `+page.svelte`:
```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import PasswordStrength from '$lib/components/PasswordStrength.svelte';
  export let data; // from load
  export let form;
  let username = data.existingAdmin?.username ?? '';
  let password = '';
  let confirm  = '';
  $: strength = calcStrength(password);
  function calcStrength(pw: string){let s=0;if(pw.length>=8)s++;if(/[A-Z]/.test(pw))s++;if(/[a-z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;return s;}
</script>

<h1 class="text-2xl font-bold mb-4">ตั้งรหัสผ่านผู้ดูแล</h1>
<form method="POST" use:enhance>
  <label>Username<input name="username" bind:value={username} required class="border rounded px-2 py-1 w-full" /></label>
  <label class="block mt-3">Password<input type="password" name="password" bind:value={password} required class="border rounded px-2 py-1 w-full" /></label>
  <PasswordStrength {strength} />
  <label class="block mt-3">Confirm<input type="password" name="confirm" bind:value={confirm} required class="border rounded px-2 py-1 w-full" /></label>
  {#if form?.error}<p class="text-red-600 text-sm mt-2">{form.error}</p>{/if}
  <button type="submit" class="mt-4 px-4 py-2 rounded bg-blue-600 text-white">บันทึก</button>
</form>