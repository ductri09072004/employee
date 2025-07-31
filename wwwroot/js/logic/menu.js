// --- State Variables ---
let allMenuItems = [];
let currentPage = 1;
let itemsPerPage = 15;
let user = null;
let allCategoriesArr = [];
let selectedImageFile = null; // Biến toàn cục cho modal
let selectedAddImageFile = null;

// --- DOMContentLoaded: Entry point ---
document.addEventListener('DOMContentLoaded', async function() {
    // Thêm nút làm mới nếu chưa có
    if (!document.getElementById('refreshBtn')) {
        const btn = document.createElement('button');
        btn.id = 'refreshBtn';
        btn.innerHTML = '<img src="/svg/icon_action/reset.svg" alt="Reset" width="16" height="16">';
        btn.style = 'margin: 12px; background: #007bff; color: #fff; border: none; border-radius: 6px; padding: 8px 18px; font-weight: 600; cursor: pointer;';
        const table = document.getElementById('menu-table-body');
        if (table && table.parentElement) {
            const wrapper = document.createElement('div');
            wrapper.style = 'text-align: right; width: 100%;';
            wrapper.appendChild(btn);
            table.parentElement.insertAdjacentElement('beforebegin', wrapper);
        }
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                await loadCategoriesForMenu(user.restaurant_id); // load categories trước
                
                // Kiểm tra cache trước
                const cacheKey = `menuData_${user.restaurant_id}`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    try {
                        const data = JSON.parse(cached);
                        if (Array.isArray(data) && data.length > 0) {
                            renderMenuList(data);
                            console.log('Đã load dữ liệu menu từ cache');
                            return;
                        }
                    } catch (e) {
                        console.error('Lỗi parse cache, fallback về API:', e);
                    }
                }
                
                // Load từ API nếu không có cache
                await loadMenuList(user.restaurant_id, cacheKey);
            } else {
                console.error('Restaurant ID not found in user data.');
                displayError('Không tìm thấy thông tin nhà hàng.');
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            displayError('Lỗi dữ liệu người dùng.');
        }
    } else {
        console.error('User not logged in.');
        displayError('Người dùng chưa đăng nhập.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const filterBtn = document.querySelector('.filter-button');
    if (filterBtn) {
        filterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showAlert('Tính năng còn đang trong quá trình phát triển', 'info');
        });
    }

    // Event handler cho nút refresh
    setTimeout(() => {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.onclick = async function() {
                showLoading();
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user && user.restaurant_id) {
                            const cacheKey = `menuData_${user.restaurant_id}`;
                            localStorage.removeItem(cacheKey);
                            console.log('Đã xóa cache, load lại từ API');
                            await loadMenuList(user.restaurant_id, cacheKey);
                            showAlert('Đã làm mới dữ liệu!', 'success');
                        }
                    }
                } catch (error) {
                    console.error('Lỗi khi refresh:', error);
                    showAlert('Lỗi khi làm mới dữ liệu!', 'error');
                } finally {
                    hideLoading();
                }
            };
            console.log('Đã thiết lập event handler cho nút refresh menu');
        } else {
            console.log('Không tìm thấy nút refresh menu');
        }
    }, 100);
});

function displayError(message) {
    const tbody = document.getElementById('menu-table-body');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7">${message}</td></tr>`;
    }
}

// --- Load categories for menu ---
async function loadCategoriesForMenu(restaurantId) {
    try {
        if (window.cateService && window.cateService.getCate) {
            const data = await window.cateService.getCate(restaurantId);
            // data có thể là object hoặc array
            if (Array.isArray(data)) {
                allCategoriesArr = data;
            } else if (typeof data === 'object') {
                allCategoriesArr = Object.values(data);
            } else {
                allCategoriesArr = [];
            }
        } else {
            allCategoriesArr = [];
        }
    } catch (err) {
        allCategoriesArr = [];
    }
}

// --- Data Loading ---
async function loadMenuList(restaurantId, cacheKey) {
    try {
        showLoading();
        const menuData = await window.menuService.getMenu(restaurantId);
        if (Array.isArray(menuData)) {
            // Lưu vào cache
            if (cacheKey) {
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(menuData));
                    console.log('Đã lưu dữ liệu menu vào cache');
                } catch (e) {
                    console.warn('Không thể lưu vào localStorage:', e);
                }
            }
            renderMenuList(menuData);
        } else {
            console.error('Expected an array of menu items, but received:', menuData);
            displayError('Định dạng dữ liệu menu không hợp lệ.');
        }
    } catch (error) {
        console.error('Error loading menu list:', error);
        displayError('Lỗi tải dữ liệu menu.');
    } finally {
        hideLoading();
    }
}

