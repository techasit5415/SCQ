<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    export let logoSrc = "/SCQ_logo.png";
    export let logoMicrosoft = "/microsoft_logo.png";
    export let logoGoogle = "/google_logo.png";

    let username = "";
    let password = "";
    let showPassword = false;

    onMount(() => {
        console.log("--- Component Loaded in Browser ---");
    });

    async function handleSubmit(event) {
        event.preventDefault();
        console.log("handleSubmit called");
        try {
            const formData = new FormData(event.target);
            console.log("Sending form data:", [...formData.entries()]);

            // ใช้ window.location.origin เพื่อให้ใช้ได้ทั้ง localhost และ IP
            const apiUrl = `${window.location.origin}/admin`;
            const res = await fetch(apiUrl, { method: "POST", body: formData });

            console.log("Response status:", res.status);
            const data = await res.json();
            console.log("Response JSON:", data);
            const parsedData = JSON.parse(data.data);
            console.log("Parsed data:", parsedData);
            if (res.ok && parsedData[0]?.success === 1) {
                console.log("Login success, redirecting...");

                // เก็บ login state
                localStorage.setItem("isLoggedIn", "true");
                // หรือ sessionStorage.setItem('isLoggedIn', 'true');

                const redirectUrl = `${window.location.origin}/homeadmin`;
                console.log("Redirecting to:", redirectUrl);
                window.location.href = redirectUrl;
                console.log("Redirect command executed");
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Network error or server not responding.");
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit}>
    <div class="content">
        <div class="logoSCQ">
            <img src={logoSrc} alt="SCQ Logo" class="logo" />
        </div>
        <div class="text1">
            <span>Login via Google or Microsoft</span>
        </div>
        <div class="text2">
            <span>using KMITL</span>
        </div>
        <div class="login-by-GM">
            <button class="login-btn">
                <img src={logoMicrosoft} alt="SCQ Logo" class="login-logo" />
            </button>
            <button class="login-btn">
                <img src={logoGoogle} alt="SCQ Logo" class="login-logo" />
            </button>
        </div>
        <div class="text3">
            <div class="line-left"></div>
            <div>
                <span> หรือ </span>
            </div>
            <div class="line-right"></div>
        </div>
        <div class="email-user">
            <div class="user-title">
                <span>Email address</span>
                <span>(@kmitl.ac.th)</span>
            </div>
            <div class="restaurant-user">
                <input
                    type="text"
                    placeholder="Your Email"
                    bind:value={username}
                    required
                    name="user-login"
                    class="user-input"
                />
            </div>
        </div>
        <div class="email-password">
            <div class="password-title">
                <span>Password</span>
            </div>
            <div class="restaurant-password">
                <label>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        bind:value={password}
                        required
                        class="password-input"
                    />
                    <!-- <span
                        class="passwordicon material-symbols-outlined"
                        on:click={() => (showPassword = !showPassword)}
                        style="cursor:pointer;"
                    >
                        {showPassword ? "visibility" : "visibility_off"}
                    </span> -->
                </label>
                
            </div>
        </div>
        <div class="confirm">
            <button class="confirm-btn">
                <span>เข้าสู่ระบบ</span>
            </button>
        </div>
    </div>
</form>

<style>
    .content {
        display: flex;
        flex-direction: column;
        height: 95vh;
        justify-content: center;
        align-items: center;
        gap: 24px;
        font-family: "Noto Sans Thai", sans-serif;
    }
    .logo {
        width: 130px;
        height: 130px;
        border-radius: 8px;
    }
    .text1 {
        font-size: 19px;
        font-weight: bold;
    }
    .text2 {
        font-size: 15px;
        color: #68696E;
    }
    .text3 {
        display: flex;
        /* justify-content: center; */
        align-items: center;
        gap: 20px;
    }
    .line-left {
        width: 196px;
        height: 1px;
        background-color: #b4b5b7;
    }
    .line-right {
        width: 196px;
        height: 1px;
        background-color: #b4b5b7;
    }

    .login-by-GM {
        display: flex;
        gap: 80px;
    }
    .login-btn {
        width: 48px;
        height: 48px;
        border-radius: 50px;
        border: none;
        background-color: white;
        box-shadow: 0 0px 10px rgba(0, 0, 0, 0.3);
        align-content: center;
        justify-content: center;
    }
    .login-logo {
        width: 24px;
        height: 24px;
    }

    .email-user {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .user-input {
        width: 472px;
        height: 48px;
        border-radius: 8px;
        border: 1px solid #ccc;
        padding-left: 16px;
    }
    .email-password {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .password-input {
        width: 472px;
        height: 48px;
        border-radius: 8px;
        border: 1px solid #ccc;
        padding-left: 16px;
    }
    
    .confirm-btn {
        width: 353px;
        height: 48px;
        border-radius: 16px;
        font-size: 14px;
        font-family: 'Noto Sans Thai', sans-serif;
        background-color: orange;
        color: white;
        border: 2px solid white;
    }

    button:hover {
        background-color: #357abd;
    }
</style>
