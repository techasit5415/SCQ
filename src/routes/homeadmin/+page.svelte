<script>
    function restaurantMenu() {
        var x = document.getElementById("hiddenbar-container");
        if(x) {
            if (x.style.display === "none" || x.style.display === "") {
                x.style.display = "block";
            } else {
                x.style.display = "none";
            }
        }
    }
</script>

<div id="menubar" class="menubar">
    <button type="button">Dashbord</button>
    <button type="button">Manage Users</button>
    <button type="button" on:click={restaurantMenu}>Manage Restaurant</button>
    <label id="hiddenbar-container">
        <button type="button">Restaurant1</button>
        <button type="button">Restaurant2</button>
        <button type="button">Restaurant3</button>
    </label>
    <button type="button">Reports</button>
    <button type="button">System Log</button>
    <button type="button">Setting</button>
</div>

<div class="header">
    <div class="photo">
        <img src="/Photo/Icon.png" alt="icon">
    </div>
    <div class="headtext">
        <h1>SCQ</h1>
    </div>

</div>

<style>
    .header {
        display: flex;
        height: 10%;
        width: 100%;
        border-bottom: 1px solid #7f7f7f;
        background: white;
        position: fixed;
        top: 0;
        left: 0;
        align-items: center;
    }
    .menubar {
        height: 100%;
        width: 200px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        background: white;
        position: fixed;
        top: 10%;
        left: 0;
    }
    label {
        display: none;
    }
    button {
        width: 100%;
        padding: 1rem;
        background-color: rgb(255, 255, 255);
        border: none;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        text-align: left;
    }
    button:hover {
        background-color: darkgrey;
    }
    .photo img {
        width: 100px;
        height: 100px;
    }
</style>
