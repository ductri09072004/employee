let currentEditDishId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                loadToppings(user.restaurant_id);
            } else {
                console.error('Không tìm thấy restaurant_id trong thông tin user');
                document.getElementById('topping-accordion-body').innerHTML = '<tr><td colspan="4">Không tìm thấy thông tin nhà hàng.</td></tr>';
            }
        } catch (error) {
            console.error('Lỗi khi parse user data:', error);
            document.getElementById('topping-accordion-body').innerHTML = '<tr><td colspan="4">Lỗi dữ liệu người dùng.</td></tr>';
        }
    } else {
        console.error('Chưa đăng nhập');
        document.getElementById('topping-accordion-body').innerHTML = '<tr><td colspan="4">Người dùng chưa đăng nhập.</td></tr>';
    }

    // Sửa event cho nút Sửa (edit)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-link.edit')) {
            e.preventDefault();
            const link = e.target.closest('.action-link.edit');
            const dishId = link.getAttribute('data-id');
            showAddToppingModalForDish(dishId);
        }
    });

    // Event cho nút Xóa (delete)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-link.delete')) {
            e.preventDefault();
            const link = e.target.closest('.action-link.delete');
            const dishId = link.getAttribute('data-id');
            const optionId = link.getAttribute('data-option-id');
            showDeleteConfirmation(dishId, optionId);
        }
    });

    // Đóng modal thêm topping
    const closeBtn = document.getElementById('closeAddToppingModal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('add-topping-modal').style.display = 'none';
        };
    }
    // Thêm event cho nút mở modal thêm topping tổng quát
    const openAddToppingBtn = document.getElementById('openAddToppingModal');
    if (openAddToppingBtn) {
        openAddToppingBtn.onclick = async function() {
            const modal = document.getElementById('add-topping-modal');
            if (modal) {
                modal.style.display = 'block';
                document.getElementById('toppingNameDetailsInput').value = '';
                document.getElementById('toppingNameInput').value = '';
                document.getElementById('toppingPriceInput').value = '';
                // Load danh sách món vào dropdown
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);
                let menuData = {};
                try {
                    menuData = await window.menuService.getMenu(user.restaurant_id);
                } catch (e) {
                    menuData = {};
                }
                const dishSelect = document.getElementById('dishSelect');
                dishSelect.innerHTML = '';
                Object.values(menuData).forEach(dish => {
                    const option = document.createElement('option');
                    option.value = dish.id_dishes || dish.id;
                    option.textContent = dish.name;
                    dishSelect.appendChild(option);
                });
                // Gọi trigger change để load phân loại cho món đầu tiên
                if (dishSelect.options.length > 0) {
                    dishSelect.value = dishSelect.options[0].value;
                    dishSelect.dispatchEvent(new Event('change'));
                }
            }
        };
    }

    // Khi chọn món, load các phân loại (name_details) của món đó vào select
    document.getElementById('dishSelect').addEventListener('change', async function() {
        const dishId = this.value;
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        let menuData = {};
        try {
            menuData = await window.menuService.getMenu(user.restaurant_id);
        } catch (e) {
            menuData = {};
        }
        const dish = Object.values(menuData).find(d => (d.id_dishes || d.id) === dishId);
        const select = document.getElementById('toppingNameDetailsSelect');
        select.innerHTML = '<option value="">-- Chọn phân loại --</option><option value="__new__">+ Nhập phân loại mới</option>';
        if (dish && dish.toppings) {
            const uniqueDetails = [...new Set(dish.toppings.map(t => t.name_details))];
            uniqueDetails.forEach(name_details => {
                const opt = document.createElement('option');
                opt.value = name_details;
                opt.textContent = name_details;
                select.appendChild(opt);
            });
        }
        // Ẩn input nhập mới
        document.getElementById('toppingNameDetailsInput').style.display = 'none';
    });

    // Khi chọn phân loại, nếu chọn nhập mới thì hiện input
    document.getElementById('toppingNameDetailsSelect').addEventListener('change', function() {
        if (this.value === '__new__') {
            document.getElementById('toppingNameDetailsInput').style.display = '';
        } else {
            document.getElementById('toppingNameDetailsInput').style.display = 'none';
        }
    });
    
    // Thêm validation cho ô nhập phân loại topping
    const toppingNameDetailsInput = document.getElementById('toppingNameDetailsInput');
    if (toppingNameDetailsInput) {
        let lastDetailsLength = 0;
        toppingNameDetailsInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Hiển thị thông báo khi vừa đạt 20 ký tự
            if (value.length === 20 && lastDetailsLength < 20) {
                if (typeof showAlert === 'function') {
                    showAlert('Phân loại topping chỉ tối đa 20 ký tự', 'warning');
                } else {
                    alert('Phân loại topping chỉ tối đa 20 ký tự');
                }
            }
            lastDetailsLength = value.length;
        });
    }
    
    // Thêm validation cho ô nhập tên topping
    const toppingNameInput = document.getElementById('toppingNameInput');
    if (toppingNameInput) {
        let lastToppingNameLength = 0;
        toppingNameInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Hiển thị thông báo khi vừa đạt 20 ký tự
            if (value.length === 20 && lastToppingNameLength < 20) {
                if (typeof showAlert === 'function') {
                    showAlert('Tên topping chỉ tối đa 20 ký tự', 'warning');
                } else {
                    alert('Tên topping chỉ tối đa 20 ký tự');
                }
            }
            lastToppingNameLength = value.length;
        });
    }
    
    // Thêm validation cho ô nhập giá topping
    const toppingPriceInput = document.getElementById('toppingPriceInput');
    if (toppingPriceInput) {
        toppingPriceInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Chặn nhập dấu "-"
            if (value.includes('-')) {
                value = value.replace(/-/g, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giá topping không được nhập số âm', 'warning');
                } else {
                    alert('Giá topping không được nhập số âm');
                }
                return;
            }
            
            // Chặn bắt đầu bằng số 0 (trừ khi chỉ có 1 số 0)
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giá topping không được bắt đầu bằng số 0', 'warning');
                } else {
                    alert('Giá topping không được bắt đầu bằng số 0');
                }
                return;
            }
            
            // Kiểm tra nếu giá vượt quá 99,999,999
            const numValue = parseFloat(value);
            if (numValue > 99999999) {
                e.target.value = 99999999;
                if (typeof showAlert === 'function') {
                    showAlert('Giá topping không được lớn hơn 99,999,999 VNĐ', 'warning');
                } else {
                    alert('Giá topping không được lớn hơn 99,999,999 VNĐ');
                }
            }
        });
    }

    // Xác nhận thêm topping
    const confirmBtn = document.getElementById('confirmAddToppingBtn');
    if (confirmBtn) {
        confirmBtn.onclick = async function() {
            const dishSelect = document.getElementById('dishSelect');
            const id_dishes = dishSelect ? dishSelect.value : null;
            // Lấy name_details từ select hoặc input
            const detailsSelect = document.getElementById('toppingNameDetailsSelect');
            let name_details = '';
            if (detailsSelect.value === '__new__') {
                name_details = document.getElementById('toppingNameDetailsInput').value.trim();
            } else {
                name_details = detailsSelect.value;
            }
            const name = document.getElementById('toppingNameInput').value.trim();
            const priceStr = document.getElementById('toppingPriceInput').value.trim();
            const price = Number(priceStr);
            if (!id_dishes || !name_details || !name || !priceStr) {
                showAlert('Vui lòng nhập đầy đủ thông tin!', 'warning');
                return;
            }
            if (isNaN(price) || price < 0) {
                showAlert('Giá topping không hợp lệ!', 'warning');
                return;
            }
            // Construct options as a single-item array
            const options = [{ name, price }];
            try {
                showLoading();
                await window.toppingService.createTopping({
                    id_dishes,
                    name_details,
                    options
                });
                showAlert('Thêm topping thành công!', 'success');
                document.getElementById('add-topping-modal').style.display = 'none';
                // Reload lại topping
                const userStr = localStorage.getItem('user');
                const user = JSON.parse(userStr);
                loadToppings(user.restaurant_id);
            } catch (err) {
                showAlert('Thêm topping thất bại!', 'error');
            } finally {
                hideLoading();
            }
        };
    }
    // Đóng modal khi click outside
    const modal = document.getElementById('add-topping-modal');
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    // Event listener cho nút đóng modal add table
    const closeAddTableModalBtn = document.getElementById('closeAddTableModal');
    if (closeAddTableModalBtn) {
        closeAddTableModalBtn.addEventListener('click', function() {
            closeModal('add-table-modal');
        });
    }

    // Event listener cho nút đóng modal QR
    const closeQRModalBtn = document.getElementById('closeShowQRModal');
    if (closeQRModalBtn) {
        closeQRModalBtn.addEventListener('click', function() {
            closeModal('show-qr-modal');
        });
    }

    // Đóng modal add table khi click outside
    const addTableModal = document.getElementById('add-table-modal');
    if (addTableModal) {
        window.addEventListener('click', function(e) {
            if (e.target === addTableModal) addTableModal.style.display = 'none';
        });
    }

    // Đóng modal delete khi click outside
    const deleteModal = document.getElementById('delete-table-modal');
    if (deleteModal) {
        window.addEventListener('click', function(e) {
            if (e.target === deleteModal) deleteModal.style.display = 'none';
        });
    }

    // Đóng modal QR khi click outside
    const qrModal = document.getElementById('show-qr-modal');
    if (qrModal) {
        window.addEventListener('click', function(e) {
            if (e.target === qrModal) qrModal.style.display = 'none';
        });
    }
});