// --- Initial Rendering Logic ---
function renderMenuList(menuData) {
    allMenuItems = menuData;
    
    const select = document.querySelector('.items-per-page-select');
    if (select) {
        itemsPerPage = parseInt(select.value, 10) || 15;
    }
    
    currentPage = 1;
    
    renderMenuListPaged(currentPage, itemsPerPage);
    updatePaginationUI(currentPage, itemsPerPage, allMenuItems.length);
}

// --- Paged Rendering Logic ---
function renderMenuListPaged(page, perPage) {
    const tbody = document.getElementById('menu-table-body');
    if (!tbody) return;

    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageItems = allMenuItems.slice(startIdx, endIdx);

    if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Không có món ăn nào.</td></tr>';
        return;
    }

    tbody.innerHTML = pageItems.map(item => {
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(item.price);
        
        const toppingNames = (item.toppings || [])
            .flatMap(topping => topping.options || [])
            .map(option => option.name)
            .join(', ');

        const statusText = item.status === 'active' ? 'Còn hàng' : 'Hết hàng';
        const statusClass = item.status === 'active' ? 'in-stock' : 'sold-out';

        return `
            <tr>
                <td>${item.category_name || 'Không rõ'}</td>
                <td>${item.name || ''}</td>
                <td><img src="${item.image}" alt="${item.name}" class="menu-image"></td>
                <td>${formattedPrice}</td>
                <td>${toppingNames || 'Không có'}</td>
                <td><span class="status-text ${statusClass}">${statusText}</span></td>
                <td>
                    <a href="#" class="menu-action-link edit" data-id="${item.id}">Sửa</a>
                    <a href="#" class="menu-action-link delete" data-id="${item.id}">Xóa</a>
                </td>
            </tr>
        `;
    }).reverse().join('');

    setupMenuActionButtons();
}

// --- Setup Action Buttons ---
function setupMenuActionButtons() {
    document.querySelectorAll('.menu-action-link.edit').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const menuId = e.target.getAttribute('data-id');
            editMenuItem(menuId);
        });
    });
    document.querySelectorAll('.menu-action-link.delete').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const menuId = e.target.getAttribute('data-id');
            deleteMenuItem(menuId);
        });
    });
}

