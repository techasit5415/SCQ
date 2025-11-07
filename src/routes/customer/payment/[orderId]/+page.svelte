<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import PromptPayQR from '$lib/Components/payment/PromptPayQR.svelte';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

	export let data: PageData;

	// Debug: ดูข้อมูลที่ได้
	console.log('� Payment Page Loaded!');
	console.log('📦 Order:', data.order);
	console.log('🏪 Restaurant:', data.restaurant);
	console.log('� Phone:', data.restaurant?.phone);

	let isUploading = false;
	let slipFile: File | null = null;
	let slipPreview: string = '';
	let fileInput: HTMLInputElement;

	// ⏰ Timer - 5 นาที
	const PAYMENT_TIMEOUT = 5 * 60; // 300 วินาที
	let timeLeft = PAYMENT_TIMEOUT;
	let timerInterval: any;
	let isExpired = false;

	function calculateTimeLeft() {
		const createdTime = new Date(data.order.created).getTime();
		const now = Date.now();
		const elapsed = Math.floor((now - createdTime) / 1000);
		const remaining = PAYMENT_TIMEOUT - elapsed;
		return remaining > 0 ? remaining : 0;
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	async function cancelExpiredOrder() {
		try {
			await fetch(`?/cancelOrder`, { method: 'POST' });
			toast.error('หมดเวลาชำระเงิน Order ถูกยกเลิกแล้ว');
			setTimeout(() => goto('/customer/orders'), 2000);
		} catch (error) {
			console.error('Error canceling order:', error);
		}
	}

	onMount(() => {
		timeLeft = calculateTimeLeft();
		if (timeLeft === 0) {
			isExpired = true;
			cancelExpiredOrder();
			return;
		}
		timerInterval = setInterval(() => {
			timeLeft = calculateTimeLeft();
			if (timeLeft === 0) {
				isExpired = true;
				clearInterval(timerInterval);
				cancelExpiredOrder();
			}
		}, 1000);
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			// ตรวจสอบประเภทไฟล์
			if (!file.type.startsWith('image/')) {
				toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
				return;
			}

			// ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error('ไฟล์ใหญ่เกิน 5MB');
				return;
			}

			slipFile = file;
			
			// สร้าง preview
			const reader = new FileReader();
			reader.onload = (e) => {
				slipPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function removeSlip() {
		slipFile = null;
		slipPreview = '';
		if (fileInput) fileInput.value = '';
	}

	function goToOrders() {
		goto('/customer/orders');
	}

	// Format timestamp
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('th-TH', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>ชำระเงิน - Order #{data.order.order_number}</title>
</svelte:head>

<div class="payment-page">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" on:click={goToOrders}>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		<h1 class="title">ชำระเงิน</h1>
	</div>

	<div class="content">
		<!-- Order Info -->
		<div class="order-info-card">
			<div class="order-header">
				<h2>Order #{data.order.order_number}</h2>
				<span class="status-badge pending">
					{data.order.payment_slip ? 'รอยืนยัน' : 'รอชำระเงิน'}
				</span>
			</div>
			<div class="order-details">
				<div class="detail-row">
					<span class="label">ร้านค้า</span>
					<span class="value">{data.restaurant?.name || 'ไม่ระบุ'}</span>
				</div>
				<div class="detail-row">
					<span class="label">วันที่สั่ง</span>
					<span class="value">{formatDate(data.order.created)}</span>
				</div>
				<div class="detail-row total">
					<span class="label">ยอดรวม</span>
					<span class="value">฿{data.order.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
				</div>
			</div>
		</div>

		<!-- PromptPay QR Code -->
		{#if data.recipient?.phone}
			<!-- ⏰ Countdown Timer -->
			<div class="timer-card" class:warning={timeLeft <= 60} class:expired={isExpired}>
				<div class="timer-icon">
					{#if isExpired}
						⏰
					{:else if timeLeft <= 60}
						⚠️
					{:else}
						⏱️
					{/if}
				</div>
				<div class="timer-content">
					<p class="timer-label">
						{#if isExpired}
							หมดเวลาชำระเงิน
						{:else if timeLeft <= 60}
							เหลือเวลาอีก
						{:else}
							เวลาที่เหลือ
						{/if}
					</p>
					<p class="timer-value">{formatTime(timeLeft)}</p>
					{#if !isExpired}
						<p class="timer-hint">กรุณาชำระเงินภายในเวลาที่กำหนด</p>
					{/if}
				</div>
			</div>

			<div class="qr-section">
				<div class="payment-method-badge">
					{#if data.paymentMethod === 'Point'}
						<span class="icon">💳</span>
						<span>ชำระด้วย SCQ Point</span>
					{:else}
						<span class="icon">📱</span>
						<span>ชำระด้วย QR Code</span>
					{/if}
				</div>
				
				<PromptPayQR 
					phoneNumber={data.recipient.phone}
					amount={data.order.total}
					shopName={data.recipient.name}
				/>
			</div>
		{:else}
			<div class="error-card">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ef4444"/>
				</svg>
				<p>ไม่พบข้อมูลการชำระเงิน</p>
				<button class="btn-secondary" on:click={goToOrders}>กลับไปหน้ารายการ</button>
			</div>
		{/if}

		<!-- Upload Slip Section -->
		{#if data.restaurant?.phone}
			<div class="upload-section">
				<h3 class="section-title">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
					</svg>
					อัพโหลดหลักฐานการโอนเงิน
				</h3>
				
				<form 
					method="POST" 
					action="?/uploadSlip"
					enctype="multipart/form-data"
					use:enhance={() => {
						if (!slipFile) {
							toast.error('กรุณาเลือกไฟล์หลักฐานการโอนเงิน');
							return ({ cancel }) => cancel();
						}
						
						isUploading = true;
						
						return async ({ result }) => {
							isUploading = false;
							
							if (result.type === 'success') {
								// Check if data exists and has success property
								if (result.data && typeof result.data === 'object' && 'success' in result.data) {
									if (result.data.success) {
										toast.success('ส่งหลักฐานการโอนเงินเรียบร้อยแล้ว!');
										setTimeout(() => {
											goto('/customer/orders');
										}, 1500);
									} else {
										const errorMsg = result.data.error || 'เกิดข้อผิดพลาดในการอัพโหลด';
										toast.error(errorMsg);
									}
								} else {
									// Form submitted successfully but no explicit success flag
									toast.success('ส่งหลักฐานการโอนเงินเรียบร้อยแล้ว!');
									setTimeout(() => {
										goto('/customer/orders');
									}, 1500);
								}
							} else if (result.type === 'failure') {
								const errorMsg = result.data?.error || 'เกิดข้อผิดพลาดในการอัพโหลด';
								toast.error(errorMsg);
							} else {
								toast.error('เกิดข้อผิดพลาดในการอัพโหลด');
							}
						};
					}}
				>
					<input 
						type="file" 
						name="slip"
						accept="image/*"
						on:change={handleFileSelect}
						bind:this={fileInput}
						class="file-input"
						id="slip-input"
						disabled={isUploading}
					/>
					
					{#if !slipPreview}
						<label for="slip-input" class="upload-area">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
								<path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z" fill="currentColor"/>
							</svg>
							<p class="upload-text">คลิกเพื่อเลือกรูปภาพ</p>
							<p class="upload-hint">รองรับไฟล์ JPG, PNG (สูงสุด 5MB)</p>
						</label>
					{:else}
						<div class="slip-preview">
							<img src={slipPreview} alt="หลักฐานการโอนเงิน" />
							<button 
								type="button" 
								class="remove-slip-btn" 
								on:click={removeSlip}
								disabled={isUploading}
							>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
								</svg>
							</button>
						</div>
					{/if}

					<button 
						type="submit" 
						class="btn-primary"
						disabled={!slipFile || isUploading}
					>
						{isUploading ? 'กำลังส่ง...' : 'ส่งหลักฐานการโอนเงิน'}
					</button>
				</form>

				<div class="info-box">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#3b82f6"/>
					</svg>
					<p>หลังจากโอนเงินเรียบร้อย กรุณาถ่ายภาพหลักฐานและอัพโหลดที่นี่ ทางร้านจะตรวจสอบและยืนยันคำสั่งซื้อของคุณ</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.payment-page {
		min-height: 100vh;
		background: #f9fafb;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.back-btn {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #374151;
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

	/* ⏰ Timer Card */
	.timer-card {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 24px;
		display: flex;
		align-items: center;
		gap: 20px;
		box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
		transition: all 0.3s;
	}

	.timer-card.warning {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		animation: pulse 2s infinite;
	}

	.timer-card.expired {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.02); }
	}

	.timer-icon {
		font-size: 3rem;
		filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
	}

	.timer-content {
		flex: 1;
		color: white;
	}

	.timer-label {
		font-size: 0.875rem;
		opacity: 0.9;
		margin: 0 0 8px 0;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.timer-value {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0;
		font-family: 'Courier New', monospace;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.timer-hint {
		font-size: 0.875rem;
		opacity: 0.8;
		margin: 8px 0 0 0;
	}

	.content {
		max-width: 600px;
		margin: 0 auto;
		padding: 24px 16px;
	}

	.order-info-card {
		background: white;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 24px;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		padding-bottom: 16px;
		border-bottom: 1px solid #e5e7eb;
	}

	.order-header h2 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		color: #111827;
	}

	.status-badge {
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.status-badge.pending {
		background: #fef3c7;
		color: #92400e;
	}

	.order-details {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9375rem;
	}

	.detail-row .label {
		color: #6b7280;
	}

	.detail-row .value {
		color: #111827;
		font-weight: 500;
	}

	.detail-row.total {
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px solid #e5e7eb;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.detail-row.total .value {
		color: #1e40af;
	}

	.qr-section {
		margin-bottom: 24px;
	}

	.payment-method-badge {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 12px 20px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-weight: 600;
		margin-bottom: 20px;
		box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
	}

	.payment-method-badge .icon {
		font-size: 1.5rem;
	}

	.error-card {
		background: white;
		border-radius: 12px;
		padding: 40px 20px;
		text-align: center;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}

	.error-card svg {
		margin-bottom: 16px;
	}

	.error-card p {
		color: #6b7280;
		margin: 0 0 24px 0;
	}

	.upload-section {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 20px 0;
		color: #111827;
	}

	.section-title svg {
		color: #3b82f6;
	}

	.file-input {
		display: none;
	}

	.upload-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		border: 2px dashed #d1d5db;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		background: #f9fafb;
		margin-bottom: 16px;
	}

	.upload-area:hover {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.upload-area svg {
		color: #9ca3af;
		margin-bottom: 12px;
	}

	.upload-text {
		font-size: 1rem;
		font-weight: 500;
		color: #374151;
		margin: 0 0 4px 0;
	}

	.upload-hint {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.slip-preview {
		position: relative;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 16px;
		border: 2px solid #e5e7eb;
	}

	.slip-preview img {
		width: 100%;
		height: auto;
		display: block;
	}

	.remove-slip-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		background: rgba(239, 68, 68, 0.9);
		color: white;
		border: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.remove-slip-btn:hover {
		background: #dc2626;
		transform: scale(1.1);
	}

	.btn-primary,
	.btn-secondary {
		width: 100%;
		padding: 14px 24px;
		border: none;
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		background: #d1d5db;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}

	.info-box {
		display: flex;
		gap: 12px;
		padding: 16px;
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		border-radius: 8px;
		margin-top: 16px;
	}

	.info-box svg {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.info-box p {
		font-size: 0.875rem;
		color: #1e40af;
		margin: 0;
		line-height: 1.6;
	}

	@media (max-width: 640px) {
		.content {
			padding: 16px 12px;
		}

		.order-info-card,
		.upload-section {
			border-radius: 8px;
		}
	}
</style>
