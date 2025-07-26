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
        class:active={activeMenu === "manageRestaurant"}
        on:click={listOrder}
        ><span class="material-symbols-outlined"> storefront </span><span
            class="btn-text">Order</span
        ></button
    >
    <label id="hiddenbar-container">
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
    </label>
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
        on:click={() => (titleHeader2 = "Setting")}
        on:click={() => (pathPra = "Home / Setting")}
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
    <div class="photo">
        <img src="/Photo/Icon.png" alt="icon" />
    </div>
    <div class="headtext">
        <h1>Restaurant panel</h1>
    </div>
</div>

<div class="header2">
    <div class="path">
        <p style="padding-top: 70px;">{pathPra}</p>
    </div>
    <div class="headtext2">
        <h2 id="title">{titleHeader2}</h2>
    </div>
</div>

<!-- หน้า Dashboard ร้านอาหาร -->
<div id="dashboard" class="dashboard">
    <div class="dash1">
        <div class="dash1-com1">
            <p style="padding-top: 10px; margin-left: 5px;">New Order</p>
        </div>
        <div class="dash1-com1" style="margin-left: 5%;">
            <p style="padding-top: 10px; margin-left: 5px;">In Progess Order</p>
        </div>
        <div class="dash1-com1" style="margin-left: 5%;">
            <p style="padding-top: 10px; margin-left: 5px;">Completed Order</p>
        </div>
        <div class="dash1-com1" style="margin-left: 5%;">
            <p style="padding-top: 10px; margin-left: 5px;">Today's Sales</p>
        </div>
    </div>
    <div class="dash2">
        <p style="padding-top: 10px; margin-left: 5px;">Order Status</p>
    </div>
</div>


<!-- หน้า Order New ร้านอาหาร -->
<div id="orderNew" class="orderNew" hidden>
    <div class="newOrder">
        <p style="padding-top: 10px; margin-left: 5px;">Order New</p>
    </div>
</div>

<!-- หน้า Order In Progress ร้านอาหาร -->
<div id="orderInProgress" class="orderInProgress" hidden>
    <div class="newOrder">
        <p style="padding-top: 10px; margin-left: 5px;">Order In Progress</p>
    </div>
</div>

<!-- หน้า Order Completed ร้านอาหาร -->
<div id="orderCompleted" class="orderCompleted" hidden>
    <div class="newOrder">
        <p style="padding-top: 10px; margin-left: 5px;">Order Completed</p>
    </div>
</div>

<!-- หน้า Menu ร้านอาหาร -->
<div id="menu" class="menu" hidden>
    <div class="newOrder">
        <p style="padding-top: 10px; margin-left: 5px;">Menu</p>
    </div>
</div>

<!-- หน้า Roprts ร้านอาหาร -->
<div id="reports" class="reports" hidden>
    <div class="newOrder">
        <p style="padding-top: 10px; margin-left: 5px;">Reports</p>
    </div>
</div>

<!-- หน้า Setting ร้านอาหาร -->
<div id="setting" class="setting" hidden>
    <div class="newOrder">
        <p style="padding-top: 10px; margin-left: 5px;">Setting</p>
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
        height: 150px;
        width: 100%;
        border-bottom: 2px solid rgb(221, 221, 221);
        background: white;
        padding-left: 32vh;
        align-items: center;
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

    .order {
        background-color: rgb(221, 221, 221);
    }

    /* หน้า Dashboard */
    .dash1 {
        margin-top: 10px;
        display: flex;
        height: 100%;
        width: 100%;
        /* background-color: red; */
    }
    .dash1-com1 {
        height: 96px; /* เต็มความสูงของ viewport */
        width: 253px;
        background: rgb(255, 255, 255);
        margin-left: 17%;
        border-radius: 15px;
        align-items: center;
    }
    .dash2 {
        margin-left: 320px;
        width: 1300px;
        height: 200px;
        border-radius: 15px;
        background-color: white;
    }

    /* หน้า Order */
    body {
        background-color: #EDF0F2;
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
        font-size: 20px;
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