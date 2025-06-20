// Restaurant Service
const Table_API = {
    BASE_URL: 'https://jollicowfe-production.up.railway.app/api',
    
    async getTable(restaurant_id) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/softbyres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    restaurant_id: restaurant_id
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get order history error:', error);
            throw error;
        }
    },

    async createTable(id_table,restaurant_id) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_table: id_table,
                    restaurant_id: restaurant_id
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create table error:', error);
            throw error;
        }
    },

    async deleteTable(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete table error:', error);
            throw error;
        }
    }
};

// Export service
window.tableService = Table_API;

