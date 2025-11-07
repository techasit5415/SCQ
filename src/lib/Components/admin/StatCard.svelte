<script lang="ts">
	export let title: string;
	export let value: string | number;
	export let icon: string;
	export let color: string = '#667eea';
	export let trend: 'up' | 'down' | 'neutral' = 'neutral';
	export let trendValue: string = '';
</script>

<div class="stat-card" style="--card-color: {color}">
	<div class="stat-icon">
		<span class="material-icons">{icon}</span>
	</div>
	<div class="stat-content">
		<h4 class="stat-title">{title}</h4>
		<div class="stat-value">{value}</div>
		{#if trendValue}
			<div class="stat-trend" class:up={trend === 'up'} class:down={trend === 'down'}>
				<span class="material-icons">
					{trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
				</span>
				<span>{trendValue}</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		display: flex;
		align-items: flex-start;
		gap: 16px;
		border-left: 4px solid var(--card-color);
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--card-color);
		color: white;
		flex-shrink: 0;
	}

	.material-icons {
		font-size: 24px;
	}

	.stat-content {
		flex: 1;
	}

	.stat-title {
		font-size: 13px;
		font-weight: 500;
		color: #666;
		margin: 0 0 8px 0;
		font-family: 'Noto Sans Thai', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: #333;
		margin-bottom: 4px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.stat-trend {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		font-weight: 500;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.stat-trend.up {
		color: #4caf50;
	}

	.stat-trend.down {
		color: #f44336;
	}

	.stat-trend .material-icons {
		font-size: 16px;
	}
</style>
