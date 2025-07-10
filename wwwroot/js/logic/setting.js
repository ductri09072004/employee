document.addEventListener('DOMContentLoaded', function() {
    const updateBtn = document.querySelector('.update-button');
    const portIpInput = document.getElementById('portIp');
    const currentIpDiv = document.getElementById('currentIp');
    const ipWarning = document.getElementById('ip-warning');

    // Lấy id_restaurant từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const id_restaurant = user.restaurant_id;

    let currentIpValue = '';
    let newIpValue = '';

    // Hiển thị IP hiện tại
    function checkIpDiff() {
        if (!currentIpValue && !newIpValue) {
            ipWarning.style.display = 'block';
            ipWarning.style.color = '#FFA500'; // cam
            ipWarning.textContent = 'Chưa có IP. Vui lòng cài đặt IP cho nhà hàng!';
            return;
        }
        if (!currentIpValue) {
            ipWarning.style.display = 'block';
            ipWarning.style.color = '#FFA500'; // cam
            ipWarning.textContent = 'Chưa có IP. Vui lòng cài đặt IP cho nhà hàng!';
            return;
        }
        if (currentIpValue === newIpValue) {
            ipWarning.style.display = 'block';
            ipWarning.style.color = '#0c6e35'; // xanh lá
            ipWarning.textContent = 'IP đã được đồng bộ với hệ thống.';
        } else {
            ipWarning.style.display = 'block';
            ipWarning.style.color = '#EB455F'; // đỏ
            ipWarning.textContent = 'IP public hiện tại và IP mới không giống nhau. Vui lòng cập nhật để đảm bảo truy cập hệ thống!';
        }
    }

    if (id_restaurant && currentIpDiv) {
        window.restaurantService.getIP(id_restaurant)
            .then(data => {
                let ip = '';
                if (data && typeof data.ip_wifi === 'string') {
                    ip = data.ip_wifi;
                } else if (data && typeof data.ip_wifi === 'object' && data.ip_wifi.ip_wifi) {
                    ip = data.ip_wifi.ip_wifi;
                }
                currentIpDiv.textContent = ip || 'Chưa có IP';
                currentIpValue = ip || '';
                checkIpDiff();
            })
            .catch(() => {
                currentIpDiv.textContent = 'Không lấy được IP';
                currentIpValue = '';
                checkIpDiff();
            });
    }

    // Tự động lấy IP public và hiển thị lên input
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            if (data && data.ip) {
                portIpInput.value = data.ip;
                newIpValue = data.ip;
                checkIpDiff();
            }
        })
        .catch(err => {
            console.warn('Không lấy được IP public:', err);
            newIpValue = '';
            checkIpDiff();
        });

    portIpInput.addEventListener('input', function() {
        newIpValue = portIpInput.value.trim();
        checkIpDiff();
    });

    updateBtn.addEventListener('click', async function() {
        const ip = portIpInput.value.trim();
        if (!ip) {
            showAlert('Vui lòng nhập IP Wi-Fi', 'warning');
            return;
        }

        if (!id_restaurant) {
            showAlert('Không tìm thấy ID nhà hàng. Vui lòng đăng nhập lại.', 'error');
            return;
        }

        try {
            // Gọi API cập nhật IP, truyền ip_wifi là string
            const result = await window.restaurantService.edit_IP_Res(id_restaurant, ip);
            if (result && (result.success || result.message)) {
                showAlert('Cập nhật IP Wi-Fi thành công!', 'success');
                // Sau khi cập nhật, load lại IP hiện tại
                if (currentIpDiv) {
                    window.restaurantService.getIP(id_restaurant)
                        .then(data => {
                            let ip = '';
                            if (data && typeof data.ip_wifi === 'string') {
                                ip = data.ip_wifi;
                            } else if (data && typeof data.ip_wifi === 'object' && data.ip_wifi.ip_wifi) {
                                ip = data.ip_wifi.ip_wifi;
                            }
                            currentIpDiv.textContent = ip || 'Chưa có IP';
                            currentIpValue = ip || '';
                            checkIpDiff();
                        })
                        .catch(() => {
                            currentIpDiv.textContent = 'Không lấy được IP';
                            currentIpValue = '';
                            checkIpDiff();
                        });
                }
            } else {
                showAlert('Cập nhật thất bại. Vui lòng thử lại.', 'error');
            }
        } catch (err) {
            showAlert('Có lỗi xảy ra khi cập nhật IP Wi-Fi.', 'error');
            console.error(err);
        }
    });
});
