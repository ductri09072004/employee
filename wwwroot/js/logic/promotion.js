// Hiển thị danh sách staff vào bảng, bỏ qua password
let allStaffArr = [];
let currentPage = 1;
let itemsPerPage = 15;

document.addEventListener('DOMContentLoaded', function() {
    // Add promotion modal
    const openBtn = document.getElementById('openAddPromotionModal');
    const modal = document.getElementById('add-promotion-modal');
    const closeBtn = document.getElementById('closeAddPromotionModal');
    const closeX = document.getElementById('closeAddPromotionModalX');
    const form = document.getElementById('addPromotionForm');
    if (openBtn && modal && closeBtn) {
        openBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
        });
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        if (closeX) {
            closeX.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Edit promotion modal
    const editModal = document.getElementById('edit-promotion-modal');
    const closeEditBtn = document.getElementById('closeEditPromotionModal');
    const closeEditX = document.getElementById('closeEditPromotionModalX');
    const editForm = document.getElementById('editPromotionForm');
    
    if (editModal && closeEditBtn) {
        closeEditBtn.addEventListener('click', function() {
            editModal.style.display = 'none';
        });
        if (closeEditX) {
            closeEditX.addEventListener('click', function() {
                editModal.style.display = 'none';
            });
        }
        window.addEventListener('click', function(e) {
            if (e.target === editModal) {
                editModal.style.display = 'none';
            }
        });
    }
    
    // Edit form submit handler
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Edit form submitted'); // Debug log
            
            const promotionId = document.getElementById('edit-promotion-id').value;
            const date_end = document.getElementById('edit-date-end').value;
            const max_discount = Number(document.getElementById('edit-max-discount').value);
            const min_order_value = Number(document.getElementById('edit-min-order-value').value);
            const percent = Number(document.getElementById('edit-percent').value);
            const quantity = Number(document.getElementById('edit-quantity').value);
            const status = document.getElementById('edit-status').value;
            
            console.log('Form data:', { promotionId, date_end, max_discount, min_order_value, percent, quantity, status }); // Debug log
            
            if (!promotionId || !date_end || !max_discount || !min_order_value || !percent || !quantity || !status) {
                showAlert('Vui lòng điền đầy đủ thông tin!', 'warning');
                return;
            }
            
            try {
                // Tìm promotion trong array để lấy thông tin đầy đủ
                const promotion = allStaffArr.find(p => p.id === promotionId);
                if (!promotion) {
                    showAlert('Không tìm thấy thông tin khuyến mãi!', 'error');
                    return;
                }
                
                // Tạo object promotion với thông tin đầy đủ
                const updatedPromotionData = {
                    id_promotion: promotion.id_promotion,
                    id_restaurant: promotion.id_restaurant,
                    date_end: date_end,
                    max_discount: max_discount,
                    min_order_value: min_order_value,
                    percent: percent,
                    quantity: quantity,
                    status: status,
                    title: promotion.title,
                    title_sub: promotion.title_sub
                };
                
                console.log('Updating promotion with ID:', promotionId, 'new data:', updatedPromotionData);
                await window.promotionService.editPromotion(promotionId, updatedPromotionData);
                showAlert('Cập nhật khuyến mãi thành công!', 'success');
                editModal.style.display = 'none';
                
                // Clear cache and reload data
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.restaurant_id) {
                        const cacheKey = `promotionData_${user.restaurant_id}`;
                        localStorage.removeItem(cacheKey);
                        loadPromotionData(user.restaurant_id);
                    }
                }
            } catch (err) {
                console.error('Error updating promotion:', err);
                showAlert('Có lỗi xảy ra khi cập nhật khuyến mãi!', 'error');
            }
        });
    }
    

    
    // Thêm validation cho ô nhập ngày kết thúc
    const dateEndInput = document.getElementById('add-date-end');
    if (dateEndInput) {
        dateEndInput.addEventListener('change', function(e) {
            const selectedDate = new Date(e.target.value);
            const currentDate = new Date();
            
            // Tính khoảng cách giữa ngày được chọn và ngày hiện tại (tính bằng ngày)
            const timeDiff = selectedDate.getTime() - currentDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            // Kiểm tra nếu ngày kết thúc cách ngày hiện tại ít hơn 3 ngày
            if (daysDiff < 3) {
                // Tính ngày tối thiểu (ngày hiện tại + 3 ngày)
                const minDate = new Date();
                minDate.setDate(currentDate.getDate() + 3);
                
                // Format ngày tối thiểu thành định dạng datetime-local
                const year = minDate.getFullYear();
                const month = String(minDate.getMonth() + 1).padStart(2, '0');
                const day = String(minDate.getDate()).padStart(2, '0');
                const hours = String(minDate.getHours()).padStart(2, '0');
                const minutes = String(minDate.getMinutes()).padStart(2, '0');
                const minDateString = `${year}-${month}-${day}T${hours}:${minutes}`;
                
                // Đặt giá trị tối thiểu cho input
                e.target.value = minDateString;
                
                if (typeof showAlert === 'function') {
                    showAlert('Ngày kết thúc phải cách ngày hiện tại ít nhất 3 ngày', 'warning');
                } else {
                    alert('Ngày kết thúc phải cách ngày hiện tại ít nhất 3 ngày');
                }
            }
        });
        
        // Đặt ngày tối thiểu cho input khi trang được load
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 3);
        
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const minDateString = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        dateEndInput.setAttribute('min', minDateString);
    }
    
    // Thêm validation cho ô nhập giảm tối đa
    const maxDiscountInput = document.getElementById('add-max-discount');
    if (maxDiscountInput) {
        maxDiscountInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Chặn nhập dấu "-"
            if (value.includes('-')) {
                value = value.replace(/-/g, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giảm tối đa không được nhập số âm', 'warning');
                } else {
                    alert('Giảm tối đa không được nhập số âm');
                }
                return;
            }
            
            // Chặn bắt đầu bằng số 0 (trừ khi chỉ có 1 số 0)
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giảm tối đa không được bắt đầu bằng số 0', 'warning');
                } else {
                    alert('Giảm tối đa không được bắt đầu bằng số 0');
                }
                return;
            }
            
            // Kiểm tra nếu giá trị vượt quá 99,999,999
            const numValue = parseFloat(value);
            if (numValue > 99999999) {
                e.target.value = 99999999;
                if (typeof showAlert === 'function') {
                    showAlert('Giảm tối đa không được lớn hơn 99,999,999 VNĐ', 'warning');
                } else {
                    alert('Giảm tối đa không được lớn hơn 99,999,999 VNĐ');
                }
            }
        });
    }
    
    // Thêm validation cho ô nhập giá trị đơn tối thiểu
    const minOrderValueInput = document.getElementById('add-min-order-value');
    if (minOrderValueInput) {
        minOrderValueInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Chặn nhập dấu "-"
            if (value.includes('-')) {
                value = value.replace(/-/g, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giá trị đơn tối thiểu không được nhập số âm', 'warning');
                } else {
                    alert('Giá trị đơn tối thiểu không được nhập số âm');
                }
                return;
            }
            
            // Chặn bắt đầu bằng số 0 (trừ khi chỉ có 1 số 0)
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giá trị đơn tối thiểu không được bắt đầu bằng số 0', 'warning');
                } else {
                    alert('Giá trị đơn tối thiểu không được bắt đầu bằng số 0');
                }
                return;
            }
            
            // Kiểm tra nếu giá trị vượt quá 99,999,999
            const numValue = parseFloat(value);
            if (numValue > 99999999) {
                e.target.value = 99999999;
                if (typeof showAlert === 'function') {
                    showAlert('Giá trị đơn tối thiểu không được lớn hơn 99,999,999 VNĐ', 'warning');
                } else {
                    alert('Giá trị đơn tối thiểu không được lớn hơn 99,999,999 VNĐ');
                }
            }
        });
    }
    
    // Thêm validation cho ô nhập phần trăm giảm
    const percentInput = document.getElementById('add-percent');
    if (percentInput) {
        percentInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Chặn nhập dấu "-"
            if (value.includes('-')) {
                value = value.replace(/-/g, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Phần trăm giảm không được nhập số âm', 'warning');
                } else {
                    alert('Phần trăm giảm không được nhập số âm');
                }
                return;
            }
            
            // Chặn bắt đầu bằng số 0 (trừ khi chỉ có 1 số 0)
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Phần trăm giảm không được bắt đầu bằng số 0', 'warning');
                } else {
                    alert('Phần trăm giảm không được bắt đầu bằng số 0');
                }
                return;
            }
            
            // Kiểm tra nếu phần trăm vượt quá 100
            const numValue = parseFloat(value);
            if (numValue > 100) {
                e.target.value = 100;
                if (typeof showAlert === 'function') {
                    showAlert('Phần trăm giảm không được lớn hơn 100%', 'warning');
                } else {
                    alert('Phần trăm giảm không được lớn hơn 100%');
                }
            }
            
            // Kiểm tra nếu phần trăm nhỏ hơn 1
            if (numValue < 1 && value !== '') {
                e.target.value = 1;
                if (typeof showAlert === 'function') {
                    showAlert('Phần trăm giảm phải từ 1% trở lên', 'warning');
                } else {
                    alert('Phần trăm giảm phải từ 1% trở lên');
                }
            }
        });
    }
    
    // Thêm validation cho ô nhập số lượng
    const quantityInput = document.getElementById('add-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Chặn nhập dấu "-"
            if (value.includes('-')) {
                value = value.replace(/-/g, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Số lượng không được nhập số âm', 'warning');
                } else {
                    alert('Số lượng không được nhập số âm');
                }
                return;
            }
            
            // Chặn bắt đầu bằng số 0 (trừ khi chỉ có 1 số 0)
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Số lượng không được bắt đầu bằng số 0', 'warning');
                } else {
                    alert('Số lượng không được bắt đầu bằng số 0');
                }
                return;
            }
            
            // Kiểm tra nếu số lượng vượt quá 9999
            const numValue = parseFloat(value);
            if (numValue > 9999) {
                e.target.value = 9999;
                if (typeof showAlert === 'function') {
                    showAlert('Số lượng không được lớn hơn 9999', 'warning');
                } else {
                    alert('Số lượng không được lớn hơn 9999');
                }
            }
            
            // Kiểm tra nếu số lượng nhỏ hơn 1
            if (numValue < 1 && value !== '') {
                e.target.value = 1;
                if (typeof showAlert === 'function') {
                    showAlert('Số lượng phải từ 1 trở lên', 'warning');
                } else {
                    alert('Số lượng phải từ 1 trở lên');
                }
            }
        });
    }
    

    
    // Xử lý submit form thêm promotion
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            // Lấy id_restaurant từ localStorage
            let id_restaurant = '';
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user && user.restaurant_id) {
                        id_restaurant = user.restaurant_id;
                    }
                } catch {}
            } else {
                id_restaurant = localStorage.getItem('id_restaurant') || '';
            }
            // Lấy dữ liệu từ form
            const date_end = document.getElementById('add-date-end').value;
            const max_discount = Number(document.getElementById('add-max-discount').value);
            const min_order_value = Number(document.getElementById('add-min-order-value').value);
            const percent = Number(document.getElementById('add-percent').value);
            const quantity = Number(document.getElementById('add-quantity').value);
            const status = document.getElementById('add-status').value;
            try {
                showLoading();
                const result = await window.promotionService.createPromotion(
                    id_restaurant,
                    date_end,
                    max_discount,
                    min_order_value,
                    percent,
                    quantity,
                    status
                );
                if (result && (result.success || result.id_promotion)) {              
                    modal.style.display = 'none';
                    showAlert('Thêm khuyến mãi thành công!', 'success');
                    
                    // Clear cache and reload data
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user && user.restaurant_id) {
                            const cacheKey = `promotionData_${user.restaurant_id}`;
                            localStorage.removeItem(cacheKey);
                            loadPromotionData(user.restaurant_id);
                        }
                    }
                } else {
                    showAlert('Thêm khuyến mãi thất bại!', 'error' + (result && result.message ? result.message : ''));
                }
            } catch (error) {
                showAlert('Có lỗi khi thêm khuyến mãi!', 'error');
            } finally {
                hideLoading();
            }
        });
    }
    

});

