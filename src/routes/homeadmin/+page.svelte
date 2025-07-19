<!-- <h1>hello world from admin</h1> -->
<div class="menu-bar">
    <button type="button">Dashbord</button>
    <button type="button">Manage Users</button>
    <button type="button">Manage Restaurant</button>
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
    .photo img {
        width: 100px;
        height: 100px;
    }
    .menu-bar {
        height: 100%;
        width: 200px;
        /* border-right: 1px solid #7f7f7f; */
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        background: white;
        position: fixed;
        top: 10%;
        left: 0;
    }
    button {
        width: 100%;
        padding: 1rem;
        background-color: white;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        text-align: left;
    }
    button:hover {
        background-color: darkgrey;
    }
</style>