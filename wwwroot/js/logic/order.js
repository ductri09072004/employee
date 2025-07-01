let allOrdersArr = [];
let currentPage = 1;
let itemsPerPage = 15;

document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem('user');
    const status_order = 'pending';
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                loadOrderHistory(user.restaurant_id,status_order);
                // Thêm load order cards với status confirmed
                loadOrderCardsConfirmed(user.restaurant_id, 'preparing');
            } else {
                console.error('Không tìm thấy restaurant_id trong thông tin user');
                document.getElementById('orderHistoryBody').innerHTML = '<tr><td colspan="10">Không tìm thấy thông tin nhà hàng.</td></tr>';
            }
        } catch (error) {
            console.error('Lỗi khi parse user data:', error);
            document.getElementById('orderHistoryBody').innerHTML = '<tr><td colspan="10">Lỗi dữ liệu người dùng.</td></tr>';
        }
    } else {
        console.error('Chưa đăng nhập');
        document.getElementById('orderHistoryBody').innerHTML = '<tr><td colspan="10">Người dùng chưa đăng nhập.</td></tr>';
    }
});

// Thêm function mới cho order cards với status confirmed
async function loadOrderCardsConfirmed(restaurantId, status_order) {
    try {
        const data = await window.orderService.getOrderby3in1Status(restaurantId, status_order);
        renderOrderCardsConfirmed(data);
    } catch (error) {
        console.error('Error loading order cards confirmed:', error);
    }
}

function renderOrderCardsConfirmed(data) {
    const orderCardsGrid = document.querySelector('.order-cards-grid');
    if (!orderCardsGrid) return;

    // Chuyển đổi object thành array
    const ordersArr = Object.entries(data).map(([key, order]) => order);
    
    if (ordersArr.length === 0) {
        orderCardsGrid.innerHTML = '<p>Không có đơn hàng đã xác nhận.</p>';
        return;
    }

    orderCardsGrid.innerHTML = ordersArr.map(order => {
        // Format date
        const orderDate = new Date(order.date_create);
        const formattedTime = orderDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Tạo HTML cho order items từ dữ liệu thực
        const orderItems = order.items || [];
        const itemsHtml = orderItems.length > 0 ? orderItems.map(item => {
            // Xử lý name_topping array
            const toppings = item.name_topping && Array.isArray(item.name_topping) 
                ? item.name_topping.join(', ') 
                : (item.name_topping || '---');
            
            return `
                <tr>
                    <td>${item.id_dishes || 'Món ăn'}</td>
                    <td>${item.quantity || 1}</td>
                    <td>${toppings}</td>
                    <td>${item.note || '---'}</td>
                </tr>
            `;
        }).join('') : `
            <tr>
                <td>Không có món ăn</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        `;

        return `
            <div class="order-card">
                <div class="card-header">
                    <h2 class="card-title">Hóa Đơn Đặt Món</h2>     
                </div>
                <div class="card-header-1">
                    <p class="card-info">Bàn: ${order.id_table || '01'}</p>
                    <span class="card-time">${formattedTime}</span>
                </div>
                <div class="card-header-1">
                    <p class="card-info">Trạng thái: </p>
                    <span class="card-status">${order.status_order || 'Đã xác nhận'}</span>
                </div>
                
                <table class="order-items-table">
                    <thead>
                        <tr>
                            <th>Món ăn</th>
                            <th>Số lượng</th>
                            <th>Topping</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="order-actions">
                    
                    <button class="btn btn-green" data-order-id="${order.id_order}">Hoàn tất</button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadOrderHistory(restaurantId,status_order) {
    try {
        const data = await window.orderService.getOrderbyStatus(restaurantId,status_order);
        renderOrderList(data);
    } catch (error) {
        console.error('Error loading order history:', error);
        document.getElementById('orderHistoryBody').innerHTML = '<tr><td colspan="10">Lỗi tải dữ liệu.</td></tr>';
    }
}

function renderOrderList(data) {
    // Chuyển đổi object thành array để dễ xử lý phân trang
    allOrdersArr = Object.entries(data).map(([key, order]) => order);
    
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
        return;
    }

    tbody.innerHTML = pageOrders.map((order, idx) => {
        // Format date
        const orderDate = new Date(order.date_create);
        const formattedTime = orderDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Format price
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(order.total_price || 0);

        // Đếm số ghi chú từ items
        const orderItems = order.items || [];
        const notesCount = orderItems.filter(item => item.note && item.note.trim() !== '').length;

        return `
            <tr>
                <td>${String(startIdx + idx + 1).padStart(2, '0')}</td>
                <td>${order.id_order || 'N/A'}</td>
                <td>Bàn ${order.id_table || 'N/A'}</td>
                <td>${formattedTime}</td>
                <td>${formattedPrice}</td>
                <td>${order.payment || 'N/A'}</td>
                <td>${order.status_order || 'N/A'}</td>
                <td>${notesCount} ghi chú</td>
                <td><a href="#" class="action-link" data-id="${order.id_order}">${order.status_order || 'N/A'}</a></td>
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


document.addEventListener('click', function(e) {
    if (e.target.classList.contains('action-link')) {
        e.preventDefault();
        const id_order = e.target.getAttribute('data-id');
        if (!id_order) return;
        orderService.updateStatus(id_order, 'preparing')
            .then(data => {
                alert('Đã chuyển trạng thái sang preparing!');
                // Reload lại dữ liệu
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.restaurant_id) {
                        loadOrderHistory(user.restaurant_id, 'pending');
                        loadOrderCardsConfirmed(user.restaurant_id, 'preparing');
                    }
                }
            })
            .catch(err => {
                alert('Có lỗi khi cập nhật trạng thái!');
            });
    }
});


document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn') && e.target.classList.contains('btn-green')) {
        e.preventDefault();
        const id_order = e.target.getAttribute('data-order-id');
        if (!id_order) return;
        orderService.updateStatus(id_order, 'confirmed')
            .then(data => {
                alert('Đã chuyển trạng thái sang confirmed!');
                // Reload lại dữ liệu
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.restaurant_id) {
                        loadOrderHistory(user.restaurant_id, 'pending');
                        loadOrderCardsConfirmed(user.restaurant_id, 'preparing');
                    }
                }
            })
            .catch(err => {
                alert('Có lỗi khi cập nhật trạng thái!');
            });
    }
});

