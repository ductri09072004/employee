// Hiển thị danh sách staff vào bảng, bỏ qua password
let allStaffArr = [];
let currentPage = 1;
let itemsPerPage = 15;

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await window.authService.getInactivestaff();
        // data là object, mỗi key là 1 staff
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
    }

    // Xử lý sự kiện click cho các nút action
    const staffBody = document.getElementById('staffBody');
    if (staffBody) {
        staffBody.addEventListener('click', async function(e) {
            // Duyệt tài khoản
            const editLink = e.target.closest('a.action-link.edit');
            if (editLink) {
                e.preventDefault();
                const staffId = editLink.dataset.id; // Lấy id (-OS...)
                if (!staffId) return;

                try {
                    const response = await window.authService.put_staff(staffId);
                    if (response && response.message) {
                        showAlert('Duyệt tài khoản thành công!', 'success');
                        // Xóa tài khoản đã duyệt khỏi danh sách và render lại
                        allStaffArr = allStaffArr.filter(s => s.id_staff !== staffId); // Lọc bằng id (-OS...)
                        renderStaffListPaged(currentPage, itemsPerPage);
                        updatePaginationUI(currentPage, itemsPerPage, allStaffArr.length);
                    } else {
                        showAlert('Duyệt thất bại. ' + (response?.message || ''), 'error');
                    }
                } catch (error) {
                    console.error('Lỗi khi duyệt tài khoản:', error);
                    showAlert('Có lỗi xảy ra!', 'error');
                }
                return;
            }

            // Xóa yêu cầu
            const deleteLink = e.target.closest('a.action-link.delete');
            if (deleteLink) {
                e.preventDefault();
                const staffId = deleteLink.dataset.id; // Lấy id (-OS...)
                if (!staffId) return;

                const staff = allStaffArr.find(s => s.id === staffId);
                const staffName = staff ? staff.name : staffId;

                showConfirmModal({
                    title: 'Xác nhận xóa yêu cầu',
                    message: `Bạn có chắc muốn xóa yêu cầu đăng ký của nhân viên "<strong>${staffName}</strong>"?`,
                    confirmText: 'Xóa',
                    confirmButtonClass: 'btn-danger',
                    onConfirm: async () => {
                        try {
                            showLoading();
                            const response = await window.authService.deleteAccRes(staffId);
                            if (response) {
                                showAlert('Đã xóa yêu cầu thành công!', 'success');
                                allStaffArr = allStaffArr.filter(s => s.id !== staffId); // Lọc bằng id (-OS...)
                                renderStaffListPaged(currentPage, itemsPerPage);
                                updatePaginationUI(currentPage, itemsPerPage, allStaffArr.length);
                            } else {
                               showAlert('Xóa thất bại!', 'error');
                            }
                        } catch (error) {
                            console.error('Lỗi khi xóa yêu cầu:', error);
                            showAlert('Có lỗi xảy ra khi xóa yêu cầu.', 'error');
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
            <td>${staff.status}</td>
            <td>
                <a href="#" class="action-link edit" data-id="${staff.id_staff}" style="color: #1976d2;">
                    <img src="/svg/icon_action/write.svg" alt="Duyệt" title="Duyệt TK" style="width:20px;height:20px;vertical-align:middle;">
                </a>
                <a href="#" class="action-link delete" data-id="${staff.id}" style="color: #e31616;">
                    <img src="/svg/icon_action/delete.svg" alt="Xóa" title="${staff.id}Xóa yêu cầu" style="width:20px;height:20px;vertical-align:middle;">
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
