// --- State Variables ---
let allMenuItems = [];
let currentPage = 1;
let itemsPerPage = 15;

// --- DOMContentLoaded: Entry point ---
document.addEventListener('DOMContentLoaded', function() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                loadMenuList(user.restaurant_id);
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
    const tbody = document.getElementById('menu-table-body');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7">${message}</td></tr>`;
    }
}

// --- Data Loading ---
async function loadMenuList(restaurantId) {
    try {
        const menuData = await window.menuService.getMenu(restaurantId);
        if (Array.isArray(menuData)) {
            renderMenuList(menuData);
        } else {
            console.error('Expected an array of menu items, but received:', menuData);
            displayError('Định dạng dữ liệu menu không hợp lệ.');
        }
    } catch (error) {
        console.error('Error loading menu list:', error);
        displayError('Lỗi tải dữ liệu menu.');
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
