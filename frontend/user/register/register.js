document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("form").addEventListener("submit", async function (event) {
        event.preventDefault(); // Ngăn chặn form gửi đi mặc định

        const userName = document.querySelector("input[type='text']").value;
        const password = document.querySelector("input[type='password']").value;
        const email = document.querySelector("input[type='email']").value;
        const fullName = document.querySelectorAll("input[type='text']")[1].value; // Lấy họ và tên
        const messageElement = document.createElement("p"); // Tạo thẻ hiển thị thông báo
        messageElement.style.color = "red"; // Mặc định màu đỏ khi lỗi

        try {
            const response = await fetch("http://localhost:8081/laptrinhweb/public/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userName, password, email, fullName })
            });

            const data = await response.json();

            if (response.ok) {
                messageElement.style.color = "green"; // Thành công thì đổi màu xanh
                window.location.href = "/user/login/login.html";
            } else {
                messageElement.innerText = data.message || "Đăng ký thất bại!";
            }
        } catch (error) {
            console.error("Lỗi:", error);
            messageElement.innerText = "Có lỗi xảy ra!";
        }

        // Hiển thị thông báo trong form
        document.querySelector(".register-box").appendChild(messageElement);
    });
});
