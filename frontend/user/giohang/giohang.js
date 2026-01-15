import { fetchWithToken } from '../api.js'; // Hàm gọi API có kèm token

document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    const size = urlParams.get('size');
    const quantity = urlParams.get('quantity');

    // 🟢 Nếu có productId => Thêm vào giỏ hàng trước, sau đó load danh sách giỏ hàng
    if (productId && size && quantity) {
        await addToCart(productId, size, quantity);
        // Sau khi thêm sản phẩm, xóa query parameters khỏi URL
        window.history.replaceState(null, '', window.location.pathname);
    }  

    // 🟢 Load danh sách sản phẩm trong giỏ hàng
    await loadCart();
});

// 🟢 **Hàm lấy danh sách sản phẩm trong giỏ hàng**
async function loadCart() {
    try {
        const response = await fetchWithToken('http://localhost:8081/laptrinhweb/user/all-product-cart', {
            method: 'GET'
        });

        if (!response || response.code !== 200) {
            throw new Error(`Không thể tải giỏ hàng. Chi tiết lỗi: ${JSON.stringify(response)}`);
        }

        const cartItems = response.result;
        console.log('Danh sách giỏ hàng:', cartItems);

        renderCart(cartItems); // Hiển thị sản phẩm trong giỏ hàng

    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
    }
}


// 🟢 **Hàm hiển thị sản phẩm trong giỏ hàng**
function renderCart(cartItems) {
    const tbody = document.querySelector(".cart-table tbody");
    tbody.innerHTML = ""; // Xóa nội dung cũ

    cartItems.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>
                <div class="product-info">
                    <img src="${item.imageUrl}" alt="${item.productName}">
                    <span>${item.productName}</span>
                </div>
            </td>
            <td>${item.size}</td>
            <td>${item.price} VND</td>
            <td>
                <button class="qty-btn minus" data-id="${item.productId}" data-size="${item.size}">-</button>
                <input type="text" value="${item.quantity}" class="qty-input">
                <button class="qty-btn plus" data-id="${item.productId}" data-size="${item.size}">+</button>
            </td>
            <td>
                <button class="delete-btn" data-cart-product-id="${item.cartProductId}">Xóa</button>
            </td>
        `;

        tbody.appendChild(row);
    });

    addEventListeners();
}


// Thêm sự kiện cho nút xóa sản phẩm
function addEventListeners() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async function() {
            const cartProductId = this.dataset.cartProductId;
            if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
                await deleteProductFromCart(cartProductId);
            }
        });
    });
}


// Hàm xóa sản phẩm khỏi giỏ hàng
async function deleteProductFromCart(cartProductId) {
    try {
        const response = await fetchWithToken(`http://localhost:8081/laptrinhweb/user/delete-cart-product/${cartProductId}`, {
            method: 'DELETE'
        });

        if (response.code === 200) {
            alert("Xóa sản phẩm thành công!");
            await loadCart(); // Cập nhật lại giỏ hàng
        } else {
            alert("Xóa sản phẩm thất bại!");
        }
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    }
}


document.querySelector(".rent-btn").addEventListener("click", function () {
    const selectedProducts = document.querySelectorAll(".cart-table tbody input[type='checkbox']:checked");
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (selectedProducts.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để thuê!");
        return;
    }

    if (!startDate || !endDate) {
        alert("Vui lòng chọn ngày bắt đầu và ngày kết thúc thuê!");
        return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
        alert("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
        return;
    }

    // Tạo danh sách orderInfo từ các sản phẩm được chọn
    const orderInfo = Array.from(selectedProducts).map(checkbox => {
        const row = checkbox.closest("tr");
        const productId = row.querySelector(".qty-btn.plus").dataset.id;
        const size = row.querySelector(".qty-btn.plus").dataset.size;
        const quantity = row.querySelector(".qty-input").value;

        // Lấy giá trong cột giá (cột thứ 4)
        const priceText = row.querySelector("td:nth-child(4)").textContent;
        const price = parseInt(priceText.replace(/\D/g, ''));

        return {
            productId: productId,
            size: size,
            quantity: parseInt(quantity),
            price: price,
            startDate: startDate,
            endDate: endDate
        };
    });

    // Lưu vào localStorage
    localStorage.setItem("orderInfo", JSON.stringify(orderInfo));

    // Chuyển trang
    window.location.href = "/user/thongtin/thongtin.html";
});