// --- Edit Menu Item Function ---
function editMenuItem(menuId) {
    selectedImageFile = null;
    const menuItem = allMenuItems.find(item => item.id === menuId);
    if (!menuItem) {
        showAlert('Không tìm thấy món ăn để sửa!', 'error');
        return;
    }
    let modal = document.getElementById('edit-menu-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-menu-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:480px; background:#fff; border-radius:14px; box-shadow:0 8px 32px rgba(60,60,60,0.18); padding:32px 28px 22px 28px; position:relative;">
                <span class="close-modal" id="closeEditMenuModal" style="position:absolute; top:18px; right:22px; font-size:22px; color:#888; cursor:pointer;">&times;</span>
                <h2 class="modal-title" style="margin-bottom:22px; font-size:22px; color:#007bff; text-align:center; font-weight:700;">Sửa món ăn</h2>
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div>
                        <label for="editMenuCategoryInput" style="font-weight:500; margin-bottom:6px; display:block;">Danh mục</label>
                        <select id="editMenuCategoryInput" style="width:100%; padding:10px 12px; border:1px solid #d0d7de; border-radius:7px; font-size:15px; background:#f8f9fa;"></select>
                    </div>
                    <div>
                        <label for="editMenuNameInput" style="font-weight:500; margin-bottom:6px; display:block;">Tên món</label>
                        <input type="text" id="editMenuNameInput" maxlength="30" style="width:100%; padding:10px 12px; border:1px solid #d0d7de; border-radius:7px; font-size:15px; background:#f8f9fa;">
                    </div>
                    <div>
                        <label style="font-weight:500; margin-bottom:6px; display:block;">Ảnh món ăn</label>
                        <div id="imageUploadArea" style="border:2px dashed #d0d7de; border-radius:8px; padding:20px; text-align:center; background:#f8f9fa; cursor:pointer; transition:all 0.3s; display:none;">
                            <div id="uploadIcon" style="font-size:24px; color:#888; margin-bottom:8px;">📁</div>
                            <div id="uploadText" style="color:#666; font-size:14px;">Kéo thả ảnh vào đây hoặc click để chọn file</div>
                            <input type="file" id="imageFileInput" accept="image/*" style="display:none;">
                        </div>
                        <div id="imagePreview" style="margin-top:12px; display:none;">
                            <img id="previewImg" style="max-width:100%; max-height:120px; border-radius:6px; border:1px solid #d0d7de;">
                            <div style="margin-top:8px;">
                                <button id="changeImageBtn" style="background:#6c757d; color:#fff; border:none; border-radius:4px; padding:6px 12px; font-size:12px; cursor:pointer;">Thay đổi ảnh</button>
                            </div>
                            <div id="uploadProgress" style="margin-top:8px; display:none;">
                                <div style="background:#e9ecef; border-radius:4px; height:6px; overflow:hidden;">
                                    <div id="progressBar" style="background:#007bff; height:100%; width:0%; transition:width 0.3s;"></div>
                                </div>
                                <div id="progressText" style="font-size:12px; color:#666; margin-top:4px;">Đang tải lên...</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label for="editMenuPriceInput" style="font-weight:500; margin-bottom:6px; display:block;">Giá</label>
                        <input type="number" id="editMenuPriceInput" max="99999999" style="width:100%; padding:10px 12px; border:1px solid #d0d7de; border-radius:7px; font-size:15px; background:#f8f9fa;">
                    </div>
                    <div>
                        <label for="editMenuStatusInput" style="font-weight:500; margin-bottom:6px; display:block;">Trạng thái</label>
                        <select id="editMenuStatusInput" style="width:100%; padding:10px 12px; border:1px solid #d0d7de; border-radius:7px; font-size:15px; background:#f8f9fa;">
                            <option value="active">Còn hàng</option>
                            <option value="inactive">Hết hàng</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:14px; width:100%; justify-content:center; margin-top:32px;">
                    <button id="cancelEditMenuBtn" style="background:#e9ecef; color:#333; border:none; border-radius:7px; padding:10px 32px; font-size:16px; cursor:pointer; font-weight:500; transition:background 0.2s;">Hủy</button>
                    <button id="confirmEditMenuBtn" style="background:#007bff; color:#fff; border:none; border-radius:7px; padding:10px 32px; font-size:16px; cursor:pointer; font-weight:600; transition:background 0.2s;">Lưu</button>
                </div>
                <style>
                    #edit-menu-modal .modal-content button:hover#cancelEditMenuBtn { background: #d3d7db; }
                    #edit-menu-modal .modal-content button:hover#confirmEditMenuBtn { background: #0056b3; }
                    #imageUploadArea:hover { border-color: #007bff; background: #f0f8ff; }
                    #imageUploadArea.dragover { border-color: #007bff; background: #e6f3ff; }
                </style>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Gán giá trị hiện tại
    const categorySelect = document.getElementById('editMenuCategoryInput');
    categorySelect.innerHTML = allCategoriesArr.map(cat => `<option value="${cat.id_category}" ${cat.id_category === menuItem.id_category ? 'selected' : ''}>${cat.name} (${cat.id_category})</option>`).join('');
    document.getElementById('editMenuNameInput').value = menuItem.name || '';
    document.getElementById('editMenuPriceInput').value = menuItem.price || '';
    document.getElementById('editMenuStatusInput').value = menuItem.status || 'active';
    
    // Thêm validation cho ô nhập tên món trong modal sửa
    let lastEditNameLength = 0;
    const editNameInput = document.getElementById('editMenuNameInput');
    if (editNameInput) {
        editNameInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Hiển thị thông báo khi vừa đạt 30 ký tự
            if (value.length === 30 && lastEditNameLength < 30) {
                if (typeof showAlert === 'function') {
                    showAlert('Tên món chỉ tối đa 30 ký tự', 'warning');
                } else {
                    alert('Tên món chỉ tối đa 30 ký tự');
                }
            }
            lastEditNameLength = value.length;
        });
    }
    
    // Thêm validation cho ô nhập giá trong modal sửa
    const editPriceInput = document.getElementById('editMenuPriceInput');
    if (editPriceInput) {
        editPriceInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Chặn nhập dấu "-"
            if (value.includes('-')) {
                value = value.replace(/-/g, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giá không được nhập số âm', 'warning');
                } else {
                    alert('Giá không được nhập số âm');
                }
                return;
            }
            
            // Chặn bắt đầu bằng số 0 (trừ khi chỉ có 1 số 0)
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giá không được bắt đầu bằng số 0', 'warning');
                } else {
                    alert('Giá không được bắt đầu bằng số 0');
                }
                return;
            }
            
            // Kiểm tra nếu giá vượt quá 99,999,999
            let numValue = parseFloat(value);
            if (numValue > 99999999) {
                e.target.value = 99999999;
                if (typeof showAlert === 'function') {
                    showAlert('Giá không được lớn hơn 99,999,999 VNĐ', 'warning');
                } else {
                    alert('Giá không được lớn hơn 99,999,999 VNĐ');
                }
            }
        });
    }
    
    // Hiển thị ảnh hiện tại nếu có
    if (menuItem.image) {
        showImagePreview(menuItem.image);
    }
    
    modal.style.display = 'block';
    
    // Setup drag & drop functionality
    setupImageUpload();

    // Đóng modal
    document.getElementById('closeEditMenuModal').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('cancelEditMenuBtn').onclick = () => { modal.style.display = 'none'; };
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };

    // Xác nhận sửa
    document.getElementById('confirmEditMenuBtn').onclick = async function() {
        const newCategoryId = categorySelect.value;
        const newName = document.getElementById('editMenuNameInput').value.trim();
        const newPrice = parseFloat(document.getElementById('editMenuPriceInput').value);
        const newStatus = document.getElementById('editMenuStatusInput').value;
        let newImage = document.getElementById('previewImg').src;
        
        if (!newCategoryId || !newName || !newImage || isNaN(newPrice)) {
            showAlert('Vui lòng nhập đầy đủ thông tin hợp lệ!', 'warning');
            return;
        }
        
        // Nếu có file mới, upload lên Cloudinary trước khi lưu
        if (selectedImageFile) {
            try {
                newImage = await uploadToCloudinaryAsync(selectedImageFile);
            } catch (err) {
                showAlert('Lỗi tải ảnh lên Cloudinary!', 'error');
                return;
            }
        }
        
        const updatedMenuData = {
            id_category: newCategoryId,
            name: newName,
            image: newImage,
            price: newPrice,
            status: newStatus
        };
        
        try {
            await window.menuService.editMenu(menuItem.id, updatedMenuData);
            modal.style.display = 'none';
            showAlert('Cập nhật món ăn thành công!', 'success');
            if (user && user.restaurant_id) {
                // Xóa cache và load lại dữ liệu
                const cacheKey = `menuData_${user.restaurant_id}`;
                localStorage.removeItem(cacheKey);
                await loadMenuList(user.restaurant_id, cacheKey);
            }
        } catch (err) {
            showAlert('Có lỗi xảy ra khi cập nhật món ăn!', 'error');
            console.error('Error updating menu:', err);
        }
    };
}

