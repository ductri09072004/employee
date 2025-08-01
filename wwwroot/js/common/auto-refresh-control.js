// AutoRefreshControl - Component điều khiển auto refresh
class AutoRefreshControl {
    constructor() {
        this.isEnabled = true;
        this.controlElement = null;
        this.init();
    }

    init() {
        // Chỉ hiển thị control trên trang QL_Order
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/Home/QL_Order')) {
            return; // Không tạo control nếu không phải trang QL_Order
        }
        
        this.createControlElement();
        this.setupEventListeners();
        this.updateDisplay();
    }

    createControlElement() {
        // Tạo element control
        this.controlElement = document.createElement('div');
        this.controlElement.id = 'auto-refresh-control';
        this.controlElement.className = 'auto-refresh-control';
        this.controlElement.innerHTML = `
            <div class="auto-refresh-toggle">
                <input type="checkbox" id="auto-refresh-toggle" ${this.isEnabled ? 'checked' : ''}>
                <label for="auto-refresh-toggle">
                    <span class="toggle-icon">🔄</span>
                    <span class="toggle-text">Auto</span>
                </label>
            </div>
            <div class="auto-refresh-status">
                <span class="status-indicator ${this.isEnabled ? 'active' : 'inactive'}"></span>
                <span class="status-text">${this.isEnabled ? 'ON' : 'OFF'}</span>
            </div>
        `;

        // Thêm styles
        const style = document.createElement('style');
        style.textContent = `
            .auto-refresh-control {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 8px 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 1000;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                min-width: auto;
            }

            .auto-refresh-control:hover {
                box-shadow: 0 3px 12px rgba(0,0,0,0.15);
            }

            .auto-refresh-toggle {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .auto-refresh-toggle input[type="checkbox"] {
                display: none;
            }

            .auto-refresh-toggle label {
                display: flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                user-select: none;
                color: #333;
                font-size: 12px;
            }

            .toggle-icon {
                font-size: 14px;
                transition: transform 0.3s ease;
            }

            .auto-refresh-toggle input[type="checkbox"]:checked + label .toggle-icon {
                animation: spin 2s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .auto-refresh-status {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .status-indicator {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                transition: background-color 0.3s ease;
            }

            .status-indicator.active {
                background-color: #28a745;
                box-shadow: 0 0 4px rgba(40, 167, 69, 0.5);
            }

            .status-indicator.inactive {
                background-color: #dc3545;
            }

            .status-text {
                font-size: 10px;
                color: #666;
            }

            @media (max-width: 768px) {
                .auto-refresh-control {
                    top: 10px;
                    right: 10px;
                    padding: 6px 10px;
                    font-size: 11px;
                }
                
                .toggle-text {
                    display: none;
                }
                
                .status-text {
                    display: none;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.controlElement);
    }

    setupEventListeners() {
        const toggle = this.controlElement.querySelector('#auto-refresh-toggle');
        toggle.addEventListener('change', (e) => {
            this.isEnabled = e.target.checked;
            this.updateDisplay();
            this.toggleAutoRefresh();
            
            // Lưu preference vào localStorage
            localStorage.setItem('autoRefreshEnabled', this.isEnabled.toString());
        });
    }

    updateDisplay() {
        const toggle = this.controlElement.querySelector('#auto-refresh-toggle');
        const statusIndicator = this.controlElement.querySelector('.status-indicator');
        const statusText = this.controlElement.querySelector('.status-text');

        toggle.checked = this.isEnabled;
        statusIndicator.className = `status-indicator ${this.isEnabled ? 'active' : 'inactive'}`;
        statusText.textContent = this.isEnabled ? 'On' : 'Off';
    }

    toggleAutoRefresh() {
        if (window.autoRefreshManager) {
            if (this.isEnabled) {
                // Khôi phục auto refresh cho trang QL_Order
                this.restoreAutoRefresh();
            } else {
                // Dừng tất cả auto refresh
                window.autoRefreshManager.stopAll();
            }
        }
    }

    restoreAutoRefresh() {
        // Chỉ khôi phục auto refresh cho trang QL_Order
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/Home/QL_Order')) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.restaurant_id) {
                    startOrderAutoRefresh(user.restaurant_id);
                }
            }
        }
    }

    // Phương thức để ẩn/hiện control
    show() {
        this.controlElement.style.display = 'flex';
    }

    hide() {
        this.controlElement.style.display = 'none';
    }

    // Phương thức để cập nhật trạng thái từ bên ngoài
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.updateDisplay();
        this.toggleAutoRefresh();
    }
}

// Khởi tạo control khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Chỉ tạo control trên trang QL_Order
    const currentPath = window.location.pathname;
    if (currentPath.includes('/Home/QL_Order')) {
        // Kiểm tra preference từ localStorage
        const savedPreference = localStorage.getItem('autoRefreshEnabled');
        const shouldEnable = savedPreference === null ? true : savedPreference === 'true';
        
        window.autoRefreshControl = new AutoRefreshControl();
        window.autoRefreshControl.setEnabled(shouldEnable);
    }
});

// Export cho module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoRefreshControl;
} 