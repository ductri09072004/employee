// --- State Variables ---
let allCategoriesArr = [];
let currentPage = 1;
let itemsPerPage = 15;
let user = null;

// --- DOMContentLoaded: Entry point ---
document.addEventListener('DOMContentLoaded', function() {
    console.log('categories.js loaded');
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                loadCategories(user.restaurant_id);
            } else {
                console.error('Không tìm thấy restaurant_id trong thông tin user');
                document.getElementById('categories-table-body').innerHTML = '<tr><td colspan="4">Không tìm thấy thông tin nhà hàng.</td></tr>';
            }
        } catch (error) {
            console.error('Lỗi khi parse user data:', error);
            document.getElementById('categories-table-body').innerHTML = '<tr><td colspan="4">Lỗi dữ liệu người dùng.</td></tr>';
        }
    } else {
        console.error('Chưa đăng nhập');
        document.getElementById('categories-table-body').innerHTML = '<tr><td colspan="4">Người dùng chưa đăng nhập.</td></tr>';
    }

    // Modal logic for add category
    const openBtn = document.getElementById('openAddCategoryModal');
    const modal = document.getElementById('add-category-modal');
    const closeBtn = document.getElementById('closeAddCategoryModal');
    const confirmBtn = document.getElementById('confirmAddCategoryBtn');
    const nameInput = document.getElementById('categoryNameInput');

    if (openBtn && modal && closeBtn) {
        openBtn.addEventListener('click', function () {
            modal.style.display = 'block';
            nameInput.value = '';
            nameInput.focus();
        });
        closeBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });
        window.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function () {
            const name = nameInput.value.trim();
            if (!name) {
                // alert('Vui lòng nhập tên danh mục!');
                return;
            }
            if (!user || !user.restaurant_id) {
                // alert('Không tìm thấy thông tin nhà hàng!');
                return;
            }
            try {
                await window.cateService.createCate(user.restaurant_id, name);
                // alert('Thêm danh mục thành công!');
                modal.style.display = 'none';
                loadCategories(user.restaurant_id);
            } catch (err) {
                // alert('Thêm danh mục thất bại!');
            }
        });
    }
});

function displayError(message) {
    const tbody = document.getElementById('categories-table-body');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4">${message}</td></tr>`;
    }
}

// --- Data Loading ---
async function loadCategories(restaurantId) {
    try {
        const data = await window.cateService.getCate(restaurantId);
        renderCategoryList(data);
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categories-table-body').innerHTML = '<tr><td colspan="4">Lỗi tải dữ liệu.</td></tr>';
    }
}

// --- Initial Rendering Logic ---
function renderCategoryList(data) {
    console.log('renderCategoryList called with data:', data);
    
    // Chuyển đổi object thành array để dễ xử lý phân trang
    allCategoriesArr = Object.entries(data).map(([key, category]) => ({
        ...category,
        // Sử dụng id có sẵn trong category, nếu không có thì dùng key
        id: category.id || key
    }));
    
    console.log('allCategoriesArr after mapping:', allCategoriesArr);
    
    // Lấy giá trị mặc định từ select nếu có
    const select = document.querySelector('.items-per-page-select');
    if (select) {
        itemsPerPage = parseInt(select.value, 10) || 15;
    }
    
    // Reset về trang 1 khi load dữ liệu mới
    currentPage = 1;
    
    // Render danh sách và cập nhật UI phân trang
    renderCategoryListPaged(currentPage, itemsPerPage);
    updatePaginationUI(currentPage, itemsPerPage, allCategoriesArr.length);
}

