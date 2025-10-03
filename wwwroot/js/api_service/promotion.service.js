// Auth Service
const PROMO_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowfe-production.up.railway.app/api/admin';
    },
    
    async getPromotion() {
        try {
            const response = await fetch(`${this.BASE_URL}/promotions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get promotions error:', error);
            throw error;
        }
    },

    async getPromotionByRes(id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/promotions`, {
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

    async createPromotion(id_restaurant,date_end,max_discount,min_order_value,percent,quantity,status) {
        try {
            const response = await fetch(`${this.BASE_URL}/promotions/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date_end: date_end,
                    id_restaurant: id_restaurant,
                    max_discount: max_discount,
                    min_order_value: min_order_value,
                    percent: percent,
                    quantity: quantity,
                    status: status,       
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create promotion error:', error);
            throw error;
        }
    },

    async editPromotion(id, promotionData) {
        try {
            const response = await fetch(`${this.BASE_URL}/promotions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(promotionData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Edit promotion error:', error);
            throw error;
        }
    },

    async deletePromotion(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/promotions/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete promotions error:', error);
            throw error;
        }
    },
};

// Export service
window.promotionService = PROMO_API; 