<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let value: string = '';
	export let placeholder: string = 'ค้นหา...';
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher();

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		dispatch('input', value);
	}

	function handleClear() {
		value = '';
		dispatch('input', value);
		dispatch('clear');
	}
</script>

<div class="search-bar">
	<span class="material-icons search-icon">search</span>
	<input
		type="text"
		{placeholder}
		{disabled}
		bind:value
		on:input={handleInput}
		class="search-input"
	/>
	{#if value}
		<button class="clear-btn" on:click={handleClear} aria-label="Clear search">
			<span class="material-icons">close</span>
		</button>
	{/if}
</div>

<style>
	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 10px;
		padding: 0 16px;
		transition: all 0.2s ease;
	}

	.search-bar:focus-within {
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.search-icon {
		color: #999;
		font-size: 20px;
		margin-right: 8px;
	}

	.search-input {
		flex: 1;
		border: none;
		outline: none;
		padding: 12px 0;
		font-size: 14px;
		font-family: 'Noto Sans Thai', sans-serif;
		background: transparent;
	}

	.search-input::placeholder {
		color: #999;
	}

	.search-input:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.clear-btn {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		color: #999;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.clear-btn:hover {
		background: #f5f5f5;
		color: #666;
	}

	.clear-btn .material-icons {
		font-size: 18px;
	}
</style>
