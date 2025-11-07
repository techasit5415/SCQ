<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toastStore } from '$lib/stores/toast';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import PromptPayQR from '$lib/Components/payment/PromptPayQR.svelte';

	export let data: PageData;

	console.log('🎯 Advertise Payment Page Loaded!');
	console.log('📦 Order:', data.order);
	console.log('🏪 Restaurant:', data.restaurant);
	console.log('📱 Admin Phone:', data.adminPhone);

	let isUploading = false;
	let slipFile: File | null = null;
	let slipPreview: string = '';
	let fileInput: HTMLInputElement;

	// Timer - 5 นาที
	const PAYMENT_TIMEOUT = 5 * 60;
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

	onMount(() => {
		// คำนวณเวลาที่เหลือตอนเปิดหน้า
		timeLeft = calculateTimeLeft();

		// ตั้ง timer
		timerInterval = setInterval(() => {
			timeLeft = calculateTimeLeft();
			if (timeLeft <= 0) {
				isExpired = true;
				clearInterval(timerInterval);
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
			if (!file.type.startsWith('image/')) {
				toastStore.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
				return;
			}
			
			if (file.size > 5 * 1024 * 1024) {
				toastStore.error('ไฟล์ใหญ่เกิน 5MB');
				return;
			}
			
			slipFile = file;
			
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

	function goBack() {
		goto(`/restaurant/${data.restaurant.id}/advertise`);
	}

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

<div class="payment-page">
	<div class="container">
		<div class="header">
			<button class="back-btn" on:click={goBack}>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
					<path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				กลับ
			</button>
			<h1>ชำระเงินโฆษณา</h1>
		</div>

		{#if isExpired}
			<div class="error-card">
				<h2>หมดเวลาชำระเงิน</h2>
				<p>การชำระเงินหมดเวลาแล้ว กรุณาสั่งซื้อใหม่</p>
				<button class="btn-primary" on:click={goBack}>
					กลับไปหน้าโฆษณา
				</button>
			</div>
		{:else}
			<!-- Order Info -->
			<div class="order-info">
				<h2>📦 รายละเอียดการสั่งซื้อ</h2>
				<div class="info-grid">
					<div class="info-item">
						<span class="label">Order ID:</span>
						<span class="value">{data.order.id}</span>
					</div>
					<div class="info-item">
						<span class="label">จำนวนเงิน:</span>
						<span class="value amount">฿{data.order.total}</span>
					</div>
					<div class="info-item">
						<span class="label">เวลาสั่งซื้อ:</span>
						<span class="value">{formatDate(data.order.created)}</span>
					</div>
					<div class="info-item">
						<span class="label">เวลาที่เหลือ:</span>
						<span class="value timer" class:warning={timeLeft < 60}>{formatTime(timeLeft)}</span>
					</div>
				</div>
			</div>

			<!-- QR Code Section -->
			<div class="qr-section">
				<div class="qr-header">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M15 3h4a2 2 0 0 1 2 2v4m0 6v4a2 2 0 0 1-2 2h-4m-6 0H5a2 2 0 0 1-2-2v-4m0-6V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>สแกน QR Code เพื่อชำระเงิน</span>
				</div>
				
				<PromptPayQR 
					phoneNumber={data.adminPhone}
					amount={data.order.total}
					shopName="SCQ System"
				/>
			</div>

			<!-- Upload Slip Section -->
			<div class="upload-section">
				<h3 class="section-title">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
							toastStore.error('กรุณาเลือกไฟล์หลักฐานการโอนเงิน');
							return ({ cancel }) => cancel();
						}
						
						isUploading = true;
						
						return async ({ result }) => {
							isUploading = false;
							
							if (result.type === 'success') {
								if (result.data?.success) {
									toastStore.success('อัพโหลดสำเร็จ! โฆษณาได้รับการสร้างแล้ว');
									setTimeout(() => {
										goBack();
									}, 2000);
								} else {
									toastStore.error(result.data?.error || 'เกิดข้อผิดพลาด');
								}
							}
						};
					}}
				>
					<input
						bind:this={fileInput}
						type="file"
						name="slip"
						accept="image/*"
						on:change={handleFileSelect}
						class="file-input"
					/>

					{#if slipPreview}
						<div class="slip-preview">
							<img src={slipPreview} alt="หลักฐานการโอนเงิน" />
							<button 
								type="button" 
								class="remove-slip-btn" 
								on:click={removeSlip}
								disabled={isUploading}
								aria-label="ลบรูปหลักฐาน"
							>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
								</svg>
							</button>
						</div>
					{:else}
						<button type="button" class="upload-area" on:click={() => fileInput.click()}>
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
								<path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<p class="upload-text">คลิกเพื่ออัพโหลดหลักฐานการโอนเงิน</p>
							<p class="upload-hint">รองรับไฟล์: JPG, PNG (ไม่เกิน 5MB)</p>
						</button>
					{/if}

					<button 
						type="submit" 
						class="btn-primary"
						disabled={!slipFile || isUploading}
					>
						{#if isUploading}
							<span class="loading-spinner"></span>
							กำลังอัพโหลด...
						{:else}
							ยืนยันการโอนเงิน
						{/if}
					</button>
				</form>

				<p class="info-text">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
						<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					หลังจากอัพโหลดหลักฐาน ระบบจะตรวจสอบและสร้างโฆษณาให้ภายใน 5-10 นาที
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.payment-page {
		min-height: 100vh;
		background: #f9fafb;
		padding: 20px;
	}

	.container {
		max-width: 600px;
		margin: 0 auto;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 24px;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		background: white;
		border: 1px solid #e5e7eb;
		padding: 8px 16px;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		color: #6b7280;
		font-size: 14px;
	}

	.back-btn:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	h1 {
		font-size: 28px;
		font-weight: 700;
		color: #111827;
		margin: 0;
	}

	.order-info, .qr-section, .upload-section {
		background: white;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 20px;
		border: 1px solid #e5e7eb;
	}

	.order-info h2 {
		font-size: 18px;
		font-weight: 600;
		color: #111827;
		margin: 0 0 16px 0;
	}

	.info-grid {
		display: grid;
		gap: 12px;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.label {
		font-size: 14px;
		color: #6b7280;
	}

	.value {
		font-size: 14px;
		color: #111827;
		font-weight: 500;
	}

	.amount {
		font-size: 18px;
		color: #059669;
		font-weight: 700;
	}

	.timer {
		font-family: 'Courier New', monospace;
		font-size: 16px;
		font-weight: 700;
		color: #059669;
	}

	.timer.warning {
		color: #dc2626;
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.qr-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 0 0 20px 0;
		color: #111827;
		font-size: 16px;
		font-weight: 600;
	}

	.qr-header svg {
		color: #3b82f6;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 16px;
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
		width: 100%;
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
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		padding: 8px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.remove-slip-btn:hover {
		background: rgba(0, 0, 0, 0.9);
	}

	.btn-primary {
		width: 100%;
		background: #3b82f6;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.info-text {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 14px;
		color: #6b7280;
		margin-top: 16px;
		padding: 12px;
		background: #f3f4f6;
		border-radius: 8px;
	}

	.info-text svg {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.error-card {
		background: white;
		border-radius: 12px;
		padding: 32px;
		text-align: center;
		border: 1px solid #fecaca;
		background-color: #fef2f2;
	}

	.error-card h2 {
		color: #dc2626;
		margin: 0 0 12px 0;
	}

	.error-card p {
		color: #6b7280;
		margin: 0 0 24px 0;
	}
</style>