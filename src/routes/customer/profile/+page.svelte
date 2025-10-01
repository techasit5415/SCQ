<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form;

	$: user = data?.user || {
		id: '',
		username: 'ผู้ใช้',
		email: '',
		avatar: '',
		name: 'ผู้ใช้'
	};
	$: points = data?.points || 0;
	$: orderCount = data?.orderCount || 0;
	
	// Debug logs
	$: console.log('🎨 Profile data:', data);
	$: console.log('👤 User:', user);
	$: console.log('💎 Points:', points);
	$: console.log('📦 Order count:', orderCount);

	function getAvatarUrl(): string {
		if (user.avatar && user.id) {
			// PocketBase avatar URL format: /api/files/COLLECTION_ID_OR_NAME/RECORD_ID/FILENAME
			// เพิ่ม timestamp เพื่อบังคับให้โหลดรูปใหม่
			const timestamp = new Date().getTime();
			return `${PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}?t=${timestamp}`;
		}
		return '/Photo/Icon.png';
	}

	function goBack() {
		goto('/customer');
	}

	function goToOrders() {
		goto('/customer/orders');
	}

	function goToCredit() {
		// TODO: ไปหน้า SCQ Credit (ประวัติการใช้ Point)
		alert('ฟีเจอร์กำลังพัฒนา');
	}

	let isEditMode = false;
	let editName = '';
	let editEmail = '';
	let fileInput: HTMLInputElement;
	let isUploading = false;
	let isSaving = false;
	
	// Update editName and editEmail when user data changes
	$: if (user) {
		editName = user.name || '';
		editEmail = user.email || '';
	}
	
	// แสดงข้อความเมื่อบันทึกสำเร็จ
	$: if (form?.success) {
		const message = form.message || 'บันทึกสำเร็จ';
		alert(message);
		isEditMode = false;
		isSaving = false;
		isUploading = false;
		// รีเฟรชหน้า
		if (typeof window !== 'undefined') {
			setTimeout(() => window.location.reload(), 500);
		}
	}
	
	// แสดงข้อความ error
	$: if (form?.error) {
		alert('เกิดข้อผิดพลาด: ' + form.error);
		isSaving = false;
		isUploading = false;
	}

	function handleChangeAvatar() {
		fileInput.click();
	}

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			// ตรวจสอบขนาดไฟล์ (จำกัดไม่เกิน 5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert('ไฟล์ใหญ่เกินไป! กรุณาเลือกไฟล์ที่เล็กกว่า 5MB');
				return;
			}
			
			// ตรวจสอบชนิดไฟล์
			if (!file.type.startsWith('image/')) {
				alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
				return;
			}
			
			if (!confirm(`ต้องการอัพโหลดรูป: ${file.name} หรือไม่?`)) {
				target.value = ''; // Clear input
				return;
			}
			
			isUploading = true;
			console.log('📤 Starting upload:', file.name, file.type, file.size);
			
			// สร้าง FormData สำหรับส่งไปยัง server action
			const formElement = document.createElement('form');
			const formData = new FormData(formElement);
			formData.append('avatar', file);
			
			try {
				const response = await fetch('?/uploadAvatar', {
					method: 'POST',
					body: formData
				});
				
				console.log('📥 Response status:', response.status);
				
				if (!response.ok) {
					const errorText = await response.text();
					console.error('❌ Upload failed:', errorText);
					alert('เกิดข้อผิดพลาด: ไม่สามารถอัพโหลดได้');
					isUploading = false;
					target.value = '';
					return;
				}
				
				const result = await response.json();
				console.log('📦 Result:', result);
				
				if (result.type === 'success' || result.success) {
					alert('อัพโหลดรูปสำเร็จ! กำลังรีเฟรชหน้า...');
					setTimeout(() => {
						window.location.reload();
					}, 500);
				} else {
					const errorMsg = result.error || result.data?.error || 'ไม่สามารถอัพโหลดได้';
					alert('เกิดข้อผิดพลาด: ' + errorMsg);
					isUploading = false;
				}
			} catch (error) {
				console.error('❌ Upload error:', error);
				alert('เกิดข้อผิดพลาดในการอัพโหลด: ' + (error instanceof Error ? error.message : 'Unknown error'));
				isUploading = false;
			} finally {
				target.value = ''; // Clear input
			}
		}
	}

	function toggleEditMode() {
		isEditMode = !isEditMode;
		if (isEditMode && user) {
			editName = user.name || '';
			editEmail = user.email || '';
		}
	}

	function handleCancelEdit() {
		isEditMode = false;
		if (user) {
			editName = user.name || '';
			editEmail = user.email || '';
		}
	}

	function handleChangePassword() {
		// TODO: ไปหน้าเปลี่ยนรหัสผ่าน
		alert('ฟีเจอร์เปลี่ยนรหัสผ่านกำลังพัฒนา');
	}

	async function handleLogout() {
		if (confirm('ต้องการออกจากระบบหรือไม่?')) {
			goto('/logout');
		}
	}
