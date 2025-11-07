<script lang="ts">
    export let icon: string;
    export let value: string | number;
    export let label: string;
    export let sublabel: string = '';
    export let variant: 'default' | 'active' | 'revenue' | 'warning' = 'default';
</script>

<div class="kpi-card" class:active={variant === 'active'} class:revenue={variant === 'revenue'} class:warning={variant === 'warning'}>
    <div class="kpi-icon">
        <span class="material-icons">{icon}</span>
    </div>
    <div class="kpi-content">
        <div class="kpi-value">{value}</div>
        <div class="kpi-label">{label}</div>
        {#if sublabel}
            <div class="kpi-sublabel">{sublabel}</div>
        {/if}
    </div>
</div>

<style>
    .kpi-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .kpi-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .kpi-card.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .kpi-card.revenue {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
    }

    .kpi-card.warning {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        color: white;
    }

    .kpi-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
    }

    .kpi-card:not(.active):not(.revenue):not(.warning) .kpi-icon {
        background: rgba(102, 126, 234, 0.1);
    }

    .material-icons {
        font-size: 28px;
        color: inherit;
    }

    .kpi-card:not(.active):not(.revenue):not(.warning) .material-icons {
        color: #667eea;
    }

    .kpi-content {
        flex: 1;
    }

    .kpi-value {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 4px;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .kpi-label {
        font-size: 14px;
        font-weight: 500;
        opacity: 0.9;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .kpi-sublabel {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 2px;
        font-family: 'Noto Sans Thai', sans-serif;
    }

    .kpi-card:not(.active):not(.revenue):not(.warning) .kpi-label,
    .kpi-card:not(.active):not(.revenue):not(.warning) .kpi-sublabel {
        color: #666;
    }
</style>
