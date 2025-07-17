document.addEventListener('DOMContentLoaded', async function () {
    const tableBody = document.getElementById('table-list-body');
    let restaurantInfo = localStorage.getItem('user');
    let restaurant_id = '';
    if (restaurantInfo) {
        try {
            restaurant_id = JSON.parse(restaurantInfo).restaurant_id;
        } catch (e) {
            restaurant_id = '';
        }
    }
    if (!restaurant_id) {
        tableBody.innerHTML = '<tr><td colspan="4">Không tìm thấy thông tin bàn.</td></tr>';
        showAlert('Không tìm thấy thông tin nhà hàng!', 'error');
        return;
    }
    try {
        showLoading();
        const data = await window.tableService.getTable(restaurant_id);
        console.log('API Response:', data); // Debug log
        
        let tablesArr = [];
        let totalCount = 0;
        
        // Kiểm tra format response
        if (data && typeof data === 'object' && data.tables && typeof data.total === 'number') {
            // Format mới: { tables: [...], total: number }
            tablesArr = Array.isArray(data.tables) ? data.tables : [];
            totalCount = data.total;
        } else if (Array.isArray(data)) {
            // Format cũ: chỉ mảng
            tablesArr = data;
            totalCount = data.length;
        } else {
            // Fallback
            tablesArr = [];
            totalCount = 0;
        }
        
        console.log('Tables array:', tablesArr); // Debug log
        console.log('Total count:', totalCount); // Debug log
        
        if (tablesArr.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">Không có dữ liệu bàn.</td></tr>';
            showAlert('Không có dữ liệu bàn.', 'info');
            // Cập nhật pagination với count = 0
            updatePaginationUI(1, 15, totalCount);
            return;
        }
        renderTableList(tablesArr, restaurant_id, totalCount);
    } catch (err) {
        console.error('Error loading tables:', err); // Debug log
        tableBody.innerHTML = '<tr><td colspan="4">Lỗi tải dữ liệu bàn.</td></tr>';
        showAlert('Lỗi tải dữ liệu bàn!', 'error');
        // Cập nhật pagination với count = 0 khi có lỗi
        updatePaginationUI(1, 15, 0);
    } finally {
        hideLoading();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Popup logic
    const openBtn = document.getElementById('openAddTableModal');
    const modal = document.getElementById('add-table-modal');
    const closeBtn = document.getElementById('closeAddTableModal');
    const confirmBtn = document.getElementById('confirmAddTableBtn');
    const tableNumberInput = document.getElementById('tableNumberInput');
    let restaurant_id = '';
    // Lấy restaurant_id từ localStorage (dùng lại cho createTable)
    let restaurantInfo = localStorage.getItem('user');
    if (restaurantInfo) {
        try {
            restaurant_id = JSON.parse(restaurantInfo).restaurant_id;
        } catch (e) {
            restaurant_id = '';
        }
    }
    if (openBtn && modal && closeBtn) {
        openBtn.addEventListener('click', function () {
            modal.style.display = 'block';
            tableNumberInput.value = '';
            tableNumberInput.focus();
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
    // Xử lý nút Thêm
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function () {
            const id_table = tableNumberInput.value.trim();
            if (!id_table) {
                showAlert('Vui lòng nhập số bàn!', 'warning');
                tableNumberInput.focus();
                return;
            }
            if (!restaurant_id) {
                showAlert('Không tìm thấy restaurant_id!', 'error');
                return;
            }
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Đang thêm...';
            try {
                showLoading();
                await window.tableService.createTable(id_table, restaurant_id);
                modal.style.display = 'none';
                showAlert('Thêm bàn thành công!', 'success');
                // Reload lại danh sách bàn
                location.reload();
            } catch (err) {
                showAlert('Thêm bàn thất bại!', 'error');
            } finally {
                hideLoading();
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Thêm';
            }
        });
    }
    setupDeleteTableModalEvents();
    setupShowQRModalEvents();
});

let deleteTableId = null;

//btn delete
function setupDeleteTableButtons() {
    document.querySelectorAll('.action-link.delete').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            if (!id) return;
            deleteTableId = id;
            showDeleteTableModal();
        });
    });
}

//popup delete
function showDeleteTableModal() {
    const modal = document.getElementById('delete-table-modal');
    if (modal) modal.style.display = 'block';
}

//hide popup
function hideDeleteTableModal() {
    const modal = document.getElementById('delete-table-modal');
    if (modal) modal.style.display = 'none';
    deleteTableId = null;
}

