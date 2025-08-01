let allOrdersArr = [];
let currentPage = 1;
let itemsPerPage = 15;

// Biến global để lưu trữ đơn hàng hiện tại
let currentOrder = null;

document.addEventListener('DOMContentLoaded', function() {
    // Test PDF library
    setTimeout(() => {
        testPdfLibrary();
    }, 1000);
    
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

    // Event listener cho nút xem hóa đơn trong bảng
    document.addEventListener('click', function(e) {
        console.log('Click event triggered, target:', e.target);
        console.log('Closest .action-link.view-invoice:', e.target.closest('.action-link.view-invoice'));
        
        if (e.target.closest('.action-link.view-invoice')) {
            e.preventDefault();
            const orderId = e.target.closest('.action-link.view-invoice').getAttribute('data-order-id');
            console.log('Order ID from button:', orderId);
            if (orderId) {
                showInvoiceModal(orderId);
            }
        }
    });

    // Event listener cho nút tải PDF trong bảng
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-link.download-pdf')) {
            e.preventDefault();
            const orderId = e.target.closest('.action-link.download-pdf').getAttribute('data-order-id');
            if (orderId) {
                downloadPdfDirectly(orderId);
            }
        }
    });

    // Event listener cho nút đóng modal hóa đơn
    const closeInvoiceModal = document.getElementById('closeInvoiceModal');
    if (closeInvoiceModal) {
        closeInvoiceModal.addEventListener('click', function() {
            const modal = document.getElementById('invoice-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Event listener cho việc click bên ngoài modal để đóng
    window.addEventListener('click', function(event) {
        const invoiceModal = document.getElementById('invoice-modal');
        
        if (event.target === invoiceModal) {
            invoiceModal.style.display = 'none';
        }
    });
});

async function loadOrderHistory(restaurantId, cacheKey) {
    try {
        showLoading();
        const data = await window.orderService.getOrderby3in1Status(restaurantId, 'confirmed');
        
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
    console.log('renderOrderList được gọi với data:', data);
    
    // Chuyển đổi object thành array và đảo ngược thứ tự (item cuối cùng lên đầu)
    allOrdersArr = Object.entries(data).map(([key, order]) => order).reverse();
    console.log('allOrdersArr sau khi xử lý:', allOrdersArr);
    
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

        // Tạo HTML cho các action
        const actionHtml = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <a href="#" class="action-link view-invoice" data-order-id="${order.id_order}" title="Xem hóa đơn" style="display: flex; align-items: center; gap: 5px;">
                    <img src="/svg/icon_action/eyeoff.svg" alt="Xem hóa đơn" style="width: 20px; height: 20px;">
                </a>
                <a href="#" class="action-link download-pdf" data-order-id="${order.id_order}" title="Tải PDF" style="display: flex; align-items: center; gap: 5px;">
                    <img src="/svg/icon_action/download.svg" alt="Tải PDF" style="width: 20px; height: 20px;">
                    <span style="color: #4267B2; font-size: 12px;">PDF</span>
                </a>
            </div>
        `;

        return `
            <tr>
                <td>${String(startIdx + idx + 1).padStart(2, '0')}</td>
                <td>${order.id_order}</td>
                <td>Bàn ${order.id_table}</td>
                <td>${formattedDateTime}</td>
                <td>${formattedPrice}</td>
       
                <td>${order.status_order}</td>
                <td>
                    ${actionHtml}
                </td>
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

// Hàm hiển thị modal xem hóa đơn
async function showInvoiceModal(orderId) {
    try {
        showLoading();
        console.log('Đang tìm đơn hàng với ID:', orderId);
        console.log('allOrdersArr hiện tại:', allOrdersArr);
        
        // Tìm đơn hàng trong allOrdersArr trước
        let order = allOrdersArr.find(o => o.id_order === orderId);
        
        if (!order) {
            console.log('Không tìm thấy trong allOrdersArr, thử gọi API...');
            
            // Lấy thông tin user từ localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.restaurant_id) {
                alert('Vui lòng đăng nhập lại!');
                return;
            }

            // Lấy dữ liệu đơn hàng từ API
            const orderData = await window.orderService.getOrderby3in1Status(user.restaurant_id, 'confirmed');
            console.log('Dữ liệu đơn hàng từ API:', orderData);
            
            // Tìm đơn hàng theo ID - thử cả 2 cách
            // Cách 1: Tìm trong mảng
            if (Array.isArray(orderData)) {
                order = orderData.find(o => o.id_order === orderId);
            }
            
            // Cách 2: Tìm trong object (nếu API trả về object)
            if (!order && typeof orderData === 'object' && !Array.isArray(orderData)) {
                order = Object.values(orderData).find(o => o.id_order === orderId);
            }
        }
        
        if (!order) {
            console.error('Không tìm thấy đơn hàng với ID:', orderId);
            console.log('Tất cả đơn hàng có sẵn:', allOrdersArr);
            alert('Không tìm thấy thông tin đơn hàng!');
            return;
        }

        console.log('Đã tìm thấy đơn hàng:', order);
        
        // Lưu đơn hàng hiện tại
        currentOrder = order;
        
        // Render hóa đơn
        renderInvoice(order);
        
        // Hiển thị modal xem hóa đơn
        const modal = document.getElementById('invoice-modal');
        if (modal) {
            modal.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Lỗi khi tải thông tin hóa đơn:', error);
        alert('Có lỗi xảy ra khi tải thông tin hóa đơn!');
    } finally {
        hideLoading();
    }
}

// Hàm tải PDF trực tiếp từ bảng
async function downloadPdfDirectly(orderId) {
    try {
        showLoading();
        console.log('Đang tải PDF trực tiếp cho đơn hàng ID:', orderId);
        
        // Tìm đơn hàng trong allOrdersArr trước
        let order = allOrdersArr.find(o => o.id_order === orderId);
        
        if (!order) {
            console.log('Không tìm thấy trong allOrdersArr, thử gọi API...');
            
            // Lấy thông tin user từ localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.restaurant_id) {
                alert('Vui lòng đăng nhập lại!');
                return;
            }

            // Lấy dữ liệu đơn hàng từ API
            const orderData = await window.orderService.getOrderby3in1Status(user.restaurant_id, 'confirmed');
            
            // Tìm đơn hàng theo ID - thử cả 2 cách
            // Cách 1: Tìm trong mảng
            if (Array.isArray(orderData)) {
                order = orderData.find(o => o.id_order === orderId);
            }
            
            // Cách 2: Tìm trong object (nếu API trả về object)
            if (!order && typeof orderData === 'object' && !Array.isArray(orderData)) {
                order = Object.values(orderData).find(o => o.id_order === orderId);
            }
        }
        
        if (!order) {
            console.error('Không tìm thấy đơn hàng với ID:', orderId);
            alert('Không tìm thấy thông tin đơn hàng!');
            return;
        }

        console.log('Đã tìm thấy đơn hàng để tải PDF:', order);
        
        // Tạo và tải PDF trực tiếp
        generateAndDownloadPDF(order);
        
    } catch (error) {
        console.error('Lỗi khi tải PDF:', error);
        alert('Có lỗi xảy ra khi tải PDF!');
    } finally {
        hideLoading();
    }
}

// Hàm render hóa đơn
function renderInvoice(order) {
    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) return;

    // Format date
    const orderDate = new Date(order.date_create);
    const formattedDateTime = orderDate.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format prices
    const formattedDefaultPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(order.default_price);

    const formattedTotalPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(order.total_price);

    // Tính giá giảm được
    const discountAmount = order.default_price - order.total_price;
    const formattedDiscountAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(discountAmount);

    // Get status class
    const statusClass = getStatusClass(order.status_order);

    // Render items
    const itemsHtml = order.items.map(item => {
        const formattedItemPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(item.price);

        const toppingsText = item.name_topping && item.name_topping.length > 0 
            ? item.name_topping.map(topping => cleanVietnameseText(topping)).join(', ') 
            : 'No toppings';

        return `
            <div class="invoice-item">
                <div class="item-details">
                    <div class="item-name">${cleanVietnameseText(item.id_dishes)}</div>
                    <div class="item-toppings">Topping: ${toppingsText}</div>
                    ${item.note ? `<div class="item-note">Ghi chú: ${cleanVietnameseText(item.note)}</div>` : ''}
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="item-quantity">x${item.quantity}</span>
                    <div class="item-price">${formattedItemPrice}</div>
                </div>
            </div>
        `;
    }).join('');

    // Render full invoice
    invoiceContent.innerHTML = `
        <div class="invoice-header">
            <div class="invoice-info">
                <p>Hóa đơn: ${order.id_order}</p>
                <p>Bàn: ${order.id_table}</p>
                <p>Ngày giờ: ${formattedDateTime}</p>
            </div>
            
        </div>
        
        <div class="invoice-items">
            ${itemsHtml}
        </div>
        
        <div class="invoice-total">
            <div class="price-breakdown">
                <div class="price-row">
                    <span class="price-label">Giá gốc:</span>
                    <span class="price-value original-price">${formattedDefaultPrice}</span>
                </div>
                ${discountAmount > 0 ? `
                <div class="price-row discount-row">
                    <span class="price-label">Giảm giá:</span>
                    <span class="price-value discount-price">-${formattedDiscountAmount}</span>
                </div>
                ` : ''}
                <div class="price-row total-row">
                    <span class="total-label">Tổng cộng:</span>
                    <span class="total-amount">${formattedTotalPrice}</span>
                </div>
            </div>
        </div>
    `;
}

// Hàm tạo và tải PDF với font tiếng Việt
function generateAndDownloadPDF(order) {
    try {
        console.log('Bắt đầu tạo PDF cho đơn hàng:', order);
        
        // Kiểm tra jsPDF có sẵn không
        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library chưa được load. Vui lòng refresh trang và thử lại.');
        }
        
        // Khởi tạo jsPDF - thử nhiều cách khác nhau
        let jsPDF;
        try {
            // Cách 1: UMD version
            jsPDF = window.jspdf.jsPDF;
        } catch (e) {
            try {
                // Cách 2: Destructuring
                jsPDF = window.jspdf.jsPDF;
            } catch (e2) {
                // Cách 3: Trực tiếp
                jsPDF = window.jspdf;
            }
        }
        
        if (!jsPDF) {
            throw new Error('Không thể khởi tạo jsPDF. Vui lòng refresh trang và thử lại.');
        }
        
        console.log('jsPDF đã được khởi tạo:', jsPDF);
        
        // Tạo PDF với encoding UTF-8
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });
        
        console.log('Document PDF đã được tạo');
        
        // Thiết lập font hỗ trợ Unicode
        doc.setFont("helvetica");
        doc.setLanguage("vi");
        
        // Thông tin header
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let yPosition = 20;
        
        // Tiêu đề
        doc.setFontSize(18);
        doc.setTextColor(66, 103, 178);
        doc.text("INVOICE", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 15;
        
        // Thông tin đơn hàng
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Order ID: ${order.id_order}`, margin, yPosition);
        yPosition += 8;
        doc.text(`Table: ${order.id_table}`, margin, yPosition);
        yPosition += 8;
        
        // Format date
        const orderDate = new Date(order.date_create);
        const formattedDateTime = orderDate.toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Order Date: ${formattedDateTime}`, margin, yPosition);
        yPosition += 15;
        
        console.log('Đã thêm header, bắt đầu tạo bảng...');
        
        // Bảng món ăn - sử dụng text đơn giản để tránh lỗi font
        const tableData = order.items.map(item => {
            const toppingsText = item.name_topping && item.name_topping.length > 0 
                ? item.name_topping.map(topping => cleanVietnameseText(topping)).join(', ') 
                : 'No toppings';
            
            // Format price manually to avoid currency symbol issues
            const formattedPrice = new Intl.NumberFormat('en-US').format(item.price) + ' VND';
            
            return [
                cleanVietnameseText(item.id_dishes) || 'Dish name',
                toppingsText,
                item.quantity.toString(),
                formattedPrice,
                cleanVietnameseText(item.note) || ''
            ];
        });
        
        console.log('Table data:', tableData);
        
        // Thêm header cho bảng
        const tableHeaders = ['Dish Name', 'Toppings', 'Qty', 'Price', 'Notes'];
        
        // Kiểm tra autoTable có sẵn không
        if (typeof doc.autoTable === 'undefined') {
            throw new Error('autoTable plugin chưa được load. Vui lòng refresh trang và thử lại.');
        }
        
        doc.autoTable({
            startY: yPosition,
            head: [tableHeaders],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 103, 178],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 10,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 50 },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 35 }
            }
        });
        
        console.log('Bảng đã được tạo');
        
        // Lấy vị trí Y sau bảng
        const finalY = doc.lastAutoTable.finalY + 10;
        
        // Tổng tiền - format manually
        const formattedDefaultPrice = new Intl.NumberFormat('en-US').format(order.default_price) + ' VND';
        const formattedTotalPrice = new Intl.NumberFormat('en-US').format(order.total_price) + ' VND';
        
        const discountAmount = order.default_price - order.total_price;
        const formattedDiscountAmount = new Intl.NumberFormat('en-US').format(discountAmount) + ' VND';
        
        // Hiển thị breakdown giá
        doc.setFontSize(12);
        doc.text(`Original Price: ${formattedDefaultPrice}`, pageWidth - margin - 10, finalY, { align: 'right' });
        
        if (discountAmount > 0) {
            doc.setTextColor(231, 76, 60);
            doc.text(`Discount: -${formattedDiscountAmount}`, pageWidth - margin - 10, finalY + 8, { align: 'right' });
            doc.setTextColor(0, 0, 0);
        }
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(66, 103, 178);
        doc.text(`Total: ${formattedTotalPrice}`, pageWidth - margin - 10, finalY + 16, { align: 'right' });
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text("Thank you for using Jolliserve service!", pageWidth / 2, finalY + 30, { align: "center" });
        
        console.log('Đã hoàn thành tạo PDF, bắt đầu tải...');
        
        // Tải PDF
        const fileName = `HoaDon_${order.id_order}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        console.log('PDF đã được tải thành công:', fileName);
        
    } catch (error) {
        console.error('Lỗi chi tiết khi tạo PDF:', error);
        console.error('Error stack:', error.stack);
        
        let errorMessage = 'Có lỗi xảy ra khi tạo PDF. ';
        
        if (error.message.includes('jsPDF library')) {
            errorMessage += 'Thư viện PDF chưa được load. Vui lòng refresh trang và thử lại.';
        } else if (error.message.includes('autoTable plugin')) {
            errorMessage += 'Plugin bảng chưa được load. Vui lòng refresh trang và thử lại.';
        } else {
            errorMessage += 'Vui lòng thử lại sau.';
        }
        
        alert(errorMessage);
    }
}

// Hàm xử lý dữ liệu tiếng Việt
function cleanVietnameseText(text) {
    if (!text) return '';
    
    // Chuyển đổi các ký tự tiếng Việt bị lỗi
    const vietnameseMap = {
        'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd',
        'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D'
    };
    
    let cleanedText = text;
    
    // Thay thế các ký tự tiếng Việt
    for (const [vietnamese, latin] of Object.entries(vietnameseMap)) {
        cleanedText = cleanedText.replace(new RegExp(vietnamese, 'g'), latin);
    }
    
    return cleanedText;
}

// Hàm helper để lấy class CSS cho status
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'confirmed';
        case 'pending':
            return 'pending';
        case 'cancelled':
            return 'cancelled';
        default:
            return 'pending';
    }
}

// Hàm đóng modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Hàm test thư viện PDF
function testPdfLibrary() {
    console.log('=== TEST PDF LIBRARY ===');
    console.log('window.jspdf:', window.jspdf);
    console.log('typeof window.jspdf:', typeof window.jspdf);
    
    if (window.jspdf) {
        console.log('window.jspdf keys:', Object.keys(window.jspdf));
        console.log('window.jspdf.jsPDF:', window.jspdf.jsPDF);
    }
    
    // Test tạo PDF đơn giản
    try {
        if (window.jspdf && window.jspdf.jsPDF) {
            const testDoc = new window.jspdf.jsPDF();
            console.log('Test PDF created successfully');
            return true;
        }
    } catch (error) {
        console.error('Test PDF creation failed:', error);
        return false;
    }
    
    return false;
}
