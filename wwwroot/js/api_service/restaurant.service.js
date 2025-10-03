// Restaurant Service
const Restaurant_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowfe-production.up.railway.app/api/admin';
    },

    async getIP(id_restaurant) {
        try {
            const response = await fetch(`${this.BASE_URL}/restaurants/GetIP`, {
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
    },

    async edit_IP_Res(id_restaurant, ip_wifi) {
        try {
            const response = await fetch(`${this.BASE_URL}/restaurants/IP`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id_restaurant: id_restaurant,
                    ip_wifi: ip_wifi 
                }) // ip_wifi là string
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Edit IP_Wifi error:', error);
            throw error;
        }
    },

    async getRes() {
        try {
            const response = await fetch(`${this.BASE_URL}/restaurants`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get restaurants error:', error);
            throw error;
        }
    },
};

// Export service
window.restaurantService = Restaurant_API;

