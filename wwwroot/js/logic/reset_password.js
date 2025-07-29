// Hàm kiểm tra số điện thoại hợp lệ (10 số)
function isValidPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10;
}

// Hàm kiểm tra mật khẩu hợp lệ (không chứa ký tự # do Razor lỗi)
function isValidPassword(password) {
    if (password.length < 8) return false;
    if (!/[a-zA-Z]/.test(password)) return false;
    if (!/\d/.test(password)) return false;
    // Phải có ít nhất 1 ký tự đặc biệt (không có #)
    if (!/[!@$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) return false;
    return true;
}

// Hàm hiển thị thông báo lỗi
function showError(message) {
    showAlert(message, 'error');
}

// Hàm hiển thị thông báo thành công
function showSuccess(message) {
    showAlert(message, 'success');
}

// Hàm toggle hiển thị mật khẩu
function togglePassword() {
    const passwordInput = document.getElementById('newPassword');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.src = '/svg/sidebar/hidden.svg'; // Giữ nguyên icon ẩn
    } else {
        passwordInput.type = 'password';
        toggleIcon.src = '/svg/sidebar/hidden.svg'; // Giữ nguyên icon ẩn
    }
}

// Hàm toggle hiển thị xác nhận mật khẩu
function toggleConfirmPassword() {
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleConfirmIcon = document.getElementById('toggleConfirmIcon');
    
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        toggleConfirmIcon.src = '/svg/sidebar/hidden.svg'; // Giữ nguyên icon ẩn
    } else {
        confirmPasswordInput.type = 'password';
        toggleConfirmIcon.src = '/svg/sidebar/hidden.svg'; // Giữ nguyên icon ẩn
    }
}

// Lưu dữ liệu form vào localStorage
function saveFormData() {
    const formData = {
        phone: document.getElementById('phone').value,
        newPassword: document.getElementById('newPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    localStorage.setItem('resetPasswordFormData', JSON.stringify(formData));
}

// Khôi phục dữ liệu form từ localStorage
function restoreFormData() {
    const savedData = localStorage.getItem('resetPasswordFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('phone').value = formData.phone || '';
        document.getElementById('newPassword').value = formData.newPassword || '';
        document.getElementById('confirmPassword').value = formData.confirmPassword || '';
    }
}

// Xóa dữ liệu form khỏi localStorage
function clearFormData() {
    localStorage.removeItem('resetPasswordFormData');
}

// Xử lý sự kiện khi trang được load
document.addEventListener('DOMContentLoaded', function() {
    restoreFormData();
    
    // Thêm event listener cho form submission
    document.getElementById('resetPasswordForm').addEventListener('submit', handleFormSubmit);
    
    // Thêm event listener cho input changes để lưu dữ liệu
    document.getElementById('phone').addEventListener('input', saveFormData);
    document.getElementById('newPassword').addEventListener('input', saveFormData);
    document.getElementById('confirmPassword').addEventListener('input', saveFormData);
    
    // Validation real-time cho số điện thoại
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value;
        value = value.replace(/[^\d]/g, ''); // Chỉ giữ lại số
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        e.target.value = value;
        saveFormData();
    });
});

// Xử lý form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const phone = document.getElementById('phone').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!phone) {
        showError('Vui lòng nhập số điện thoại');
        return;
    }
    
    if (!isValidPhone(phone)) {
        showError('Số điện thoại phải có đúng 10 chữ số');
        return;
    }
    
    if (!newPassword) {
        showError('Vui lòng nhập mật khẩu mới');
        return;
    }
    
    if (!isValidPassword(newPassword)) {
        showError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái, số và ký tự đặc biệt');
        return;
    }
    
    if (!confirmPassword) {
        showError('Vui lòng xác nhận mật khẩu');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Mật khẩu xác nhận không khớp');
        return;
    }
    
    try {
        // Sử dụng authService để reset password
        const response = await window.authService.reset_acc(phone, newPassword);
        
        if (response) {
            showSuccess('Đã đặt lại mật khẩu thành công');
            clearFormData();
            setTimeout(() => {
                window.location.href = '/Auth/Login';
            }, 2000);
        } else {
            showError(response.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        showError('Có lỗi xảy ra khi kết nối đến server');
    }
}