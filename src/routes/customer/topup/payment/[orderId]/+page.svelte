<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import PromptPayQR from '$lib/Components/payment/PromptPayQR.svelte';

	export let data: PageData;

	let isUploading = false;
	let slipFile: File | null = null;
	let slipPreview: string = '';
	let fileInput: HTMLInputElement;

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			// ตรวจสอบประเภทไฟล์
			if (!file.type.startsWith('image/')) {
				toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
				return;
			}
			
			// ตรวจสอบขนาดไฟล์
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

	function goBack() {
		goto('/customer/topup');
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

<svelte:head>
	<title>ชำระเงินเติม Point</title>
</svelte:head>

<div class="payment-page">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" on:click={goBack}>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		<h1 class="title">ชำระเงินเติม Point</h1>
	</div>

	<div class="content">
		<!-- Order Info -->
		<div class="order-info-card">
			<div class="order-header">
				<h2>เติมเงิน</h2>
				<span class="status-badge pending">รอชำระเงิน</span>
			</div>
			<div class="order-details">
				<div class="detail-row">
					<span class="label">วันที่สร้างคำขอ</span>
					<span class="value">{formatDate(data.order.created)}</span>
				</div>
				<div class="detail-row total">
					<span class="label">จำนวนเงิน</span>
					<span class="value">฿{data.order.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
				</div>
				<div class="detail-row">
					<span class="label">Point ที่จะได้รับ</span>
					<span class="value point-highlight">+{data.order.total} Point</span>
				</div>
			</div>
		</div>

		<!-- PromptPay QR Code -->
		<div class="qr-section">
			<div class="payment-method-badge">
				<span class="icon">💳</span>
				<span>เติมเงินเข้า SCQ Point</span>
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
					<path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
					
					return async ({ result, update }) => {
						isUploading = false;
						
						if (result.type === 'success') {
							if (result.data?.success) {
								toast.success('อัพโหลดสำเร็จ! กำลังรอการตรวจสอบจากระบบ');
								setTimeout(() => {
									goto('/customer/topup');
								}, 1500);
							} else {
								toast.error(result.data?.error || 'เกิดข้อผิดพลาด');
							}
						} else {
							await update();
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
						<img src={slipPreview} alt="Slip preview" />
						<button type="button" class="remove-btn" on:click={removeSlip}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
					class="submit-btn"
					disabled={isUploading || !slipFile}
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
				หลังจากอัพโหลดหลักฐาน ระบบจะตรวจสอบและเพิ่ม Point ให้ท่านภายใน 5-10 นาที
			</p>
		</div>
	</div>
</div>

<style>
	.payment-page {
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

	.order-info-card, .upload-section {
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
	}

	.detail-row .label {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.detail-row .value {
		color: #111827;
		font-weight: 500;
	}

	.detail-row.total {
		padding-top: 12px;
		border-top: 1px solid #e5e7eb;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.detail-row.total .value {
		color: #1e40af;
	}

	.point-highlight {
		color: #667eea !important;
		font-size: 1.125rem;
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

	.remove-btn {
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

	.remove-btn:hover {
		background: rgba(0, 0, 0, 0.9);
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
		margin-bottom: 16px;
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

	.info-text {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 0.875rem;
		color: #6b7280;
		line-height: 1.5;
		margin: 0;
	}

	.info-text svg {
		flex-shrink: 0;
		margin-top: 2px;
		color: #3b82f6;
	}
</style>
