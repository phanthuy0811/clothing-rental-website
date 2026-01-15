export function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("JWT_TOKEN");

    if (!token) {
        console.error("Không tìm thấy token");
        return Promise.reject("Không tìm thấy token");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(url, { ...options, headers })
        .then(async response => {
            const contentType = response.headers.get("Content-Type");

            // Nếu lỗi (status code không phải 2xx)
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                // Nếu có response dạng JSON, parse ra
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || JSON.stringify(errorData);
                } else {
                    // Nếu trả về text thường
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Nếu thành công
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            } else {
                return response.text(); // hoặc response.blob() nếu cần xử lý ảnh/file
            }
        })
        .catch(error => {
            console.error("Lỗi khi fetch dữ liệu:", error);
            throw error;
        });
}
