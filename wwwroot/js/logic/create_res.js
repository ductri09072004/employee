// Hàm kiểm tra mã số thuế hợp lệ (10 số)
function isValidTaxCode(taxCode) {
    // Loại bỏ tất cả ký tự không phải số
    const cleanTaxCode = taxCode.replace(/\D/g, '');
    // Kiểm tra có đúng 10 số không
    return cleanTaxCode.length === 10;
}

// Biến lưu trữ dữ liệu
let provinces = [];
let districts = [];
let wards = [];

// Hàm fetch dữ liệu từ API
async function fetchProvinces() {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/?depth=3');
        provinces = await response.json();
        renderProvinces();
    } catch (error) {
        console.error('Error fetching provinces:', error);
        showAlert('Không thể tải dữ liệu địa chỉ', 'error');
    }
}

// Hàm render danh sách tỉnh/thành
function renderProvinces() {
    const provinceSelect = document.getElementById('province');
    provinceSelect.innerHTML = '<option value="">Chọn Tỉnh/Thành</option>';
    
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province.code;
        option.textContent = province.name;
        provinceSelect.appendChild(option);
    });
}

// Hàm render danh sách quận/huyện
function renderDistricts(provinceCode) {
    const districtSelect = document.getElementById('district');
    districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
    
    const province = provinces.find(p => p.code === parseInt(provinceCode));
    if (province) {
        districts = province.districts;
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district.code;
            option.textContent = district.name;
            districtSelect.appendChild(option);
        });
    }
}

// Hàm render danh sách phường/xã
function renderWards(districtCode) {
    const wardSelect = document.getElementById('ward');
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    
    const district = districts.find(d => d.code === parseInt(districtCode));
    if (district) {
        wards = district.wards;
        wards.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward.code;
            option.textContent = ward.name;
            wardSelect.appendChild(option);
        });
    }
}

// Hàm hiển thị thông tin staff
async function displayStaffInfo() {
    try {
        console.log('Getting staff data from localStorage...');
        const tempStaffData = localStorage.getItem('temp_staff_data');
        
        if (tempStaffData) {
            const staffData = JSON.parse(tempStaffData);
            console.log('Staff data from localStorage:', staffData);
            
            const container = document.getElementById('staffInfoContainer');
            
            // Hiển thị thông tin từ dữ liệu tạm thời
            document.getElementById('staffName').textContent = staffData.name || 'Chưa có thông tin';
            document.getElementById('staffPhone').textContent = staffData.phone || 'Chưa có thông tin';
            container.style.display = 'block';
            console.log('Staff info displayed successfully from localStorage');
        } else {
            showAlert('Không tìm thấy dữ liệu nhân viên tạm thời', 'warning');
            document.getElementById('staffInfoContainer').style.display = 'none';
        }
    } catch (error) {
        console.error('Error getting staff data from localStorage:', error);
        document.getElementById('staffInfoContainer').style.display = 'none';
    }
}

// Hàm lưu dữ liệu form vào localStorage
function saveRestaurantFormData() {
    const formData = {
        restaurantName: document.getElementById('restaurantName').value,
        province: document.getElementById('province').value,
        district: document.getElementById('district').value,
        ward: document.getElementById('ward').value,
        streetName: document.getElementById('streetName').value,
        taxCode: document.getElementById('taxCode').value
    };
    localStorage.setItem('temp_restaurant_form_data', JSON.stringify(formData));
}

// Hàm khôi phục dữ liệu form từ localStorage
function restoreRestaurantFormData() {
    const savedData = localStorage.getItem('temp_restaurant_form_data');
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('restaurantName').value = formData.restaurantName || '';
        document.getElementById('streetName').value = formData.streetName || '';
        document.getElementById('taxCode').value = formData.taxCode || '';
        
        // Khôi phục các select boxes (cần đợi dữ liệu provinces được load)
        if (formData.province) {
            setTimeout(() => {
                document.getElementById('province').value = formData.province;
                if (formData.district) {
                    renderDistricts(formData.province);
                    setTimeout(() => {
                        document.getElementById('district').value = formData.district;
                        if (formData.ward) {
                            renderWards(formData.district);
                            setTimeout(() => {
                                document.getElementById('ward').value = formData.ward;
                            }, 100);
                        }
                    }, 100);
                }
            }, 500);
        }
        console.log('Restaurant form data restored from localStorage');
    }
}

// Event listeners
document.getElementById('province').addEventListener('change', function() {
    renderDistricts(this.value);
    document.getElementById('ward').innerHTML = '<option value="">Chọn Phường/Xã</option>';
    saveRestaurantFormData();
});

document.getElementById('district').addEventListener('change', function() {
    renderWards(this.value);
    saveRestaurantFormData();
});

// Thêm event listeners để lưu dữ liệu khi user nhập
document.getElementById('restaurantName').addEventListener('input', saveRestaurantFormData);
document.getElementById('streetName').addEventListener('input', saveRestaurantFormData);
document.getElementById('taxCode').addEventListener('input', saveRestaurantFormData);
document.getElementById('province').addEventListener('change', saveRestaurantFormData);
document.getElementById('district').addEventListener('change', saveRestaurantFormData);
document.getElementById('ward').addEventListener('change', saveRestaurantFormData);

