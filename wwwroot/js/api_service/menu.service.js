// Restaurant Service
const Menus_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowbe-admin.up.railway.app/api/admin';
    },
    

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
    },

    async editMenu(id, menuData) {
        try {
            const response = await fetch(`${this.BASE_URL}/menus/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(menuData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Edit menu error:', error);
            throw error;
        }
    },

    async createMenu(id_categories, name, image,restaurant_id,status, price) {
        try {
            const response = await fetch(`${this.BASE_URL}/menus/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_category: id_categories,
                    image: image,
                    name: name,
                    price: price,
                    restaurant_id: restaurant_id,
                    status: status,
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get cate error:', error);
            throw error;
        }
    },

    async deleteMenu(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/menus/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete menu error:', error);
            throw error;
        }
    }
};

// Export service
window.menuService = Menus_API;

