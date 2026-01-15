import { fetchWithToken } from '../api.js';
document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("productId");

    if (!productId) {
        console.error("Không tìm thấy ID sản phẩm trong URL!");
        return;
    }

    let product = null;
    let availableSizes = {}; // Lưu số lượng tồn kho cho từng size

    try {
        const response = await fetch(`http://localhost:8081/laptrinhweb/public/get-product/${productId}`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        product = data.result;
        document.getElementById("title").textContent = product.name;
        document.getElementById("price").innerHTML = `<strong>Giá thuê:</strong> ${product.price.toLocaleString()} VND/ngày`;
        document.getElementById("image").querySelector("img").src = product.imageUrl;

        await fetchItemSizes(productId);
        await fetchRelatedProducts(product.categoryId, productId);

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
    }

    async function fetchItemSizes(productId) {
        try {
            const itemResponse = await fetch(`http://localhost:8081/laptrinhweb/public/get-item-by-id/${productId}`);
            const itemData = await itemResponse.json();

            if (itemData.code === 200) {
                const item = itemData.result;
                availableSizes = {
                    S: item.s,
                    M: item.m,
                    L: item.l,
                    XL: item.xl
                };

                document.getElementById("size-s-count").textContent = `(${item.s})`;
                document.getElementById("size-m-count").textContent = `(${item.m})`;
                document.getElementById("size-l-count").textContent = `(${item.l})`;
                document.getElementById("size-xl-count").textContent = `(${item.xl})`;
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin item:", error);
        }
    }

    const sizeButtons = document.querySelectorAll(".size-options button");
    let selectedSize = null;

    sizeButtons.forEach(button => {
        button.addEventListener("click", function () {
            sizeButtons.forEach(btn => btn.classList.remove("selected"));
            this.classList.add("selected");

            // Chỉ lấy phần trước dấu "(" nếu có
            selectedSize = this.textContent.split("(")[0].trim();
        });
    });

    const quantityInput = document.querySelector(".quantity input");
    const decreaseBtn = document.querySelector(".quantity .btn-quantity:first-child");
    const increaseBtn = document.querySelector(".quantity .btn-quantity:last-child");

    decreaseBtn.addEventListener("click", () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });

    increaseBtn.addEventListener("click", () => {
        let value = parseInt(quantityInput.value);
        quantityInput.value = value + 1;
    });

    function isLoggedIn() {
        return !!localStorage.getItem("JWT_TOKEN");
    }

    document.querySelector(".add-to-cart").addEventListener("click", async function () {
        if (!isLoggedIn()) {
            alert("Bạn cần đăng nhập để thêm vào giỏ hàng!");
            window.location.href = "/user/login/login.html";
            return;
        }

        if (!selectedSize) {
            alert("Vui lòng chọn kích thước trước khi thêm vào giỏ hàng!");
            return;
        }

        const quantity = parseInt(quantityInput.value);

        try {
            const cartData = { productId, size: selectedSize, quantity };
            const response = await fetchWithToken('http://localhost:8081/laptrinhweb/user/cart', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cartData)
            });

            if (!response || response.code !== 200) {
                throw new Error(`Lỗi khi thêm sản phẩm: ${JSON.stringify(response)}`);
            }

            console.log('Sản phẩm đã thêm vào giỏ hàng:', response.result);
            window.location.href = "/user/giohang/giohang.html";
        } catch (error) {
            alert(error.message);
        }
    });

    const startDateInput = document.querySelector(".date-selection input:first-child");
    const endDateInput = document.querySelector(".date-selection input:last-child");

    const today = new Date().toISOString().split("T")[0];
    startDateInput.setAttribute("min", today);
    endDateInput.setAttribute("min", today);

    startDateInput.addEventListener("change", function () {
        if (new Date(this.value) < new Date(today)) {
            alert("Không thể chọn ngày trong quá khứ!");
            this.value = "";
        }
        endDateInput.setAttribute("min", this.value);
    });

    endDateInput.addEventListener("change", function () {
        if (new Date(this.value) < new Date(startDateInput.value)) {
            alert("Ngày kết thúc phải sau ngày bắt đầu!");
            this.value = "";
        }
    });

    document.querySelector(".rent-now").addEventListener("click", function () {
        if (!isLoggedIn()) {
            alert("Bạn cần đăng nhập để thuê sản phẩm!");
            window.location.href = "/user/login/login.html";
            return;
        }

        if (!selectedSize) {
            alert("Vui lòng chọn kích thước trước khi thuê!");
            return;
        }

        const quantity = parseInt(quantityInput.value);
        const availableQuantity = availableSizes[selectedSize];

        if (!availableQuantity || quantity > availableQuantity) {
            alert(`Không đủ số lượng cho size ${selectedSize}!`);
            return;
        }

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert("Vui lòng chọn ngày thuê trước khi thuê sản phẩm!");
            return;
        }

        if (new Date(startDate) < new Date()) {
            alert("Ngày bắt đầu không thể nhỏ hơn hôm nay!");
            startDateInput.value = "";
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert("Ngày kết thúc phải sau ngày bắt đầu!");
            endDateInput.value = "";
            return;
        }

        const orderInfo = {
            productId: productId,
            size: selectedSize,
            quantity: quantity,
            startDate: startDate,
            endDate: endDate,
            price: product.price
        };

        localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
        window.location.href = "/user/thongtin/thongtin.html";
    });
});


