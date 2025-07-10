// Restaurant Service
const Table_API = {
    BASE_URL: 'https://jollicowfe-production.up.railway.app/api/admin',
    
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
            console.log('Raw API Response:', data); // Debug log
            
            // Kiểm tra xem response có format mới không (có cả tables và total)
            if (data && typeof data === 'object' && data.tables && typeof data.total === 'number') {
                console.log('Using new format'); // Debug log
                return {
                    tables: data.tables,
                    total: data.total
                };
            }
            
            // Nếu không có format mới, trả về format cũ (backward compatibility)
            const tablesArr = Array.isArray(data) ? data : [];
            console.log('Using old format, count:', tablesArr.length); // Debug log
            return {
                tables: tablesArr,
                total: tablesArr.length
            };
        } catch (error) {
            console.error('Get table error:', error);
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

