import { fetchWithToken } from '../api.js';

document.addEventListener("DOMContentLoaded", async function () {
    let orderRequests = JSON.parse(localStorage.getItem("orderInfo"));
    if (orderRequests && !Array.isArray(orderRequests)) {
        orderRequests = [orderRequests];
    }
    localStorage.removeItem("orderInfo");

    if (!orderRequests || orderRequests.length === 0) {
        alert("Không tìm thấy thông tin đơn hàng!");
        window.location.href = "/user/home/home.html";
        return;
    }

    // ✅ Gắn sự kiện click cho nút "Đặt cọc"
    document.querySelector(".deposit-btn").addEventListener("click", async function () {
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();

        if (!phone || !address) {
            alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
            return;
        }

        const updatedOrderRequests = orderRequests.map(order => ({
            ...order,
            phone,
            address
        }));

        try {
            // Bước 1: Tạo đơn hàng trước
            const createOrderRes = await fetchWithToken("http://localhost:8081/laptrinhweb/user/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedOrderRequests)
            });

            if (!createOrderRes || createOrderRes.code !== 200) {
                throw new Error("Lỗi tạo đơn hàng");
            }

            const orderId = createOrderRes.result.orderId;
            const totalPrice = createOrderRes.result.totalPrice; // Lấy totalPrice từ response
            const depositAmount = Math.round(totalPrice * 0.2); // 20% của totalPrice

            // Bước 2: Hiển thị modal với thông tin thanh toán
            showPaymentModal(depositAmount, orderId);

        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            alert("Đã xảy ra lỗi khi tạo đơn hàng.");
        }
    });

    // ✅ Gắn sự kiện click cho nút "Thanh toán ngay" (Thanh toán sau)
    document.querySelector(".later-btn").addEventListener("click", async function () {
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();

        if (!phone || !address) {
            alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
            return;
        }

        const updatedOrderRequests = orderRequests.map(order => ({
            ...order,
            phone,
            address
        }));

        try {
            const createOrderRes = await fetchWithToken("http://localhost:8081/laptrinhweb/user/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedOrderRequests)
            });

            if (!createOrderRes || createOrderRes.code !== 200) {
                throw new Error("Lỗi tạo đơn hàng");
            }

            alert("Tạo đơn hàng thành công. Bạn có thể thanh toán sau!");
            window.location.href = "/user/home/home.html";

        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            alert("Đã xảy ra lỗi khi tạo đơn hàng.");
        }
    });
});

// ✅ Hàm hiển thị modal thanh toán đã được cập nhật
function showPaymentModal(depositAmount, orderId) {
    const modal = document.getElementById("payment-modal");
    const closeBtn = document.getElementById("modal-close");
    const confirmBtn = document.getElementById("pay-confirm");

    const soDuEl = document.getElementById("soDu");
    const soTienEl = document.getElementById("soTien");

    modal.classList.add("active");
    soTienEl.textContent = Number(depositAmount).toLocaleString("vi-VN") + " VNĐ";

    // Gọi API để lấy số dư
    fetchWithToken("http://localhost:8081/laptrinhweb/user/get-wallet")
        .then(walletResponse => {
            if (walletResponse && walletResponse.code === 200) {
                const balance = walletResponse.result.balance;
                soDuEl.textContent = Number(balance).toLocaleString("vi-VN") + " VNĐ";
            } else {
                soDuEl.textContent = "Không lấy được số dư";
            }
        })
        .catch(error => {
            console.error("Lỗi khi lấy số dư:", error);
            soDuEl.textContent = "Lỗi khi lấy số dư";
        });

    // ✅ Khi xác nhận thanh toán - chỉ cần gọi API thanh toán
    confirmBtn.onclick = async () => {
        try {
            // Chỉ cần thanh toán đặt cọc vì đơn hàng đã được tạo
            const paymentRes = await fetchWithToken("http://localhost:8081/laptrinhweb/user/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: Number(orderId),
                    paymentType: "DEPOSIT"
                })
            });

            if (paymentRes && paymentRes.code === 200) {
                alert("Đặt cọc thành công!");
                modal.classList.remove("active");
                window.location.href = "/user/lichsu/lichsu.html";
            } else {
                alert("Thanh toán thất bại: " + (paymentRes.message || "Lỗi không xác định"));
            }

        } catch (error) {
            console.error("Lỗi xác nhận thanh toán:", error);
            alert("Đã xảy ra lỗi khi xác nhận thanh toán.");
        }
    };

    // Đóng modal
    closeBtn.onclick = () => modal.classList.remove("active");
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("active");
    };
}