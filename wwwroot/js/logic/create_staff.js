console.log('Script loaded'); // Debug log to verify script loading

// Hàm kiểm tra số điện thoại hợp lệ (10 số)
function isValidPhone(phone) {
    // Loại bỏ tất cả ký tự không phải số
    const cleanPhone = phone.replace(/\D/g, '');
    // Kiểm tra có đúng 10 số không
    return cleanPhone.length === 10;
}

// Hàm kiểm tra mật khẩu hợp lệ (không chứa ký tự # do Razor lỗi)
function isValidPassword(password) {
    // Ít nhất 8 ký tự
    if (password.length < 8) return false;
    // Phải có ít nhất 1 chữ cái
    if (!/[a-zA-Z]/.test(password)) return false;
    // Phải có ít nhất 1 số
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

// Hàm hiển thị thông báo cảnh báo
function showWarning(message) {
    showAlert(message, 'warning');
}

// Hàm kiểm tra số điện thoại đã tồn tại hay chưa
async function checkPhoneExists(phone) {
    try {
        const response = await window.authService.checkPhone(phone);
        return response;
    } catch (error) {
        console.error('Error checking phone:', error);
        return { exists: false, message: 'Không thể kiểm tra số điện thoại' };
    }
}

// Hàm lưu dữ liệu form vào localStorage
function saveFormData() {
    const formData = {
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        phone: document.getElementById('phone').value,
        password_hash: document.getElementById('passwordInput').value
    };
    localStorage.setItem('temp_staff_form_data', JSON.stringify(formData));
}

// Hàm khôi phục dữ liệu form từ localStorage
function restoreFormData() {
    const savedData = localStorage.getItem('temp_staff_form_data');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            document.getElementById('lastName').value = formData.lastName || '';
            document.getElementById('firstName').value = formData.firstName || '';
            document.getElementById('phone').value = formData.phone || '';
            document.getElementById('passwordInput').value = formData.password_hash || '';
        } catch (error) {
            console.error('Error parsing saved form data:', error);
        }
    }
}

// Biến để lưu trạng thái kiểm tra số điện thoại
let phoneCheckResult = { exists: false, message: '' };

document.getElementById('lastName').addEventListener('input', saveFormData);
document.getElementById('firstName').addEventListener('input', saveFormData);
document.getElementById('phone').addEventListener('input', saveFormData);
document.getElementById('passwordInput').addEventListener('input', saveFormData);

document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/[^\d+]/g, '');
    if (value.length > 12) {
        value = value.substring(0, 12);
    }
    e.target.value = value;
    saveFormData();
    
    // Kiểm tra số điện thoại khi đủ 10 số
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
        checkPhoneExists(cleanPhone).then(result => {
            phoneCheckResult = result;
            if (result.exists) {
                showWarning(result.message);
            }
        });
    } else {
        // Reset kết quả kiểm tra nếu không đủ 10 số
        phoneCheckResult = { exists: false, message: '' };
    }
});

function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const toggleIcon = document.getElementById('toggleIcon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.src = "/svg/cart.svg";
    } else {
        passwordInput.type = 'password';
        toggleIcon.src = "/svg/hidden.svg";
    }
}

document.getElementById('staffForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password_hash = document.getElementById('passwordInput').value;
    
    // Validate form
    if (!lastName || !firstName || !phone || !password_hash) {
        showError('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (!isValidPhone(phone)) {
        showError('Số điện thoại phải có đúng 10 chữ số');
        return;
    }
    
    // Kiểm tra số điện thoại đã tồn tại hay chưa
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneCheck = await checkPhoneExists(cleanPhone);
    
    if (phoneCheck.exists) {
        showError(phoneCheck.message);
        return;
    }
    
    if (!isValidPassword(password_hash)) {
        showError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái, số và ký tự đặc biệt');
        return;
    }
    
    const name = lastName + ' ' + firstName;
    localStorage.setItem('temp_staff_data', JSON.stringify({
        name: name,
        phone: phone,
        password_hash: password_hash
    }));
    
    setTimeout(() => {
        window.location.replace('/Auth/Create_Restaurant');
    }, 100);
});

document.addEventListener('DOMContentLoaded', function() {
    restoreFormData();
});