async function loadToppings(restaurantId) {
    try {
        showLoading();
        
        // Check cache first
        const cacheKey = `toppingsData_${restaurantId}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        let data;
        if (cachedData) {
            try {
                data = JSON.parse(cachedData);
                console.log('Loaded toppings from cache');
            } catch (parseError) {
                console.error('Error parsing cached data:', parseError);
                localStorage.removeItem(cacheKey);
            }
        }
        
        // If no cached data or parsing failed, fetch from API
        if (!data) {
            data = await window.menuService.getMenu(restaurantId);
            // Cache the data
            localStorage.setItem(cacheKey, JSON.stringify(data));
            console.log('Loaded toppings from API and cached');
        }
        
        window.renderToppingAccordion(data);
    } catch (error) {
        console.error('Error loading toppings:', error);
        document.getElementById('topping-accordion-body').innerHTML = '<tr><td colspan="4">Lỗi tải dữ liệu.</td></tr>';
    } finally {
        hideLoading();
    }
}

// --- Refresh Toppings Data ---
window.refreshToppingsData = function() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                const cacheKey = `toppingsData_${user.restaurant_id}`;
                localStorage.removeItem(cacheKey);
                loadToppings(user.restaurant_id);
            }
        } catch (error) {
            console.error('Error refreshing toppings data:', error);
        }
    }
};

function showDeleteConfirmation(dishId, optionId) {
    const deleteModal = document.getElementById('delete-table-modal');
    if (deleteModal) {
        deleteModal.style.display = 'block';
        
        // Update modal content for topping
        const modalTitle = deleteModal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Xác nhận xóa topping';
            modalTitle.style.color = '#B24242';
        }

        const modalContent = deleteModal.querySelector('div[style*="text-align:center"]');
        if (modalContent) {
            modalContent.textContent = 'Bạn có chắc chắn muốn xóa topping này không?';
        }

        // Setup delete confirmation
        const confirmBtn = document.getElementById('confirmDeleteTableBtn');
        if (confirmBtn) {
            confirmBtn.onclick = () => deleteTopping(dishId, optionId);
        }
    }
}

async function deleteTopping(dishId, optionId) {
    try {
        // TODO: Implement actual deletion logic
        console.log('Delete topping:', { dishId, optionId });
        showAlert('Chức năng xóa topping sẽ được implement sau', 'warning');
        closeModal('delete-table-modal');
        
        // Clear cache and reload data
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                const cacheKey = `toppingsData_${user.restaurant_id}`;
                localStorage.removeItem(cacheKey);
                loadToppings(user.restaurant_id);
            }
        }
    } catch (error) {
        console.error('Error deleting topping:', error);
        showAlert('Có lỗi xảy ra khi xóa topping', 'error');
    }
}

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function showAddToppingModalForDish(dishId) {
    currentEditDishId = dishId;
    const modal = document.getElementById('add-topping-modal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('toppingNameDetailsInput').value = '';
        document.getElementById('toppingNameInput').value = '';
        document.getElementById('toppingPriceInput').value = '';
    }
}

// Render topping accordion table
window.renderToppingAccordion = function(data) {
    const tbody = document.getElementById('topping-accordion-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    const dishes = Object.values(data);
    dishes.forEach((dish, idx) => {
        const stt = String(idx + 1).padStart(2, '0');
        const statusBadge = (dish.status === 'active' || dish.status === true)
            ? '<span style="color: #28a745; font-weight: 600;">Còn món</span>'
            : '<span style="color: #dc3545; font-weight: 600;">Hết món</span>';
        // Main row
        const trMain = document.createElement('tr');
        trMain.className = 'topping-accordion-row';
        trMain.innerHTML = `
            <td>${stt}</td>
            <td>${dish.name}</td>
            <td>${statusBadge}</td>
            <td>
                <a href="#" class="action-link edit" data-id="${dish.id_dishes || dish.id}" title="Sửa">
                    <img src="/svg/icon_action/write.svg" alt="Sửa món" style="width:20px; height: 20px;">
                </a>
                <a href="#" class="action-link delete" data-id="${dish.id_dishes || dish.id}" title="Xóa">
                      <img src="/svg/icon_action/delete.svg" alt="Xóa món" style="width: 20px; height: 20px;">
                </a>
            </td>
        `;
        // Details row
        const trDetails = document.createElement('tr');
        trDetails.className = 'topping-accordion-details';
        trDetails.innerHTML = `<td colspan="4">
            <ul class="topping-topping-list">
                ${(dish.toppings||[]).map(cat => `
                    <li class="topping-category">${cat.name_details}
                        <ul>
                            ${(cat.options||[]).filter(o=>o).map(option => `
                                <li class="topping-option">${option.name} <span style='color:#888;'>(${option.price.toLocaleString('vi-VN')} đ)</span></li>
                            `).join('')}
                        </ul>
                    </li>
                `).join('')}
            </ul>
        </td>`;
        // Accordion logic
        trMain.addEventListener('click', function(e) {
            // Đừng trigger khi bấm vào nút Sửa/Xóa
            if (e.target.closest('.action-link')) return;
            trDetails.classList.toggle('open');
        });
        tbody.appendChild(trMain);
        tbody.appendChild(trDetails);
    });
};

// Hook vào loadToppings để sử dụng accordion view
if (window.loadToppings) {
    const oldLoadToppings = window.loadToppings;
    window.loadToppings = async function(restaurantId) {
        try {
            const data = await window.menuService.getMenu(restaurantId);
            window.renderToppingAccordion(data);
        } catch (error) {
            console.error('Error loading toppings:', error);
            document.getElementById('topping-accordion-body').innerHTML = '<tr><td colspan="4">Lỗi tải dữ liệu.</td></tr>';
        }
    };
} 