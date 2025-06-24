// Restaurant Service
const Order_API = {
    BASE_URL: 'https://jollicowfe-production.up.railway.app/api',
    
    async create_restaurant(id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/orders/fillerid`, {
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
            console.error('Create restaurant error:', error);
            throw error;
        }
    },

    async getOrderHistory(id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/orders/fillerid`, {
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
            console.error('Get order history error:', error);
            throw error;
        }
    }
};

// Export service
window.orderService = Order_API;