// Validation real-time cho mã số thuế
document.getElementById('taxCode').addEventListener('input', function(e) {
    // Chỉ cho phép nhập số
    let value = e.target.value;
    value = value.replace(/[^\d]/g, ''); // Chỉ giữ lại số
    
    // Giới hạn độ dài tối đa 10 số
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    e.target.value = value;
    saveRestaurantFormData();
});

// Handle form submission
document.getElementById('restaurantForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate form
    const restaurantName = document.getElementById('restaurantName').value;
    const provinceCode = document.getElementById('province').value;
    const districtCode = document.getElementById('district').value;
    const wardCode = document.getElementById('ward').value;
    const streetName = document.getElementById('streetName').value;
    const taxCode = document.getElementById('taxCode').value;
    
    if (!restaurantName || !provinceCode || !districtCode || !wardCode || !streetName || !taxCode) {
        showAlert('Vui lòng điền đầy đủ thông tin', 'warning');
        return;
    }

    // Validate mã số thuế
    if (!isValidTaxCode(taxCode)) {
        showAlert('Mã số thuế phải có đúng 10 chữ số', 'warning');
        return;
    }

    // Kiểm tra dữ liệu staff tạm thời
    const tempStaffData = localStorage.getItem('temp_staff_data');
    if (!tempStaffData) {
        showAlert('Không tìm thấy dữ liệu staff. Vui lòng quay lại trang đăng ký staff.', 'error');
        return;
    }

    const staffData = JSON.parse(tempStaffData);
    console.log('Retrieved staff data from localStorage:', staffData);

    // Tìm tên địa chỉ từ mã code
    const province = provinces.find(p => p.code === parseInt(provinceCode));
    const district = province?.districts.find(d => d.code === parseInt(districtCode));
    const ward = district?.wards.find(w => w.code === parseInt(wardCode));

    // Construct full address with actual names
    const fullAddress = `${streetName}, ${ward?.name}, ${district?.name}, ${province?.name}`;
    
    try {
        console.log('Step 1: Creating staff with data:', staffData);
        
        // Bước 1: Tạo staff trước
        const staffResponse = await window.authService.create_staff(
            staffData.name,
            staffData.phone,
            staffData.password_hash
        );

        console.log('Staff creation response:', staffResponse);

        if (!staffResponse || !staffResponse.id_staff) {
            showAlert('Có lỗi xảy ra khi tạo staff', 'error');
            return;
        }

        console.log('Staff created successfully with ID:', staffResponse.id_staff);
        
        // Lưu id_staff vào localStorage
        localStorage.setItem('id_staff', staffResponse.id_staff);
        
        // Bước 2: Tạo restaurant
        console.log('Step 2: Creating restaurant with data:', { restaurantName, fullAddress, taxCode });
        
        const restaurantResponse = await window.restaurantService.create_restaurant(
            restaurantName,
            fullAddress,
            taxCode
        );

        console.log('Restaurant response:', restaurantResponse);

        if (!restaurantResponse || !restaurantResponse.id_restaurant) {
            showAlert('Có lỗi xảy ra khi tạo restaurant', 'error');
            return;
        }

        console.log('Restaurant created successfully with ID:', restaurantResponse.id_restaurant);
        
        // Lưu id_restaurant vào localStorage
        localStorage.setItem('id_restaurant', restaurantResponse.id_restaurant);
        
        // Bước 3: Liên kết staff với restaurant
        console.log('Step 3: Linking staff with restaurant');
        
        const addIdResponse = await window.authService.add_id_restaurant(
            restaurantResponse.id_restaurant,
            staffResponse.id_staff
        );
        
        console.log('Link response:', addIdResponse);
        
        if (addIdResponse && addIdResponse.message) {
            console.log('Success message:', addIdResponse.message);
            
            // Xóa dữ liệu tạm thời
            localStorage.removeItem('temp_staff_data');
            localStorage.removeItem('temp_staff_form_data');
            localStorage.removeItem('temp_restaurant_form_data');
            
            showAlert('Tạo tài khoản thành công', 'success');
            
            setTimeout(() => {
                window.location.replace('/Auth/Login');
            }, 100);
        } else {
            console.log('No success message in response');
            showAlert('Tạo thành công nhưng có lỗi khi liên kết staff với restaurant', 'warning');
        }
        
    } catch (error) {
        console.error('Error in the process:', error);
        showAlert('Có lỗi xảy ra trong quá trình tạo. Vui lòng thử lại.', 'error');
    }
});

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị id_staff nếu có
    const id_staff = localStorage.getItem('id_staff');
    if (id_staff) {
        const displayElement = document.getElementById('displayIdStaff');
        if (displayElement) {
            displayElement.textContent = id_staff;
        }
    }
    
    // Khởi tạo dữ liệu
    fetchProvinces();
    displayStaffInfo();
    
    // Khôi phục dữ liệu form sau khi provinces được load
    setTimeout(() => {
        restoreRestaurantFormData();
    }, 1000);
});
