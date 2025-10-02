<script>
    import { goto } from "$app/navigation";
    import TopBar from '$lib/Components/ComponentsShop/Topbar.svelte';
    import RestaurantSidebar from '$lib/Components/ComponentsShop/RestaurantSidebar.svelte';

    let activeMenu = "dashboard";
    let titleHeader2 = "Dashboard";
    let pathPra = "Home / Dashboard";
    let last = "dashboard";
    let addItem = "addItem";

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
        on:click={() => (activeMenu = "orderNew")}
        on:click={() => (titleHeader2 = "Order")}
        on:click={() => (pathPra = "Home / Order")}
        on:click={openAnyPage}
    >
        <span class="material-symbols-outlined"> storefront </span>
        <span class="btn-text">Order</span>
    </button>

    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "menu"}
        on:click={() => (activeMenu = "menu")}
        on:click={() => (titleHeader2 = "Menu")}
        on:click={() => (pathPra = "Home / Menu")} 
        on:click={openAnyPage}
    >
        <span class="material-symbols-outlined"> fork_spoon </span>
        <span class="btn-text">Menu</span>
    </button>

    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "reports"}
        on:click={() => (activeMenu = "reports")}
        on:click={() => (titleHeader2 = "Reports")}
        on:click={() => (pathPra = "Home / Reports")}
        on:click={openAnyPage}
    >
        <span class="material-symbols-outlined"> assignment </span>
        <span class="btn-text">Reports</span>
    </button>

    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "setting"}
        on:click={() => (activeMenu = "setting")}
        on:click={() => (titleHeader2 = "Settings")}
        on:click={() => (pathPra = "Home / Settings")}
        on:click={openAnyPage}
    >
        <span class="material-symbols-outlined"> settings </span>
        <span class="btn-text">Settings</span>
    </button>

    <button
        type="button"
        class="menu-btn"
        class:active={activeMenu === "logout"}
        on:click={() => (activeMenu = "logout")}
        on:click={() => (titleHeader2 = "Logout")}
    >
        <span class="material-symbols-outlined"> logout </span>
        <span class="btn-text">Logout</span>
    </button>
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
            <p style="margin-left: 5px;">New Order</p>
        </div>
        <div class="dash1-com1" style="margin-left: 5%;">
            <p style="margin-left: 5px;">In Progess Order</p>
        </div>
        <div class="dash1-com1" style="margin-left: 5%;">
            <p style="margin-left: 5px;">Completed Order</p>
        </div>
        <div class="dash1-com1" style="margin-left: 5%;">
            <p style="margin-left: 5px;">Today's Sales</p>
        </div>
    </div>
    <div class="dash2">
        <p style="padding-top: 10px; margin-left: 5px;">Order Status</p>
    </div>
</div>

<!-- หน้า Pending Orders ร้านอาหาร -->
<div id="orderNew" class="orderNew" hidden>
    <div class="orderNew1">
        <div class="new">
            <button type="button" class="orderNew-btn"
                class:active={activeMenu === "orderNew"}
                on:click={() => (activeMenu = "orderNew")}
                on:click={openAnyPage}>
                    <span style="color:#2B7FFF; font-size: 19px;">Pending Orders</span>
            </button>
        </div>
        <div class="inProgress" style="margin-left: 20px">
            <button type="button" class="orderInProgress-btn"
                class:active={activeMenu === "orderInProgress"}
                on:click={() => (activeMenu = "orderInProgress")}
                on:click={openAnyPage}>
                    <span style="color: black; font-size: 19px;">Active Orders</span>
            </button>
        </div>
        <div class="completed" style="margin-left: 20px">
            <button type="button" class="orderCompleted-btn"
                class:active={activeMenu === "orderCompleted"}
                on:click={() => (activeMenu = "orderCompleted")}
                on:click={openAnyPage}>
                    <span style="color: black; font-size: 19px;">Order History</span>
            </button>
        </div>
    </div>
    <div class="lineMenu">
        <div class="lineMenu1" style="background-color: #2B7FFF;"></div>
        <div class="lineMenu2" style="background-color: #bcbbbb;"></div>
        <div class="lineMenu3" style="background-color: #bcbbbb;"></div>
        <div class="lineMenu4" style="background-color: #bcbbbb;"></div>
    </div>
    <div class="orderNewDetail">
        <div class="orderID">
            <h2>
                Order <span style="word-spacing: 400px;">ID ราคา</span>
            </h2>
            
        </div>
        <div class="orderIDDetail">

        </div>
    </div>
</div>

<!-- หน้า Active Orders ร้านอาหาร -->
<div id="orderInProgress" class="orderInProgress" hidden>
    <div class="orderInProgress1">
        <div class="new">
            <button type="button" class="orderNew-btn"
                class:active={activeMenu === "orderNew"}
                on:click={() => (activeMenu = "orderNew")}
                on:click={openAnyPage}>
                    <span style="color: black; font-size: 19px;">Pending Orders</span>
            </button>
        </div>
        <div class="inProgress" style="margin-left: 20px">
            <button type="button" class="orderInProgress-btn"
                class:active={activeMenu === "orderInProgress"}
                on:click={() => (activeMenu = "orderInProgress")}
                on:click={openAnyPage}>
                    <span style="color:#2B7FFF; font-size: 19px">Active Orders</span>
            </button>
        </div>
        <div class="completed" style="margin-left: 20px">
            <button type="button" class="orderCompleted-btn"
                class:active={activeMenu === "orderCompleted"}
                on:click={() => (activeMenu = "orderCompleted")}
                on:click={openAnyPage}>
                    <span style="color: black; font-size: 19px;">Order History</span>
            </button>
        </div>
    </div>
    <div class="lineMenu">
        <div class="lineMenu1" style="background-color: #bcbbbb;"></div>
        <div class="lineMenu2" style="background-color: #2B7FFF;"></div>
        <div class="lineMenu3" style="background-color: #bcbbbb;"></div>
        <div class="lineMenu4" style="background-color: #bcbbbb;"></div>
    </div>
