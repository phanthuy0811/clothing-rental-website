import { fetchWithToken } from '../api.js';

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Ngăn chặn reload trang mặc định

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("productId"); // Lấy ID sản phẩm từ URL

        if (!productId) {
            throw new Error("Không tìm thấy ID sản phẩm.");
        }

        // Lấy giá trị từ form
        const size = document.getElementById('size').value;
        const quantity = document.getElementById('quantity').value;


        if (!size || !quantity || isNaN(quantity) || quantity <= 0) {
            alert("Vui lòng chọn size và nhập số lượng hợp lệ.");
            return;
        }

        try {
            // Dữ liệu gửi lên server
            const requestData = {
                productId: productId,  // Gửi thêm ID sản phẩm
                size: size,
                quantity: parseInt(quantity) // Chuyển số lượng về kiểu số nguyên
            };

            console.log(requestData);
            // Gửi request cập nhật số lượng sản phẩm
            const response = await fetchWithToken("http://localhost:8081/laptrinhweb/admin/update-item", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            });

            if (response.code === 200) {
                alert("Cập nhật số lượng thành công!");
                window.location.href = "/admin/chitiet/chitiet.html"; // Chuyển hướng về trang chi tiết sản phẩm
            } else {
                alert("Cập nhật số lượng thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    });
});
