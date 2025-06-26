// Restaurant Service
const Cates_API = {
    BASE_URL: 'https://jollicowfe-production.up.railway.app/api',
    

    async getCate(id_restaurant) {
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
    },

    async createCate(id_restaurant, name) {
        try {
            const response = await fetch(`${this.BASE_URL}/categories/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_restaurant: id_restaurant,
                    name: name
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get cate error:', error);
            throw error;
        }
    },

    async deleteCate(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/categories/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete table error:', error);
            throw error;
        }
    },

    async editCate(id, categoryData) {
        try {
            const response = await fetch(`${this.BASE_URL}/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Edit cate error:', error);
            throw error;
        }
    },
};

// Export service
window.cateService = Cates_API;

