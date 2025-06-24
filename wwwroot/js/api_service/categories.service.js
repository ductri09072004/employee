// Restaurant Service
const Cates_API = {
    BASE_URL: 'https://jollicowfe-production.up.railway.app/api',
    

    async getMenu(id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/categories`, {
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
            console.error('Get cate error:', error);
            throw error;
        }
    }
};

// Export service
window.cateService = Cates_API;