</script>

<svelte:head>
	<title>โปรไฟล์ - {user.name}</title>
</svelte:head>

<div class="profile-page">
	<!-- Header -->
	<div class="header">
		<button class="back-btn" on:click={goBack} aria-label="กลับหน้าก่อน">
			<span class="material-icons">arrow_back</span>
		</button>
		<h1 class="title">โปรไฟล์</h1>
	</div>

	<!-- Profile Info -->
	<div class="profile-section">
		<div class="avatar-container">
			<img src={getAvatarUrl()} alt={user.name} class="avatar" />
			<button 
				class="avatar-edit-btn" 
				on:click={handleChangeAvatar} 
				aria-label="เปลี่ยนรูปโปรไฟล์"
				disabled={isUploading}
			>
				<span class="material-icons">{isUploading ? 'hourglass_empty' : 'camera_alt'}</span>
			</button>
		</div>
		
		{#if isEditMode}
			<form method="POST" action="?/updateProfile" use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					await update();
					isSaving = false;
				};
			}}>
				<div class="edit-form">
					<input 
						type="text" 
						name="name"
						bind:value={editName} 
						placeholder="ชื่อ-นามสกุล"
						class="edit-input"
						required
					/>
					<input 
						type="email" 
						name="email"
						bind:value={editEmail} 
						placeholder="อีเมล"
						class="edit-input"
						required
					/>
					<div class="edit-actions">
						<button type="button" class="btn-cancel" on:click={handleCancelEdit} disabled={isSaving}>
							ยกเลิก
						</button>
						<button type="submit" class="btn-save" disabled={isSaving}>
							{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
						</button>
					</div>
				</div>
			</form>
		{:else}
			<h2 class="user-name">{user.name}</h2>
			{#if user.email}
				<p class="user-email">{user.email}</p>
			{/if}
		{/if}
	</div>
	
	<!-- Hidden file input -->
	<input 
		type="file" 
		accept="image/*" 
		bind:this={fileInput}
		on:change={handleFileChange}
		style="display: none;"
	/>

	<!-- Menu List -->
	<div class="menu-section">
		<button class="menu-item" on:click={goToOrders}>
			<div class="menu-icon">
				<span class="material-icons">favorite_border</span>
			</div>
			<span class="menu-text">ร้านโปรด</span>
			<div class="menu-badge">{orderCount}</div>
			<span class="material-icons arrow">chevron_right</span>
		</button>

		<button class="menu-item" on:click={goToCredit}>
			<div class="menu-icon">
				<span class="material-icons">credit_card</span>
			</div>
			<span class="menu-text">SCQ Credit</span>
			<div class="menu-points">{points} แต้ม</div>
			<span class="material-icons arrow">chevron_right</span>
		</button>

		<button class="menu-item" on:click={handleChangeAvatar}>
			<div class="menu-icon">
				<span class="material-icons">photo_camera</span>
			</div>
			<span class="menu-text">เปลี่ยนรูปโปรไฟล์</span>
			<span class="material-icons arrow">chevron_right</span>
		</button>

		<button class="menu-item" on:click={toggleEditMode}>
			<div class="menu-icon">
				<span class="material-icons">edit</span>
			</div>
			<span class="menu-text">แก้ไขข้อมูล</span>
			<span class="material-icons arrow">chevron_right</span>
		</button>

		<button class="menu-item logout" on:click={handleChangePassword}>
			<div class="menu-icon">
				<span class="material-icons">lock_outline</span>
			</div>
			<span class="menu-text">เปลี่ยนรหัสผ่าน</span>
			<span class="material-icons arrow">chevron_right</span>
		</button>
	</div>
</div>

<style>
	.profile-page {
		min-height: 100vh;
		background: #f8f9fa;
		padding-bottom: 80px;
	}

	.header {
		display: flex;
		align-items: center;
		padding: 16px;
		background: white;
		border-bottom: 1px solid #e5e5e5;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.back-btn {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16px;
	}

	.back-btn:hover {
		background: #f5f5f5;
	}

	.back-btn .material-icons {
		font-size: 24px;
		color: #333;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.profile-section {
		background: white;
		padding: 40px 20px 30px;
		text-align: center;
		border-bottom: 8px solid #f8f9fa;
	}

	.avatar-container {
		width: 100px;
		height: 100px;
		margin: 0 auto 16px;
		border-radius: 50%;
		overflow: visible;
		position: relative;
	}

	.avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
		border: 3px solid #ff6b35;
		background: #f5f5f5;
	}

	.avatar-edit-btn {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #ff6b35;
		border: 2px solid white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
		transition: all 0.2s ease;
	}

	.avatar-edit-btn:hover {
		background: #e55a2b;
		transform: scale(1.1);
	}

	.avatar-edit-btn .material-icons {
		font-size: 18px;
		color: white;
	}

	.user-name {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 8px 0;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.user-email {
		font-size: 0.9rem;
		color: #666;
		margin: 0;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.menu-section {
		background: white;
		margin-top: 16px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 16px 20px;
		background: white;
		border: none;
		border-bottom: 1px solid #f0f0f0;
		cursor: pointer;
		transition: background 0.2s ease;
		text-align: left;
	}

	.menu-item:hover {
		background: #f8f9fa;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
		border-radius: 8px;
		margin-right: 16px;
	}

	.menu-icon .material-icons {
		font-size: 24px;
		color: #666;
	}

	.menu-text {
		flex: 1;
		font-size: 1rem;
		font-weight: 500;
		color: #333;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.menu-badge {
		background: #ff6b35;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 12px;
		margin-right: 8px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.menu-points {
		color: #ff6b35;
		font-size: 0.9rem;
		font-weight: 600;
		margin-right: 8px;
		font-family: 'Noto Sans Thai', sans-serif;
	}

	.arrow {
		font-size: 20px;
		color: #999;
	}

	.menu-item.logout {
		margin-top: 16px;
		border-top: 8px solid #f8f9fa;
	}

	.menu-item.logout .menu-icon {
		background: #fee;
	}

	.menu-item.logout .menu-icon .material-icons {
		color: #ff6b35;
	}

	/* Edit Form Styles */
	.edit-form {
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.edit-input {
		width: 100%;
		padding: 12px 16px;
		margin-bottom: 12px;
		border: 2px solid #e5e5e5;
		border-radius: 8px;
		font-size: 1rem;
		font-family: 'Noto Sans Thai', sans-serif;
		transition: border-color 0.2s ease;
	}

	.edit-input:focus {
		outline: none;
		border-color: #ff6b35;
	}

	.edit-actions {
		display: flex;
		gap: 12px;
		margin-top: 16px;
	}

	.btn-cancel,
	.btn-save {
		flex: 1;
		padding: 12px;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		font-family: 'Noto Sans Thai', sans-serif;
		transition: all 0.2s ease;
	}

	.btn-cancel {
		background: #f5f5f5;
		color: #666;
	}

	.btn-cancel:hover {
		background: #e5e5e5;
	}

	.btn-save {
		background: #ff6b35;
		color: white;
	}

	.btn-save:hover:not(:disabled) {
		background: #e55a2b;
		transform: translateY(-1px);
	}

	.btn-cancel:disabled,
	.btn-save:disabled,
	.avatar-edit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-save:disabled {
		transform: none;
	}

	/* Material Icons Support */
	@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');
</style>
