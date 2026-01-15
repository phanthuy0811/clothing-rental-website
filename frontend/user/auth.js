document.addEventListener("DOMContentLoaded", function () {
    const userIconContainer = document.querySelector(".icons");

    async function getUserAvatar() {
        try {
            const token = localStorage.getItem("JWT_TOKEN");
            if (!token) return "/user/user.png"; // Trả về ảnh mặc định nếu chưa đăng nhập

            const response = await fetch("http://localhost:8081/laptrinhweb/user/profile", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const userData = await response.json();

            console.log("user",userData);
            const avt = userData.result;
            return avt.avatarUrl ? avt.avatarUrl : "/user/user.png"; // Trả về ảnh user hoặc ảnh mặc định

        } catch (error) {
            console.error("Lỗi khi lấy ảnh user:", error);
            return "/user/user.png"; // Dùng ảnh mặc định nếu có lỗi
        }
    }

    async function checkLoginStatus() {
        const token = localStorage.getItem("JWT_TOKEN"); // Lấy token từ localStorage

        if (token) {
            const avatarUrl = await getUserAvatar(); // Lấy ảnh user

            // Nếu đã đăng nhập, hiển thị avatar + giỏ hàng
            userIconContainer.innerHTML = `
                <div class="user-dropdown">
                    <img id="user-avatar" src="${avatarUrl}" alt="User Avatar" class="user-icon">
                    <div class="dropdown-menu">
                        <a href="/user/profile/profile.html">Trang cá nhân</a>
                        <a href="#" id="logout-btn">Đăng xuất</a>
                    </div>
                </div>
                <a href="/user/giohang/giohang.html">
                    <img id="cart-avatar" src="/user/cart.jpg" alt="Cart Avatar" class="cart-icon">
                </a>
            `;
        } else {
            // Nếu chưa đăng nhập, chỉ hiển thị avatar với menu đăng nhập
            userIconContainer.innerHTML = `
                <div class="user-dropdown">
                    <img id="user-avatar" src="/user/user.png" alt="User Avatar" class="user-icon">
                    <div class="dropdown-menu">
                        <a href="/user/login/login.html">Đăng nhập</a>
                        <a href="/user/register/register.html">Đăng ký</a>
                    </div>
                </div>
            `;
        }

        // Nếu đã đăng nhập, thêm sự kiện đăng xuất
        if (token) {
            document.getElementById("logout-btn").addEventListener("click", function () {
                localStorage.removeItem("JWT_TOKEN"); // Xóa token
                location.reload(); // Tải lại trang
            });
        }
    }

    checkLoginStatus();
});
