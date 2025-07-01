// Render topping accordion table
window.renderToppingAccordion = function(data) {
    const tbody = document.getElementById('topping-accordion-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    const dishes = Object.values(data);
    dishes.forEach((dish, idx) => {
        const stt = String(idx + 1).padStart(2, '0');
        const statusBadge = (dish.status === 'active' || dish.status === true)
            ? '<span style="color: #28a745; font-weight: 600;">Còn món</span>'
            : '<span style="color: #dc3545; font-weight: 600;">Hết món</span>';
        // Main row
        const trMain = document.createElement('tr');
        trMain.className = 'topping-accordion-row';
        trMain.innerHTML = `
            <td>${stt}</td>
            <td>${dish.name}</td>
            <td>${statusBadge}</td>
            <td>
                <a href="#" class="action-link edit" data-id="${dish.id_dishes || dish.id}">Sửa</a>
                <a href="#" class="action-link delete" data-id="${dish.id_dishes || dish.id}">Xóa</a>
            </td>
        `;
        // Details row
        const trDetails = document.createElement('tr');
        trDetails.className = 'topping-accordion-details';
        trDetails.innerHTML = `<td colspan="4">
            <ul class="topping-topping-list">
                ${(dish.toppings||[]).map(cat => `
                    <li class="topping-category">${cat.name_details}
                        <ul>
                            ${(cat.options||[]).filter(o=>o).map(option => `
                                <li class="topping-option">${option.name} <span style='color:#888;'>(${option.price.toLocaleString('vi-VN')} đ)</span></li>
                            `).join('')}
                        </ul>
                    </li>
                `).join('')}
            </ul>
        </td>`;
        // Accordion logic
        trMain.addEventListener('click', function(e) {
            // Đừng trigger khi bấm vào nút Sửa/Xóa
            if (e.target.classList.contains('action-link')) return;
            trDetails.classList.toggle('open');
        });
        tbody.appendChild(trMain);
        tbody.appendChild(trDetails);
    });
};
// Hook vào loadToppings
if (window.loadToppings) {
    const oldLoadToppings = window.loadToppings;
    window.loadToppings = async function(restaurantId) {
        try {
            const data = await window.menuService.getMenu(restaurantId);
            window.renderToppingAccordion(data);
        } catch (error) {
            console.error('Error loading toppings:', error);
            document.getElementById('topping-accordion-body').innerHTML = '<tr><td colspan="4">Lỗi tải dữ liệu.</td></tr>';
        }
    };
} 