<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	
	export let message = '';
	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let duration = 3000;
	export let onClose: (() => void) | undefined = undefined;
	
	let visible = true;
	
	const icons = {
		success: '✓',
		error: '✕',
		warning: '⚠',
		info: 'ℹ'
	};
	
	onMount(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				visible = false;
				if (onClose) {
					setTimeout(onClose, 300); // Wait for fade out animation
				}
			}, duration);
			
			return () => clearTimeout(timer);
		}
	});
	
	function handleClose() {
		visible = false;
		if (onClose) {
			setTimeout(onClose, 300);
		}
	}
</script>

{#if visible}
	<div 
		class="toast toast-{type}" 
		transition:fly={{ y: -20, duration: 300 }}
		role="alert"
	>
		<div class="toast-icon">
			{icons[type]}
		</div>
		<div class="toast-message">
			{message}
		</div>
		<button class="toast-close" on:click={handleClose} aria-label="ปิด">
			<span class="material-icons">close</span>
		</button>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		top: 20px;
		right: 20px;
		min-width: 300px;
		max-width: 500px;
		padding: 16px 20px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		gap: 12px;
		z-index: 9999;
		font-family: 'Noto Sans Thai', sans-serif;
	}
	
	.toast-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: bold;
		flex-shrink: 0;
	}
	
	.toast-success .toast-icon {
		background: #d1fae5;
		color: #065f46;
	}
	
	.toast-error .toast-icon {
		background: #fee2e2;
		color: #991b1b;
	}
	
	.toast-warning .toast-icon {
		background: #fef3c7;
		color: #92400e;
	}
	
	.toast-info .toast-icon {
		background: #dbeafe;
		color: #1e40af;
	}
	
	.toast-message {
		flex: 1;
		font-size: 14px;
		color: #333;
		line-height: 1.5;
	}
	
	.toast-close {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		flex-shrink: 0;
		transition: all 0.2s;
	}
	
	.toast-close:hover {
		background: #f5f5f5;
		color: #666;
	}
	
	.toast-close .material-icons {
		font-size: 18px;
	}
	
	/* Border colors */
	.toast-success {
		border-left: 4px solid #10b981;
	}
	
	.toast-error {
		border-left: 4px solid #ef4444;
	}
	
	.toast-warning {
		border-left: 4px solid #f59e0b;
	}
	
	.toast-info {
		border-left: 4px solid #3b82f6;
	}
	
	/* Material Icons Support */
	@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');
</style>
