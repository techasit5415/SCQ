<script>
    import { goto } from "$app/navigation";
    
    const sections = [
        {
            title: "Main Entry Points",
            links: [
                { path: "/login", label: "Login", icon: "login" },
                { path: "/admin/dashboard", label: "Admin Dashboard", icon: "admin_panel_settings" },
                { path: "/homeadmin", label: "Admin Home", icon: "dashboard" },
                { path: "/homecustomer", label: "Customer Home", icon: "person" },
                { path: "/homerestaurant", label: "Restaurant Home", icon: "restaurant" }
            ]
        },
        {
            title: "Admin Pages",
            links: [
                { path: "/admin/manageUser", label: "Manage Users", icon: "people" },
                { path: "/admin/Restaurant", label: "Manage Restaurants", icon: "storefront" },
                { path: "/admin/Restaurant/AddRestaurant", label: "Add Restaurant", icon: "add_business" }
            ]
        },
        {
            title: "System & Utilities",
            links: [
                { path: "/logout", label: "Logout", icon: "logout" }
            ]
        }
    ];
    
    function navigateTo(path) {
        goto(path);
    }
</script>

<svelte:head>
    <title>SCQ - Navigation Page</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="container">
    <header>
        <div class="logo">
            <img src="/SCQ_logo.png" alt="SCQ Logo" />
        </div>
        <h1>Smart Canteen Queue System</h1>
        <p class="subtitle">Navigate to any section of the application</p>
    </header>

    <main>
        {#each sections as section}
            <section class="route-section">
                <h2>{section.title}</h2>
                <div class="links-grid">
                    {#each section.links as link}
                        <button class="route-card" on:click={() => navigateTo(link.path)}>
                            <span class="material-symbols-outlined icon">{link.icon}</span>
                            <span class="label">{link.label}</span>
                        </button>
                    {/each}
                </div>
            </section>
        {/each}
    </main>

    <footer>
        <p>&copy; {new Date().getFullYear()} SCQ - Smart Canteen Queue System</p>
    </footer>
</div>

<style>
    /* Modern, clean style for the navigation hub */
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: 'Noto Sans Thai', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 20px;
        background-color: #f8f9fa;
        color: #333;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
    }

    .logo {
        margin-bottom: 1rem;
    }

    .logo img {
        height: 80px;
        width: auto;
    }

    h1 {
        font-size: 2.5rem;
        margin: 0;
        color: #333;
    }

    .subtitle {
        font-size: 1.2rem;
        color: #666;
        margin-top: 0.5rem;
    }

    .route-section {
        margin-bottom: 2.5rem;
    }

    h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #ff8c42;
        color: #333;
    }

    .links-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }

    .route-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        text-align: center;
        height: 150px;
    }

    .route-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        background-color: #fff8f0;
    }

    .icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        color: #ff8c42;
    }

    .label {
        font-size: 1.1rem;
        font-weight: 500;
        color: #333;
    }

    footer {
        margin-top: 3rem;
        text-align: center;
        padding-top: 1.5rem;
        border-top: 1px solid #e0e0e0;
        color: #666;
        font-size: 0.9rem;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .container {
            padding: 1rem;
        }
        
        .links-grid {
            grid-template-columns: 1fr;
        }
        
        .route-card {
            height: 120px;
        }
        
        h1 {
            font-size: 1.8rem;
        }
    }
</style>