window.addEventListener('DOMContentLoaded', async () => {
    let id_restaurant = '';
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                id_restaurant = user.restaurant_id;
            }
        } catch {}
    } else {
        id_restaurant = localStorage.getItem('id_restaurant');
    }
    
    if (id_restaurant) {
        loadPromotionData(id_restaurant);
    }
});

async function loadPromotionData(restaurantId) {
    try {
        showLoading();
        
        // Check cache first
        const cacheKey = `promotionData_${restaurantId}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        let data;
        if (cachedData) {
            try {
                data = JSON.parse(cachedData);
                console.log('Loaded promotion data from cache');
            } catch (parseError) {
                console.error('Error parsing cached data:', parseError);
                localStorage.removeItem(cacheKey);
            }
        }
        
        // If no cached data or parsing failed, fetch from API
        if (!data) {
            data = await window.promotionService.getPromotionByRes(restaurantId);
            // Cache the data
            localStorage.setItem(cacheKey, JSON.stringify(data));
            console.log('Loaded promotion data from API and cached');
        }
        
        console.log('Raw data from API:', data); // Debug log
        
        // data là object, mỗi key là 1 promotion
        // Convert object to array and add the Firebase document ID as id
        allStaffArr = Object.entries(data)
            .filter(([key, promotion]) => promotion.id_promotion)
            .map(([key, promotion]) => ({
                ...promotion,
                id: key // Store the Firebase document ID as 'id'
            }))
            .reverse();
        
        console.log('Processed allStaffArr:', allStaffArr); // Debug log
        
        // Lấy giá trị mặc định từ select nếu có
        const select = document.querySelector('.items-per-page-select');
        if (select) {
            itemsPerPage = parseInt(select.value, 10) || 15;
        }
        currentPage = 1;
        renderStaffListPaged(currentPage, itemsPerPage);
        updatePaginationUI(currentPage, itemsPerPage, allStaffArr.length);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách promotion:', error);
        const staffBody = document.getElementById('staffBody');
        if (staffBody) staffBody.innerHTML = '<tr><td colspan="8">Lỗi khi tải dữ liệu khuyến mãi.</td></tr>';
    } finally {
        hideLoading();
    }
}

// --- Refresh Promotion Data ---
window.refreshPromotionData = function() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                const cacheKey = `promotionData_${user.restaurant_id}`;
                localStorage.removeItem(cacheKey);
                // Show loading effect when refreshing
                showLoading();
                loadPromotionData(user.restaurant_id);
            }
        } catch (error) {
            console.error('Error refreshing promotion data:', error);
            hideLoading();
        }
    }
};

// Removed old success message handling since we now use direct showAlert

function formatDateTimeVN(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatCurrencyVN(value) {
    if (typeof value !== 'number') value = Number(value);
    if (isNaN(value)) return '';
    return value.toLocaleString('vi-VN') + 'đ';
}

function renderStatusVN(status) {
    if (status === 'active') return '<span style="color:#198754;">active</span>';
    if (status === 'inactive') return '<span style="color:#e31616;">inactive</span>';
    return status;
}

function renderStaffListPaged(page, perPage) {
    const staffBody = document.getElementById('staffBody');
    console.log('staffBody element:', staffBody); // Debug log
    
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageStaff = allStaffArr.slice(startIdx, endIdx);
    console.log('pageStaff:', pageStaff); // Debug log
    
    if (pageStaff.length === 0) {
        if (staffBody) {
            staffBody.innerHTML = '<tr><td colspan="8">Không có dữ liệu khuyến mãi.</td></tr>';
        }
        return;
    }
    
    staffBody.innerHTML = pageStaff.map(staff => `
        <tr>
            <td>${staff.id_promotion}</td>
            <td>${formatCurrencyVN(staff.max_discount)}</td>
            <td>${formatCurrencyVN(staff.min_order_value)}</td>
            <td>${staff.percent}%</td>
            <td>${staff.quantity}</td>
            <td>${formatDateTimeVN(staff.date_end)}</td>
            <td>${renderStatusVN(staff.status)}</td>
          
                         <td>
                  <a href="#" class="menu-action-link edit" data-id="${staff.id}" title="Sửa khuyến mãi">
                         <img src="/svg/icon_action/write.svg" alt="Sửa khuyến mãi" style="width:20px; height: 20px;">
                    </a>
                    <a href="#" class="menu-action-link delete" data-id="${staff.id}" title="Xóa khuyến mãi">
                         <img src="/svg/icon_action/delete.svg" alt="Xóa khuyến mãi" style="width: 20px; height: 20px;">
                    </a>
             </td>
        </tr>
    `).join('');
    
    // Add event listeners for edit and delete buttons
    const editButtons = staffBody.querySelectorAll('.edit');
    console.log('Found edit buttons:', editButtons.length); // Debug log
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const promotionId = this.getAttribute('data-id');
            console.log('Edit button clicked, promotionId:', promotionId); // Debug log
            openEditModal(promotionId);
        });
    });
    
    const deleteButtons = staffBody.querySelectorAll('.delete');
    console.log('Found delete buttons:', deleteButtons.length); // Debug log
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const promotionId = this.getAttribute('data-id');
            console.log('Delete button clicked, promotionId:', promotionId); // Debug log
            showDeleteConfirmation(promotionId);
        });
    });
}

// Function to open edit modal and populate with promotion data
function openEditModal(promotionId) {
    console.log('Edit promotion function called with ID:', promotionId);
    
    // Tìm promotion trong array
    const promotion = allStaffArr.find(p => p.id === promotionId);
    if (!promotion) {
        console.error('Promotion not found with ID:', promotionId);
        showAlert('Không tìm thấy khuyến mãi!', 'error');
        return;
    }
    
    console.log('Found promotion:', promotion); // Debug log
    
    // Sử dụng modal có sẵn trong HTML
    const modal = document.getElementById('edit-promotion-modal');
    if (!modal) {
        console.error('Edit modal not found!');
        showAlert('Không tìm thấy modal sửa khuyến mãi!', 'error');
        return;
    }
    
    // Điền dữ liệu vào form
    const promotionIdInput = document.getElementById('edit-promotion-id');
    const dateEndInput = document.getElementById('edit-date-end');
    const maxDiscountInput = document.getElementById('edit-max-discount');
    const minOrderValueInput = document.getElementById('edit-min-order-value');
    const percentInput = document.getElementById('edit-percent');
    const quantityInput = document.getElementById('edit-quantity');
    const statusInput = document.getElementById('edit-status');
    
    if (promotionIdInput && dateEndInput && maxDiscountInput && minOrderValueInput && percentInput && quantityInput && statusInput) {
        // Lưu promotion ID để sử dụng khi submit
        promotionIdInput.value = promotionId;
        
        // Format date for datetime-local input
        const dateEnd = new Date(promotion.date_end);
        const year = dateEnd.getFullYear();
        const month = String(dateEnd.getMonth() + 1).padStart(2, '0');
        const day = String(dateEnd.getDate()).padStart(2, '0');
        const hours = String(dateEnd.getHours()).padStart(2, '0');
        const minutes = String(dateEnd.getMinutes()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        dateEndInput.value = formattedDate;
        maxDiscountInput.value = promotion.max_discount;
        minOrderValueInput.value = promotion.min_order_value;
        percentInput.value = promotion.percent;
        quantityInput.value = promotion.quantity;
        statusInput.value = promotion.status;
        
        // Set minimum date for edit form
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 3);
        
        const minYear = currentDate.getFullYear();
        const minMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const minDay = String(currentDate.getDate()).padStart(2, '0');
        const minHours = String(currentDate.getHours()).padStart(2, '0');
        const minMinutes = String(currentDate.getMinutes()).padStart(2, '0');
        const minDateString = `${minYear}-${minMonth}-${minDay}T${minHours}:${minMinutes}`;
        
        dateEndInput.setAttribute('min', minDateString);
    } else {
        console.error('Some form inputs not found!');
        showAlert('Có lỗi khi tải form sửa khuyến mãi!', 'error');
        return;
    }
    
    // Hiển thị modal
    modal.style.display = 'flex';
    
    console.log('Modal displayed successfully'); // Debug log
}

// --- Delete Confirmation Modal ---
function showDeleteConfirmation(promotionId) {
    console.log('showDeleteConfirmation called with promotionId:', promotionId);
    
    // Tìm promotion trong array để hiển thị thông tin
    const promotion = allStaffArr.find(p => p.id === promotionId);
    if (!promotion) {
        console.error('Promotion not found with ID:', promotionId);
        showAlert('Không tìm thấy khuyến mãi!', 'error');
        return;
    }
    
    let modal = document.getElementById('delete-promotion-modal');
    if (!modal) {
        // Tạo modal nếu chưa có
        modal = document.createElement('div');
        modal.id = 'delete-promotion-modal';
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                position: relative;
                animation: popupFadeIn 0.3s ease-out;
            ">
                <span class="close-modal" id="closeDeletePromotionModal" style="
                    position: absolute;
                    top: 12px;
                    right: 16px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #999;
                    cursor: pointer;
                    line-height: 1;
                ">&times;</span>
                <h2 class="modal-title" style="
                    color: #B24242;
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: 600;
                    text-align: center;
                ">Xác nhận xóa khuyến mãi</h2>
                <div style="
                    margin: 18px 0 24px 0;
                    text-align: center;
                    color: #333;
                    font-size: 15px;
                    line-height: 1.5;
                ">
                    Bạn có chắc chắn muốn xóa khuyến mãi <strong>${promotion.id_promotion}</strong> không?
                </div>
                <div style="
                    display: flex;
                    gap: 12px;
                    width: 100%;
                    justify-content: center;
                ">
                    <button id="cancelDeletePromotionBtn" style="
                        background: #e9ecef;
                        color: #333;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 14px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: background-color 0.2s;
                        min-width: 80px;
                    " onmouseover="this.style.backgroundColor='#d1d5db'" onmouseout="this.style.backgroundColor='#e9ecef'">Hủy</button>
                    <button id="confirmDeletePromotionBtn" style="
                        background: #B24242;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 14px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: background-color 0.2s;
                        min-width: 80px;
                    " onmouseover="this.style.backgroundColor='#a03a3a'" onmouseout="this.style.backgroundColor='#B24242'">Xóa</button>
                </div>
            </div>
        `;
        
        // Thêm CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popupFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.8) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    } else {
        // Cập nhật thông tin promotion trong modal nếu đã tồn tại
        const titleElement = modal.querySelector('.modal-title');
        const messageElement = modal.querySelector('div[style*="text-align: center"]');
        if (titleElement && messageElement) {
            titleElement.textContent = 'Xác nhận xóa khuyến mãi';
            messageElement.innerHTML = `Bạn có chắc chắn muốn xóa khuyến mãi <strong>${promotion.id_promotion}</strong> không?`;
        }
    }
    
    modal.style.display = 'flex';

    // Đóng modal
    const closeBtn = document.getElementById('closeDeletePromotionModal');
    const cancelBtn = document.getElementById('cancelDeletePromotionBtn');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    if (cancelBtn) cancelBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };
    
    // Xác nhận xóa
    const confirmBtn = document.getElementById('confirmDeletePromotionBtn');
    if (confirmBtn) {
        confirmBtn.onclick = async function() {
            try {
                console.log('Deleting promotion with ID:', promotionId);
                await window.promotionService.deletePromotion(promotionId);
                showAlert('Xóa khuyến mãi thành công!', 'success');
                modal.style.display = 'none';
                
                // Clear cache and reload data
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.restaurant_id) {
                        const cacheKey = `promotionData_${user.restaurant_id}`;
                        localStorage.removeItem(cacheKey);
                        loadPromotionData(user.restaurant_id);
                    }
                }
            } catch (err) {
                console.error('Error deleting promotion:', err);
                showAlert('Có lỗi xảy ra khi xóa khuyến mãi!', 'error');
                modal.style.display = 'none';
            }
        };
    }
}

