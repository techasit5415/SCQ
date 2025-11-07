<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;

	let selectedAmount = 100;
	let customAmount = '';
	let isSubmitting = false;

	const quickAmounts = [50, 100, 200, 500, 1000, 2000];

	function selectAmount(amount: number) {
		selectedAmount = amount;
		customAmount = '';
	}

	function handleCustomAmountChange() {
		const value = parseInt(customAmount);
		if (!isNaN(value) && value > 0) {
			selectedAmount = value;
		}
	}

	function goBack() {
		goto('/customer/profile');
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('th-TH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>เติม SCQ Point</title>
</svelte:head>

<div class="topup-page">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" on:click={goBack} aria-label="กลับ">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		<h1 class="title">เติม SCQ Point</h1>
	</div>

	<div class="content">
		<!-- Current Points Card -->
		<div class="points-card">
			<div class="points-icon">💎</div>
			<div class="points-info">
				<p class="points-label">Point คงเหลือ</p>
				<p class="points-value">{data.currentPoints.toLocaleString('th-TH')} Point</p>
			</div>
		</div>

		<!-- Topup Form -->
		<div class="topup-form-card">
			<h2>เลือกจำนวนเงินที่ต้องการเติม</h2>
			
			<!-- Quick Amount Buttons -->
			<div class="amount-grid">
				{#each quickAmounts as amount}
					<button
						type="button"
						class="amount-btn"
						class:selected={selectedAmount === amount && !customAmount}
						on:click={() => selectAmount(amount)}
					>
						฿{amount}
					</button>
				{/each}
			</div>

			<!-- Custom Amount Input -->
			<div class="custom-amount">
				<label for="customAmount">หรือระบุจำนวนเอง</label>
				<div class="input-wrapper">
					<span class="currency">฿</span>
					<input
						id="customAmount"
						type="number"
						bind:value={customAmount}
						on:input={handleCustomAmountChange}
						placeholder="0"
						min="1"
						step="1"
					/>
				</div>
			</div>

			<!-- Summary -->
			<div class="summary">
				<div class="summary-row">
					<span>จำนวนเงิน</span>
					<span>฿{selectedAmount.toLocaleString('th-TH')}</span>
				</div>
				<div class="summary-row total">
					<span>Point ที่จะได้รับ</span>
					<span class="point-value">+{selectedAmount.toLocaleString('th-TH')} Point</span>
				</div>
				<p class="note">* 1 บาท = 1 Point</p>
			</div>

			<!-- Submit Form -->
			<form method="POST" action="?/createTopup" use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					console.log('📋 Form result:', result);
					isSubmitting = false;
					
					// ถ้า server ส่ง redirect มาให้ทำการ redirect
					if (result.type === 'redirect') {
						console.log('🔄 Redirecting to:', result.location);
						goto(result.location);
					} else {
						console.log('⚠️ Not redirecting, result type:', result.type);
						await update();
					}
				};
			}}>
				<input type="hidden" name="amount" value={selectedAmount} />
				
				<button
					type="submit"
					class="submit-btn"
					disabled={isSubmitting || selectedAmount < 1}
				>
					{#if isSubmitting}
						<span class="loading-spinner"></span>
						กำลังดำเนินการ...
					{:else}
						ดำเนินการเติมเงิน
					{/if}
				</button>
			</form>
		</div>

		<!-- Topup History -->
		{#if data.topupHistory && data.topupHistory.length > 0}
			<div class="history-card">
				<h2>ประวัติการเติมเงิน</h2>
				<div class="history-list">
					{#each data.topupHistory as item}
						<div class="history-item">
							<div class="history-icon">
								{#if item.status === 'Success'}
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								{:else}
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								{/if}
							</div>
							<div class="history-details">
								<p class="history-amount">+{item.Total_Amount} Point</p>
								<p class="history-date">{formatDate(item.created)}</p>
							</div>
							<div class="history-status" class:success={item.status === 'Success'} class:pending={item.status === 'Pending'}>
								{item.status === 'Success' ? 'สำเร็จ' : 'รอยืนยัน'}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Info Card -->
		<div class="info-card">
			<h3>📌 วิธีการเติมเงิน</h3>
			<ol>
				<li>เลือกจำนวนเงินที่ต้องการเติม</li>
				<li>กดปุ่ม "ดำเนินการเติมเงิน"</li>
				<li>สแกน QR Code PromptPay เพื่อโอนเงิน</li>
				<li>อัพโหลดหลักฐานการโอนเงิน</li>
				<li>รอการตรวจสอบจากระบบ</li>
				<li>Point จะเข้าสู่ระบบอัตโนมัติ</li>
			</ol>
		</div>
	</div>
</div>

<style>
	.topup-page {
		min-height: 100vh;
		background: #f9fafb;
	}

	.header {
		background: white;
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 16px;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.back-btn {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		color: #374151;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.back-btn:hover {
		background: #f3f4f6;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: #111827;
	}

	.content {
		max-width: 600px;
		margin: 0 auto;
		padding: 24px 16px;
	}

	.points-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16px;
		padding: 24px;
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 24px;
		box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
	}

	.points-icon {
		font-size: 3rem;
	}

	.points-info {
		flex: 1;
	}

	.points-label {
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
		margin: 0 0 4px 0;
	}

	.points-value {
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
	}

	.topup-form-card, .history-card, .info-card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 24px;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}

	h2 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 20px 0;
		color: #111827;
	}

	.amount-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 24px;
	}

	.amount-btn {
		background: white;
		border: 2px solid #e5e7eb;
		padding: 16px;
		border-radius: 12px;
		font-size: 1.125rem;
		font-weight: 600;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s;
	}

	.amount-btn:hover {
		border-color: #667eea;
		background: #eff6ff;
	}

	.amount-btn.selected {
		border-color: #667eea;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.custom-amount {
		margin-bottom: 24px;
	}

	.custom-amount label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 8px;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.currency {
		position: absolute;
		left: 16px;
		font-size: 1.125rem;
		font-weight: 600;
		color: #6b7280;
	}

	.custom-amount input {
		width: 100%;
		padding: 14px 16px 14px 40px;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		font-size: 1.125rem;
		font-weight: 600;
		transition: border-color 0.2s;
	}

	.custom-amount input:focus {
		outline: none;
		border-color: #667eea;
	}

	.summary {
		background: #f9fafb;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 24px;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
		color: #374151;
	}

	.summary-row.total {
		padding-top: 12px;
		border-top: 1px solid #e5e7eb;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.point-value {
		color: #667eea;
		font-size: 1.25rem;
	}

	.note {
		text-align: center;
		font-size: 0.75rem;
		color: #6b7280;
		margin: 8px 0 0 0;
	}

	.submit-btn {
		width: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 16px;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.3);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.history-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: #f9fafb;
		border-radius: 12px;
	}

	.history-icon {
		flex-shrink: 0;
	}

	.history-details {
		flex: 1;
	}

	.history-amount {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 4px 0;
	}

	.history-date {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
	}

	.history-status {
		padding: 4px 12px;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.history-status.success {
		background: #d1fae5;
		color: #065f46;
	}

	.history-status.pending {
		background: #fef3c7;
		color: #92400e;
	}

	.info-card {
		background: #eff6ff;
		border: 1px solid #bfdbfe;
	}

	.info-card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1e40af;
		margin: 0 0 12px 0;
	}

	.info-card ol {
		margin: 0;
		padding-left: 20px;
		color: #374151;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.info-card li {
		margin-bottom: 4px;
	}
</style>
