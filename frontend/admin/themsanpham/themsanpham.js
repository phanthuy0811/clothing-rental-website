import { fetchWithToken } from '../api.js';

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Ngăn chặn reload trang mặc định

        const name = document.getElementById("name").value.trim();
        const sample = document.getElementById("sample").value.trim();
        const price = document.getElementById("price").value.trim();
        const fileInput = document.getElementById("image").files[0];

        // Kiểm tra dữ liệu hợp lệ
        if (!name || !sample || !price || !fileInput) {
            alert("Vui lòng điền đầy đủ thông tin và chọn ảnh.");
            return;
        }

        try {
            // Upload ảnh lên Cloudinary
            const cloudName = "dafrwywgo"; // Thay bằng cloud name của bạn
            const uploadPreset = "laptrinhweb"; // Thay bằng upload preset của bạn
            const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

            const cloudFormData = new FormData();
            cloudFormData.append("file", fileInput);
            cloudFormData.append("upload_preset", uploadPreset);

            const cloudResponse = await fetch(cloudUrl, {
                method: "POST",
                body: cloudFormData
            });

            const cloudResult = await cloudResponse.json();

            if (!cloudResult.secure_url) {
                throw new Error("Lỗi upload ảnh lên Cloudinary.");
            }

            console.log("Ảnh đã upload lên Cloudinary với URL:", cloudResult.secure_url);

            // Gửi dữ liệu sản phẩm sau khi có ảnh
            const productData = {
                name: name,
                sample: sample,
                price: parseFloat(price),
                imageUrl: cloudResult.secure_url // URL ảnh từ Cloudinary
            };

            const response = await fetchWithToken("http://localhost:8081/laptrinhweb/admin/create-product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });

            if (response.code === 200) {
                alert("Thêm sản phẩm thành công!");
                window.location.href = "/admin/sanpham/sanpham.html"; // Chuyển hướng về trang sản phẩm
            } else {
                alert("Thêm sản phẩm thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    });
});
