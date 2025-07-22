// wwwroot/js/common/confirm.modal.js

(function() {
    function showConfirmModal({
        title = 'Xác nhận',
        message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
        confirmText = 'Xác nhận',
        cancelText = 'Hủy',
        confirmButtonClass = 'btn-danger', // 'btn-primary', 'btn-success', etc.
        onConfirm = () => {}
    }) {
        // Remove existing modal if any
        const existingModal = document.getElementById('globalConfirmModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'globalConfirmModal';
        modal.style.cssText = `
            position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%;
            overflow: auto; background-color: rgba(0,0,0,0.5); display: flex;
            align-items: center; justify-content: center;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="background:#fff; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.18); padding:28px 24px 20px 24px; min-width: 320px; max-width: 450px; text-align: center; animation: modal-fade-in 0.3s ease-out;">
                <h2 class="modal-title" style="color:#B24242; font-size:20px; margin:0 0 16px 0;">${title}</h2>
                <div style="margin: 10px 0 22px 0; color:#333; font-size:15px; line-height: 1.5;">${message}</div>
                <div style="display:flex; gap:12px; width:100%; justify-content:center;">
                    <button id="globalCancelBtn" style="background:#e9ecef; color:#333; border:none; border-radius:7px; padding:8px 22px; font-size:15px; cursor:pointer; font-weight:500; transition: background 0.2s;">${cancelText}</button>
                    <button id="globalConfirmBtn" style="color:#fff; border:none; border-radius:7px; padding:8px 22px; font-size:15px; cursor:pointer; font-weight:600; transition: background 0.2s;">${confirmText}</button>
                </div>
            </div>
            <style> @keyframes modal-fade-in { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } </style>
        `;
        
        // Apply button styles
        const confirmBtn = modal.querySelector('#globalConfirmBtn');
        if (confirmButtonClass === 'btn-danger') {
            confirmBtn.style.background = '#B24242';
            confirmBtn.onmouseover = () => confirmBtn.style.background = '#9d3a3a';
            confirmBtn.onmouseout = () => confirmBtn.style.background = '#B24242';
        } else if (confirmButtonClass === 'btn-primary') {
            confirmBtn.style.background = '#0d6efd';
             confirmBtn.onmouseover = () => confirmBtn.style.background = '#0b5ed7';
            confirmBtn.onmouseout = () => confirmBtn.style.background = '#0d6efd';
        } else if (confirmButtonClass === 'btn-success') {
            confirmBtn.style.background = '#198754';
            confirmBtn.onmouseover = () => confirmBtn.style.background = '#146c43';
            confirmBtn.onmouseout = () => confirmBtn.style.background = '#198754';
        }

        const cancelBtn = modal.querySelector('#globalCancelBtn');
        cancelBtn.onmouseover = () => cancelBtn.style.background = '#d3d7db';
        cancelBtn.onmouseout = () => cancelBtn.style.background = '#e9ecef';


        document.body.appendChild(modal);

        // --- Event Listeners ---
        function closeModal() {
            modal.remove();
        }

        modal.querySelector('#globalConfirmBtn').addEventListener('click', () => {
            onConfirm();
            closeModal();
        });

        modal.querySelector('#globalCancelBtn').addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target.id === 'globalConfirmModal') {
                closeModal();
            }
        });
    }

    // Attach to window object
    window.showConfirmModal = showConfirmModal;
})(); 