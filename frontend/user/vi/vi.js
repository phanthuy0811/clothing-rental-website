import { fetchWithToken } from '../api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const balanceSpan = document.getElementById("balance");
    const soDuSpan = document.getElementById("soDu");
    const napButton = document.querySelector(".nap-btn");
    const modal = document.getElementById("payment-modal");
    const modalClose = document.getElementById("modal-close");
    const topUpBtn = document.getElementById("top-up-btn");
    const amountInput = document.getElementById("amount-input");

    // Gọi API lấy số dư và hiển thị
    async function loadBalance() {
        try {
            const res = await fetchWithToken("http://localhost:8081/laptrinhweb/user/get-wallet");

            if (res && res.code === 200 && typeof res.result.balance === "number") {
                const balance = res.result.balance;
                const formatted = Number(balance).toLocaleString("vi-VN") + " VNĐ";
                balanceSpan.textContent = formatted;
                soDuSpan.textContent = formatted;
            } else {
                balanceSpan.textContent = "Không lấy được số dư";
                soDuSpan.textContent = "Không lấy được";
            }
        } catch (error) {
            console.error("Lỗi khi lấy số dư:", error);
            balanceSpan.textContent = "Lỗi khi lấy số dư";
            soDuSpan.textContent = "Lỗi khi lấy";
        }
    }

    await loadBalance();

    // Mở modal
    napButton.addEventListener("click", () => {
        modal.classList.add("active");
    });

    // Đóng modal
    modalClose.addEventListener("click", () => {
        modal.classList.remove("active");
        amountInput.value = ""; // Reset input
    });

    // Xử lý nạp tiền
    topUpBtn.addEventListener("click", async () => {
        const amount = parseInt(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        try {
            const res = await fetchWithToken("http://localhost:8081/laptrinhweb/user/wallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount })
            });

            if (res && res.code === 200) {
                alert("Nạp tiền thành công!");
                modal.classList.remove("active");
                await loadBalance(); // Cập nhật số dư mới
            } else {
                alert("Nạp tiền thất bại: " + (res.message || "Lỗi không xác định"));
            }
        } catch (err) {
            console.error("Lỗi nạp tiền:", err);
            alert("Đã xảy ra lỗi khi nạp tiền.");
        }
    });
});
