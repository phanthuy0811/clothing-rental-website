import { fetchWithToken } from '../api.js';

document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("order-container");
    const paginationContainer = document.getElementById("pagination");
    const statusFilter = document.getElementById("status-filter");

    let currentPage = 0;
    let totalPages = 1;
    let currentStatus = "all"; // Trạng thái hiện tại được chọn

    function formatDate(dateArray) {
        if (!Array.isArray(dateArray)) return "N/A";
        const [year, month, day] = dateArray;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    }

    function formatDateTime(dateArray) {
        if (!Array.isArray(dateArray)) return "N/A";
        const [year, month, day, hour = 0, minute = 0] = dateArray;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    async function loadOrders(page = 0, status = "all") {
    try {
        let url = `http://localhost:8081/laptrinhweb/admin/get-all-order-admin?page=${page}`;
        
        if (status !== "all") {
            url += `&statusText=${encodeURIComponent(status)}`;
        }

        console.log("Calling URL:", url); // Debug log

        const response = await fetchWithToken(url, {
            method: 'GET'
        });

        if (!response || !Array.isArray(response.content)) {
            throw new Error("Dữ liệu không hợp lệ hoặc không có content");
        }

        container.innerHTML = "";

        const orders = response.content;

        if (orders.length === 0) {
            container.innerHTML = "<div class='no-orders'>Không có đơn hàng nào.</div>";
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement("div");
            orderDiv.classList.add("order-item");

            const infoHtml = `
                <div class="order-info">
                    <p><strong>Người đặt:</strong> ${order.userFullName}</p>
                    <p><strong>Ngày đặt:</strong> ${formatDateTime(order.orderDate)}</p>
                    <p><strong>Ngày bắt đầu thuê:</strong> ${formatDate(order.startDate)}</p>
                    <p><strong>Ngày kết thúc thuê:</strong> ${formatDate(order.endDate)}</p>
                </div>
            `;

            let productsHtml = "";
            order.orderDetails.forEach(item => {
                productsHtml += `
                    <div class="product-item" style="display: flex; gap: 10px; margin: 10px 0;">
                        <img src="${item.imageUrl}" alt="${item.productName}" style="width: 80px; height: 80px; object-fit: cover;">
                        <div>
                            <p><strong>${item.productName}</strong> (Size: ${item.size})</p>
                            <p>Số lượng: ${item.quantity}</p>
                            <p>Giá: ${item.price.toLocaleString()} VND</p>
                        </div>
                    </div>
                `;
            });

            const summaryHtml = `
                <div class="order-summary" style="margin-top: 10px; border-top: 1px solid #ccc; padding-top: 10px;">
                    <p><strong>Tổng tiền:</strong> ${order.totalPrice.toLocaleString()} VND</p>
                    <p><strong>Trạng thái:</strong> ${order.orderStatus}</p>
                </div>
            `;

            orderDiv.innerHTML = infoHtml + productsHtml + summaryHtml;

            // Nếu trạng thái là "Đang trả hàng" thì thêm nút xác nhận
            if (order.orderStatus === "Đang trả hàng") {
                const confirmBtn = document.createElement("button");
                confirmBtn.textContent = "Xác nhận nhận được hàng";
                confirmBtn.classList.add("confirm-return-btn");
                confirmBtn.style.marginTop = "10px";
                confirmBtn.addEventListener("click", async () => {
                    try {
                        const confirmUrl = `http://localhost:8081/laptrinhweb/admin/returned?orderId=${order.orderId}`;
                        const res = await fetchWithToken(confirmUrl, {
                            method: "POST"
                        });

                        // Nếu trả về đúng định dạng có code và result
                        if (res && res.code === 200 && res.result === true) {
                            alert("Xác nhận nhận hàng thành công!");
                            loadOrders(currentPage, currentStatus); // Tải lại danh sách
                        } else {
                            alert("Xác nhận nhận hàng thất bại. Vui lòng thử lại.");
                        }
                    } catch (err) {
                        console.error("Lỗi khi xác nhận nhận hàng:", err);
                        alert("Có lỗi xảy ra khi xác nhận nhận hàng.");
                    }
                });
                orderDiv.appendChild(confirmBtn);
            }


            container.appendChild(orderDiv);
        });

        totalPages = response.totalPages || 1;
        renderPagination(totalPages, page);

    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        container.innerHTML = "<div class='error'>Có lỗi xảy ra khi tải đơn hàng.</div>";
    }
}


    function renderPagination(totalPages, currentPage) {
        if (!paginationContainer) return;

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
                    currentPage = page;
                    loadOrders(page, currentStatus);
                });
            }
            return btn;
        };

        paginationContainer.appendChild(createPageButton("<", currentPage - 1, false, currentPage === 0));
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

        if (totalPages > 1) {
            paginationContainer.appendChild(createPageButton(totalPages.toString(), totalPages - 1, currentPage === totalPages - 1));
        }

        paginationContainer.appendChild(createPageButton(">", currentPage + 1, false, currentPage === totalPages - 1));
    }

    // Xử lý sự kiện thay đổi trạng thái
    statusFilter.addEventListener("change", function() {
        currentStatus = this.value;
        currentPage = 0; // Reset về trang đầu khi lọc
        loadOrders(currentPage, currentStatus);
    });

    // Tải đơn hàng ban đầu
    loadOrders(currentPage, currentStatus);
});
