<script lang="ts">
  import { enhance } from '$app/forms';
  export let data: { hasAdmin: boolean; existingAdmin: { id: number; username: string } | null };
  export let form: any; // SvelteKit form action result

  let username = data.existingAdmin?.username ?? '';
  let password = '';
  let confirm  = '';

  // simple client-side strength check
  $: strength = calcStrength(password);

  function calcStrength(pw: string): number {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-5
  }
  export let strength: number;
  // minimal inline local component
  const PasswordStrength = (/* props injected */) => {};
</script>

<h1 class="text-2xl font-bold mb-4">ตั้งรหัสผ่านผู้ดูแลระบบ (Admin)</h1>
{#if data.hasAdmin}
  <p class="mb-4 text-sm text-gray-500">กำลังแก้ไข admin เดิม: <strong>{data.existingAdmin?.username}</strong></p>
{:else}
  <p class="mb-4 text-sm text-gray-500">ยังไม่มี admin สร้างใหม่เลย</p>
{/if}

{#if form?.error}
  <div class="p-2 mb-4 bg-red-500/20 text-red-700 rounded">{form.error}</div>
{/if}

<form method="POST" use:enhance>
  <div class="mb-3">
    <label class="block mb-1">Username</label>
    <input name="username" bind:value={username} required class="border rounded px-2 py-1 w-full" />
  </div>

  <div class="mb-3">
    <label class="block mb-1">Password</label>
    <input type="password" name="password" bind:value={password} required class="border rounded px-2 py-1 w-full" />
    <PasswordStrength {strength} />
  </div>

  <div class="mb-3">
    <label class="block mb-1">Confirm Password</label>
    <input type="password" name="confirm" bind:value={confirm} required class="border rounded px-2 py-1 w-full" />
  </div>

  <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white">บันทึก</button>
</form>

<!-- inline strength component -->


<!-- quick/dirty: use inline component; in real app split file -->
<svelte:component this={PasswordStrength} strength={strength} />

<!-- define PasswordStrength component inline -->
