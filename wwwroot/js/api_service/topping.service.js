// Restaurant Service
const Topping_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowfe-production.up.railway.app/api/admin';
    },
    

    async createTopping(toppingData) {
        try {
            const response = await fetch(`${this.BASE_URL}/toppings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(toppingData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create topping error:', error);
            throw error;
        }
    },

    async updateTitle(id, titleData) {
        try {
            const response = await fetch(`${this.BASE_URL}/toppings/namedetail/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(titleData)
            });
            return await response.json();
        } catch (error) {
            console.error('Update titleData error:', error);
            throw error;
        }
    },

    async updateTopping(id, toppingData) {
        try {
            const response = await fetch(`${this.BASE_URL}/toppings/option/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(toppingData)
            });
            return await response.json();
        } catch (error) {
            console.error('Update topping error:', error);
            throw error;
        }
    },
};

// Export service
window.toppingService = Topping_API;