// --- Paged Rendering Logic ---
function renderCategoryListPaged(page, perPage) {
    const tbody = document.getElementById('categories-table-body');
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageCategories = allCategoriesArr.slice(startIdx, endIdx);
    
    console.log('renderCategoryListPaged - pageCategories:', pageCategories);
    
    if (pageCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Không có dữ liệu danh mục.</td></tr>';
        return;
    }

    const htmlContent = pageCategories.map((category, idx) => {
        const stt = String(startIdx + idx + 1).padStart(2, '0');
        
        return `
            <tr>
                <td>${stt}</td>
                <td>${category.id_category}</td>
                <td>${category.name}</td>
                <td>
                    <a href="#" class="menu-action-link edit" data-id="${category.id}">Sửa</a>
                    <a href="#" class="menu-action-link delete" data-id="${category.id}">Xóa</a>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('Generated HTML for table:', htmlContent);
    tbody.innerHTML = htmlContent;
    
    // Add event listeners to action buttons
    setupActionButtons();
}

function setupActionButtons() {
    // Edit buttons
    document.querySelectorAll('.menu-action-link.edit').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = e.target.getAttribute('data-id');
            console.log('Edit button clicked, categoryId:', categoryId);
            editCategory(categoryId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.menu-action-link.delete').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = e.target.getAttribute('data-id');
            console.log('Delete button clicked, categoryId:', categoryId);
            showDeleteConfirmation(categoryId);
        });
    });
}

// --- Edit Category Function ---
function editCategory(categoryId) {
    console.log('Edit category function called with ID:', categoryId);
    
    // Tìm category trong array
    const category = allCategoriesArr.find(cat => cat.id === categoryId);
    if (!category) {
        console.error('Category not found with ID:', categoryId);
        return;
    }
    
    // Tạo hoặc lấy modal edit
    let modal = document.getElementById('edit-category-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-category-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:400px;">
                <span class="close-modal" id="closeEditCategoryModal">&times;</span>
                <h2 class="modal-title">Sửa danh mục</h2>
                <div style="margin: 20px 0;">
                    <label for="editCategoryNameInput" style="display:block; margin-bottom:8px; font-weight:500;">Tên danh mục:</label>
                    <input type="text" id="editCategoryNameInput" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px; font-size:14px;">
                </div>
                <div style="display:flex; gap:12px; width:100%; justify-content:center;">
                    <button id="cancelEditCategoryBtn" style="background:#e9ecef; color:#333; border:none; border-radius:7px; padding:10px 24px; font-size:15px; cursor:pointer; font-weight:500;">Hủy</button>
                    <button id="confirmEditCategoryBtn" style="background:#007bff; color:#fff; border:none; border-radius:7px; padding:10px 24px; font-size:15px; cursor:pointer; font-weight:600;">Lưu</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Hiển thị modal và điền dữ liệu hiện tại
    const nameInput = document.getElementById('editCategoryNameInput');
    if (nameInput) {
        nameInput.value = category.name;
        nameInput.focus();
    }
    modal.style.display = 'block';

    // Đóng modal
    const closeBtn = document.getElementById('closeEditCategoryModal');
    const cancelBtn = document.getElementById('cancelEditCategoryBtn');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    if (cancelBtn) cancelBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };
    
    // Xác nhận sửa
    const confirmBtn = document.getElementById('confirmEditCategoryBtn');
    if (confirmBtn) {
        confirmBtn.onclick = async function() {
            const newName = nameInput.value.trim();
            if (!newName) {
                alert('Vui lòng nhập tên danh mục!');
                return;
            }
            
            try {
                // Tạo object category với thông tin đầy đủ
                const updatedCategoryData = {
                    id: category.id,
                    id_category: category.id_category,
                    id_restaurant: category.id_restaurant,
                    name: newName
                };
                
                console.log('Updating category with ID:', categoryId, 'new data:', updatedCategoryData);
                await window.cateService.editCate(categoryId, updatedCategoryData);
                modal.style.display = 'none';
                if (user && user.restaurant_id) {
                    loadCategories(user.restaurant_id);
                }
            } catch (err) {
                console.error('Error updating category:', err);
                alert('Có lỗi xảy ra khi cập nhật danh mục!');
            }
        };
    }
}

// --- Delete Confirmation Modal ---
function showDeleteConfirmation(categoryId) {
    console.log('showDeleteConfirmation called with categoryId:', categoryId);
    
    let modal = document.getElementById('delete-category-modal');
    if (!modal) {
        // Tạo modal nếu chưa có
        modal = document.createElement('div');
        modal.id = 'delete-category-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:340px;">
                <span class="close-modal" id="closeDeleteCategoryModal">&times;</span>
                <h2 class="modal-title" style="color:#B24242;">Xác nhận xóa danh mục</h2>
                <div style="margin: 18px 0 24px 0; text-align:center; color:#333; font-size:15px;">Bạn có chắc chắn muốn xóa danh mục này không?</div>
                <div style="display:flex; gap:12px; width:100%; justify-content:center;">
                    <button id="cancelDeleteCategoryBtn" style="background:#e9ecef; color:#333; border:none; border-radius:7px; padding:10px 24px; font-size:15px; cursor:pointer; font-weight:500;">Hủy</button>
                    <button id="confirmDeleteCategoryBtn" style="background:#B24242; color:#fff; border:none; border-radius:7px; padding:10px 24px; font-size:15px; cursor:pointer; font-weight:600;">Xóa</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'block';

    // Đóng modal
    const closeBtn = document.getElementById('closeDeleteCategoryModal');
    const cancelBtn = document.getElementById('cancelDeleteCategoryBtn');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    if (cancelBtn) cancelBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };
    
    // Xác nhận xóa
    const confirmBtn = document.getElementById('confirmDeleteCategoryBtn');
    if (confirmBtn) {
        confirmBtn.onclick = async function() {
            try {
                console.log('Deleting category with ID:', categoryId);
                await window.cateService.deleteCate(categoryId);
                modal.style.display = 'none';
                if (user && user.restaurant_id) {
                    loadCategories(user.restaurant_id);
                }
            } catch (err) {
                console.error('Error deleting category:', err);
                modal.style.display = 'none';
            }
        };
    }
}

// --- Pagination UI Update ---
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
        newBtnFirst.addEventListener('click', () => window.onCategoriesPageChange(1, itemsPerPage));
        newBtnPrev.addEventListener('click', () => window.onCategoriesPageChange(currentPage - 1, itemsPerPage));
        newBtnNext.addEventListener('click', () => window.onCategoriesPageChange(currentPage + 1, itemsPerPage));
        newBtnLast.addEventListener('click', () => window.onCategoriesPageChange(totalPages, itemsPerPage));
    }
}

// --- Pagination Callback ---
window.onCategoriesPageChange = function(page, perPage) {
    currentPage = parseInt(page, 10);
    itemsPerPage = parseInt(perPage, 10);
    
    // Render lại danh sách với trang mới
    renderCategoryListPaged(currentPage, itemsPerPage);
    
    // Cập nhật UI phân trang
    updatePaginationUI(currentPage, itemsPerPage, allCategoriesArr.length);
};
