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
    <button type="button">
        <span class="material-symbols-outlined">dashboard</span>
        Dashboard
    </button>
    <button type="button"><span class="material-symbols-outlined">
person
</span>Manage Users</button>
    <button type="button" on:click={restaurantMenu}><span class="material-symbols-outlined">
storefront
</span>Manage Restaurant</button>
    <label id="hiddenbar-container">
        <button type="button" class="restaurant">Restaurant1</button>
        <button type="button" class="restaurant">Restaurant2</button>
        <button type="button" class="restaurant">Restaurant3</button>
    </label>
    <button type="button"><span class="material-symbols-outlined">
assignment
</span>Reports</button>
    <button type="button"><span class="material-symbols-outlined">
history
</span>System Log</button>
    <button type="button"><span class="material-symbols-outlined">
settings
</span>Setting</button>
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
    /* Icon  */
.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 24;
  margin-right: 10px;
}

    .header {
        display: flex;
        height: 10%;
        width: 100%;
        border-bottom: 2px solid rgb(221, 221, 221);
        background: white;
        position: fixed;
        top: 0;
        left: 0;
        align-items: center;
    }

    .icon-menu {
        width: 50px;
        height: 50px;
    }

    .menubar {
        height: 100%;
        width: 250px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        background: white;
        position: fixed;
        top: 10%;
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
        height: 60px;
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
    }

    button:hover {
        background-color: darkgrey;
    }

    .photo img {
        width: 100px;
        height: 100px;
    }

.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 24
}

</style>
