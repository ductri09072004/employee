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

// Khởi tạo các event listeners
function initializeAddressSelectors() {
    document.getElementById('province').addEventListener('change', function() {
        renderDistricts(this.value);
        document.getElementById('ward').innerHTML = '<option value="">Chọn Phường/Xã</option>';
    });

    document.getElementById('district').addEventListener('change', function() {
        renderWards(this.value);
    });

    // Khởi tạo dữ liệu
    fetchProvinces();
}

// Export các hàm cần thiết
window.addressAPI = {
    initializeAddressSelectors
}; 