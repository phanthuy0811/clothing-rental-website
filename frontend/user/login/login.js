document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;
    const messageElement = document.getElementById("message");

    try {
        const response = await fetch("http://localhost:8081/laptrinhweb/public/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userName, password })
        });

        const data = await response.json();

        if (response.ok && data.result && data.result.token) {
            // Lưu token vào localStorage
            localStorage.setItem("JWT_TOKEN", data.result.token);

            // Giải mã token để lấy role
            const tokenPayload = JSON.parse(atob(data.result.token.split(".")[1]));
            const userRoles = tokenPayload.scope; // Lấy chuỗi role từ token

            messageElement.innerText = "Đăng nhập thành công!";
            
            // Kiểm tra role trong chuỗi scope
            if (userRoles.includes("ROLE_ADMIN")) {
                window.location.href = "/admin/user/user.html"; 
            } else if (userRoles.includes("ROLE_USER")) {
                window.location.href = "/user/home/home.html"; 
            } else {
                messageElement.innerText = "Bạn không có quyền truy cập!";
            }
        } else {
            messageElement.innerText = data.message || "Đăng nhập thất bại!";
        }
    } catch (error) {
        console.error("Lỗi:", error);
        messageElement.innerText = "Có lỗi xảy ra!";
    }
});
