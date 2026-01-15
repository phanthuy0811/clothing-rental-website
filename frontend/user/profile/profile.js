
import { fetchWithToken } from '../api.js'; // Hàm gọi API có kèm token

document.addEventListener('DOMContentLoaded', async function() {
    await loadUserProfile(); // Gọi hàm lấy thông tin user khi trang load

    document.getElementById('updateProfileForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Ngăn form reload trang

        await updateUserProfile(); // Gọi hàm cập nhật user
    });
});

// 🟢 **Hàm lấy thông tin user và hiển thị lên form**
async function loadUserProfile() {
    try {
        const response = await fetchWithToken('http://localhost:8081/laptrinhweb/user/profile', {
            method: 'GET'
        });

        console.log("HTTP Status Code:", response);

        if (!response || response.code !== 200) {
            throw new Error(`Không thể lấy thông tin người dùng. Chi tiết lỗi: ${JSON.stringify(response)}`);
        }     

        const data = response.result;
        console.log('Dữ liệu từ API:', data);

        
        // Hiển thị dữ liệu lên form
        document.getElementById('userName').value = data.userName || '';
        document.getElementById('fullName').value = data.fullName || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';
        document.querySelector('.avatar').src = data.avatarUrl || '/user/user.png';


    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
}

// 🟢 **Hàm cập nhật thông tin user và upload ảnh lên Cloudinary**
// 🟢 **Hàm cập nhật thông tin user**
async function updateUserProfile() {
    try {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const fileInput = document.getElementById('image').files[0]; // Lấy file ảnh nếu có

        // Tạo đối tượng chứa dữ liệu người dùng
        const userData = { 
            fullName: fullName,
            email: email,
            phone: phone
        };

        // Tạo FormData để gửi dữ liệu dạng multipart/form-data
        const formData = new FormData();
        
        // Append dữ liệu người dùng dưới dạng JSON blob
        formData.append("updateProfileRequest", new Blob([JSON.stringify(userData)], { type: "application/json" }));
        
        // Nếu có chọn file ảnh, thêm vào formData
        if (fileInput) {
            formData.append("image", fileInput);
        }

        // Gọi API cập nhật thông tin người dùng với FormData
        const response = await fetchWithToken('http://localhost:8081/laptrinhweb/user/update-profile', {
            method: 'PUT',
            body: formData
            // Không cần set Content-Type, browser sẽ tự động set khi dùng FormData
        });

        if (!response || response.code !== 200) {
            throw new Error(`Lỗi cập nhật thông tin: ${JSON.stringify(response)}`);
        }

        alert("Cập nhật thông tin thành công!");
        console.log('Thông tin sau khi cập nhật:', response.result);

        // Cập nhật lại giao diện sau khi cập nhật thành công
        await loadUserProfile();

    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        alert("Đã xảy ra lỗi khi cập nhật thông tin, vui lòng thử lại!");
    }
}

