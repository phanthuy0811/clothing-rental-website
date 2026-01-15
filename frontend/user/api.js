

export function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("JWT_TOKEN");  // Lấy token từ Local Storage

    if (!token) {
        console.error("Không tìm thấy token");
        return Promise.reject("Không tìm thấy token");
    }

    // Tạo headers từ options, nếu có
    const headers = new Headers(options.headers || {});

    // Đặt Authorization cho mọi request
    headers.set("Authorization", `Bearer ${token}`);

    // Nếu body không phải là FormData, đặt Content-Type là application/json
    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(url, { ...options, headers })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || "Lỗi khi gọi API");
                });
            }
            return response.json();
        })
        .catch(error => {
            console.error("Lỗi khi fetch dữ liệu:", error);
            throw error;
        });
}
