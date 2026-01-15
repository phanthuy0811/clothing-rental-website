document.addEventListener("DOMContentLoaded", async function () {
    const productListContainer = document.querySelector(".product-list");
    const categoryListContainer = document.querySelector(".category-list");
    const paginationContainer = document.querySelector(".pagination");
    const searchBtn = document.querySelector(".search-btn");
    const searchInput = document.querySelector(".search-box input");
    const productTitle = document.querySelector(".new-products h2");

    let currentPage = 0;
    let currentURL = 'http://localhost:8081/laptrinhweb/public/all-product';
    let currentKeyword = null;

    async function fetchProducts(url, page = 0, keyword = null) {
        try {
            let fullUrl = url;
            if (keyword) {
                fullUrl += `?keyword=${encodeURIComponent(keyword)}&page=${page}`;
            } else {
                fullUrl += `?page=${page}`;
            }

            const response = await fetch(fullUrl, { method: 'GET' });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log("Dữ liệu sản phẩm:", data);

            productListContainer.innerHTML = "";

            const products = data.content;

            if (products.length > 0) {
            products.forEach(product => {
                const productItem = document.createElement("div");
                productItem.classList.add("product-item");

                // Sử dụng productName thay cho name nếu là tìm kiếm
                const productName = product.name || product.productName;
                const imageUrl = product.imageUrl || '/user/images.jpg';
                const price = product.price;

                productItem.innerHTML = `
                    <a href="/user/sanpham/sanpham.html?productId=${product.id || ''}">
                        <img src="${imageUrl}" alt="${productName}">
                    </a>
                    <p>${productName}</p>
                    <p>Giá thuê: ${price} VND/Ngày</p>
                `;

                productListContainer.appendChild(productItem);
            });
            }else {
                productListContainer.innerHTML = "<p>Không có sản phẩm nào!</p>";
            }

            renderPagination(data.totalPages, page, url, keyword);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
            productListContainer.innerHTML = "<p>Không thể tải danh sách sản phẩm!</p>";
        }
    }

    function renderPagination(totalPages, currentPage, url, keyword = null) {
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
                btn.addEventListener("click", () => fetchProducts(url, page, keyword));
            }
            return btn;
        }

        const prevButton = createPageButton("<", currentPage - 1, false, currentPage === 0);
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

        const nextButton = createPageButton(">", currentPage + 1, false, currentPage === totalPages - 1);
        paginationContainer.appendChild(nextButton);
    }

    // Sự kiện tìm kiếm
    searchBtn.addEventListener("click", function () {
        const keyword = searchInput.value.trim();
        if (keyword.length === 0) return;

        currentKeyword = keyword;
        currentPage = 0;
        currentURL = 'http://localhost:8081/laptrinhweb/public/search';
        productTitle.textContent = "Kết quả tìm kiếm";

        fetchProducts(currentURL, currentPage, currentKeyword);
    });

    // Gọi mặc định khi tải trang
    await fetchProducts(currentURL, currentPage);

    try {
        const categoryResponse = await fetch('http://localhost:8081/laptrinhweb/public/all-category', { method: 'GET' });

        if (!categoryResponse.ok) {
            throw new Error(`Lỗi HTTP: ${categoryResponse.status}`);
        }

        const categoryData = await categoryResponse.json();
        console.log("Danh mục sản phẩm:", categoryData);

        if (categoryData.result && categoryData.result.length > 0) {
            categoryListContainer.innerHTML = "";

            categoryData.result.forEach(category => {
                const categoryItem = document.createElement("div");
                categoryItem.classList.add("category-item");
                categoryItem.setAttribute("data-category-id", category.id);

                categoryItem.innerHTML = `
                    <img src="${category.imageUrl || '/user/category.png'}" alt="${category.name}">
                    <p>${category.name}</p>
                `;

                categoryListContainer.appendChild(categoryItem);
            });

            document.querySelectorAll(".category-item img").forEach(img => {
                img.addEventListener("click", function () {
                    const categoryId = this.parentElement.getAttribute("data-category-id");
                    if (categoryId) {
                        currentPage = 0;
                        currentKeyword = null;
                        currentURL = `http://localhost:8081/laptrinhweb/public/product-category/${categoryId}`;
                        productTitle.textContent = "Sản phẩm mới";
                        fetchProducts(currentURL, currentPage);
                    }
                });
            });

        } else {
            categoryListContainer.innerHTML = "<p>Không có danh mục nào!</p>";
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh mục sản phẩm:", error);
        categoryListContainer.innerHTML = "<p>Không thể tải danh sách danh mục!</p>";
    }
});