// Xử lý popup xác nhận xóa
function setupDeleteTableModalEvents() {
    const closeBtn = document.getElementById('closeDeleteTableModal');
    const cancelBtn = document.getElementById('cancelDeleteTableBtn');
    const confirmBtn = document.getElementById('confirmDeleteTableBtn');
    if (closeBtn) closeBtn.onclick = hideDeleteTableModal;
    if (cancelBtn) cancelBtn.onclick = hideDeleteTableModal;
    if (confirmBtn) {
        confirmBtn.onclick = async function () {
            if (!deleteTableId) return;
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Đang xóa...';
            try {
                showLoading();
                await window.tableService.deleteTable(deleteTableId);
                hideDeleteTableModal();
                showAlert('Xóa bàn thành công!', 'success');
                location.reload();
            } catch (err) {
                showAlert('Xóa bàn thất bại!', 'error');
            } finally {
                hideLoading();
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Xóa';
            }
        };
    }
    // Đóng modal khi click ra ngoài
    const modal = document.getElementById('delete-table-modal');
    if (modal) {
        window.addEventListener('click', function (e) {
            if (e.target === modal) hideDeleteTableModal();
        });
    }
}

//hiện qr
function setupShowQRButtons() {
    document.querySelectorAll('.action-link.upload').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            // Lấy url từ cột QR Code (cùng hàng)
            const tr = btn.closest('tr');
            if (!tr) return;
            const urlCell = tr.querySelector('td:nth-child(3) a');
            if (!urlCell) return;
            const url = urlCell.getAttribute('href');
            showQRModal(url);
        });
    });
}

function showQRModal(url) {
    const modal = document.getElementById('show-qr-modal');
    const qrContainer = document.getElementById('qrCodeContainer');
    const urlText = document.getElementById('qrUrlText');
    if (!modal || !qrContainer || !urlText) return;
    // Xóa QR cũ
    qrContainer.innerHTML = '';
    // Render QR code
    new QRCode(qrContainer, {
        text: url,
        width: 180,
        height: 180,
        colorDark: '#000',
        colorLight: '#fff',
        correctLevel: QRCode.CorrectLevel.H
    });
    urlText.textContent = url;
    modal.style.display = 'block';
}

function hideQRModal() {
    const modal = document.getElementById('show-qr-modal');
    if (modal) modal.style.display = 'none';
}

function setupShowQRModalEvents() {
    const closeBtn = document.getElementById('closeShowQRModal');
    if (closeBtn) closeBtn.onclick = hideQRModal;
    const modal = document.getElementById('show-qr-modal');
    if (modal) {
        window.addEventListener('click', function (e) {
            if (e.target === modal) hideQRModal();
        });
    }
}

let allTablesArr = [];
let currentPage = 1;
let itemsPerPage = 15;
let totalTableCount = 0; // Thêm biến để lưu tổng số bàn từ API

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

function renderTableListPaged(page, perPage) {
    console.log('Rendering page:', { page, perPage, totalItems: allTablesArr.length }); // Debug log
    
    const tableBody = document.getElementById('table-list-body');
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageTables = allTablesArr.slice(startIdx, endIdx);
    
    console.log('Page data:', { startIdx, endIdx, itemsInPage: pageTables.length }); // Debug log
    
    if (pageTables.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">Không có dữ liệu bàn.</td></tr>';
        return;
    }

    tableBody.innerHTML = pageTables.map((item, idx) => {
        const tableId = item.id_table || `B${(startIdx + idx + 1).toString().padStart(2, '0')}`;
        const qrUrl = `https://jollicow-client-production.up.railway.app/menu/generate?id_table=${tableId}&restaurant_id=${item.restaurant_id || ''}`;
        return `
            <tr>
                <td>${(startIdx + idx + 1).toString().padStart(2, '0')}</td>
                <td>${tableId}</td>
                <td><a href="${qrUrl}" target="_blank">${qrUrl}</a></td>
                <td>
                    <a href="#" class="action-link upload">[Hiện]</a>
                    <a href="#" class="action-link">[Chỉnh sửa]</a>
                    <a href="#" class="action-link delete" data-id="${item.id}">[Xóa]</a>
                </td>
            </tr>
        `;
    }).join('');
    
    // Cập nhật lại các event listeners sau khi render lại bảng
    setupDeleteTableButtons();
    setupShowQRButtons();
}

// Hàm này sẽ được gọi bởi component Pagination
window.onTablePageChange = function(page, perPage) {
    console.log('Page change triggered:', { page, perPage }); // Debug log
    
    currentPage = parseInt(page, 10);
    itemsPerPage = parseInt(perPage, 10);
    
    // Render lại danh sách với trang mới
    renderTableListPaged(currentPage, itemsPerPage);
    
    // Cập nhật UI phân trang
    updatePaginationUI(currentPage, itemsPerPage, allTablesArr.length);
};

// Khi load dữ liệu lần đầu
function renderTableList(tablesArr, restaurant_id, totalCount) {
    allTablesArr = tablesArr.reverse().map(item => ({ ...item, restaurant_id }));
    
    // Lấy giá trị mặc định từ select nếu có
    const select = document.querySelector('.items-per-page-select');
    if (select) {
        itemsPerPage = parseInt(select.value, 10) || 15;
    }
    
    // Reset về trang 1 khi load dữ liệu mới
    currentPage = 1;
    
    // Render danh sách và cập nhật UI phân trang
    renderTableListPaged(currentPage, itemsPerPage);
    updatePaginationUI(currentPage, itemsPerPage, totalCount || allTablesArr.length);
}