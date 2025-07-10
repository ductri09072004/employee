// Restaurant Service
const Restaurant_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowfe-production.up.railway.app/api/admin';
    },
    
    async create_restaurant(name_restaurant, address, number_tax) {
        try {
            const response = await fetch(`${this.BASE_URL}/restaurants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name_restaurant: name_restaurant,
                    address: address,
                    number_tax: number_tax
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create restaurant error:', error);
            throw error;
        }
    }
};

// Export service
window.restaurantService = Restaurant_API;

