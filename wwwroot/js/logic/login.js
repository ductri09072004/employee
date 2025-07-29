// Login functionality
function togglePassword() {
    var input = document.getElementById("passwordInput");
    var icon = document.getElementById("toggleIcon");
    if (input.type === "password") {
        input.type = "text";
        icon.src = "/svg/cart.svg";
    } else {
        input.type = "password";
        icon.src = "/svg/hidden.svg";
    }
}

// Hiển thị loading state
function showLoading() {
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <div class="spinner" style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span>Đang xử lý...</span>
        </div>
    `;
}

// Ẩn loading state
function hideLoading() {
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Đăng nhập';
}

// Xử lý form submission
async function handleLoginForm(e) {
    e.preventDefault();
    
    // Reset error messages
    document.getElementById('phoneError').style.display = 'none';
    document.getElementById('passwordError').style.display = 'none';
    
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('passwordInput').value;
    
    // Validate input
    if (!phone) {
        document.getElementById('phoneError').textContent = 'Vui lòng nhập số điện thoại';
        document.getElementById('phoneError').style.display = 'block';
        return;
    }
    
    if (!password) {
        document.getElementById('passwordError').textContent = 'Vui lòng nhập mật khẩu';
        document.getElementById('passwordError').style.display = 'block';
        return;
    }

    // Hiển thị loading
    showLoading();

    try {
        const response = await window.authService.login(phone, password);

        if (response.success) {
            // Lưu thông tin user vào localStorage
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Gửi request để lưu session
            const sessionResponse = await fetch('/Auth/SetSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone: phone })
            });

            if (sessionResponse.ok) {
                // Chuyển hướng theo role
                if (response.user.role === 'superadmin') {
                    window.location.href = '/Admin/Index';
                } else {
                    window.location.href = '/Home/Index';
                }
            } else {
                hideLoading();
                document.getElementById('passwordError').textContent = 'Có lỗi xảy ra khi xác thực';
                document.getElementById('passwordError').style.display = 'block';
            }
        } else {
            hideLoading();
            // Hiển thị thông báo lỗi
            document.getElementById('passwordError').textContent = response.message || 'Đăng nhập thất bại';
            document.getElementById('passwordError').style.display = 'block';
        }
    } catch (error) {
        hideLoading();
        console.error('Error:', error);
        document.getElementById('passwordError').textContent = 'Có lỗi xảy ra, vui lòng thử lại';
        document.getElementById('passwordError').style.display = 'block';
    }
}

// Khởi tạo khi trang được load
document.addEventListener('DOMContentLoaded', function() {
    // Thêm CSS cho spinner
    if (!document.getElementById('login-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'login-spinner-style';
        style.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .btn-submit:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Thêm event listener cho form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }
});