async function fetchRelatedProducts(categoryId, currentProductId) {
    const productListContainer = document.querySelector(".product-list");
    const paginationContainer = document.querySelector(".pagination");
    let currentPage = 0;

    async function loadProductsByCategory(page = 0) {
        try {
            const response = await fetch(`http://localhost:8081/laptrinhweb/public/product-category/${categoryId}?page=${page}`);
            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            const products = data.content;

            productListContainer.innerHTML = "";

            if (products.length > 0) {
                products.forEach(product => {
                    if (product.id !== currentProductId) {
                        const productItem = document.createElement("div");
                        productItem.classList.add("product-item");

                        productItem.innerHTML = `
                            <a href="/user/sanpham/sanpham.html?productId=${product.id}">
                                <img src="${product.imageUrl || '/user/images.jpg'}" alt="${product.name}">
                            </a>
                            <p>${product.name}</p>
                            <p>Giá thuê: ${product.price} VND/Ngày</p>
                        `;

                        productListContainer.appendChild(productItem);
                    }
                });
            } else {
                productListContainer.innerHTML = "<p>Không có sản phẩm nào!</p>";
            }

            renderPagination(data.totalPages, page);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm liên quan:", error);
        }
    }

    function renderPagination(totalPages, currentPage) {
        paginationContainer.innerHTML = "";

        if (totalPages <= 1) return;

        function createPageButton(label, page, isActive = false, isDisabled = false) {
            const btn = document.createElement("button");
            btn.textContent = label;
            if (isActive) btn.classList.add("active");
            if (isDisabled) {
                btn.disabled = true;
                btn.classList.add("disabled");
            } else {
                btn.addEventListener("click", () => loadProductsByCategory(page));
            }
            return btn;
        }

        const prevButton = createPageButton("«", currentPage - 1, false, currentPage === 0);
        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(createPageButton("1", 0, currentPage === 0));

        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages - 2, currentPage + 1);

        if (startPage > 1) {
            const ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.classList.add("ellipsis");
            paginationContainer.appendChild(ellipsis);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationContainer.appendChild(createPageButton((i + 1).toString(), i, i === currentPage));
        }

        if (endPage < totalPages - 2) {
            const ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.classList.add("ellipsis");
            paginationContainer.appendChild(ellipsis);
        }

        if (totalPages > 1) {
            paginationContainer.appendChild(createPageButton(totalPages.toString(), totalPages - 1, currentPage === totalPages - 1));
        }

        const nextButton = createPageButton("»", currentPage + 1, false, currentPage === totalPages - 1);
        paginationContainer.appendChild(nextButton);
    }

    await loadProductsByCategory(currentPage);
}
