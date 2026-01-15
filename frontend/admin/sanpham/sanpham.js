import { fetchWithToken } from '../api.js';

document.addEventListener('DOMContentLoaded', async function() {
    console.log("Sự kiện DOMContentLoaded đã được gọi!");
    await loadCategories();
    await loadProducts();
    setupFormHandler();
    setupModalHandlers();
});

async function loadCategories(selectedCategoryId = null, isEditMode = false) {
    try {
        const response = await fetch("http://localhost:8081/laptrinhweb/public/all-category");
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data.result)) throw new Error("response.result không hợp lệ");

        // Cập nhật danh mục cho form thêm sản phẩm
        const sampleSelect = document.getElementById("sample");
        sampleSelect.innerHTML = '<option value="">Chọn danh mục</option>';
        
        data.result.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            sampleSelect.appendChild(option);
        });

        // Nếu ở chế độ sửa, cập nhật danh mục cho form sửa sản phẩm
        if (isEditMode) {
            const editSampleSelect = document.getElementById("editSample");
            editSampleSelect.innerHTML = '<option value="">Chọn danh mục</option>';
            data.result.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                if (selectedCategoryId && selectedCategoryId == category.id) {
                    option.selected = true;
                }
                editSampleSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error("Lỗi khi tải danh mục sản phẩm:", error);
    }
}

let currentAdminPage = 0;
const adminPaginationContainer = document.querySelector(".pagination");

async function loadProducts(page = 0) {
    const tableBody = document.querySelector(".table-container tbody");
    if (!tableBody) {
        console.error("Không tìm thấy phần tử tbody!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/laptrinhweb/public/all-product?page=${page}`);
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

        const data = await response.json();
        const products = data.content;

        if (!Array.isArray(products)) throw new Error("Dữ liệu sản phẩm không hợp lệ");

        tableBody.innerHTML = "";

        products.forEach((product, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1 + page * data.size}</td>
                <td>${product.name}</td>
                <td>${product.categoryName}</td>
                <td>${product.price} VND</td>
                <td>${product.quantity}</td>
                <td><img src="${product.imageUrl}" alt="Không có" class="product-img"></td>
                <td>
                    <button class="edit-btn" data-id="${product.id}">Sửa</button>
                    <button class="delete-btn" data-id="${product.id}">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        setupProductActionButtons();
        renderAdminPagination(data.totalPages, page);

    } catch (error) {
        console.error("Lỗi khi tải danh sách sản phẩm:", error);
    }
}

function setupProductActionButtons() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async function () {
            if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                await deleteProduct(this.dataset.id);
            }
        });
    });

    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", function () {
            openEditModal(this.dataset.id);
        });
    });
}

function renderAdminPagination(totalPages, currentPage) {
    if (!adminPaginationContainer) return;

    adminPaginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const createPageButton = (label, page, isActive = false, isDisabled = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        if (isActive) btn.classList.add("active");
        if (isDisabled) {
            btn.disabled = true;
            btn.classList.add("disabled");
        } else {
            btn.addEventListener("click", () => {
                currentAdminPage = page;
                loadProducts(page);
            });
        }
        return btn;
    };

    adminPaginationContainer.appendChild(createPageButton("<", currentPage - 1, false, currentPage === 0));
    adminPaginationContainer.appendChild(createPageButton("1", 0, currentPage === 0));

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages - 2, currentPage + 1);

    if (startPage > 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        adminPaginationContainer.appendChild(ellipsis);
    }

    for (let i = startPage; i <= endPage; i++) {
        adminPaginationContainer.appendChild(createPageButton((i + 1).toString(), i, i === currentPage));
    }

    if (endPage < totalPages - 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        adminPaginationContainer.appendChild(ellipsis);
    }

    if (totalPages > 1) {
        adminPaginationContainer.appendChild(createPageButton(totalPages.toString(), totalPages - 1, currentPage === totalPages - 1));
    }

    adminPaginationContainer.appendChild(createPageButton(">", currentPage + 1, false, currentPage === totalPages - 1));
}

async function deleteProduct(productId) {
    try {
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/admin/delete-product/${productId}`, { method: 'DELETE' });
        if (response.code === 200) {
            alert("Xóa sản phẩm thành công!");
            location.reload();
        } else {
            alert("Xóa sản phẩm thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
    }
}

function setupFormHandler() {
    document.querySelector("#addProductForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const categoryId = document.getElementById("sample").value;
        const price = document.getElementById("price").value.trim();
        const fileInput = document.getElementById("image").files[0];

        if (!name || !categoryId || !price || !fileInput) {
            return alert("Vui lòng điền đầy đủ thông tin và chọn ảnh.");
        }

        try {
            const product = {
                name: name,
                categoryId: categoryId,
                price: price
            };

            const formData = new FormData();
            // 👈 serialize product object thành JSON blob rồi append
            formData.append("product", new Blob([JSON.stringify(product)], { type: "application/json" }));
            formData.append("image", fileInput);

            const response = await fetchWithToken("http://localhost:8081/laptrinhweb/admin/create-product", {
                method: "POST",
                body: formData
            });

            if (response.code === 200) {
                alert("Thêm sản phẩm thành công!");
                location.reload();
            } else {
                alert(response.message || "Thêm sản phẩm thất bại!");
            }

        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    });
}

function openEditModal(productId) {
    document.getElementById("editProductModal").style.display = "block";
    loadProductDetails(productId);
}

async function loadProductDetails(productId) {
    try {
        const response = await fetch(`http://localhost:8081/laptrinhweb/public/get-product/${productId}`);
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        const data = await response.json();
        
        document.getElementById("editName").value = data.result.name;
        document.getElementById("editPrice").value = data.result.price;
        document.getElementById("editProductForm").setAttribute("data-id", productId);
        
        // Gọi loadCategories để hiển thị danh mục trong form sửa
        await loadCategories(data.result.categoryId, true);
        
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
    }
}

document.getElementById("editProductForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const productId = this.getAttribute("data-id");
    const name = document.getElementById("editName").value;
    const categoryId = document.getElementById("editSample").value;
    const price = document.getElementById("editPrice").value;
    const fileInput = document.getElementById("editImage").files[0];

    // Tạo đối tượng chứa dữ liệu cần cập nhật
    const updateData = { name, categoryId, price };

    const formData = new FormData();
    // Append dữ liệu sản phẩm (không có ảnh) vào formData
    formData.append("product", new Blob([JSON.stringify(updateData)], { type: "application/json" }));

    // Nếu có ảnh mới, thêm ảnh vào formData
    if (fileInput) {
        formData.append("image", fileInput);
    }

    try {
        // Gửi request PUT để cập nhật sản phẩm
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/admin/update-product/${productId}`, {
            method: "PUT",
            body: formData
        });

        if (response.code === 200) {
            alert("Cập nhật sản phẩm thành công!");
            location.reload();  // Reload lại trang sau khi cập nhật thành công
        } else {
            alert("Cập nhật sản phẩm thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        alert("Đã xảy ra lỗi, vui lòng thử lại!");
    }
});

function setupModalHandlers() {
    document.querySelectorAll(".close-btn").forEach(btn => {
        btn.addEventListener("click", () => btn.closest(".modal").style.display = "none");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("addProductModal");
    const openModalBtn = document.getElementById("openModalBtn");
    const closeModalBtn = document.querySelector(".close-btn");

    // Khi nhấn vào nút "Thêm", hiển thị modal
    openModalBtn.addEventListener("click", function () {
        modal.style.display = "block";
    });

    // Khi nhấn vào nút "×" hoặc bấm ngoài modal, ẩn modal
    closeModalBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});
