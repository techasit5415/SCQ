<script>
    import TopBar from '../../../lib/Components/Topbar.svelte';
    import AdminSidebar from '../../../lib/Components/sidebar.svelte';
    import { onMount } from 'svelte';

    export let data;
    
    let systemLogs = data.systemLogs || [];
    let logStats = data.logStats || {};
    let autoRefresh = false;
    let searchFilter = '';
    let severityFilter = 'ALL';
    let typeFilter = 'ALL';
    let refreshInterval;

    // Filter logs based on search and filters
    $: filteredLogs = systemLogs.filter(log => {
        const matchesSearch = searchFilter === '' || 
            log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
            log.user.toLowerCase().includes(searchFilter.toLowerCase()) ||
            log.details.toLowerCase().includes(searchFilter.toLowerCase());
        
        const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
        const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
        
        return matchesSearch && matchesSeverity && matchesType;
    });

    function formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    function getRelativeTime(timestamp) {
        const now = new Date();
        const logTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - logTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'เพิ่งเกิดขึ้น';
        if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
        return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
    }

    function getSeverityColor(severity) {
        switch (severity) {
            case 'ERROR': return '#FF4444';
            case 'WARNING': return '#FF8C00';
            case 'INFO': return '#4CAF50';
            default: return '#95969A';
        }
    }

    function getTypeIcon(type) {
        switch (type) {
            case 'AUTH': return 'login';
            case 'SECURITY': return 'security';
            case 'CRUD': return 'edit';
            case 'SYSTEM': return 'settings';
            case 'BUSINESS': return 'business';
            case 'CONFIG': return 'tune';
            default: return 'info';
        }
    }

    function toggleAutoRefresh() {
        autoRefresh = !autoRefresh;
        if (autoRefresh) {
            refreshInterval = setInterval(() => {
                console.log('Auto refreshing logs...');
            }, 30000);
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        }
    }

    function exportLogs() {
        const csv = [
            ['Timestamp', 'Action', 'User', 'Type', 'Severity', 'IP', 'Details'].join(','),
            ...filteredLogs.map(log => [
                formatTimestamp(log.timestamp),
                log.action,
                log.user,
                log.type,
                log.severity,
                log.ip,
                `"${log.details}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    onMount(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    });
</script>

<svelte:head>
    <title>System Log - SCQ Admin</title>
</svelte:head>

<div class="system-log">
    <!-- Top Navigation -->
    <TopBar />
    
    <!-- Side Navigation -->
    <AdminSidebar activeMenu="systemLog" />
    
    <!-- Main Content -->
    <div class="content">
        <!-- Breadcrumb and Title -->
        <div class="frame-6">
            <div class="home-system-log">
                <span class="homesystemlog_span_01">Home / </span>
                <span class="homesystemlog_span_02">System Log</span>
            </div>
            <div class="system-log_01">
                <span class="systemlog_01_span">System Log</span>
            </div>
        </div>

        <!-- Log Content -->
        <div class="frame-7">
            <div class="frame-11">
                <!-- Log Statistics Cards -->
                <div class="stats-container">
                    <div class="stat-card">
                        <div class="stat-number">{logStats.totalLogs || 0}</div>
                        <div class="stat-label">Total Logs</div>
                    </div>
                    <div class="stat-card error">
                        <div class="stat-number">{logStats.errorCount || 0}</div>
                        <div class="stat-label">Errors</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-number">{logStats.warningCount || 0}</div>
                        <div class="stat-label">Warnings</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-number">{logStats.infoCount || 0}</div>
                        <div class="stat-label">Info</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{logStats.lastHourLogs || 0}</div>
                        <div class="stat-label">Last Hour</div>
                    </div>
                </div>

                <!-- Controls Section -->
                <div class="frame-81">
                    <div><span class="activitylog_span">Activity Log</span></div>
                    <div class="controls-group">
                        <div class="auto-refresh">
                            <span class="autorefresh_span">Auto Refresh</span>
                        </div>
                        <button class="switch {autoRefresh ? 'active' : ''}" on:click={toggleAutoRefresh} aria-label="Toggle auto refresh">
                            <div class="ellipse-2"></div>
                        </button>
                        <button class="export-btn" on:click={exportLogs}>
                            <span class="material-icons">download</span>
                            Export
                        </button>
                    </div>
                </div>

                <!-- Divider -->
                <div class="divider">
                    <div class="line-1"></div>
                </div>

                <!-- Filters Section -->
                <div class="frame-82">
                    <div><span class="filter_span">Filter</span></div>
                    <div class="filters-row">
                        <input 
                            type="text" 
                            class="textfield" 
                            placeholder="Search logs..." 
                            bind:value={searchFilter}
                        />
                        <select class="filter-select" bind:value={severityFilter}>
                            <option value="ALL">All Severity</option>
                            <option value="INFO">Info</option>
                            <option value="WARNING">Warning</option>
                            <option value="ERROR">Error</option>
                        </select>
                        <select class="filter-select" bind:value={typeFilter}>
                            <option value="ALL">All Types</option>
                            <option value="AUTH">Authentication</option>
                            <option value="SECURITY">Security</option>
                            <option value="CRUD">Data Changes</option>
                            <option value="SYSTEM">System</option>
                            <option value="BUSINESS">Business</option>
                            <option value="CONFIG">Configuration</option>
                        </select>
                    </div>
                </div>

                <!-- Log Table -->
                <div class="log-table-container">
                    <div class="log-table-header">
                        <div class="header-cell time">Time</div>
                        <div class="header-cell action">Action</div>
                        <div class="header-cell user">User</div>
                        <div class="header-cell type">Type</div>
                        <div class="header-cell severity">Severity</div>
                        <div class="header-cell details">Details</div>
                    </div>
                    
                    <div class="log-table-body">
                        {#each filteredLogs as log (log.id)}
                            <div class="log-row">
                                <div class="cell time">
                                    <div class="timestamp">{formatTimestamp(log.timestamp)}</div>
                                    <div class="relative-time">{getRelativeTime(log.timestamp)}</div>
                                </div>
                                <div class="cell action">
                                    <div class="action-content">
                                        <span class="material-icons">{getTypeIcon(log.type)}</span>
                                        {log.action}
                                    </div>
                                </div>
                                <div class="cell user">{log.user}</div>
                                <div class="cell type">
                                    <span class="type-badge {log.type.toLowerCase()}">{log.type}</span>
                                </div>
                                <div class="cell severity">
                                    <span class="severity-badge" style="background-color: {getSeverityColor(log.severity)}">
                                        {log.severity}
                                    </span>
                                </div>
                                <div class="cell details">
                                    <div class="details-content">
                                        {log.details}
                                        <div class="ip-address">IP: {log.ip}</div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                {#if filteredLogs.length === 0}
                    <div class="no-logs">
                        <span class="material-icons">info</span>
                        <div>No logs found matching your criteria</div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

    .system-log {
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
        background: #EDF0F2;
        overflow: auto;
    }

    .frame-6 {
        width: 100%;
        padding: 20px;
        background: white;
        border-bottom: 1px #B4B5B7 solid;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        display: flex;
    }

    .home-system-log {
        align-self: stretch;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    .homesystemlog_span_01 {
        color: #95969A;
        font-size: 13px;
        font-weight: 400;
        line-height: 15.60px;
    }

    .homesystemlog_span_02 {
        color: #333438;
        font-size: 13px;
        font-weight: 400;
        line-height: 15.60px;
    }

    .system-log_01 {
        align-self: stretch;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }

    .systemlog_01_span {
        color: #333438;
        font-size: 20px;
        font-weight: 400;
        line-height: 24px;
    }

    .frame-7 {
        width: 100%;
        padding: 20px;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 24px;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
    }

    .frame-11 {
        flex: 1;
        min-height: calc(100vh - 140px);
        padding: 16px;
        background: white;
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.20);
        border-radius: 16px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        gap: 16px;
        display: flex;
    }

    .stats-container {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }

    .stat-card {
        padding: 16px;
        background: #F8F9FA;
        border-radius: 8px;
        border: 1px solid #E9ECEF;
        min-width: 120px;
        text-align: center;
    }

    .stat-card.error {
        border-color: #FF4444;
        background: #FFF5F5;
    }

    .stat-card.warning {
        border-color: #FF8C00;
        background: #FFF8F0;
    }

    .stat-card.info {
        border-color: #4CAF50;
        background: #F8FFF8;
    }

    .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #333438;
        margin-bottom: 4px;
    }

    .stat-label {
        font-size: 12px;
        color: #68696E;
        font-weight: 400;
    }

    .frame-81 {
        align-self: stretch;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        display: flex;
    }

    .controls-group {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .activitylog_span {
        color: #333438;
        font-size: 13px;
        font-weight: 400;
        line-height: 15.60px;
    }

    .auto-refresh {
        text-align: right;
    }

    .autorefresh_span {
        color: #68696E;
        font-size: 13px;
        font-weight: 400;
        line-height: 15.60px;
    }

    .switch {
        width: 48px;
        height: 24px;
        padding: 4px;
        background: #95969A;
        border-radius: 100px;
        border: 1px #B4B5B7 solid;
        justify-content: flex-start;
        align-items: center;
        display: flex;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .switch.active {
        background: #4CAF50;
        justify-content: flex-end;
    }

    .ellipse-2 {
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .export-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #FF8C00;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 400;
        transition: background-color 0.3s ease;
    }

    .export-btn:hover {
        background: #E67C00;
    }

    .export-btn .material-icons {
        font-size: 16px;
    }

    .divider {
        width: 100%;
        height: 1px;
        position: relative;
    }

    .line-1 {
        width: 100%;
        height: 1px;
        background: #B4B5B7;
    }

    .frame-82 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 10px;
        display: flex;
    }

    .filter_span {
        color: #333438;
        font-size: 13px;
        font-weight: 400;
        line-height: 15.60px;
    }

    .filters-row {
        display: flex;
        gap: 16px;
        width: 100%;
        flex-wrap: wrap;
    }

    .textfield {
        width: 300px;
        height: 32px;
        padding: 8px 16px;
        background: white;
        border-radius: 8px;
        border: 1px #B4B5B7 solid;
        font-size: 13px;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .textfield:focus {
        outline: none;
        border-color: #FF8C00;
    }

    .filter-select {
        height: 32px;
        padding: 8px 16px;
        background: white;
        border-radius: 8px;
        border: 1px #B4B5B7 solid;
        font-size: 13px;
        font-family: 'Noto Sans Thai', sans-serif;
        cursor: pointer;
    }

    .filter-select:focus {
        outline: none;
        border-color: #FF8C00;
    }

    .log-table-container {
        flex: 1;
        border: 1px solid #E9ECEF;
        border-radius: 8px;
        overflow: hidden;
    }

    .log-table-header {
        display: grid;
        grid-template-columns: 180px 200px 150px 120px 100px 1fr;
        background: #F8F9FA;
        border-bottom: 1px solid #E9ECEF;
        font-weight: 600;
        font-size: 12px;
        color: #333438;
    }

    .header-cell {
        padding: 12px 16px;
        text-align: left;
        border-right: 1px solid #E9ECEF;
    }

    .header-cell:last-child {
        border-right: none;
    }

    .log-table-body {
        max-height: 600px;
        overflow-y: auto;
    }

    .log-row {
        display: grid;
        grid-template-columns: 180px 200px 150px 120px 100px 1fr;
        border-bottom: 1px solid #F1F3F4;
        transition: background-color 0.2s ease;
    }

    .log-row:hover {
        background: #F8F9FA;
    }

    .cell {
        padding: 12px 16px;
        font-size: 13px;
        border-right: 1px solid #F1F3F4;
        display: flex;
        align-items: center;
    }

    .cell:last-child {
        border-right: none;
    }

    .cell.time {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .timestamp {
        font-weight: 500;
        color: #333438;
    }

    .relative-time {
        font-size: 11px;
        color: #68696E;
    }

    .action-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .action-content .material-icons {
        font-size: 16px;
        color: #68696E;
    }

    .type-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
    }

    .type-badge.auth { 
        background: #E3F2FD; 
        color: #1976D2; 
    }
    
    .type-badge.security { 
        background: #FFEBEE; 
        color: #C62828; 
    }
    
    .type-badge.crud { 
        background: #E8F5E8; 
        color: #2E7D32; 
    }
    
    .type-badge.system { 
        background: #FFF3E0; 
        color: #F57C00; 
    }
    
    .type-badge.business { 
        background: #F3E5F5; 
        color: #7B1FA2; 
    }
    
    .type-badge.config { 
        background: #E0F2F1; 
        color: #00695C; 
    }

    .severity-badge {
        padding: 4px 8px;
        border-radius: 4px;
        color: white;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
    }

    .details-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .ip-address {
        font-size: 11px;
        color: #68696E;
        font-family: monospace;
    }

    .no-logs {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #68696E;
        gap: 16px;
    }

    .no-logs .material-icons {
        font-size: 48px;
        color: #B4B5B7;
    }

    @media (max-width: 768px) {
        .content {
            width: 100%;
            margin-left: 0;
        }

        .stats-container {
            justify-content: center;
        }

        .stat-card {
            min-width: 100px;
        }

        .filters-row {
            flex-direction: column;
        }

        .textfield {
            width: 100%;
        }

        .log-table-header,
        .log-row {
            grid-template-columns: 1fr;
            gap: 8px;
        }

        .cell {
            border-right: none;
            border-bottom: 1px solid #F1F3F4;
        }

        .controls-group {
            flex-direction: column;
            gap: 8px;
        }
    }
</style>