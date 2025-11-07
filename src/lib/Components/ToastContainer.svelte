<script lang="ts">
	import { toastStore } from '$lib/stores/toast';
	import Toast from './Toast.svelte';
</script>

<div class="toast-container">
	{#each $toastStore as toast (toast.id)}
		<Toast 
			message={toast.message}
			type={toast.type}
			duration={toast.duration}
			onClose={() => toastStore.remove(toast.id)}
		/>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 12px;
		pointer-events: none;
	}
	
	.toast-container :global(.toast) {
		pointer-events: auto;
	}
</style>
