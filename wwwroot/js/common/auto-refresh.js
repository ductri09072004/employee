// AutoRefreshManager - Quản lý tự động refresh dữ liệu
class AutoRefreshManager {
    constructor() {
        this.intervals = new Map();
        this.isVisible = true;
        this.setupVisibilityListener();
    }

    // Bắt đầu auto refresh
    start(key, refreshFunction, intervalMs = 30000, silent = false) {
        // Dừng interval cũ nếu có
        this.stop(key);
        
        // Tạo interval mới
        const interval = setInterval(async () => {
            if (!this.isVisible) {
                console.log(`Auto refresh ${key} tạm dừng - tab không hiển thị`);
                return;
            }

            try {
                if (silent) {
                    // Silent refresh - không hiển thị loading
                    await refreshFunction();
                } else {
                    // Normal refresh - hiển thị loading
                    showLoading();
                    await refreshFunction();
                    hideLoading();
                }
            } catch (error) {
                console.error(`Lỗi auto refresh ${key}:`, error);
                if (!silent) {
                    hideLoading();
                }
            }
        }, intervalMs);

        this.intervals.set(key, interval);
        console.log(`Đã bắt đầu auto refresh ${key} với interval ${intervalMs}ms`);
    }

    // Dừng auto refresh
    stop(key) {
        const interval = this.intervals.get(key);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(key);
            console.log(`Đã dừng auto refresh ${key}`);
        }
    }

    // Dừng tất cả auto refresh
    stopAll() {
        this.intervals.forEach((interval, key) => {
            clearInterval(interval);
            console.log(`Đã dừng auto refresh ${key}`);
        });
        this.intervals.clear();
    }

    // Kiểm tra xem auto refresh có đang chạy không
    isRunning(key) {
        return this.intervals.has(key);
    }

    // Thiết lập listener cho visibility change
    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            console.log(`Tab ${this.isVisible ? 'hiển thị' : 'ẩn'} - Auto refresh ${this.isVisible ? 'tiếp tục' : 'tạm dừng'}`);
        });
    }

    // Tạo function refresh với cache comparison
    createRefreshFunction(apiCall, cacheKey, onDataUpdate, onNotification) {
        return async () => {
            try {
                const newData = await apiCall();
                
                // So sánh với cache
                const cachedData = localStorage.getItem(cacheKey);
                if (cachedData) {
                    const oldData = JSON.parse(cachedData);
                    if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
                        // Có dữ liệu mới
                        console.log(`Phát hiện dữ liệu mới cho ${cacheKey}`);
                        if (onNotification) {
                            onNotification('Có dữ liệu mới!', 'info');
                        }
                    }
                }
                
                // Cập nhật cache
                localStorage.setItem(cacheKey, JSON.stringify(newData));
                
                // Gọi callback cập nhật UI
                if (onDataUpdate) {
                    onDataUpdate(newData);
                }
                
            } catch (error) {
                console.error(`Lỗi trong refresh function ${cacheKey}:`, error);
                throw error;
            }
        };
    }
}

// Khởi tạo AutoRefreshManager
window.autoRefreshManager = new AutoRefreshManager();

// Export cho module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoRefreshManager;
} 