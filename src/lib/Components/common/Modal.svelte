<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let show: boolean = false;
	export let title: string = '';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let showCloseButton: boolean = true;

	const dispatch = createEventDispatcher();

	function handleClose() {
		dispatch('close');
	}

	function handleOverlayClick() {
		if (showCloseButton) {
			handleClose();
		}
	}
</script>

{#if show}
	<div class="modal-overlay" on:click={handleOverlayClick}>
		<div class="modal-content" class:small={size === 'small'} class:large={size === 'large'} 
		     on:click|stopPropagation>
			{#if title || showCloseButton}
				<div class="modal-header">
					{#if title}
						<h3>{title}</h3>
					{/if}
					{#if showCloseButton}
						<button class="close-btn" on:click={handleClose} aria-label="Close">
							<span class="material-icons">close</span>
						</button>
					{/if}
				</div>
			{/if}
			<div class="modal-body">
				<slot />
			</div>
			<div class="modal-footer">
				<slot name="footer" />
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
		backdrop-filter: blur(4px);
		animation: fadeIn 0.2s ease;
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
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		width: 100%;
		max-width: 600px;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.modal-content.small {
		max-width: 400px;
	}

	.modal-content.large {
		max-width: 900px;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px 24px 16px;
		border-bottom: 1px solid #e0e0e0;
		gap: 16px;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.close-btn {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		color: #666;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #f5f5f5;
		color: #333;
	}

	.material-icons {
		font-size: 24px;
	}

	.modal-body {
		padding: 24px;
		overflow-y: auto;
		flex: 1;
	}

	.modal-footer {
		padding: 16px 24px;
		border-top: 1px solid #e0e0e0;
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.modal-footer:empty {
		display: none;
	}
</style>
