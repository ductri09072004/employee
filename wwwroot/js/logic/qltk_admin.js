// Hiển thị danh sách staff vào bảng, bỏ qua password
let allStaffArr = [];
let currentPage = 1;
let itemsPerPage = 15;

window.addEventListener('DOMContentLoaded', async () => {
    // Thêm nút làm mới nếu chưa có
    if (!document.getElementById('refreshBtn')) {
        const btn = document.createElement('button');
        btn.id = 'refreshBtn';
        btn.innerHTML = '<span style="font-size: 14px;">&#x21bb;</span>';
        btn.style = 'margin: 12px; background: #1976d2; color: #fff; border: none; border-radius: 6px; padding: 8px 18px; font-weight: 600; cursor: pointer;';
        const table = document.getElementById('staffBody');
        if (table && table.parentElement) {
            // Tạo div bọc để căn phải
            const wrapper = document.createElement('div');
            wrapper.style = 'text-align: right; width: 100%;';
            wrapper.appendChild(btn);
            table.parentElement.insertAdjacentElement('beforebegin', wrapper);
        }
    }

    showLoading();
    try {
        let data;
        const cached = localStorage.getItem('staff_list');
        if (cached) {
            data = JSON.parse(cached);
        } else {
            data = await window.authService.getstaff();
            localStorage.setItem('staff_list', JSON.stringify(data));
        }
        // Dùng Object.entries để lấy key (-OS...) làm id cho mỗi staff
        allStaffArr = Object.entries(data)
            .filter(([key, staff]) => staff && staff.id_staff)
            .map(([key, staff]) => ({ ...staff, id: key }));

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

    // Nút làm mới
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = async function() {
            showLoading();
            try {
                localStorage.removeItem('staff_list');
                const data = await window.authService.getstaff();
                localStorage.setItem('staff_list', JSON.stringify(data));
                allStaffArr = Object.entries(data)
                    .filter(([key, staff]) => staff && staff.id_staff)
                    .map(([key, staff]) => ({ ...staff, id: key }));
                currentPage = 1;
                renderStaffListPaged(currentPage, itemsPerPage);
                updatePaginationUI(currentPage, itemsPerPage, allStaffArr.length);
                showAlert('Đã làm mới dữ liệu!', 'success');
            } catch (error) {
                showAlert('Lỗi khi làm mới dữ liệu!', 'error');
            } finally {
                hideLoading();
            }
        };
    }

    // Xử lý sự kiện click cho các nút action
    const staffBody = document.getElementById('staffBody');
    if (staffBody) {
        staffBody.addEventListener('click', async function(e) {
            const editLink = e.target.closest('a.action-link.edit');
            if (editLink) {
                e.preventDefault();
                const staffId = editLink.dataset.id; // This is the '-OS...' key
                if (!staffId) return;

                const staff = allStaffArr.find(s => s.id === staffId);
                if (!staff) {
                    showAlert('Không tìm thấy nhân viên!', 'error');
                    return;
                }
                
                const staffName = staff.name;
                const isLocking = staff.status === 'active';
                const title = isLocking ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản';
                const message = isLocking 
                    ? `Bạn có chắc chắn muốn khóa tài khoản của nhân viên "<strong>${staffName}</strong>"?`
                    : `Bạn có chắc chắn muốn mở khóa tài khoản cho nhân viên "<strong>${staffName}</strong>"?`;
                const confirmText = isLocking ? 'Khóa' : 'Mở khóa';
                const confirmButtonClass = isLocking ? 'btn-danger' : 'btn-primary';

                showConfirmModal({
                    title: title,
                    message: message,
                    confirmText: confirmText,
                    confirmButtonClass: confirmButtonClass,
                    onConfirm: async () => {
                        try {
                            showLoading();
                            let response;
                            if (isLocking) {
                                // API for locking requires 'id_staff' (e.g., NVI...)
                                response = await window.authService.put_staff_inactive(staff.id_staff);
                            } else {
                                // API for unlocking requires the main key (e.g., -OS...)
                                response = await window.authService.put_staff(staff.id_staff);
                            }

                            if (response) {
                                showAlert(isLocking ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!', 'success');
                                staff.status = isLocking ? 'inactive' : 'active';
                                renderStaffListPaged(currentPage, itemsPerPage);
                            } else {
                               showAlert(isLocking ? 'Khóa tài khoản thất bại!' : 'Mở khóa tài khoản thất bại!', 'error');
                            }
                        } catch (error) {
                            console.error('Lỗi khi cập nhật trạng thái:', error);
                            showAlert('Có lỗi xảy ra khi cập nhật trạng thái.', 'error');
                        } finally {
                            hideLoading();
                        }
                    }
                });
                return;
            }

            const deleteLink = e.target.closest('a.action-link.delete');
            if (deleteLink) {
                e.preventDefault();
                const staffId = deleteLink.dataset.id; // Lấy id (-OS...) từ data-id
                if (!staffId) return;

                const staff = allStaffArr.find(s => s.id === staffId); // Tìm staff bằng id (-OS...)
                const staffName = staff ? staff.name : staffId;

                showConfirmModal({
                    title: 'Xác nhận xóa nhân viên',
                    message: `Bạn có chắc chắn muốn xóa nhân viên "<strong>${staffName}</strong>"? Thao tác này sẽ xóa cả nhà hàng liên kết.`,
                    confirmText: 'Xóa vĩnh viễn',
                    confirmButtonClass: 'btn-danger',
                    onConfirm: async () => {
                        try {
                            showLoading();
                            const response = await window.authService.deleteAccRes(staffId);
                            if (response) {
                                showAlert('Đã xóa nhân viên và nhà hàng liên kết thành công!', 'success');
                                allStaffArr = allStaffArr.filter(s => s.id !== staffId); // Lọc bằng id (-OS...)
                                renderStaffListPaged(currentPage, itemsPerPage);
                                updatePaginationUI(currentPage, itemsPerPage, allStaffArr.length);
                            } else {
                               showAlert('Xóa thất bại!', 'error');
                            }
                        } catch (error) {
                            console.error('Lỗi khi xóa nhân viên:', error);
                            showAlert('Có lỗi xảy ra khi xóa nhân viên.', 'error');
                        } finally {
                            hideLoading();
                        }
                    }
                });
            }
        });
    }
});

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
            <td>${staff.id_staff}</td>
            <td>${staff.name}</td>
            <td>${staff.phone}</td>
            <td>${staff.restaurant_id || ''}</td>
            <td>${staff.role}</td>
            <td style="color: ${staff.status === 'active' ? '#198754' : staff.status === 'inactive' ? '#e31616' : '#000'}; font-weight: 600;">
                ${staff.status}
            </td>
            <td>
                ${staff.status === 'active'
                    ? `<a href="#" class="action-link edit" data-id="${staff.id}" style="color: #1976d2;">
                         <img src="/svg/icon_action/lock.svg" alt="Khóa" title="Khóa TK" style="width:20px;height:20px;vertical-align:middle;">
                       </a>`
                    : `<a href="#" class="action-link edit" data-id="${staff.id}" style="color: #198754;">
                         <img src="/svg/icon_action/unlock.svg" alt="Mở khóa" title="Mở khóa TK" style="width:20px;height:20px;vertical-align:middle;">
                       </a>`
                }
                <a href="#" class="action-link delete" data-id="${staff.id}" style="color: #e31616;">
                    <img src="/svg/icon_action/delete.svg" alt="Xóa" title="Xóa" style="width:20px;height:20px;vertical-align:middle;">
                </a>
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

