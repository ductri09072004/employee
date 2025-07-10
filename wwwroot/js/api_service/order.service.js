// Restaurant Service
const Order_API = {
    BASE_URL: 'https://jollicowfe-production.up.railway.app/api/admin',
    
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
    },

    async getOrderHistoryDone(id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/orders/filterresdone`, {
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
    },

    async getOrderbyStatus(id_restaurant,status_order) {
        try {
            const response = await fetch(`${this.BASE_URL}/orders/fillerstatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_restaurant: id_restaurant,
                    status_order: status_order
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get order history error:', error);
            throw error;
        }
    },

    async getOrderby3in1Status(id_restaurant,status_order) {
        try {
            const response = await fetch(`${this.BASE_URL}/orders/filler3in1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_restaurant: id_restaurant,
                    status_order: status_order
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get order history error:', error);
            throw error;
        }
    },

    async updateStatus(id_order,status_order) {
        try {
            const response = await fetch(`${this.BASE_URL}/orders/update_status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_order: id_order,
                    status_order: status_order
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update order error:', error);
            throw error;
        }
    }
};

// Export service
window.orderService = Order_API;

