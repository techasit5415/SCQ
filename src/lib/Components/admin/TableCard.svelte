<script lang="ts">
	export let title: string;
	export let icon: string = '';
	export let columns: string[] = [];
</script>

<div class="table-card">
	<div class="table-header">
		{#if icon}
			<span class="material-icons">{icon}</span>
		{/if}
		<h3>{title}</h3>
		<div class="table-actions">
			<slot name="actions" />
		</div>
	</div>
	<div class="table-content">
		<table>
			{#if columns.length > 0}
				<thead>
					<tr>
						{#each columns as column}
							<th>{column}</th>
						{/each}
					</tr>
				</thead>
			{/if}
			<tbody>
				<slot />
			</tbody>
		</table>
	</div>
	<div class="table-footer">
		<slot name="footer" />
	</div>
</div>

<style>
	.table-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.table-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 20px 24px;
		border-bottom: 1px solid #e0e0e0;
		background: #fafafa;
	}

	.table-header .material-icons {
		color: #667eea;
		font-size: 24px;
	}

	.table-header h3 {
		flex: 1;
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.table-actions {
		display: flex;
		gap: 8px;
	}

	.table-content {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: #f8f9fa;
	}

	th {
		padding: 12px 24px;
		text-align: left;
		font-size: 13px;
		font-weight: 600;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-family: 'Noto Sans Thai', sans-serif;
		border-bottom: 2px solid #e0e0e0;
	}

	:global(tbody tr) {
		transition: background 0.2s ease;
		border-bottom: 1px solid #f0f0f0;
	}

	:global(tbody tr:hover) {
		background: #f8f9fa;
	}

	:global(tbody td) {
		padding: 16px 24px;
		font-size: 14px;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.table-footer {
		padding: 16px 24px;
		border-top: 1px solid #e0e0e0;
		background: #fafafa;
	}
</style>
