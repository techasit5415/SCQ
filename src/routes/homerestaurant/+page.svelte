<script>
    import { goto } from "$app/navigation";
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
    let activeMenu = "dashboard";
</script>

<div class="header2">
    <div class="path">
        <d>Restaurant panel</d>
    </div>
    <div class="headtext2">
        <h2>Restaurant panel</h2>
    </div>
</div>

<!-- <div id="menubar" class="menubar">
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "dashboard"}
        on:click={() => (activeMenu = "dashboard")}
    >
        <span class="material-symbols-outlined">dashboard</span>
        <span class="btn-text">Dashboard</span>
    </button>
    <button
        type="button"
        class="menu-btn"
        on:click={restaurantMenu}
        class:active={activeMenu === "manageRestaurant"}
        ><span class="material-symbols-outlined"> storefront </span><span
            class="btn-text">Order</span
        ></button
    >
    <label id="hiddenbar-container">
        <button type="button" class="order"
            ><span class="btn-text">New</span></button
        >
        <button type="button" class="order"
            ><span class="btn-text">In Progress</span></button
        >
        <button type="button" class="order"
            ><span class="btn-text">Completed</span></button
        >
    </label>
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "report"}
        on:click={() => (activeMenu = "report")}
        ><span class="material-symbols-outlined"> fork_spoon </span><span
            class="btn-text">Menu</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "systemLog"}
        on:click={() => (activeMenu = "systemLog")}
        ><span class="material-symbols-outlined"> assignment </span><span
            class="btn-text">Reports</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "setting"}
        on:click={() => (activeMenu = "setting")}
        ><span class="material-symbols-outlined"> settings </span><span
            class="btn-text">Settings</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "logout"}
        on:click={() => (activeMenu = "logout")}
        ><span class="material-symbols-outlined"> logout </span><span
            class="btn-text">Logout</span
        ></button
    >
</div> -->

<!-- <div class="header">
    <div class="photo">
        <img src="/Photo/Icon.png" alt="icon" />
    </div>
    <div class="headtext">
        <h1>Restaurant panel</h1>
    </div>
</div> -->

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
        color: black;
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
    .header2 {
        display: flex;
        height: 150px;
        width: 100%;
        border-bottom: 2px solid rgb(221, 221, 221);
        background: white;
        position: fixed;
        top: 0;

    }

    /* .icon-menu {
        width: 10px;
        height: 10px;
    } */

    .menubar {
        height: 100vh; /* เต็มความสูงของ viewport */
        width: 30vh;
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        background: white;
        position: fixed;
        top: 0;
        left: 0;
        padding-top: 70px;
    }

    .order {
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

    h2 {
        color: #333;
        font-family: "Noto Sans Thai";
        font-size: 16px;
        font-style: regular;
        font-weight: 400;
        line-height: 19.2px;
    }

    button:hover {
        background-color: #f0f0f0;
    }

    /* button:active { */
    /* background: orange; ตอนกด */
    /* } */

    .photo img {
        width: 48px;
        height: auto;
    }

    .material-symbols-outlined {
        font-variation-settings:
            "FILL" 0,
            "wght" 400,
            "GRAD" 0,
            "opsz" ;
        color: black;
    }
    button.active {
        /* background: orange; */
        color: white;
    }

    button.active .material-symbols-outlined {
        color: orange;
    }
    button.active .btn-text {
        color: orange;
    }
</style>
