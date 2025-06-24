// Restaurant Service
const Menus_API = {
    BASE_URL: 'https://jollicowfe-production.up.railway.app/api',
    

    async getMenu(id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/menus/byres3in1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    restaurant_id: id_restaurant
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get menu error:', error);
            throw error;
        }
    }
};

// Export service
window.menuService = Menus_API;

