// Alert component for global use
(function() {
    if (window.showAlert) return; // Prevent duplicate

    // Create alert box if not exists
    function ensureAlertBox() {
        if (document.getElementById('custom-alert')) return;
        const alertBox = document.createElement('div');
        alertBox.id = 'custom-alert';
        alertBox.className = 'custom-alert';
        alertBox.style.display = 'none';
        alertBox.innerHTML = `
            <span id="custom-alert-message"></span>
            <button id="custom-alert-close" class="custom-alert-close" aria-label="Đóng">&times;</button>
        `;
        document.body.appendChild(alertBox);
    }

    // Main showAlert function
    window.showAlert = function(message, type = 'info', timeout = 3500) {
        ensureAlertBox();
        const alertBox = document.getElementById('custom-alert');
        const alertMsg = document.getElementById('custom-alert-message');
        const closeBtn = document.getElementById('custom-alert-close');
        alertBox.className = 'custom-alert custom-alert-' + type;
        alertMsg.textContent = message;
        alertBox.style.display = 'flex';
        alertBox.style.opacity = '1';

        // Đóng khi bấm nút
        closeBtn.onclick = function() {
            alertBox.style.opacity = '0';
            setTimeout(() => { alertBox.style.display = 'none'; }, 200);
        };

        // Tự động ẩn sau timeout
        if (timeout > 0) {
            setTimeout(() => {
                alertBox.style.opacity = '0';
                setTimeout(() => { alertBox.style.display = 'none'; }, 200);
            }, timeout);
        }
    };

    // Inject CSS if not exists
    if (!document.getElementById('custom-alert-style')) {
        const style = document.createElement('style');
        style.id = 'custom-alert-style';
        style.innerHTML = `
        .custom-alert { display: flex; align-items: center; justify-content: center; gap: 12px; min-width: 220px; max-width: 90vw; margin: 0; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 500; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: fixed; top: 32px; right: 32px; left: auto; transform: none; z-index: 10000; transition: opacity 0.2s; }
        .custom-alert-success { background: #e6f9ed; color: #1a7f37; border: 1px solid #1a7f37; }
        .custom-alert-warning { background: #fffbe6; color: #b38600; border: 1px solid #b38600; }
        .custom-alert-error   { background: #fff0f0; color: #d32f2f; border: 1px solid #d32f2f; }
        .custom-alert-info    { background: #e6f0ff; color: #1565c0; border: 1px solid #1565c0; }
        .custom-alert-close { background: none; border: none; color: inherit; font-size: 20px; font-weight: bold; cursor: pointer; margin-left: 8px; line-height: 1; }
        `;
        document.head.appendChild(style);
    }
})(); 