import { fetchWithToken } from '../api.js';

document.addEventListener('DOMContentLoaded', async function() {
    console.log("Sự kiện DOMContentLoaded đã được gọi!");

    const tableBody = document.querySelector("#userTable tbody");
    console.log("tableBody:", tableBody); // Kiểm tra xem tableBody có bị null không

    if (!tableBody) {
        console.error("Không tìm thấy phần tử tbody! Kiểm tra lại HTML.");
        return;
    }

    // Các biến phân trang
    let currentPage = 0;
    let totalPages = 1; // Tổng số trang sẽ được cập nhật khi gọi API

    const adminPaginationContainer = document.querySelector(".pagination");
    
    // Hàm tải danh sách người dùng
    async function loadUsers(page = 0) {
        try {
            const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/admin/user?page=${page}`, {
                method: 'GET'
            });
    
            console.log("Dữ liệu phản hồi từ API:", response);
    
            const pageSize = response.size || 10; // dùng 10 nếu API không trả size

            // Kiểm tra nếu không có content hoặc không phải mảng
            if (!response || !Array.isArray(response.content)) {
                throw new Error(`Không thể lấy thông tin người dùng. Chi tiết lỗi: ${JSON.stringify(response)}`);
            }
    
            const data = response.content;
    
            tableBody.innerHTML = "";
            data.forEach((user, index) => {
                const row = document.createElement("tr");
    
                const avatar = `<img src="${user.avatarUrl || '/admin/user.png'}" alt="Avatar" class="avatar">`;
    
                row.innerHTML = `
                    <td>${index + 1 + page * pageSize}</td>
                    <td>${avatar}</td>
                    <td>${user.userName}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.phone ? user.phone : "Không có"}</td>
                `;
    
                tableBody.appendChild(row);
            });
    
            totalPages = response.totalPages || 1;
            renderPagination(totalPages, page);
    
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
        }
    }
    

    // Hàm render phân trang
    function renderPagination(totalPages, currentPage) {
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
                    loadUsers(page);
                });
            }
            return btn;
        };

        // Thêm nút "<" (lùi)
        adminPaginationContainer.appendChild(createPageButton("<", currentPage - 1, false, currentPage === 0));

        // Thêm nút trang đầu tiên
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

        // Thêm nút trang cuối cùng
        if (totalPages > 1) {
            adminPaginationContainer.appendChild(createPageButton(totalPages.toString(), totalPages - 1, currentPage === totalPages - 1));
        }

        // Thêm nút ">" (tiến)
        adminPaginationContainer.appendChild(createPageButton(">", currentPage + 1, false, currentPage === totalPages - 1));
    }

    // Tải người dùng ở trang đầu tiên
    loadUsers(currentPage);

});