function updatePaginationUI(page, perPage, totalItems) {
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    currentPage = parseInt(page, 10);
    itemsPerPage = parseInt(perPage, 10);
    // Update info text
    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        paginationInfo.textContent = `${start} - ${end}/${totalItems}`;
    }
    // Update button states and onclick handlers
    const btnFirst = document.getElementById('page-first');
    const btnPrev = document.getElementById('page-prev');
    const btnNext = document.getElementById('page-next');
    const btnLast = document.getElementById('page-last');
    if (btnFirst && btnPrev && btnNext && btnLast) {
        btnFirst.disabled = currentPage === 1;
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;
        btnLast.disabled = currentPage === totalPages;
        // Xóa event listeners cũ (nếu có)
        btnFirst.replaceWith(btnFirst.cloneNode(true));
        btnPrev.replaceWith(btnPrev.cloneNode(true));
        btnNext.replaceWith(btnNext.cloneNode(true));
        btnLast.replaceWith(btnLast.cloneNode(true));
        // Lấy lại reference sau khi clone
        const newBtnFirst = document.getElementById('page-first');
        const newBtnPrev = document.getElementById('page-prev');
        const newBtnNext = document.getElementById('page-next');
        const newBtnLast = document.getElementById('page-last');
        // Gắn event listeners mới
        newBtnFirst.addEventListener('click', () => window.staffPageChange(1, itemsPerPage));
        newBtnPrev.addEventListener('click', () => window.staffPageChange(currentPage - 1, itemsPerPage));
        newBtnNext.addEventListener('click', () => window.staffPageChange(currentPage + 1, itemsPerPage));
        newBtnLast.addEventListener('click', () => window.staffPageChange(totalPages, itemsPerPage));
    }
}

// Hàm này sẽ được gọi bởi component Pagination
window.staffPageChange = function(page, perPage) {
    currentPage = parseInt(page, 10);
    itemsPerPage = parseInt(perPage, 10);
    renderStaffListPaged(currentPage, itemsPerPage);
    updatePaginationUI(currentPage, itemsPerPage, allStaffArr.length);
};
