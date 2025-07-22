<script>
    import { goto } from "$app/navigation";
    function gotohomeadmin() {
        goto("/homeadmin");
    }
    let activevisable = "visible";
    let showPassword = false;
</script>

<form method="POST" action="?/login">
    <div class="login-container">
        <h2>Admin Login</h2>
        <div class="photo">
            <img src="/Photo/Icon.png" alt="icon" />
        </div>
        <div class="form-group">
            <label>
                <input name="email" type="email" placeholder="Email" />
                <span class="icon material-symbols-outlined">
                    account_circle
                </span>
            </label>
        </div>
        <div class="form-group">
            <label>
                <!-- <h3>Password</h3> -->
                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                />
                <span class="icon material-symbols-outlined"> lock </span>
                <span
                    class="passwordicon material-symbols-outlined"
                    on:click={() => (showPassword = !showPassword)}
                >
                    {showPassword ? "visibility" : "visibility_off"}
                </span>
            </label>
        </div>
        <button type="button" on:click={gotohomeadmin}>Log in</button>
    </div>
</form>

<style>
    .login-container {
        width: 300px; /* กำหนดความกว้างตายตัว */
        max-width: 300px;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        background: white;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    h2 {
        text-align: center;
        color: #333;
        font-family: "Noto Sans Thai";
        font-size: 24px;
        font-weight: 400;
        /* margin-bottom: 2rem; */
    }

    .form-group {
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        width: 100%;
        position: relative; /* เพื่อให้ icon อยู่ในตำแหน่งที่ถูกต้อง */
    }

    label {
        width: 100%;
        display: flex;
        flex-direction: column;
        color: #555;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    input {
        width: 100%;
        padding: 0.6rem;
        border: 1px solid #ddd;
        border-radius: 10px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
        font-family: "Noto Sans Thai";
        font-size: 14px;
        font-weight: 400;
    }

    input:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
    }

    button {
        width: 100%;
        padding: 1rem;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .photo {
        display: flex;
        justify-content: center; /* จัดให้อยู่กลาง */
        margin-bottom: 1rem;
    }

    .photo img {
        width: 150px;
        height: auto;
    }

    button:hover {
        background-color: #357abd;
    }
    .form-group .icon {
        position: absolute;
        left: 10px;
        top: 42%; /* ปรับตำแหน่งให้เหมาะสม */
        transform: translateY(-50%);
        color: #888;
        pointer-events: none; /* กันไม่ให้ icon รับคลิก */
    }

    .form-group input {
        width: 100%;
        padding: 10px 10px 10px 40px; /* padding-left เผื่อที่ให้ icon */
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        outline: none;
    }
    .form-group .passwordicon {
        position: absolute;
        left: 85%;
        top: 42%; /* ปรับตำแหน่งให้เหมาะสม */
        transform: translateY(-50%);
        color: #888;
    }
</style>