// --- Image Upload Functions ---
function setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('imageFileInput');
    
    // Click to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
}

function handleImageFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showAlert('Vui lòng chọn file ảnh hợp lệ!', 'warning');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('File ảnh không được lớn hơn 5MB!', 'warning');
        return;
    }
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Lưu file vào biến tạm, chưa upload
    selectedImageFile = file;
}

function showImagePreview(imageUrl) {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const uploadArea = document.getElementById('imageUploadArea');
    
    previewImg.src = imageUrl;
    preview.style.display = 'block';
    uploadArea.style.display = 'none';
    
    // Thêm event listener cho nút thay đổi ảnh
    const changeBtn = document.getElementById('changeImageBtn');
    if (changeBtn) {
        changeBtn.onclick = () => {
            preview.style.display = 'none';
            uploadArea.style.display = 'block';
            document.getElementById('imageFileInput').value = '';
            selectedImageFile = null;
        };
    }
}

// Hàm upload lên Cloudinary trả về Promise
function uploadToCloudinaryAsync(file) {
    return new Promise((resolve, reject) => {
        const progressDiv = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        progressDiv.style.display = 'block';
        progressText.textContent = 'Đang tải lên Cloudinary...';
        progressBar.style.width = '0%';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'jollicow'); // Đặt đúng tên preset của bạn

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dcdaz0dzb/image/upload');
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
            }
        };
        xhr.onload = function() {
            progressDiv.style.display = 'none';
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                if (data.secure_url) {
                    resolve(data.secure_url);
                } else {
                    reject('Không lấy được URL ảnh từ Cloudinary');
                }
            } else {
                reject('Upload thất bại');
            }
        };
        xhr.onerror = function() {
            progressDiv.style.display = 'none';
            reject('Lỗi mạng khi upload');
        };
        xhr.send(formData);
    });
}

