// Hiển thị danh sách staff vào bảng, bỏ qua password
let allStaffArr = [];
let currentPage = 1;
let itemsPerPage = 15;

document.addEventListener('DOMContentLoaded', function() {
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
                    localStorage.setItem('promotion_success', 'Thêm khuyến mãi thành công!');
                    setTimeout(() => location.reload(), 1200); 
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
    try {
        showLoading();
        const data = await window.promotionService.getPromotionByRes(id_restaurant);
        // data là object, mỗi key là 1 staff
        allStaffArr = Object.values(data).filter(staff => staff.id_promotion);
        // Lấy giá trị mặc định từ select nếu có
        const select = document.querySelector('.items-per-page-select');
        if (select) {
            itemsPerPage = parseInt(select.value, 10) || 15;
        }
        currentPage = 1;
        renderStaffListPaged(currentPage, itemsPerPage);
        updatePaginationUI(currentPage, itemsPerPage, allStaffArr.length);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách staff:', error);
        const staffBody = document.getElementById('staffBody');
        if (staffBody) staffBody.innerHTML = '<tr><td colspan="6">Lỗi khi tải dữ liệu nhân viên.</td></tr>';
    } finally {
        hideLoading();
    }
});

window.addEventListener('DOMContentLoaded', function() {
    const msg = localStorage.getItem('promotion_success');
    if (msg) {
        showAlert(msg, 'success');
        localStorage.removeItem('promotion_success');
    }
});

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
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageStaff = allStaffArr.slice(startIdx, endIdx);
    if (pageStaff.length === 0) {
        staffBody.innerHTML = '<tr><td colspan="7">Không có dữ liệu nhân viên.</td></tr>';
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
                <a href="#" class="action-link edit" style="color: #1976d2;">[Sửa]</a>
                <a href="#" class="action-link delete" style="color: #e31616;">[Xóa]</a>
            </td>
        </tr>
    `).join('');
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
