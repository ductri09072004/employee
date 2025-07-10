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


};

// Export service
window.toppingService = Topping_API;

