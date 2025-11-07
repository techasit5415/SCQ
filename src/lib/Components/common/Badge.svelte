<script lang="ts">
	export let variant: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default';
	export let size: 'small' | 'medium' = 'medium';
	export let icon: string = '';
</script>

<span class="badge" class:success={variant === 'success'} class:error={variant === 'error'} 
      class:warning={variant === 'warning'} class:info={variant === 'info'}
      class:small={size === 'small'}>
	{#if icon}
		<span class="material-icons">{icon}</span>
	{/if}
	<slot />
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		border-radius: 16px;
		font-size: 13px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
		background: #e0e0e0;
		color: #666;
		white-space: nowrap;
	}

	.badge.small {
		padding: 4px 8px;
		font-size: 11px;
		border-radius: 12px;
	}

	.badge.small .material-icons {
		font-size: 14px !important;
	}

	.material-icons {
		font-size: 16px;
	}

	.badge.success {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.badge.error {
		background: #ffebee;
		color: #c62828;
	}

	.badge.warning {
		background: #fff3e0;
		color: #e65100;
	}

	.badge.info {
		background: #e3f2fd;
		color: #1565c0;
	}
</style>