// --- Pagination UI Update ---
function updatePaginationUI(page, perPage, totalItems) {
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    currentPage = parseInt(page, 10);
    itemsPerPage = parseInt(perPage, 10);

    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        paginationInfo.textContent = `${start} - ${end}/${totalItems}`;
    }

    const btnFirst = document.getElementById('page-first');
    const btnPrev = document.getElementById('page-prev');
    const btnNext = document.getElementById('page-next');
    const btnLast = document.getElementById('page-last');

    if (btnFirst && btnPrev && btnNext && btnLast) {
        btnFirst.disabled = currentPage === 1;
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;
        btnLast.disabled = currentPage === totalPages;

        btnFirst.replaceWith(btnFirst.cloneNode(true));
        btnPrev.replaceWith(btnPrev.cloneNode(true));
        btnNext.replaceWith(btnNext.cloneNode(true));
        btnLast.replaceWith(btnLast.cloneNode(true));
        
        const newBtnFirst = document.getElementById('page-first');
        const newBtnPrev = document.getElementById('page-prev');
        const newBtnNext = document.getElementById('page-next');
        const newBtnLast = document.getElementById('page-last');

        newBtnFirst.addEventListener('click', () => window.onMenuPageChange(1, itemsPerPage));
        newBtnPrev.addEventListener('click', () => window.onMenuPageChange(currentPage - 1, itemsPerPage));
        newBtnNext.addEventListener('click', () => window.onMenuPageChange(currentPage + 1, itemsPerPage));
        newBtnLast.addEventListener('click', () => window.onMenuPageChange(totalPages, itemsPerPage));
    }
}

// --- Pagination Callback ---
window.onMenuPageChange = function(page, perPage) {
    currentPage = parseInt(page, 10);
    itemsPerPage = parseInt(perPage, 10);
    
    renderMenuListPaged(currentPage, itemsPerPage);
    
    updatePaginationUI(currentPage, itemsPerPage, allMenuItems.length);
};

