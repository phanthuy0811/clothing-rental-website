import { fetchWithToken } from '../api.js';

document.addEventListener("DOMContentLoaded", function () {
    loadProductDetails();
    document.querySelector("form").addEventListener("submit", updateProduct);
});

// 🟢 Lấy thông tin sản phẩm và hiển thị lên form
async function loadProductDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id"); // Lấy ID sản phẩm từ URL

        if (!productId) {
            throw new Error("Không tìm thấy ID sản phẩm.");
        }

        const response = await fetch(`http://localhost:8081/laptrinhweb/public/get-product/${productId}`, {
            method: "GET"
        });

        console.log("HTTP Response:", response);

        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        // Chuyển đổi phản hồi sang JSON
        const data = await response.json();
        console.log("Dữ liệu từ API:", data);

        const product = data.result;

        // Hiển thị thông tin lên form
        document.getElementById("name").value = product.name || "";
        document.getElementById("model").value = product.sample || "";
        document.getElementById("price").value = product.price || "";
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        alert("Không thể tải sản phẩm. Vui lòng thử lại!");
    }
}

// 🟢 Cập nhật sản phẩm khi nhấn nút "Lưu"
async function updateProduct(event) {
    event.preventDefault(); // Ngăn chặn form submit mặc định

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("id");
        if (!productId) throw new Error("Không tìm thấy ID sản phẩm.");

        const name = document.getElementById("name").value;
        const sample = document.getElementById("model").value;
        const price = document.getElementById("price").value;
        const fileInput = document.getElementById("image");

        let imageUrl = null;

        // Nếu có file ảnh mới, upload lên Cloudinary
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const cloudName = "dafrwywgo"; // Thay bằng Cloudinary cloud name của bạn
            const uploadPreset = "laptrinhweb"; // Thay bằng preset của bạn
            const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

            const cloudFormData = new FormData();
            cloudFormData.append("file", file);
            cloudFormData.append("upload_preset", uploadPreset);

            const cloudResponse = await fetch(cloudUrl, {
                method: "POST",
                body: cloudFormData
            });

            const cloudResult = await cloudResponse.json();
            if (!cloudResult.secure_url) {
                throw new Error("Lỗi khi upload ảnh lên Cloudinary.");
            }

            console.log("Ảnh mới đã upload:", cloudResult.secure_url);
            imageUrl = cloudResult.secure_url;
        }

        // Chuẩn bị dữ liệu cập nhật
        const updateData = { name, sample, price, imageUrl };

        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/admin/update-product/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });

        if (!response || response.code !== 200) {
            throw new Error("Lỗi khi cập nhật sản phẩm.");
        }

        alert("Cập nhật sản phẩm thành công!");
        window.location.href = "/admin/sanpham/sanpham.html"; // Quay lại trang danh sách sản phẩm
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        alert("Không thể cập nhật sản phẩm. Vui lòng thử lại!");
    }
}
