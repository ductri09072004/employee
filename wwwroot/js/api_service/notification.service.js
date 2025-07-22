// Restaurant Service
const Notifi_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowbe-admin.up.railway.app/api/admin';
    },
    

    async getNotifi() {
        try {
            const response = await fetch(`${this.BASE_URL}/notifis`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get staffs error:', error);
            throw error;
        }
    },
};

// Export service
window.notifiService = Notifi_API;

