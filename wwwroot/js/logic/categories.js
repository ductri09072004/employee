// --- State Variables ---
let allCategories = [];
let currentPage = 1;
let itemsPerPage = 15;

// --- DOMContentLoaded: Entry point ---
document.addEventListener('DOMContentLoaded', function() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                loadCategories(user.restaurant_id);
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

function displayError(message) {
    const tbody = document.getElementById('categories-table-body');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4">${message}</td></tr>`;
    }
}

// --- Data Loading ---
async function loadCategories(restaurantId) {
    try {
        const categoriesData = await window.cateService.getMenu(restaurantId); 
        if (Array.isArray(categoriesData)) {
            renderCategoriesList(categoriesData);
        } else {
            console.error('Expected an array of categories, but received:', categoriesData);
            displayError('Định dạng dữ liệu danh mục không hợp lệ.');
        }
    } catch (error) {
        console.error('Error loading categories list:', error);
        displayError('Lỗi tải dữ liệu danh mục.');
    }
}

// --- Initial Rendering Logic ---
function renderCategoriesList(categoriesData) {
    allCategories = categoriesData;
    
    const select = document.querySelector('.items-per-page-select');
    if (select) {
        itemsPerPage = parseInt(select.value, 10) || 15;
    }
    
    currentPage = 1;
    
    renderCategoriesListPaged(currentPage, itemsPerPage);
    updatePaginationUI(currentPage, itemsPerPage, allCategories.length);
}

// --- Paged Rendering Logic ---
function renderCategoriesListPaged(page, perPage) {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageItems = allCategories.slice(startIdx, endIdx);

    if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Không có danh mục nào.</td></tr>';
        return;
    }

    tbody.innerHTML = pageItems.map((item, idx) => {
        return `
            <tr>
                <td>${startIdx + idx + 1}</td>
                <td>${item.id_category || 'Không rõ'}</td>
                <td>${item.name || ''}</td>
                <td>
                    <a href="#" class="menu-action-link">Sửa</a>
                    <a href="#" class="menu-action-link delete">Xóa</a>
                </td>
            </tr>
        `;
    }).join('');
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
    
    renderCategoriesListPaged(currentPage, itemsPerPage);
    
    updatePaginationUI(currentPage, itemsPerPage, allCategories.length);
};