// --- Add Menu Item Function ---
function openAddMenuModal() {
    selectedAddImageFile = null;
    let modal = document.getElementById('add-menu-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'add-menu-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:480px; background:#fff; border-radius:14px; box-shadow:0 8px 32px rgba(60,60,60,0.18); padding:32px 28px 22px 28px; position:relative;">
                <span class="close-modal" id="closeAddMenuModal" style="position:absolute; top:18px; right:22px; font-size:22px; color:#888; cursor:pointer;">&times;</span>
                <h2 class="modal-title" style="margin-bottom:22px; font-size:22px; color:#007bff; text-align:center; font-weight:700;">Thêm món ăn</h2>
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div>
                        <label for="addMenuCategoryInput" style="font-weight:500; margin-bottom:6px; display:block;">Danh mục</label>
                        <select id="addMenuCategoryInput" style="width:100%; padding:10px 12px; border:1px solid #d0d7de; border-radius:7px; font-size:15px; background:#f8f9fa;"></select>
                    </div>
                    <div>
                        <label for="addMenuNameInput" style="font-weight:500; margin-bottom:6px; display:block;">Tên món</label>
                        <input type="text" id="addMenuNameInput" maxlength="30" style="width:100%; padding:10px 12px; border:1px solid #d0d7de; border-radius:7px; font-size:15px; background:#f8f9fa;">
                    </div>
                    <div>
                        <label style="font-weight:500; margin-bottom:6px; display:block;">Ảnh món ăn</label>
                        <div id="addImageUploadArea" style="border:2px dashed #d0d7de; border-radius:8px; padding:20px; text-align:center; background:#f8f9fa; cursor:pointer; transition:all 0.3s;">
                            <div id="addUploadIcon" style="font-size:24px; color:#888; margin-bottom:8px;">📁</div>
                            <div id="addUploadText" style="color:#666; font-size:14px;">Kéo thả ảnh vào đây hoặc click để chọn file</div>
                            <input type="file" id="addImageFileInput" accept="image/*" style="display:none;">
                        </div>
                        <div id="addImagePreview" style="margin-top:12px; display:none;">
                            <img id="addPreviewImg" style="max-width:100%; max-height:120px; border-radius:6px; border:1px solid #d0d7de;">
                            <div style="margin-top:8px;">
                                <button id="addChangeImageBtn" style="background:#6c757d; color:#fff; border:none; border-radius:4px; padding:6px 12px; font-size:12px; cursor:pointer;">Thay đổi ảnh</button>
                            </div>
                            <div id="addUploadProgress" style="margin-top:8px; display:none;">
                                <div style="background:#e9ecef; border-radius:4px; height:6px; overflow:hidden;">
                                    <div id="addProgressBar" style="background:#007bff; height:100%; width:0%; transition:width 0.3s;"></div>
                                </div>
                                <div id="addProgressText" style="font-size:12px; color:#666; margin-top:4px;">Đang tải lên...</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label for="addMenuPriceInput" style="font-weight:500; margin-bottom:6px; display:block;">Giá</label>
                        <input type="number" id="addMenuPriceInput" max="99999999" style="width:100%; padding:10px 12px; border:1px solid #d0d7de; border-radius:7px; font-size:15px; background:#f8f9fa;">
                    </div>
                    <div>
                        <label for="addMenuStatusInput" style="font-weight:500; margin-bottom:6px; display:block;">Trạng thái</label>
                        <select id="addMenuStatusInput" style="width:100%; padding:10px 12px; border:1px solid #d0d7de; border-radius:7px; font-size:15px; background:#f8f9fa;">
                            <option value="active">Còn hàng</option>
                            <option value="inactive">Hết hàng</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:14px; width:100%; justify-content:center; margin-top:32px;">
                    <button id="cancelAddMenuBtn" style="background:#e9ecef; color:#333; border:none; border-radius:7px; padding:10px 32px; font-size:16px; cursor:pointer; font-weight:500; transition:background 0.2s;">Hủy</button>
                    <button id="confirmAddMenuBtn" style="background:#007bff; color:#fff; border:none; border-radius:7px; padding:10px 32px; font-size:16px; cursor:pointer; font-weight:600; transition:background 0.2s;">Thêm</button>
                </div>
                <style>
                    #add-menu-modal .modal-content button:hover#cancelAddMenuBtn { background: #d3d7db; }
                    #add-menu-modal .modal-content button:hover#confirmAddMenuBtn { background: #0056b3; }
                    #addImageUploadArea:hover { border-color: #007bff; background: #f0f8ff; }
                    #addImageUploadArea.dragover { border-color: #007bff; background: #e6f3ff; }
                </style>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Gán danh mục
    const categorySelect = document.getElementById('addMenuCategoryInput');
    categorySelect.innerHTML = allCategoriesArr.map(cat => `<option value="${cat.id_category}">${cat.name} (${cat.id_category})</option>`).join('');
    
    // Reset các trường
    document.getElementById('addMenuNameInput').value = '';
    document.getElementById('addMenuPriceInput').value = '';
    document.getElementById('addMenuStatusInput').value = 'active';
    document.getElementById('addImagePreview').style.display = 'none';
    document.getElementById('addImageUploadArea').style.display = 'block';
    document.getElementById('addImageFileInput').value = '';
    
    // Thêm validation cho ô nhập tên món trong modal thêm
    let lastAddNameLength = 0;
    const addNameInput = document.getElementById('addMenuNameInput');
    if (addNameInput) {
        addNameInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Hiển thị thông báo khi vừa đạt 30 ký tự
            if (value.length === 30 && lastAddNameLength < 30) {
                if (typeof showAlert === 'function') {
                    showAlert('Tên món chỉ tối đa 30 ký tự', 'warning');
                } else {
                    alert('Tên món chỉ tối đa 30 ký tự');
                }
            }
            lastAddNameLength = value.length;
        });
    }
    
    // Thêm validation cho ô nhập giá trong modal thêm
    const addPriceInput = document.getElementById('addMenuPriceInput');
    if (addPriceInput) {
        addPriceInput.addEventListener('input', function(e) {
            let value = e.target.value;
            
            // Chặn nhập dấu "-"
            if (value.includes('-')) {
                value = value.replace(/-/g, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giá không được nhập số âm', 'warning');
                } else {
                    alert('Giá không được nhập số âm');
                }
                return;
            }
            
            // Chặn bắt đầu bằng số 0 (trừ khi chỉ có 1 số 0)
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
                e.target.value = value;
                if (typeof showAlert === 'function') {
                    showAlert('Giá không được bắt đầu bằng số 0', 'warning');
                } else {
                    alert('Giá không được bắt đầu bằng số 0');
                }
                return;
            }
            
            let numValue = parseFloat(value);
            if (numValue > 99999999) {
                e.target.value = 99999999;
                if (typeof showAlert === 'function') {
                    showAlert('Giá không được lớn hơn 99,999,999 VNĐ', 'warning');
                } else {
                    alert('Giá không được lớn hơn 99,999,999 VNĐ');
                }
            }
        });
    }
    
    // Setup drag & drop
    setupAddImageUpload();
    
    // Đóng modal
    const closeModal = () => { modal.style.display = 'none'; };
    
    document.getElementById('closeAddMenuModal').onclick = closeModal;
    document.getElementById('cancelAddMenuBtn').onclick = closeModal;
    
    // Đóng modal khi click bên ngoài
    const closeModalOutside = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    window.addEventListener('click', closeModalOutside);
    
    // Xác nhận thêm
    document.getElementById('confirmAddMenuBtn').onclick = async function() {
        const id_categories = categorySelect.value;
        const name = document.getElementById('addMenuNameInput').value.trim();
        const price = parseFloat(document.getElementById('addMenuPriceInput').value);
        const status = document.getElementById('addMenuStatusInput').value;
        let image = '';
        
        // Lấy restaurant_id từ localStorage
        let userStr = localStorage.getItem('user');
        let restaurant_id = '';
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                restaurant_id = userObj.restaurant_id;
            } catch {}
        }
        
        if (!id_categories || !name || isNaN(price) || !restaurant_id) {
            showAlert('Vui lòng nhập đầy đủ thông tin hợp lệ!', 'warning');
            return;
        }
        
        if (!selectedAddImageFile) {
            showAlert('Vui lòng chọn ảnh món ăn!', 'warning');
            return;
        }
        
        // Upload ảnh lên Cloudinary
        try {
            showLoading();
            image = await uploadToCloudinaryAddAsync(selectedAddImageFile);
        } catch (err) {
            showAlert('Lỗi tải ảnh lên Cloudinary!', 'error');
            hideLoading();
            return;
        }
        
        try {
            await window.menuService.createMenu(id_categories, name, image, restaurant_id, status, price);
            modal.style.display = 'none';
            showAlert('Thêm món ăn thành công!', 'success');
            if (user && user.restaurant_id) {
                // Xóa cache và load lại dữ liệu
                const cacheKey = `menuData_${user.restaurant_id}`;
                localStorage.removeItem(cacheKey);
                await loadMenuList(user.restaurant_id, cacheKey);
            }
        } catch (err) {
            showAlert('Có lỗi xảy ra khi thêm món ăn!', 'error');
            console.error('Error creating menu:', err);
        } finally {
            hideLoading();
        }
    };
    
    modal.style.display = 'block';
}

