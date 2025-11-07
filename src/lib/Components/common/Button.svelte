<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'ghost' = 'primary';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let disabled: boolean = false;
	export let loading: boolean = false;
	export let icon: string = '';
	export let fullWidth: boolean = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button 
	class="btn"
	class:primary={variant === 'primary'}
	class:secondary={variant === 'secondary'}
	class:success={variant === 'success'}
	class:error={variant === 'error'}
	class:warning={variant === 'warning'}
	class:ghost={variant === 'ghost'}
	class:small={size === 'small'}
	class:large={size === 'large'}
	class:full-width={fullWidth}
	{disabled}
	{type}
	on:click
>
	{#if loading}
		<span class="spinner"></span>
	{:else if icon}
		<span class="material-icons">{icon}</span>
	{/if}
	<slot />
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 20px;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.btn:not(:disabled):active {
		transform: translateY(0);
	}

	.btn.small {
		padding: 6px 14px;
		font-size: 12px;
		border-radius: 6px;
	}

	.btn.large {
		padding: 14px 28px;
		font-size: 16px;
		border-radius: 10px;
	}

	.btn.full-width {
		width: 100%;
	}

	/* Variants */
	.btn.primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn.secondary {
		background: #f5f5f5;
		color: #333;
	}

	.btn.secondary:hover {
		background: #e0e0e0;
	}

	.btn.success {
		background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
		color: white;
	}

	.btn.error {
		background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
		color: white;
	}

	.btn.warning {
		background: linear-gradient(135deg, #ff9800 0%, #e65100 100%);
		color: white;
	}

	.btn.ghost {
		background: transparent;
		color: #667eea;
		border: 1px solid #667eea;
	}

	.btn.ghost:hover {
		background: rgba(102, 126, 234, 0.1);
	}

	.material-icons {
		font-size: 18px;
	}

	.btn.small .material-icons {
		font-size: 16px;
	}

	.btn.large .material-icons {
		font-size: 20px;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
