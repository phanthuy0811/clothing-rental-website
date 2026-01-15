import { fetchWithToken } from '../api.js';

const mainContent = document.querySelector(".main-content");

let currentPage = 0;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", function () {
    loadOrders(0);
});

async function loadOrders(page = 0) {
    try {
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/user/get-all-order?page=${page}`, {
            method: "GET"
        });

        if (!response || !response.content) {
            throw new Error("Không thể lấy dữ liệu đơn hàng!");
        }

        const orders = response.content;
        totalPages = response.totalPages || 1;
        currentPage = response.pageNumber || page;

        mainContent.innerHTML = "<h2>Lịch sử đơn hàng</h2>";

        orders.forEach(order => {
            // Tạo khung đơn hàng
            const orderContainer = document.createElement("div");
            orderContainer.classList.add("order-container");

            // Tạo danh sách sản phẩm
            const orderDetailsList = document.createElement("div");
            orderDetailsList.classList.add("order-details");

            order.orderDetails.forEach(detail => {
                const detailItem = document.createElement("div");
                detailItem.classList.add("order-detail-item");
                detailItem.innerHTML = `
                    <img src="${detail.imageUrl}" alt="${detail.productId}" class="product-image">
                    <div class="product-info">
                        <p><strong>${detail.productName}</strong></p>
                        <p>Size: ${detail.size} | Số lượng: ${detail.quantity}</p>
                    </div>
                `;
                orderDetailsList.appendChild(detailItem);
            });

            // Định dạng ngày thuê (startDate, endDate)
            const startDate = order.startDate ? `${order.startDate[2]}/${order.startDate[1]}/${order.startDate[0]}` : 'N/A';
            const endDate = order.endDate ? `${order.endDate[2]}/${order.endDate[1]}/${order.endDate[0]}` : 'N/A';

            // Tạo phần thông tin đơn hàng nằm ở dưới cùng
            const orderFooter = document.createElement("div");
            orderFooter.classList.add("order-footer");

            // Xác định có hiển thị nút hay không dựa trên trạng thái đơn hàng
            let showPayButton = false;
            let showDepositButton = false;
            let showCancelButton = false;
            let showReturnButton = false;

            if (order.orderStatus === "Chưa thanh toán") {
                showPayButton = true;
                showDepositButton = true;
                showCancelButton = true;
            } else if (order.orderStatus === "Đã đặt cọc") {
                showPayButton = true;
                showCancelButton = true;
            } else if (order.orderStatus === "Chờ xác nhận") {
                showCancelButton = true;
            } else if (order.orderStatus === "Đã thanh toán") {
                showReturnButton = true;
            }

            // Tạo các nút
            let buttonHTML = '';
            if (showPayButton) {
                buttonHTML += `<button class="pay-btn" data-order-id="${order.orderId}">Thanh toán</button>`;
            }
            if (showDepositButton) {
                buttonHTML += `<button class="deposit-btn" data-order-id="${order.orderId}">Đặt cọc</button>`;
            }
            if (showCancelButton) {
                buttonHTML += `<button class="cancel-btn" data-order-id="${order.orderId}">Hủy đơn</button>`;
            }
            if (showReturnButton) {
                buttonHTML += `<button class="return-btn" data-order-id="${order.orderId}">Trả hàng</button>`;
            }

            orderFooter.innerHTML = `
                <div class="footer-content">
                    <div class="rental-dates">
                        <p><strong>Ngày bắt đầu thuê:</strong> ${startDate}</p>
                        <p><strong>Ngày kết thúc thuê:</strong> ${endDate}</p>
                    </div>
                    <div class="order-info">
                        <p><strong>Thành tiền:</strong> ${order.totalPrice.toLocaleString()} VND</p>
                        <div class="order-actions">
                            <span class="status"><strong>Trạng thái:</strong> ${order.orderStatus}</span>
                            ${buttonHTML}
                        </div>
                    </div>
                </div>
            `;

            // Tạo wrapper cho nội dung 
            const rightContent = document.createElement("div");
            rightContent.classList.add("order-right-content");
            rightContent.appendChild(orderDetailsList);
            rightContent.appendChild(orderFooter);

            orderContainer.appendChild(rightContent);
            mainContent.appendChild(orderContainer);
        });

        renderPagination(totalPages, currentPage);
        attachEventButtons();

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        alert("Không thể tải đơn hàng. Vui lòng thử lại!");
    }
}

function renderPagination(totalPages, currentPage) {
    let paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.id = "pagination";
        paginationContainer.style.margin = "20px 0";
        paginationContainer.style.textAlign = "center";
        mainContent.appendChild(paginationContainer);
    }
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    function createButton(label, page, disabled = false, active = false) {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.margin = "0 5px";
        btn.style.padding = "5px 10px";
        btn.style.cursor = disabled ? "not-allowed" : "pointer";

        if (active) {
            btn.style.fontWeight = "bold";
            btn.style.backgroundColor = "#007bff";
            btn.style.color = "white";
            btn.disabled = true;
        }
        if (disabled) {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        } else {
            btn.addEventListener("click", () => loadOrders(page));
        }
        return btn;
    }

    paginationContainer.appendChild(createButton("<", currentPage - 1, currentPage === 0));

    for (let i = 0; i < totalPages; i++) {
        paginationContainer.appendChild(createButton((i + 1).toString(), i, false, i === currentPage));
    }

    paginationContainer.appendChild(createButton(">", currentPage + 1, currentPage === totalPages - 1));
}

function attachEventButtons() {
    document.querySelectorAll(".pay-btn").forEach(button => {
        button.addEventListener("click", () => handlePayment(button.dataset.orderId));
    });

    document.querySelectorAll(".deposit-btn").forEach(button => {
        button.addEventListener("click", () => handleDeposit(button.dataset.orderId));
    });

    document.querySelectorAll(".cancel-btn").forEach(button => {
        button.addEventListener("click", () => handleCancel(button.dataset.orderId));
    });

    document.querySelectorAll(".return-btn").forEach(button => {
        button.addEventListener("click", () => handleReturn(button.dataset.orderId));
    });
}

async function handleCancel(orderId) {
    try {
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/user/update-order/${orderId}`, {
            method: "POST"
        });

        if (response && response.code === 200) {
            alert("Hủy đơn hàng thành công!");
            loadOrders(currentPage);
        } else {
            alert("Hủy đơn thất bại: " + (response.message || "Lỗi không xác định"));
        }
    } catch (error) {
        console.error("Lỗi khi hủy đơn:", error);
        alert("Có lỗi xảy ra khi hủy đơn. Vui lòng thử lại!");
    }
}