function setupAddImageUpload() {
    const uploadArea = document.getElementById('addImageUploadArea');
    const fileInput = document.getElementById('addImageFileInput');
    
    // Xóa event listener cũ nếu có
    const newUploadArea = uploadArea.cloneNode(true);
    uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
    
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
    
    // Click to select file
    newUploadArea.addEventListener('click', () => {
        newFileInput.click();
    });
    
    // File input change
    newFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleAddImageFile(file);
        }
    });
    
    // Drag and drop events
    newUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        newUploadArea.classList.add('dragover');
    });
    
    newUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        newUploadArea.classList.remove('dragover');
    });
    
    newUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        newUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleAddImageFile(files[0]);
        }
    });
}

function handleAddImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showAlert('Vui lòng chọn file ảnh hợp lệ!', 'warning');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showAlert('File ảnh không được lớn hơn 5MB!', 'warning');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        showAddImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    selectedAddImageFile = file;
}

function showAddImagePreview(imageUrl) {
    const preview = document.getElementById('addImagePreview');
    const previewImg = document.getElementById('addPreviewImg');
    const uploadArea = document.getElementById('addImageUploadArea');
    previewImg.src = imageUrl;
    preview.style.display = 'block';
    uploadArea.style.display = 'none';
    const changeBtn = document.getElementById('addChangeImageBtn');
    if (changeBtn) {
        changeBtn.onclick = () => {
            preview.style.display = 'none';
            uploadArea.style.display = 'block';
            document.getElementById('addImageFileInput').value = '';
            selectedAddImageFile = null;
        };
    }
}

