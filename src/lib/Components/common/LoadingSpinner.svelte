<script lang="ts">
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let text: string = '';
</script>

<div class="loading-container" class:small={size === 'small'} class:large={size === 'large'}>
	<div class="spinner"></div>
	{#if text}
		<p class="loading-text">{text}</p>
	{/if}
</div>

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 40px 20px;
	}

	.loading-container.small {
		padding: 20px;
	}

	.loading-container.large {
		padding: 80px 20px;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-container.small .spinner {
		width: 32px;
		height: 32px;
		border-width: 3px;
	}

	.loading-container.large .spinner {
		width: 64px;
		height: 64px;
		border-width: 5px;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-text {
		font-size: 14px;
		color: #666;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}
</style>
