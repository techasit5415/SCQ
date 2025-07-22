<script>
    function restaurantMenu() {
        var x = document.getElementById("hiddenbar-container");
        if (x) {
            if (x.style.display === "none" || x.style.display === "") {
                x.style.display = "block";
            } else {
                x.style.display = "none";
            }
        }
    }
</script>

<div id="menubar" class="menubar">
    <button type="button">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="btn-text">Dashboard</span>
    </button>
    <button type="button"
        ><span class="material-symbols-outlined"> person </span><span class="btn-text">Manage Users</span></button
    >
    <button type="button" on:click={restaurantMenu}
        ><span class="material-symbols-outlined"> storefront </span><span class="btn-text">Manage Restaurant</span></button
    >
    <label id="hiddenbar-container">
        <button type="button" class="restaurant"><span class="btn-text">Restaurant2</span></button>
        <button type="button" class="restaurant"><span class="btn-text">Restaurant2</span></button>
        <button type="button" class="restaurant"><span class="btn-text">Restaurant3</span></button>
    </label>
    <button type="button"
        ><span class="material-symbols-outlined">
            assignment
        </span><span class="btn-text">Report</span></button
    >
    <button type="button"
        ><span class="material-symbols-outlined"> history </span><span class="btn-text">System Log</span></button
    >
    <button type="button"
        ><span class="material-symbols-outlined">
            settings
        </span><span class="btn-text">setting</span></button
    >
</div>

<div class="header">
    <div class="photo">
        <img src="/Photo/Icon.png" alt="icon" />
    </div>
    <div class="headtext">
        <h1>Admin panel</h1>
    </div>
</div>

<style>
    /* Icon  */
    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
        margin-right: 10px;
        
    }
    .btn-text {
        font-family: "Noto Sans Thai";
        font-size: 16px;
        font-weight: 400;
        line-height: 19.2px;
    }
    .header {
        display: flex;
        height: 60px;
        width: 100%;
        border-bottom: 2px solid rgb(221, 221, 221);
        background: white;
        position: fixed;
        top: 0;
        left: 0;
        align-items: center;
    }

    .icon-menu {
        width: 10px;
        height: 10px;
    }

    .menubar {
        height: 120%;
        width: 250px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        background: white;
        position: fixed;
        top: 8%;
        left: 0;
    }

    .restaurant {
        background-color: rgb(221, 221, 221);
    }

    label {
        display: none;
    }

    button {
        display: flex;
        align-items: center;
        text-align: left;
        height: 40px;
        width: 100%;
        padding: 1rem;
        background-color: rgb(255, 255, 255);
        border: none;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    h1 {
        color: #333;
        font-family: "Noto Sans Thai";
        font-size: 16px;
        font-style: regular;
        font-weight: 400;
        line-height: 19.2px;
    }

    button:hover {
        background-color: darkgrey;
    }

    .photo img {
        width: 48px;
        height: auto;
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" 24;
    }
</style>