function uploadToCloudinaryAddAsync(file) {
    return new Promise((resolve, reject) => {
        const progressDiv = document.getElementById('addUploadProgress');
        const progressBar = document.getElementById('addProgressBar');
        const progressText = document.getElementById('addProgressText');
        progressDiv.style.display = 'block';
        progressText.textContent = 'Đang tải lên Cloudinary...';
        progressBar.style.width = '0%';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'jollicow'); // Đặt đúng tên preset của bạn
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dcdaz0dzb/image/upload');
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
            }
        };
        xhr.onload = function() {
            progressDiv.style.display = 'none';
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                if (data.secure_url) {
                    resolve(data.secure_url);
                } else {
                    reject('Không lấy được URL ảnh từ Cloudinary');
                }
            } else {
                reject('Upload thất bại');
            }
        };
        xhr.onerror = function() {
            progressDiv.style.display = 'none';
            reject('Lỗi mạng khi upload');
        };
        xhr.send(formData);
    });
}

// --- END Add Menu Item ---

// Thêm nút mở modal thêm menu vào trang (nếu cần)
window.openAddMenuModal = openAddMenuModal;

// Function để refresh dữ liệu menu
window.refreshMenuData = async function() {
    showLoading();
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                const cacheKey = `menuData_${user.restaurant_id}`;
                localStorage.removeItem(cacheKey);
                console.log('Đã xóa cache, load lại từ API');
                await loadMenuList(user.restaurant_id, cacheKey);
                showAlert('Đã làm mới dữ liệu!', 'success');
            }
        }
    } catch (error) {
        console.error('Lỗi khi refresh:', error);
        showAlert('Lỗi khi làm mới dữ liệu!', 'error');
    } finally {
        hideLoading();
    }
};

// --- Toast Notification ---
function showToast(message, type = 'success') {
    let toast = document.createElement('div');
    toast.className = 'custom-toast ' + type;
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: type === 'success' ? '#28a745' : '#dc3545',
        color: '#fff',
        padding: '18px 36px',
        borderRadius: '10px',
        fontSize: '18px',
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
        opacity: 0,
        transition: 'opacity 0.3s'
    });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = 1; }, 10);
    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => document.body.removeChild(toast), 400);
    }, 2000);
}

// --- Delete Menu Item Function ---
function deleteMenuItem(menuId) {
    const menuItem = allMenuItems.find(item => item.id === menuId);
    if (!menuItem) {
        showAlert('Không tìm thấy món ăn để xóa!', 'error');
        return;
    }

    showConfirmModal({
        title: 'Xác nhận xóa món ăn',
        message: `Bạn có chắc chắn muốn xóa món ăn "<strong>${menuItem.name}</strong>"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        confirmButtonClass: 'btn-danger',
        onConfirm: async () => {
            try {
                showLoading();
                await window.menuService.deleteMenu(menuId);
                showAlert('Xóa món ăn thành công!', 'success');
                if (user && user.restaurant_id) {
                    // Xóa cache và load lại dữ liệu
                    const cacheKey = `menuData_${user.restaurant_id}`;
                    localStorage.removeItem(cacheKey);
                    await loadMenuList(user.restaurant_id, cacheKey);
                }
            } catch (err) {
                showAlert('Có lỗi khi xóa món ăn!', 'error');
            } finally {
                hideLoading();
            }
        }
    });
}
