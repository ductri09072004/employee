// Restaurant Service
const Index_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowfe-production.up.railway.app/api/admin';
    },

    async count_order(id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/orders/count-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_restaurant: id_restaurant
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Count order error:', error);
            throw error;
        }
    },

    async statistics_order (id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/orders/revenue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_restaurant: id_restaurant
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Count order error:', error);
            throw error;
        }
    },

    async statistics_menus (id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/orderitems/count-dishes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_restaurant: id_restaurant
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Count order error:', error);
            throw error;
        }
    },

    async countAdmin() {
        try {
            const response = await fetch(`${this.BASE_URL}/track/total`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get total error:', error);
            throw error;
        }
    },
};

// Export service
window.indexService = Index_API;