async function handlePayment(orderId) {
    const modal = document.getElementById("payment-modal");
    const closeBtn = document.getElementById("modal-close");
    const confirmBtn = document.getElementById("pay-confirm");

    modal.classList.add("active");

    const soDuEl = document.getElementById("soDu");
    const soTienEl = document.getElementById("soTien");

    try {
        const walletResponse = await fetchWithToken("http://localhost:8081/laptrinhweb/user/get-wallet");
        if (walletResponse && walletResponse.code === 200) {
            const balance = walletResponse.result.balance;
            soDuEl.textContent = Number(balance).toLocaleString("vi-VN") + " VNĐ";
        } else {
            soDuEl.textContent = "Không lấy được số dư";
        }

        const orderResponse = await fetchWithToken(`http://localhost:8081/laptrinhweb/user/get-order-by-id/${orderId}`);
        if (orderResponse && orderResponse.code === 200) {
            const amount = orderResponse.result.outstandingAmount;
            soTienEl.textContent = Number(amount).toLocaleString("vi-VN") + " VNĐ";

            confirmBtn.onclick = async () => {
                try {
                    const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/user/payment`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            orderId: Number(orderId),
                            paymentType: "FULL_PAYMENT"
                        })
                    });

                    if (response && response.code === 200) {
                        alert("Thanh toán thành công!");
                        modal.classList.remove("active");
                        loadOrders(currentPage);
                    } else {
                        alert("Thanh toán thất bại: " + (response.message || "Lỗi không xác định"));
                    }
                } catch (error) {
                    console.error("Lỗi thanh toán:", error);
                    alert("Có lỗi xảy ra khi thanh toán!");
                }
            };

        } else {
            soTienEl.textContent = "Không lấy được đơn hàng";
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
        alert("Không thể tải thông tin thanh toán!");
    }

    closeBtn.onclick = () => modal.classList.remove("active");
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("active");
    };
}

async function handleDeposit(orderId) {
    const modal = document.getElementById("payment-modal");
    const closeBtn = document.getElementById("modal-close");
    const confirmBtn = document.getElementById("pay-confirm");

    modal.classList.add("active");

    const soDuEl = document.getElementById("soDu");
    const soTienEl = document.getElementById("soTien");

    try {
        const walletResponse = await fetchWithToken("http://localhost:8081/laptrinhweb/user/get-wallet");
        if (walletResponse && walletResponse.code === 200) {
            const balance = walletResponse.result.balance;
            soDuEl.textContent = Number(balance).toLocaleString("vi-VN") + " VNĐ";
        } else {
            soDuEl.textContent = "Không lấy được số dư";
        }

        const orderResponse = await fetchWithToken(`http://localhost:8081/laptrinhweb/user/get-order-by-id/${orderId}`);
        if (orderResponse && orderResponse.code === 200) {
            const totalAmount = orderResponse.result.outstandingAmount;
            const depositAmount = totalAmount * 0.2; // Tính 20% số tiền
            soTienEl.textContent = Number(depositAmount).toLocaleString("vi-VN") + " VNĐ";

            confirmBtn.onclick = async () => {
                try {
                    const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/user/payment`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            orderId: Number(orderId),
                            paymentType: "DEPOSIT"
                        })
                    });

                    if (response && response.code === 200) {
                        alert("Đặt cọc thành công!");
                        modal.classList.remove("active");
                        loadOrders(currentPage);
                    } else {
                        alert("Đặt cọc thất bại: " + (response.message || "Lỗi không xác định"));
                    }
                } catch (error) {
                    console.error("Lỗi đặt cọc:", error);
                    alert("Có lỗi xảy ra khi đặt cọc!");
                }
            };

        } else {
            soTienEl.textContent = "Không lấy được đơn hàng";
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
        alert("Không thể tải thông tin đặt cọc!");
    }

    closeBtn.onclick = () => modal.classList.remove("active");
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("active");
    };
}

async function handleReturn(orderId) {
    if (!confirm("Bạn có chắc chắn muốn trả hàng cho đơn này?")) {
        return;
    }
    try {
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/user/returning?orderId=${orderId}`, {
            method: "POST"
        });

        if (response && response.code === 200) {
            alert("Trả hàng thành công!");
            loadOrders(currentPage);
        } else {
            alert("Trả hàng thất bại: " + (response.message || "Lỗi không xác định"));
        }
    } catch (error) {
        console.error("Lỗi khi trả hàng:", error);
        alert("Có lỗi xảy ra khi trả hàng. Vui lòng thử lại!");
    }
}