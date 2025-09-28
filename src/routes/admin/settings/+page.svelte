<script>
    import TopBar from '../../../lib/Components/Topbar.svelte';
    import AdminSidebar from '../../../lib/Components/sidebar.svelte';
    import { onMount } from 'svelte';

    export let data;
    
    let settings = data.settings || {};
    let stats = data.stats || {};
    let activeTab = 'system';
    let hasUnsavedChanges = false;
    let showSuccessMessage = false;

    // Tabs configuration
    const tabs = [
        { id: 'system', label: 'System', icon: 'settings' },
        { id: 'branding', label: 'Branding', icon: 'palette' },
        { id: 'restaurant', label: 'Restaurant', icon: 'storefront' },
        { id: 'users', label: 'Users', icon: 'people' },
        { id: 'payments', label: 'Payments', icon: 'payment' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications' },
        { id: 'security', label: 'Security', icon: 'security' },
        { id: 'integrations', label: 'Integrations', icon: 'integration_instructions' }
    ];

    function switchTab(tabId) {
        if (hasUnsavedChanges) {
            if (!confirm('คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการเปลี่ยนแท็บหรือไม่?')) {
                return;
            }
        }
        activeTab = tabId;
        hasUnsavedChanges = false;
    }

    function handleInputChange() {
        hasUnsavedChanges = true;
    }

    function saveSettings() {
        // In a real app, this would send data to server
        console.log('Saving settings:', settings);
        
        // Simulate API call
        setTimeout(() => {
            hasUnsavedChanges = false;
            showSuccessMessage = true;
            setTimeout(() => {
                showSuccessMessage = false;
            }, 3000);
        }, 500);
    }

    function resetToDefaults() {
        if (confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตการตั้งค่าทั้งหมดเป็นค่าเริ่มต้น?')) {
            // Reset settings logic here
            hasUnsavedChanges = true;
        }
    }

    function exportSettings() {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scq-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatUptime(percentage) {
        return `${percentage}%`;
    }

    onMount(() => {
        // Auto-save draft every 30 seconds if there are changes
        const autoSaveInterval = setInterval(() => {
            if (hasUnsavedChanges) {
                // Auto save to localStorage as draft
                localStorage.setItem('scq-settings-draft', JSON.stringify(settings));
            }
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    });
</script>

<svelte:head>
    <title>Settings - SCQ Admin</title>
</svelte:head>

<div class="settings-page">
    <!-- Top Navigation -->
    <TopBar />
    
    <!-- Side Navigation -->
    <AdminSidebar activeMenu="settings" />
    
    <!-- Main Content -->
    <div class="content">
        <!-- Breadcrumb and Title -->
        <div class="header-section">
            <div class="breadcrumb">
                <span class="breadcrumb-item">Home / </span>
                <span class="breadcrumb-item current">Settings</span>
            </div>
            <div class="page-title">
                <h1>Settings</h1>
                <p>จัดการการตั้งค่าระบบและการกำหนดค่าต่างๆ</p>
            </div>
        </div>

        <!-- Settings Content -->
        <div class="settings-container">
            <!-- System Overview Cards -->
            <div class="overview-section">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <span class="material-icons">people</span>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{stats.totalUsers || 0}</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <span class="material-icons">storefront</span>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{stats.totalRestaurants || 0}</div>
                            <div class="stat-label">Restaurants</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <span class="material-icons">receipt</span>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{stats.totalOrders || 0}</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <span class="material-icons">trending_up</span>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{stats.systemUptime || 'N/A'}</div>
                            <div class="stat-label">System Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Success Message -->
            {#if showSuccessMessage}
                <div class="success-message">
                    <span class="material-icons">check_circle</span>
                    การตั้งค่าได้ถูกบันทึกเรียบร้อยแล้ว
                </div>
            {/if}

            <!-- Main Settings Panel -->
            <div class="settings-panel">
                <!-- Tabs Navigation -->
                <div class="tabs-nav">
                    {#each tabs as tab}
                        <button 
                            class="tab-button {activeTab === tab.id ? 'active' : ''}"
                            on:click={() => switchTab(tab.id)}
                        >
                            <span class="material-icons">{tab.icon}</span>
                            <span class="tab-label">{tab.label}</span>
                        </button>
                    {/each}
                </div>

                <!-- Tab Content -->
                <div class="tab-content">
                    <!-- System Settings -->
                    {#if activeTab === 'system'}
                        <div class="settings-section">
                            <h2>System Configuration</h2>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="platformName">Platform Name</label>
                                    <input 
                                        type="text" 
                                        id="platformName" 
                                        bind:value={settings.system.platformName}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="platformDesc">Platform Description</label>
                                    <textarea 
                                        id="platformDesc" 
                                        bind:value={settings.system.platformDescription}
                                        on:input={handleInputChange}
                                    ></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="timezone">Timezone</label>
                                    <select id="timezone" bind:value={settings.system.timezone} on:change={handleInputChange}>
                                        <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                                        <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                                        <option value="UTC">UTC (GMT+0)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="language">Default Language</label>
                                    <select id="language" bind:value={settings.system.language} on:change={handleInputChange}>
                                        <option value="th">ไทย (Thai)</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="currency">Currency</label>
                                    <select id="currency" bind:value={settings.system.currency} on:change={handleInputChange}>
                                        <option value="THB">THB (บาท)</option>
                                        <option value="USD">USD (Dollar)</option>
                                        <option value="EUR">EUR (Euro)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="dateFormat">Date Format</label>
                                    <select id="dateFormat" bind:value={settings.system.dateFormat} on:change={handleInputChange}>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Branding Settings -->
                    {#if activeTab === 'branding'}
                        <div class="settings-section">
                            <h2>Branding & Appearance</h2>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="logoUrl">Logo URL</label>
                                    <input 
                                        type="url" 
                                        id="logoUrl" 
                                        bind:value={settings.branding.logoUrl}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="primaryColor">Primary Color</label>
                                    <input 
                                        type="color" 
                                        id="primaryColor" 
                                        bind:value={settings.branding.primaryColor}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="secondaryColor">Secondary Color</label>
                                    <input 
                                        type="color" 
                                        id="secondaryColor" 
                                        bind:value={settings.branding.secondaryColor}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="faviconUrl">Favicon URL</label>
                                    <input 
                                        type="url" 
                                        id="faviconUrl" 
                                        bind:value={settings.branding.faviconUrl}
                                        on:input={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Restaurant Settings -->
                    {#if activeTab === 'restaurant'}
                        <div class="settings-section">
                            <h2>Restaurant Management</h2>
                            <div class="form-grid">
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            bind:checked={settings.restaurant.requireApproval}
                                            on:change={handleInputChange}
                                        />
                                        Require admin approval for new restaurants
                                    </label>
                                </div>
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            bind:checked={settings.restaurant.allowSelfRegistration}
                                            on:change={handleInputChange}
                                        />
                                        Allow restaurant self-registration
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label for="commissionRate">Default Commission Rate (%)</label>
                                    <input 
                                        type="number" 
                                        id="commissionRate" 
                                        min="0" 
                                        max="50" 
                                        step="0.1"
                                        bind:value={settings.restaurant.defaultCommissionRate}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="maxMenuItems">Max Menu Items per Restaurant</label>
                                    <input 
                                        type="number" 
                                        id="maxMenuItems" 
                                        min="1" 
                                        bind:value={settings.restaurant.maxMenuItems}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="maxPhotos">Max Photos per Menu Item</label>
                                    <input 
                                        type="number" 
                                        id="maxPhotos" 
                                        min="1" 
                                        max="20"
                                        bind:value={settings.restaurant.maxPhotos}
                                        on:input={handleInputChange}
                                    />
                                </div>
                            </div>
                            
                            <!-- Restaurant Categories -->
                            <div class="categories-section">
                                <h3>Restaurant Categories</h3>
                                <div class="categories-list">
                                    {#each settings.restaurant.categories as category, index}
                                        <div class="category-item">
                                            <input 
                                                type="text" 
                                                bind:value={settings.restaurant.categories[index]}
                                                on:input={handleInputChange}
                                            />
                                            <button class="remove-btn" on:click={() => {
                                                settings.restaurant.categories.splice(index, 1);
                                                settings.restaurant.categories = settings.restaurant.categories;
                                                handleInputChange();
                                            }}>
                                                <span class="material-icons">delete</span>
                                            </button>
                                        </div>
                                    {/each}
                                    <button class="add-category-btn" on:click={() => {
                                        settings.restaurant.categories.push('หมวดหมู่ใหม่');
                                        settings.restaurant.categories = settings.restaurant.categories;
                                        handleInputChange();
                                    }}>
                                        <span class="material-icons">add</span>
                                        Add Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Payment Settings -->
                    {#if activeTab === 'payments'}
                        <div class="settings-section">
                            <h2>Payment Configuration</h2>
                            <div class="form-grid">
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            bind:checked={settings.payments.enableCreditCard}
                                            on:change={handleInputChange}
                                        />
                                        Enable Credit/Debit Card payments
                                    </label>
                                </div>
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            bind:checked={settings.payments.enableQRPayment}
                                            on:change={handleInputChange}
                                        />
                                        Enable QR Code payments
                                    </label>
                                </div>
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            bind:checked={settings.payments.enableMobileBanking}
                                            on:change={handleInputChange}
                                        />
                                        Enable Mobile Banking
                                    </label>
                                </div>
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            bind:checked={settings.payments.enableCash}
                                            on:change={handleInputChange}
                                        />
                                        Enable Cash on Delivery
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label for="taxRate">Tax Rate (%)</label>
                                    <input 
                                        type="number" 
                                        id="taxRate" 
                                        min="0" 
                                        max="30" 
                                        step="0.1"
                                        bind:value={settings.payments.taxRate}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="payoutSchedule">Payout Schedule</label>
                                    <select id="payoutSchedule" bind:value={settings.payments.payoutSchedule} on:change={handleInputChange}>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Security Settings -->
                    {#if activeTab === 'security'}
                        <div class="settings-section">
                            <h2>Security Configuration</h2>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="sessionTimeout">Session Timeout (hours)</label>
                                    <input 
                                        type="number" 
                                        id="sessionTimeout" 
                                        min="1" 
                                        max="168"
                                        bind:value={settings.security.sessionTimeout}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="maxLoginAttempts">Max Login Attempts</label>
                                    <input 
                                        type="number" 
                                        id="maxLoginAttempts" 
                                        min="3" 
                                        max="10"
                                        bind:value={settings.security.maxLoginAttempts}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group">
                                    <label for="lockoutDuration">Lockout Duration (minutes)</label>
                                    <input 
                                        type="number" 
                                        id="lockoutDuration" 
                                        min="5" 
                                        max="1440"
                                        bind:value={settings.security.lockoutDuration}
                                        on:input={handleInputChange}
                                    />
                                </div>
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            bind:checked={settings.security.enableTwoFactor}
                                            on:change={handleInputChange}
                                        />
                                        Enable Two-Factor Authentication
                                    </label>
                                </div>
                                <div class="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            bind:checked={settings.security.enableAuditLog}
                                            on:change={handleInputChange}
                                        />
                                        Enable Audit Logging
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label for="backupFrequency">Backup Frequency</label>
                                    <select id="backupFrequency" bind:value={settings.security.backupFrequency} on:change={handleInputChange}>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Other tabs can be implemented similarly -->
                    {#if activeTab === 'users' || activeTab === 'notifications' || activeTab === 'integrations'}
                        <div class="settings-section">
                            <h2>Coming Soon</h2>
                            <p>This section is under development.</p>
                        </div>
                    {/if}
                </div>

                <!-- Action Buttons -->
                <div class="actions-bar">
                    <div class="left-actions">
                        <button class="btn-secondary" on:click={exportSettings}>
                            <span class="material-icons">download</span>
                            Export Settings
                        </button>
                        <button class="btn-secondary danger" on:click={resetToDefaults}>
                            <span class="material-icons">restore</span>
                            Reset to Defaults
                        </button>
                    </div>
                    <div class="right-actions">
                        <button class="btn-primary" on:click={saveSettings} disabled={!hasUnsavedChanges}>
                            <span class="material-icons">save</span>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

    :global(body) {
        background: #f5f7fa !important;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    :global(html) {
        overflow: hidden;
    }

    .settings-page {
        width: 100%;
        height: 100vh;
        position: relative;
        background: white;
        overflow: hidden;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .content {
        width: calc(100% - 256px);
        height: calc(100vh - 60px);
        margin-left: 256px;
        margin-top: 60px;
        background: #f5f7fa;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .header-section {
        width: 100%;
        padding: 20px;
        background: white;
        border-bottom: 1px #B4B5B7 solid;
    }

    .breadcrumb {
        margin-bottom: 10px;
    }

    .breadcrumb-item {
        color: #95969A;
        font-size: 13px;
        font-weight: 400;
    }

    .breadcrumb-item.current {
        color: #333438;
    }

    .page-title h1 {
        color: #333438;
        font-size: 20px;
        font-weight: 400;
        margin: 0 0 5px 0;
    }

    .page-title p {
        color: #68696E;
        font-size: 14px;
        margin: 0;
    }

    .settings-container {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        max-height: calc(100vh - 140px);
    }

    .overview-section {
        margin-bottom: 30px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    }

    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #E9ECEF;
    }

    .stat-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #FF8C00, #FFB84D);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-icon .material-icons {
        color: white;
        font-size: 24px;
    }

    .stat-content {
        flex: 1;
    }

    .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #333438;
        margin-bottom: 4px;
    }

    .stat-label {
        font-size: 14px;
        color: #68696E;
        font-weight: 400;
    }

    .success-message {
        background: #E8F5E8;
        border: 1px solid #4CAF50;
        color: #2E7D32;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
    }

    .settings-panel {
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .tabs-nav {
        display: flex;
        border-bottom: 1px solid #E9ECEF;
        background: #F8F9FA;
        overflow-x: auto;
    }

    .tab-button {
        padding: 16px 20px;
        border: none;
        background: none;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
        color: #68696E;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .tab-button:hover {
        background: #E9ECEF;
        color: #333438;
    }

    .tab-button.active {
        background: white;
        color: #FF8C00;
        border-bottom: 2px solid #FF8C00;
    }

    .tab-button .material-icons {
        font-size: 20px;
    }

    .tab-label {
        font-size: 14px;
        font-weight: 500;
    }

    .tab-content {
        padding: 30px;
    }

    .settings-section h2 {
        color: #333438;
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 20px 0;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group label {
        font-size: 14px;
        font-weight: 500;
        color: #333438;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 12px 16px;
        border: 1px solid #D1D5DB;
        border-radius: 8px;
        font-size: 14px;
        font-family: 'Noto Sans Thai', sans-serif;
        transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #FF8C00;
        box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
    }

    .form-group textarea {
        min-height: 80px;
        resize: vertical;
    }

    .checkbox-group {
        flex-direction: row;
        align-items: center;
        gap: 12px;
    }

    .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-weight: 400;
    }

    .checkbox-group input[type="checkbox"] {
        width: 18px;
        height: 18px;
        margin: 0;
    }

    .categories-section {
        margin-top: 30px;
        padding-top: 30px;
        border-top: 1px solid #E9ECEF;
    }

    .categories-section h3 {
        color: #333438;
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 15px 0;
    }

    .categories-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .category-item {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .category-item input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        font-size: 14px;
    }

    .remove-btn {
        padding: 8px;
        background: #FF4444;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background-color 0.3s ease;
    }

    .remove-btn:hover {
        background: #E53E3E;
    }

    .remove-btn .material-icons {
        font-size: 18px;
    }

    .add-category-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: #F8F9FA;
        border: 2px dashed #D1D5DB;
        border-radius: 8px;
        color: #68696E;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Noto Sans Thai', sans-serif;
        font-size: 14px;
    }

    .add-category-btn:hover {
        background: #E9ECEF;
        border-color: #FF8C00;
        color: #FF8C00;
    }

    .actions-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        border-top: 1px solid #E9ECEF;
        background: #F8F9FA;
    }

    .left-actions,
    .right-actions {
        display: flex;
        gap: 12px;
    }

    .btn-primary,
    .btn-secondary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Noto Sans Thai', sans-serif;
        border: none;
    }

    .btn-primary {
        background: #FF8C00;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: #E67C00;
    }

    .btn-primary:disabled {
        background: #D1D5DB;
        color: #9CA3AF;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: #F8F9FA;
        color: #68696E;
        border: 1px solid #D1D5DB;
    }

    .btn-secondary:hover {
        background: #E9ECEF;
        color: #333438;
    }

    .btn-secondary.danger {
        color: #DC2626;
        border-color: #FCA5A5;
    }

    .btn-secondary.danger:hover {
        background: #FEF2F2;
        border-color: #DC2626;
    }

    @media (max-width: 768px) {
        .content {
            width: 100%;
            margin-left: 0;
        }

        .tabs-nav {
            flex-wrap: nowrap;
            overflow-x: scroll;
        }

        .form-grid {
            grid-template-columns: 1fr;
        }

        .actions-bar {
            flex-direction: column;
            gap: 15px;
        }

        .left-actions,
        .right-actions {
            width: 100%;
            justify-content: center;
        }
    }
</style>