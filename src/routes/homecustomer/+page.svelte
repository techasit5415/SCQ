<script>
    import { goto } from "$app/navigation";
    function listOrder() {
        var x = document.getElementById("hiddenbar-container");
        if (x) {
            if (x.style.display === "none" || x.style.display === "") {
                x.style.display = "block";
            } else {
                x.style.display = "none";
            }
        }
    }

    function openAnyPage() {
        var thisPage = document.getElementById(activeMenu);
        var lastPage = document.getElementById(last);
        if(lastPage) {
            lastPage.style.display = "none";
        }
        if (thisPage) {
            if(activeMenu == "dashboard") {
                if (thisPage.style.display === "none" || thisPage.style.display === "") {
                    thisPage.style.display = "block";
                } else {
                    thisPage.style.display = "none";
                }
            }
            else if(activeMenu == "orderbar") {
                if (thisPage.style.display === "none" || thisPage.style.display === "") {
                    thisPage.style.display = "block";
                } else {
                    thisPage.style.display = "none";
                }
            }
            else if(activeMenu == "orderNew") {
                if (thisPage.style.display === "none" || thisPage.style.display === "") {
                    thisPage.style.display = "block";
                } else {
                    thisPage.style.display = "none";
                }
            }
            else if(activeMenu == "orderInProgress") {
                if (thisPage.style.display === "none" || thisPage.style.display === "") {
                    thisPage.style.display = "block";
                } else {
                    thisPage.style.display = "none";
                }
            }
            else if(activeMenu == "orderCompleted") {
                if (thisPage.style.display === "none" || thisPage.style.display === "") {
                    thisPage.style.display = "block";
                } else {
                    thisPage.style.display = "none";
                }
            }
            else if(activeMenu == "menu") {
                if (thisPage.style.display === "none" || thisPage.style.display === "") {
                    thisPage.style.display = "block";
                } else {
                    thisPage.style.display = "none";
                }
            }
            else if(activeMenu == "reports") {
                if (thisPage.style.display === "none" || thisPage.style.display === "") {
                    thisPage.style.display = "block";
                } else {
                    thisPage.style.display = "none";
                }
            }
            else if(activeMenu == "setting") {
                if (thisPage.style.display === "none" || thisPage.style.display === "") {
                    thisPage.style.display = "block";
                } else {
                    thisPage.style.display = "none";
                }
            }
            last = activeMenu;
        }
    }

    let activeMenu = "dashboard";
    let titleHeader2 = "Dashboard";
    let pathPra = "Home / Dashboard";
    let last = "dashboard";
</script>

<div id="menubar" class="menubar">
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "dashboard"}
        on:click={() => (activeMenu = "dashboard")}
        on:click={() => (titleHeader2 = "Dashboard")}
        on:click={() => (pathPra = "Home / Dashboard")}
        on:click={openAnyPage}
    >
        <span class="material-symbols-outlined">dashboard</span>
        <span class="btn-text">Dashboard</span>
    </button>
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "orderNew"}
        on:click={() => (titleHeader2 = "Order")}
        on:click={() => (pathPra = "Home / Order")}
        on:click={() => (activeMenu = "orderNew")}
        on:click={openAnyPage}
        ><span class="material-symbols-outlined"> storefront </span><span
            class="btn-text">Order</span
        ></button
    >
    <!-- <label id="hiddenbar-container">
        <button type="button" class="order"
            class:active={activeMenu === "orderNew"}
            on:click={() => (activeMenu = "orderNew")}
            on:click={() => (titleHeader2 = "New")}
            on:click={() => (pathPra = "Home / Order / New")} 
            on:click={openAnyPage}
            ><span class="btn-text">New</span></button
        >
        <button type="button" class="order"
            class:active={activeMenu === "orderInProgress"}
            on:click={() => (activeMenu = "orderInProgress")}
            on:click={() => (titleHeader2 = "In Progress")}
            on:click={() => (pathPra = "Home / Order / In Progress")}
            on:click={openAnyPage}
            ><span class="btn-text">In Progress</span></button
        >
        <button type="button" class="order"
            class:active={activeMenu === "orderCompleted"}
            on:click={() => (activeMenu = "orderCompleted")}
            on:click={() => (titleHeader2 = "Completed")}
            on:click={() => (pathPra = "Home / Order / Completed")}
            on:click={openAnyPage}
            ><span class="btn-text">Completed</span></button
        >
    </label> -->
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "menu"}
        on:click={() => (activeMenu = "menu")}
        on:click={() => (titleHeader2 = "Menu")}
        on:click={() => (pathPra = "Home / Menu")} 
        on:click={openAnyPage}
        ><span class="material-symbols-outlined"> fork_spoon </span><span
            class="btn-text">Menu</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "reports"}
        on:click={() => (activeMenu = "reports")}
        on:click={() => (titleHeader2 = "Reports")}
        on:click={() => (pathPra = "Home / Reports")}
        on:click={openAnyPage}
        ><span class="material-symbols-outlined"> assignment </span><span
            class="btn-text">Reports</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "setting"}
        on:click={() => (activeMenu = "setting")}
        on:click={() => (titleHeader2 = "Settings")}
        on:click={() => (pathPra = "Home / Settings")}
        on:click={openAnyPage}
        ><span class="material-symbols-outlined"> settings </span><span
            class="btn-text">Settings</span
        ></button
    >
    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "logout"}
        on:click={() => (activeMenu = "logout")}
        on:click={() => (titleHeader2 = "Logout")}
        ><span class="material-symbols-outlined"> logout </span><span
            class="btn-text">Logout</span
        ></button
    >
</div>

<div class="header">
    <div class="headtext">
        <h1 style="font-size: 20px;">SCQ</h1>
        <p style="color:orange; font-size:20px;">คณะวิทยาศาสตร์</p>
    </div>
    <div class="headbtn">
        <button
            type="button"
            class="header-btn"
            class:active={activeMenu === "menu"}
            on:click={openAnyPage}>
            <span class="material-symbols-outlined"> notifications </span>
        </button>
        <button
            type="button"
            class="header-btn"
            class:active={activeMenu === "menu"}
            on:click={() => (activeMenu = "menu")}
            on:click={() => (titleHeader2 = "Menu")}
            on:click={() => (pathPra = "Home / Menu")} 
            on:click={openAnyPage}>
            <span class="material-symbols-outlined"> overview </span>
        </button>
    </div>

</div>

<body></body>

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
        height: 100px;
        width: 100%;
        border-bottom: 2px solid rgb(221, 221, 221);
        background: white;
        position: fixed;
        top: 0;
        left: 0;
        align-items: center;
    }
    .headtext {
        margin-left: 50px;
    }
    .headbtn {
        display: flex;
    }
    .header-btn {
        margin-left: 20px;
    }
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
    body {
        background-color: #EDF0F2;
    }
    button {
        display: flex;
        align-items: center;
        height: 40px;
        width: 40px;
        /* background-color: rgb(255, 255, 255); */
        background-color: transparent;
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
    p {
        color: #333;
        font-family: "Noto Sans Thai";
        font-size: 16px;
        font-style: regular;
        font-weight: 400;
        line-height: 19.2px;
        /* padding-top: 70px; */
    }
    button:hover {
        background-color: #f0f0f0;
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