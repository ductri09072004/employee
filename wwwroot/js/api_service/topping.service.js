// Restaurant Service
const Topping_API = {
    BASE_URL: 'https://jollicowfe-production.up.railway.app/api/admin',
    

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

