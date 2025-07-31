let allOrdersArr = [];
let currentPage = 1;
let itemsPerPage = 15;

document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                // Thử lấy dữ liệu từ localStorage trước
                const cacheKey = `orderHistory_${user.restaurant_id}`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    try {
                        const data = JSON.parse(cached);
                        renderOrderList(data);
                        console.log('Đã load dữ liệu từ cache');
                    } catch (e) {
                        console.error('Lỗi parse cache, fallback về API:', e);
                        // Nếu lỗi parse, fallback về API
                        loadOrderHistory(user.restaurant_id, cacheKey);
                    }
                } else {
                    // Chưa có cache, load từ API
                    loadOrderHistory(user.restaurant_id, cacheKey);
                }
            } else {
                console.error('Không tìm thấy restaurant_id trong thông tin user');
                document.getElementById('orderHistoryBody').innerHTML = '<tr><td colspan="10">Không tìm thấy thông tin nhà hàng.</td></tr>';
                showAlert('Không tìm thấy thông tin nhà hàng!', 'error');
            }
        } catch (error) {
            console.error('Lỗi khi parse user data:', error);
            document.getElementById('orderHistoryBody').innerHTML = '<tr><td colspan="10">Lỗi dữ liệu người dùng.</td></tr>';
            showAlert('Lỗi dữ liệu người dùng!', 'error');
        }
    } else {
        console.error('Chưa đăng nhập');
        document.getElementById('orderHistoryBody').innerHTML = '<tr><td colspan="10">Người dùng chưa đăng nhập.</td></tr>';
        showAlert('Người dùng chưa đăng nhập!', 'warning');
    }
});

async function loadOrderHistory(restaurantId, cacheKey) {
    try {
        showLoading();
        const data = await window.orderService.getOrderHistoryDone(restaurantId);
        
        // Lưu vào localStorage nếu có cacheKey
        if (cacheKey) {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                console.log('Đã lưu dữ liệu vào cache');
            } catch (e) {
                console.warn('Không thể lưu vào localStorage:', e);
            }
        }
        
        renderOrderList(data);
    } catch (error) {
        console.error('Error loading order history:', error);
        document.getElementById('orderHistoryBody').innerHTML = '<tr><td colspan="10">Lỗi tải dữ liệu.</td></tr>';
        showAlert('Lỗi tải dữ liệu lịch sử đơn hàng!', 'error');
    } finally {
        hideLoading();
    }
}

function renderOrderList(data) {
    // Chuyển đổi object thành array và đảo ngược thứ tự (item cuối cùng lên đầu)
    allOrdersArr = Object.entries(data).map(([key, order]) => order).reverse();
    
    // Lấy giá trị mặc định từ select nếu có
    const select = document.querySelector('.items-per-page-select');
    if (select) {
        itemsPerPage = parseInt(select.value, 10) || 15;
    }
    
    // Reset về trang 1 khi load dữ liệu mới
    currentPage = 1;
    
    // Render danh sách và cập nhật UI phân trang
    renderOrderListPaged(currentPage, itemsPerPage);
    updatePaginationUI(currentPage, itemsPerPage, allOrdersArr.length);
}

//cụm chuyển trang
function renderOrderListPaged(page, perPage) {
    const tbody = document.getElementById('orderHistoryBody');
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    const pageOrders = allOrdersArr.slice(startIdx, endIdx);
    
    if (pageOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10">Không có dữ liệu đơn hàng.</td></tr>';
        showAlert('Không có dữ liệu đơn hàng.', 'info');
        return;
    }

    tbody.innerHTML = pageOrders.map((order, idx) => {
        // Format date
        const orderDate = new Date(order.date_create);
        const formattedDateTime = orderDate.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Format price
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(order.total_price);

        return `
            <tr>
                <td>${String(startIdx + idx + 1).padStart(2, '0')}</td>
                <td>${order.id_order}</td>
                <td>Bàn ${order.id_table}</td>
                <td>${formattedDateTime}</td>
                <td>${formattedPrice}</td>
                <td>${order.payment}</td>
                <td>${order.status_order}</td>
                <td><a href="#" class="action-link">[Xem đơn]</a></td>
            </tr>
        `;
    }).join('');
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
        newBtnFirst.addEventListener('click', () => window.onHistoryPageChange(1, itemsPerPage));
        newBtnPrev.addEventListener('click', () => window.onHistoryPageChange(currentPage - 1, itemsPerPage));
        newBtnNext.addEventListener('click', () => window.onHistoryPageChange(currentPage + 1, itemsPerPage));
        newBtnLast.addEventListener('click', () => window.onHistoryPageChange(totalPages, itemsPerPage));
    }
}

// Hàm này sẽ được gọi bởi component Pagination
window.onHistoryPageChange = function(page, perPage) {
    currentPage = parseInt(page, 10);
    itemsPerPage = parseInt(perPage, 10);
    
    // Render lại danh sách với trang mới
    renderOrderListPaged(currentPage, itemsPerPage);
    
    // Cập nhật UI phân trang
    updatePaginationUI(currentPage, itemsPerPage, allOrdersArr.length);
};

// Hàm làm mới dữ liệu (xóa cache và load lại từ API)
window.refreshOrderHistory = function() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                const cacheKey = `orderHistory_${user.restaurant_id}`;
                // Xóa cache
                localStorage.removeItem(cacheKey);
                console.log('Đã xóa cache, load lại từ API');
                // Load lại từ API
                loadOrderHistory(user.restaurant_id, cacheKey);
            }
        } catch (error) {
            console.error('Lỗi khi refresh:', error);
            showAlert('Lỗi khi làm mới dữ liệu!', 'error');
        }
    }
};
