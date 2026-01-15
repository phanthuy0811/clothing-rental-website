import { fetchWithToken } from '../api.js';

let currentDetailPage = 0;
const detailPaginationContainer = document.querySelector(".pagination");

document.addEventListener("DOMContentLoaded", async function () {
    console.log("Sự kiện DOMContentLoaded đã được gọi!");
    await loadProductDetails();
});

async function loadProductDetails(page = 0) {
    const tableBody = document.querySelector("tbody");
    console.log("tableBody:", tableBody);

    if (!tableBody) {
        console.error("Không tìm thấy phần tử tbody! Kiểm tra lại HTML.");
        return;
    }

    try {
        // Gọi API với tham số page để hỗ trợ phân trang
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/admin/all-item?page=${page}`, {
            method: "GET"
        });

        console.log("API Response:", response);

        // Kiểm tra response - có thể là { code: 200, result: {...} } hoặc trực tiếp là data
        let data;
        if (response && response.code === 200) {
            // Response có cấu trúc { code, result }
            data = response.result;
        } else if (response && response.content) {
            // Response trực tiếp là data
            data = response;
        } else {
            throw new Error(`Không thể lấy thông tin sản phẩm. Chi tiết lỗi: ${JSON.stringify(response)}`);
        }
        
        if (!data || !data.content || !Array.isArray(data.content)) {
            console.error("Lỗi: Dữ liệu nhận được không đúng định dạng.");
            return;
        }

        const items = data.content;
        const totalPages = data.totalPages;
        const currentPageData = data;

        const productNames = await Promise.all(items.map(item => getProductNameById(item.productId)));

        console.log(productNames);
        
        tableBody.innerHTML = "";
        items.forEach((item, index) => {
            const productName = productNames[index];

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1 + page * currentPageData.size}</td>
                <td>${productName}</td>
                <td>${item.s}</td>
                <td>${item.m}</td>
                <td>${item.l}</td>
                <td>${item.xl}</td>
                <td>
                    <a href="/admin/themsoluong/themsoluong.html?productId=${item.productId}">
                        <button class="add-btn">Thêm</button>   
                    </a>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Render phân trang
        renderDetailPagination(totalPages, page);

    } catch (error) {
        console.error("Lỗi khi tải danh sách sản phẩm:", error);
    }
}

function renderDetailPagination(totalPages, currentPage) {
    // Tạo container phân trang nếu chưa có
    let paginationContainer = document.querySelector(".pagination");
    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.className = "pagination";
        
        // Thêm vào cuối main-content
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
            mainContent.appendChild(paginationContainer);
        }
    }

    paginationContainer.innerHTML = "";

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
                currentDetailPage = page;
                loadProductDetails(page);
            });
        }
        return btn;
    };

    // Nút Previous
    paginationContainer.appendChild(createPageButton("<", currentPage - 1, false, currentPage === 0));
    
    // Nút trang đầu
    paginationContainer.appendChild(createPageButton("1", 0, currentPage === 0));

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages - 2, currentPage + 1);

    if (startPage > 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPageButton((i + 1).toString(), i, i === currentPage));
    }

    if (endPage < totalPages - 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
    }

    // Nút trang cuối
    if (totalPages > 1) {
        paginationContainer.appendChild(createPageButton(totalPages.toString(), totalPages - 1, currentPage === totalPages - 1));
    }

    // Nút Next
    paginationContainer.appendChild(createPageButton(">", currentPage + 1, false, currentPage === totalPages - 1));
}

async function getProductNameById(productId) {
    try {
        const response = await fetch(`http://localhost:8081/laptrinhweb/public/get-product/${productId}`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`Không thể lấy tên sản phẩm cho ID ${productId}.`);
        }

        const data = await response.json();

        return data.result.name;
    } catch (error) {
        console.error(`Lỗi khi lấy tên sản phẩm cho ID ${productId}:`, error);
        return "Không xác định";
    }
}