<script lang="ts">
	export let icon: string = 'inbox';
	export let title: string = 'ไม่มีข้อมูล';
	export let message: string = '';
	export let actionText: string = '';
	export let actionHref: string = '';
</script>

<div class="empty-state">
	<div class="empty-icon">
		<span class="material-icons">{icon}</span>
	</div>
	<h3>{title}</h3>
	{#if message}
		<p>{message}</p>
	{/if}
	<slot />
	{#if actionText && actionHref}
		<a href={actionHref} class="empty-action">
			{actionText}
		</a>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		text-align: center;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20px;
	}

	.material-icons {
		font-size: 40px;
		color: #999;
	}

	h3 {
		font-size: 20px;
		font-weight: 600;
		color: #333;
		margin: 0 0 8px 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	p {
		font-size: 14px;
		color: #666;
		margin: 0 0 24px 0;
		max-width: 400px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.empty-action {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 24px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
		transition: all 0.2s ease;
	}

	.empty-action:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}
</style>
