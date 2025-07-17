// Hiển thị danh sách staff vào bảng, bỏ qua password
let allStaffArr = [];
let currentPage = 1;
let itemsPerPage = 15;

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await window.restaurantService.getRes();
        // data là object, mỗi key là 1 staff
        allStaffArr = Object.values(data).filter(staff => staff.id_restaurant);
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
            <td>${staff.id_restaurant}</td>
            <td>${staff.address}</td>
            <td>${staff.ip_wifi}</td>
            <td>${staff.name_restaurant}</td>
            <td>${staff.number_tax}</td>
            <td>
                <a href="#" class="action-link show" style="color: #198754;">[Thêm]</a>
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
