<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import generatePayload from 'promptpay-qr';

	export let phoneNumber: string;
	export let amount: number;
	export let shopName: string = 'ร้านค้า';

	let qrCodeDataUrl = '';
	let isGenerating = true;
	let error = '';

	// แปลงเบอร์โทรเป็นรูปแบบที่ PromptPay ต้องการ (66XXXXXXXXX)
	function formatPhoneNumber(phone: string): string {
		// ลบอักขระที่ไม่ใช่ตัวเลข
		const cleaned = phone.replace(/\D/g, '');
		
		// ถ้าขึ้นต้นด้วย 0 ให้เอาออกแล้วเติม 66 ข้างหน้า
		if (cleaned.startsWith('0')) {
			return '66' + cleaned.substring(1);
		}
		// ถ้าขึ้นต้นด้วย 66 แล้ว ใช้เลย
		if (cleaned.startsWith('66')) {
			return cleaned;
		}
		// ถ้าไม่มี 0 และ 66 ให้เติม 66 ข้างหน้า
		return '66' + cleaned;
	}

	async function generateQR() {
		try {
			isGenerating = true;
			error = '';

			// แปลงเบอร์โทร
			const formattedPhone = formatPhoneNumber(phoneNumber);
			
			// สร้าง PromptPay payload
			const payload = generatePayload(formattedPhone, { amount });

			// สร้าง QR Code เป็น Data URL
			qrCodeDataUrl = await QRCode.toDataURL(payload, {
				width: 300,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			});

			isGenerating = false;
		} catch (err) {
			console.error('Error generating QR:', err);
			error = 'ไม่สามารถสร้าง QR Code ได้ กรุณาตรวจสอบหมายเลข PromptPay';
			isGenerating = false;
		}
	}

	onMount(() => {
		generateQR();
	});

	// Regenerate QR when amount or phone changes
	$: if (phoneNumber && amount) {
		generateQR();
	}
</script>

<div class="promptpay-qr-container">
	<div class="qr-header">
		<div class="promptpay-logo">
			<div class="logo-circle">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
				</svg>
			</div>
		</div>
		<h3 class="shop-name">{shopName}</h3>
		<p class="payment-label">ชำระเงินผ่าน PromptPay</p>
	</div>

	<div class="qr-body">
		{#if isGenerating}
			<div class="qr-loading">
				<div class="spinner"></div>
				<p>กำลังสร้าง QR Code...</p>
			</div>
		{:else if error}
			<div class="qr-error">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ef4444"/>
				</svg>
				<p class="error-text">{error}</p>
			</div>
		{:else}
			<div class="qr-code-wrapper">
				<img src={qrCodeDataUrl} alt="PromptPay QR Code" class="qr-image" />
			</div>
			
			<div class="amount-display">
				<p class="amount-label">ยอดที่ต้องชำระ</p>
				<p class="amount-value">฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
			</div>
		{/if}
	</div>

	<div class="qr-footer">
		<div class="instructions">
			<h4>วิธีชำระเงิน</h4>
			<ol>
				<li>เปิดแอปธนาคารหรือแอป Mobile Banking</li>
				<li>เลือกเมนู "สแกน QR Code"</li>
				<li>สแกน QR Code ด้านบน</li>
				<li>ตรวจสอบยอดเงินและยืนยันการชำระเงิน</li>
				<li>บันทึกหลักฐานการโอนเงิน</li>
			</ol>
		</div>

		<div class="phone-info">
			<p>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
				</svg>
				PromptPay: {phoneNumber}
			</p>
		</div>
	</div>
</div>

<style>
	.promptpay-qr-container {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		overflow: hidden;
		max-width: 400px;
		margin: 0 auto;
	}

	.qr-header {
		background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
		color: white;
		padding: 24px;
		text-align: center;
	}

	.promptpay-logo {
		display: flex;
		justify-content: center;
		margin-bottom: 12px;
	}

	.logo-circle {
		width: 48px;
		height: 48px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10px);
	}

	.logo-circle svg {
		width: 28px;
		height: 28px;
		color: white;
	}

	.shop-name {
		font-size: 20px;
		font-weight: 600;
		margin: 0 0 8px 0;
	}

	.payment-label {
		font-size: 14px;
		opacity: 0.9;
		margin: 0;
	}

	.qr-body {
		padding: 32px 24px;
		background: #f9fafb;
	}

	.qr-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 40px 0;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #e5e7eb;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.qr-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 40px 20px;
	}

	.error-text {
		color: #ef4444;
		text-align: center;
		margin: 0;
	}

	.qr-code-wrapper {
		background: white;
		padding: 20px;
		border-radius: 12px;
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}

	.qr-image {
		max-width: 300px;
		width: 100%;
		height: auto;
		display: block;
	}

	.amount-display {
		text-align: center;
		padding: 16px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}

	.amount-label {
		font-size: 14px;
		color: #6b7280;
		margin: 0 0 8px 0;
	}

	.amount-value {
		font-size: 32px;
		font-weight: 700;
		color: #1f2937;
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.qr-footer {
		padding: 24px;
		background: white;
		border-top: 1px solid #e5e7eb;
	}

	.instructions h4 {
		font-size: 16px;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 12px 0;
	}

	.instructions ol {
		margin: 0;
		padding-left: 20px;
		color: #6b7280;
		font-size: 14px;
		line-height: 1.8;
	}

	.instructions li {
		margin-bottom: 6px;
	}

	.phone-info {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid #e5e7eb;
	}

	.phone-info p {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: #6b7280;
		margin: 0;
	}

	.phone-info svg {
		color: #3b82f6;
	}

	@media (max-width: 640px) {
		.promptpay-qr-container {
			border-radius: 0;
			box-shadow: none;
		}

		.amount-value {
			font-size: 28px;
		}

		.instructions {
			font-size: 13px;
		}
	}
</style>
