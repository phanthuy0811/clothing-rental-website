import { fetchWithToken } from '../api.js';

document.addEventListener("DOMContentLoaded", async function() {
    await loadCategories();
    setupFormHandlers();
    setupModalHandlers();
});

async function loadCategories() {
    const tableBody = document.querySelector(".table-container tbody");
    if (!tableBody) {
        console.error("Không tìm thấy phần tử tbody!");
        return;
    }

    try {
        const response = await fetchWithToken("http://localhost:8081/laptrinhweb/public/all-category", { method: "GET" });

        if (!response || response.code !== 200) {
            throw new Error(`Lỗi khi tải danh mục: ${JSON.stringify(response)}`);
        }

        const categories = response.result;
        if (!Array.isArray(categories)) {
            console.error("Lỗi: Dữ liệu nhận được không phải là mảng.");
            return;
        }

        tableBody.innerHTML = "";
        categories.forEach((category,index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>  <!-- Thêm số thứ tự -->
                <td>${category.name}</td>
                <td><img src="${category.imageUrl}" alt="Ảnh danh mục" class="product-img"></td>
                <td>
                    <button class="edit-btn" data-id="${category.id}">Sửa</button>
                    <button class="delete-btn" data-id="${category.id}">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async function() {
                if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
                    await deleteCategory(this.dataset.id);
                }
            });
        });

        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", function() {
                openEditModal(this.dataset.id);
            });
        });

    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
    }
}

async function deleteCategory(categoryId) {
    try {
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/admin/delete-category/${categoryId}`, {
            method: "DELETE"
        });

        if (response.code !== 200) {
            alert("Xóa danh mục thất bại!");
        } else {
            alert("Xóa danh mục thành công!");
            location.reload();
        }
    } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
    }
}

function setupFormHandlers() {
    document.querySelector("#addCategoryForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const name = document.getElementById("name").value.trim();
        const fileInput = document.getElementById("image").files[0];

        if (!name || !fileInput) {
            return alert("Vui lòng điền đầy đủ thông tin và chọn ảnh.");
        }

        try {
            const category = {
                name: name
            };

            const formData = new FormData();
            // Serialize category object thành JSON blob rồi append
            formData.append("category", new Blob([JSON.stringify(category)], { type: "application/json" }));
            formData.append("image", fileInput);

            const response = await fetchWithToken("http://localhost:8081/laptrinhweb/admin/create-category", {
                method: "POST",
                body: formData
            });

            if (response.code === 200) {
                alert("Thêm danh mục thành công!");
                location.reload();
            } else {
                alert(response.message || "Thêm danh mục thất bại!");
            }
            
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    });

    document.querySelector("#editCategoryForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const categoryId = this.getAttribute("data-id");
        const name = document.getElementById("editName").value;
        const fileInput = document.getElementById("editImage").files[0];

        // Tạo đối tượng chứa dữ liệu cần cập nhật
        const updateData = { name };

        const formData = new FormData();
        // Append dữ liệu danh mục vào formData
        formData.append("category", new Blob([JSON.stringify(updateData)], { type: "application/json" }));

        // Nếu có ảnh mới, thêm ảnh vào formData
        if (fileInput) {
            formData.append("image", fileInput);
        }

        try {
            // Gửi request PUT để cập nhật danh mục
            const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/admin/update-category/${categoryId}`, {
                method: "PUT",
                body: formData
            });

            if (response.code === 200) {
                alert("Cập nhật danh mục thành công!");
                location.reload();  // Reload lại trang sau khi cập nhật thành công
            } else {
                alert("Cập nhật danh mục thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật danh mục:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    });
}


function openEditModal(categoryId) {
    document.getElementById("editCategoryModal").style.display = "block";
    loadCategoryDetails(categoryId);
}

async function loadCategoryDetails(categoryId) {
    try {
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/admin/get-category/${categoryId}`, { method: "GET" });

        if (!response || response.code !== 200) {
            throw new Error("Lỗi khi tải danh mục.");
        }

        document.getElementById("editName").value = response.result.name;
        document.getElementById("editCategoryForm").setAttribute("data-id", categoryId);
    } catch (error) {
        console.error("Lỗi khi tải chi tiết danh mục:", error);
    }
}


document.getElementById("openModalBtn").addEventListener("click", function() {
    document.getElementById("addCategoryModal").style.display = "block";
});

function setupModalHandlers() {
    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("click", () => btn.closest(".modal").style.display = "none");
    });

    document.addEventListener("click", function(event) {
        const modals = document.querySelectorAll(".modal");
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });
}
