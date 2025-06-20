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
        tableBody.innerHTML = '<tr><td colspan="4">Không tìm thấy thông tin nhà hàng.</td></tr>';
        return;
    }
    try {
        const data = await window.tableService.getTable(restaurant_id);
        const tablesArr = Array.isArray(data) ? data : [];
        if (tablesArr.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">Không có dữ liệu bàn.</td></tr>';
            return;
        }
        renderTableList(tablesArr, restaurant_id);
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="4">Lỗi tải dữ liệu bàn.</td></tr>';
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
                alert('Vui lòng nhập số bàn!');
                tableNumberInput.focus();
                return;
            }
            if (!restaurant_id) {
                alert('Không tìm thấy restaurant_id!');
                return;
            }
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Đang thêm...';
            try {
                await window.tableService.createTable(id_table, restaurant_id);
                modal.style.display = 'none';
                // Reload lại danh sách bàn
                location.reload();
            } catch (err) {
                alert('Thêm bàn thất bại!');
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Thêm';
            }
        });
    }
    setupDeleteTableModalEvents();
    setupShowQRModalEvents();
});

let deleteTableId = null;

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

function showDeleteTableModal() {
    const modal = document.getElementById('delete-table-modal');
    if (modal) modal.style.display = 'block';
}

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
                await window.tableService.deleteTable(deleteTableId);
                hideDeleteTableModal();
                location.reload();
            } catch (err) {
                alert('Xóa bàn thất bại!');
            } finally {
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

// Sau khi render bảng, gọi setupDeleteTableButtons()
function renderTableList(tablesArr, restaurant_id) {
    const tableBody = document.getElementById('table-list-body');
    tableBody.innerHTML = tablesArr.map((item, idx) => {
        const tableId = item.id_table || `B${(idx+1).toString().padStart(2, '0')}`;
        const qrUrl = `https://jollicow.up.railway.app/menu?id_table=${tableId}&restaurant_id=${restaurant_id}`;
        // Sử dụng item.id làm data-id cho nút xóa
        return `
            <tr>
                <td>${(idx+1).toString().padStart(2, '0')}</td>
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
    setupDeleteTableButtons();
    setupShowQRButtons();
} 