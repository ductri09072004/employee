let allToppingsArr = [];
let currentPage = 1;
let itemsPerPage = 15;
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
                document.getElementById('table-list-body').innerHTML = '<tr><td colspan="7">Không tìm thấy thông tin nhà hàng.</td></tr>';
            }
        } catch (error) {
            console.error('Lỗi khi parse user data:', error);
            document.getElementById('table-list-body').innerHTML = '<tr><td colspan="7">Lỗi dữ liệu người dùng.</td></tr>';
        }
    } else {
        console.error('Chưa đăng nhập');
        document.getElementById('table-list-body').innerHTML = '<tr><td colspan="7">Người dùng chưa đăng nhập.</td></tr>';
    }

    // Sửa event cho nút Sửa (edit)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action-link') && e.target.classList.contains('edit')) {
            e.preventDefault();
            const dishId = e.target.getAttribute('data-id');
            showAddToppingModalForDish(dishId);
        }
    });

    // Đóng modal thêm topping
    const closeBtn = document.getElementById('closeAddToppingModal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('add-topping-modal').style.display = 'none';
        };
    }
    // Xác nhận thêm topping
    const confirmBtn = document.getElementById('confirmAddToppingBtn');
    if (confirmBtn) {
        confirmBtn.onclick = async function() {
            const name_details = document.getElementById('toppingNameDetailsInput').value.trim();
            const name = document.getElementById('toppingNameInput').value.trim();
            const priceStr = document.getElementById('toppingPriceInput').value.trim();
            const price = Number(priceStr);
            if (!name_details || !name || !priceStr) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }
            if (isNaN(price) || price < 0) {
                alert('Giá topping không hợp lệ!');
                return;
            }
            // Construct options as a single-item array
            const options = [{ name, price }];
            try {
                await window.toppingService.createTopping({
                    id_dishes: currentEditDishId,
                    name_details,
                    options
                });
                alert('Thêm topping thành công!');
                document.getElementById('add-topping-modal').style.display = 'none';
                // Reload lại topping
                const userStr = localStorage.getItem('user');
                const user = JSON.parse(userStr);
                loadToppings(user.restaurant_id);
            } catch (err) {
                alert('Thêm topping thất bại!');
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
});

async function loadToppings(restaurantId) {
    try {
        const data = await window.menuService.getMenu(restaurantId);
        renderToppingList(data);
    } catch (error) {
        console.error('Error loading toppings:', error);
        document.getElementById('table-list-body').innerHTML = '<tr><td colspan="7">Lỗi tải dữ liệu.</td></tr>';
    }
}

function renderToppingList(data) {
    // Chuyển đổi object thành array để dễ xử lý phân trang
    allToppingsArr = Object.entries(data).map(([key, dish]) => dish);
    
    // Lấy giá trị mặc định từ select nếu có
    const select = document.querySelector('.items-per-page-select');
    if (select) {
        itemsPerPage = parseInt(select.value, 10) || 15;
    }
    
    // Reset về trang 1 khi load dữ liệu mới
    currentPage = 1;
    
    // Render danh sách và cập nhật UI phân trang
    renderToppingListPaged(currentPage, itemsPerPage);
    updatePaginationUI(currentPage, itemsPerPage, allToppingsArr.length);
}

function renderToppingListPaged(page, perPage) {
    const tbody = document.getElementById('table-list-body');
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageDishes = allToppingsArr.slice(startIdx, endIdx);
    
    if (pageDishes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Không có dữ liệu topping.</td></tr>';
        return;
    }

    let htmlContent = '';
    let rowIndex = 0;

    pageDishes.forEach((dish, dishIndex) => {
        const globalIndex = startIdx + dishIndex;
        
        // Format price
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(dish.price);

        // Status badge
        const statusBadge = (dish.status === 'active' || dish.status === true) 
            ? '<span style="color: #28a745; font-weight: 600;">Còn món</span>'
            : '<span style="color: #dc3545; font-weight: 600;">Hết món</span>';

        // Process toppings data - each topping category becomes a row
        if (dish.toppings && dish.toppings.length > 0) {
            dish.toppings.forEach((toppingCategory, toppingIndex) => {
                // For each option in the topping category, create a separate row
                toppingCategory.options.forEach((option, optionIndex) => {
                    const optionStt = toppingIndex === 0 && optionIndex === 0 ? String(globalIndex + 1).padStart(2, '0') : '';
                    
                    // Format option price
                    const optionFormattedPrice = new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(option.price);

                    htmlContent += `
                        <tr>
                            <td>${optionStt}</td>
                            <td>${toppingCategory.name_details}</td>
                            <td>${dish.name}</td>
                            <td>${option.name}</td>
                            <td>${optionFormattedPrice}</td>
                            <td>${statusBadge}</td>
                            <td>
                                <a href="#" class="action-link edit" data-id="${dish.id}" data-option-id="${option.id_option}">Sửa</a>
                                <a href="#" class="action-link delete" data-id="${dish.id}" data-option-id="${option.id_option}">Xóa</a>
                            </td>
                        </tr>
                    `;
                    rowIndex++;
                });
            });
        } else {
            // If no toppings, show just the dish
            htmlContent += `
                <tr>
                    <td>${String(globalIndex + 1).padStart(2, '0')}</td>
                    <td>-</td>
                    <td>${dish.name}</td>
                    <td>-</td>
                    <td>${formattedPrice}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <a href="#" class="action-link edit" data-id="${dish.id}">Sửa</a>
                        <a href="#" class="action-link delete" data-id="${dish.id}">Xóa</a>
                    </td>
                </tr>
            `;
            rowIndex++;
        }
    });

    tbody.innerHTML = htmlContent;
}

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
        alert('Chức năng xóa topping sẽ được implement sau');
        closeModal('delete-table-modal');
    } catch (error) {
        console.error('Error deleting topping:', error);
        alert('Có lỗi xảy ra khi xóa topping');
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
        newBtnFirst.addEventListener('click', () => window.onTablePageChange(1, itemsPerPage));
        newBtnPrev.addEventListener('click', () => window.onTablePageChange(currentPage - 1, itemsPerPage));
        newBtnNext.addEventListener('click', () => window.onTablePageChange(currentPage + 1, itemsPerPage));
        newBtnLast.addEventListener('click', () => window.onTablePageChange(totalPages, itemsPerPage));
    }
}

// Hàm này sẽ được gọi bởi component Pagination
window.onTablePageChange = function(page, perPage) {
    currentPage = parseInt(page, 10);
    itemsPerPage = parseInt(perPage, 10);
    
    // Render lại danh sách với trang mới
    renderToppingListPaged(currentPage, itemsPerPage);
    
    // Cập nhật UI phân trang
    updatePaginationUI(currentPage, itemsPerPage, allToppingsArr.length);
};

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