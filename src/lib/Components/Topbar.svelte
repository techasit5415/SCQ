<script>
    export let title = "Admin Panel";
    export let logoSrc = "/SCQ_logo.png";
</script>

<header class="top-header">
    <div class="header-content">
        <img src={logoSrc} alt="SCQ Logo" class="logo" />
        <h1>{title}</h1>
    </div>
</header>

<style>
    .top-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        z-index: 100;
    }

    .header-content {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 0 20px;
        gap: 12px;
    }

    .logo {
        width: 40px;
        height: 40px;
        border-radius: 8px;
    }

    .header-content h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        color: #333;
    }
</style>