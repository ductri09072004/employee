// Auth Service
const AUTH_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowfe-production.up.railway.app/api/admin';
    },
    
    // Login API
    async login(phone, password_hash) {
        try {
            const response = await fetch(`${this.BASE_URL}/staffs/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: phone,
                    password_hash: password_hash
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    async create_staff(name, phone, password_hash) {
        try {
            const response = await fetch(`${this.BASE_URL}/staffs/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    phone: phone,
                    password_hash: password_hash,
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    async add_id_restaurant(restaurant_id,id_staff) {
        try {
            const response = await fetch(`${this.BASE_URL}/staffs/addID`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_staff: id_staff,
                    restaurant_id: restaurant_id
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
};

// Export service
window.authService = AUTH_API; 