</div>

<!-- หน้า Order History ร้านอาหาร -->
<div id="orderCompleted" class="orderCompleted" hidden>
    <div class="orderCompleted1">
        <div class="new">
            <button type="button" class="orderNew-btn"
                class:active={activeMenu === "orderNew"}
                on:click={() => (activeMenu = "orderNew")}
                on:click={openAnyPage}>
                    <span style="color: black; font-size: 19px;">Pending Orders</span>
            </button>
        </div>
        <div class="inProgress" style="margin-left: 20px">
            <button type="button" class="orderInProgress-btn"
                class:active={activeMenu === "orderInProgress"}
                on:click={() => (activeMenu = "orderInProgress")}
                on:click={openAnyPage}>
                    <span style="color: black; font-size: 19px;">Active Orders</span>
            </button>
        </div>
        <div class="completed" style="margin-left: 20px">
            <button type="button" class="orderCompleted-btn"
                class:active={activeMenu === "orderCompleted"}
                on:click={() => (activeMenu = "orderCompleted")}
                on:click={openAnyPage}>
                    <span style="color: #2B7FFF; font-size: 19px">Order History</span>
            </button>
        </div>
    </div>
    <div class="lineMenu">
        <div class="lineMenu1" style="background-color: #bcbbbb;"></div>
        <div class="lineMenu2" style="background-color: #bcbbbb;"></div>
        <div class="lineMenu3" style="background-color: #2B7FFF;"></div>
        <div class="lineMenu4" style="background-color: #bcbbbb;"></div>
    </div>
</div>

<!-- หน้า Menu ร้านอาหาร -->
<div id="menu" class="menu" hidden>
    <div class="menu1">
        <div class="menuItem" style="margin-top: 10px;">
            <div style="display: flex; gap: 45vh;">
                <button type="button" class="addItem-btn">
                    <span class="material-symbols-outlined" style="color: white;"> add_2 </span>
                    <span class="btn-text" style="color: white; font-size: 20px">Add Item</span>
                </button>
                <input type="text" 
                    placeholder="Search"
                    name="search"
                    class="searchItem"
                />
            </div>
            
            
        </div>
        <div class="menuCategory" style="margin-top: 10px;">

        </div>
    </div>
</div>

<!-- หน้า Roprts ร้านอาหาร -->
<div id="reports" class="reports" hidden>
    
</div>

<!-- หน้า Setting ร้านอาหาร -->
<div id="setting" class="setting" hidden>
    
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
        width: 84.3%;
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

    .dash1 {
        margin-top: 10px;
        display: flex;
        height: 100%;
        width: 100%;
        /* background-color: red; */
    }
    .dash1-com1 {
        height: 96px;
        width: 253px;
        background: rgb(255, 255, 255);
        margin-left: 17%;
        border-radius: 15px;
        /* align-items: center; */
    }
    .dash2 {
        margin-left: 320px;
        width: 1300px;
        height: 200px;
        border-radius: 15px;
        background-color: white;
    }

    /* หน้า Pending Orders */
    .orderNew1 {
        margin-top: 10px;
        margin-left: 17%;
        display: flex;
    }
    .lineMenu {
        display: flex;
    }
    .lineMenu1 {
        width: 175px;
        height: 3px;
        margin-left: 17.5%;
    }
    .lineMenu2 {
        width: 175px;
        height: 3px;
    }
    .lineMenu3 {
        width: 175px;
        height: 3px;
    }
    .lineMenu4 {
        width: 995px;
        height: 3px;
        margin-bottom: 20px;
    }
    .orderNewDetail {
        display: flex;
        margin-left: 17.5%;
    }

    .orderID {
        padding: 16px;
        width: 550px;
        height: 623px;
        background: white;
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 16px;
    }
    .orderIDDetail {
        padding: 16px;
        width: 850px;
        height: 623px;
        margin-left: 3.5%;
        background: white;
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 16px;
    }

    /* หน้า Active Orders */
    .orderInProgress1 {
        width: 1300px;
        height: 40px;
        margin-top: 10px;
        margin-left: 17%;
        display: flex;
    }

    /* หน้า Order History */
    .orderCompleted1 {
        width: 1300px;
        height: 40px;
        margin-top: 10px;
        margin-left: 17%;
        display: flex;
    }

    /* หน้า Menu */
    .menu1 {
        margin-top: 10px;
        margin-left: 16%;
        display: flex;
    }
    .menuItem {
        width: 100vh;
        height: 77vh;
        background-color: rgb(255, 255, 255);
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 16px;
    }
    .addItem-btn {
        display: flex;
        width: 20vh;
        height: 7vh;
        margin-left: 2%;
        margin-top: 20px;
        background-color: orange;
        border-radius: 16px;
        justify-content: center;      /*  จัดแนวนอน */
    }
    .searchItem {
        display: flex;
        width: 25vh;
        height: 7vh;
        margin-top: 20px;
        padding-left: 10px;
        border-radius: 16px;
        border: 1px solid #ccc;
        border-color: #333;
    }
    .menuCategory {
        width: 60vh;
        height: 77vh;
        margin-left: 2%;
        background-color: rgb(255, 255, 255);
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        border-radius: 15px;
    }
        

    body {
        background-color: #EDF0F2;
    }


    /* label {
        display: flex;
    } */

    button {
        display: flex;
        align-items: center;
        text-align: left;
        height: 40px;
        width: 100%;
        padding: 1rem;
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