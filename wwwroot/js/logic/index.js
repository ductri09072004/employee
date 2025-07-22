// Hiển thị id_restaurant từ localStorage (ưu tiên user.restaurant_id) lên web ngay khi load
window.addEventListener('DOMContentLoaded', () => {
    let id_restaurant = 'CHA1001';
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
    const idElemLocal = document.getElementById('restaurant-id-local');
    if (idElemLocal) idElemLocal.textContent = id_restaurant;
});

// Fetch and update dashboard stats
window.addEventListener('DOMContentLoaded', async () => {
    let id_restaurant = 'CHA1001';
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.restaurant_id) {
                id_restaurant = user.restaurant_id;
            }
        } catch {}
    } else {
        id_restaurant = localStorage.getItem('id_restaurant') || 'CHA1001';
    }
    try {
        showLoading();
        const data = await window.indexService.count_order(id_restaurant);
        // Hiển thị id_restaurant từ API
        const idElemApi = document.getElementById('restaurant-id-api');
        if (idElemApi) idElemApi.textContent = (data && data.id_restaurant) ? data.id_restaurant : '';

        if (data && data.counts) {
            document.getElementById('stat-total').textContent = data.counts.total ?? 0;
            document.getElementById('stat-pending').textContent = data.counts.pending ?? 0;
            document.getElementById('stat-preparing').textContent = data.counts.preparing ?? 0;
            document.getElementById('stat-confirmed').textContent = data.counts.confirmed ?? 0;
            document.getElementById('stat-closed').textContent = data.counts.closed ?? 0;
            document.getElementById('stat-cancelled').textContent = data.counts.cancelled ?? 0;
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    } finally {
        hideLoading();
    }
});

// Counter animation for dashboard
function animateCountUp(element, endValue, duration = 1200, isMoney = false) {
    const start = 0;
    const startTime = performance.now();
    const end = Number(endValue) || 0;
    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = isMoney
            ? value.toLocaleString('vi-VN') + '₫'
            : value.toLocaleString('vi-VN');
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Đảm bảo số cuối cùng chính xác
            element.textContent = isMoney
                ? end.toLocaleString('vi-VN') + '₫'
                : end.toLocaleString('vi-VN');
        }
    }
    requestAnimationFrame(update);
}

// Dashboard admin: cập nhật số liệu tổng quan
window.updateDashboardStats = async function() {
    try {
        showLoading();
        // Đợi indexService sẵn sàng (nếu cần)
        let retry = 0;
        while ((!window.indexService || !window.indexService.countAdmin) && retry < 20) {
            await new Promise(res => setTimeout(res, 100));
            retry++;
        }
        if (!window.indexService || !window.indexService.countAdmin) {
            showAlert('Không thể tải dữ liệu thống kê (service chưa sẵn sàng)!', 'error');
            return;
        }
        const stats = await window.indexService.countAdmin();
        if (document.getElementById('total-visits'))
            animateCountUp(document.getElementById('total-visits'), stats.totalVisits ?? 0);
        if (document.getElementById('total-restaurants'))
            animateCountUp(document.getElementById('total-restaurants'), stats.totalRestaurants ?? 0);
        if (document.getElementById('total-staff'))
            animateCountUp(document.getElementById('total-staff'), stats.totalStaffs ?? 0);
        if (document.getElementById('total-orders'))
            animateCountUp(document.getElementById('total-orders'), stats.totalOrders ?? 0);
        if (document.getElementById('total-revenue'))
            animateCountUp(document.getElementById('total-revenue'), stats.totalRevenue ?? 0, 1200, true);
        if (document.getElementById('total-requests'))
            animateCountUp(document.getElementById('total-requests'), stats.totalRegisterRequests ?? 0);
    } catch (error) {
        showAlert('Không thể tải dữ liệu thống kê!', 'error');
        console.error(error);
    } finally {
        hideLoading();
    }
}

// Vẽ biểu đồ doanh thu theo tháng
window.addEventListener('DOMContentLoaded', async () => {
    let id_restaurant = 'CHA1001';
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
        const data = await window.indexService.statistics_order(id_restaurant);
        if (data && data.monthlyRevenue) {
            const ctx = document.getElementById('monthly-revenue-chart').getContext('2d');
            const labels = Object.keys(data.monthlyRevenue);
            const values = Object.values(data.monthlyRevenue);
            new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Doanh thu theo tháng',
                        data: values,
                        borderColor: '#4285F4',
                        backgroundColor: 'rgba(66,133,244,0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#4285F4',
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        x: { title: { display: true, text: 'Tháng' } },
                        y: { title: { display: true, text: 'Doanh thu (VNĐ)' }, beginAtZero: true }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Failed to load monthly revenue chart:', error);
    } finally {
        hideLoading();
    }
});

// Vẽ biểu đồ tròn thống kê các món bán chạy
window.addEventListener('DOMContentLoaded', async () => {
    let id_restaurant = 'CHA1001';
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
        const data = await window.indexService.statistics_menus(id_restaurant);
        if (data && data.counts) {
            const ctx = document.getElementById('menu-pie-chart').getContext('2d');
            const labels = Object.keys(data.counts);
            const values = Object.values(data.counts);
            const total = values.reduce((a, b) => a + b, 0);
            const backgroundColors = [
                '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#F44292', '#00B8D9', '#FF7043', '#8D6E63', '#789262', '#C0CA33', '#FFB300'
            ];
            new window.Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map(function(label, i) {
                                            const value = data.datasets[0].data[i];
                                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                            return {
                                                text: `${label} (${percent}%)`,
                                                fillStyle: data.datasets[0].backgroundColor[i],
                                                strokeStyle: '#fff',
                                                lineWidth: 1,
                                                hidden: isNaN(data.datasets[0].data[i]) || chart.getDataVisibility(i) === false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} (${percent}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Failed to load menu pie chart:', error);
    } finally {
        hideLoading();
    }
});
