// Auth Service
const AUTH_API = {
    get BASE_URL() {
        return window.apiConfig ? window.apiConfig.BASE_URL : 'https://jollicowbe-admin.up.railway.app/api/admin';
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
    //đăng kí tk
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
//get all acc
    async getstaff() {
        try {
            const response = await fetch(`${this.BASE_URL}/staffs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get staffs error:', error);
            throw error;
        }
    },

//lọc acc inactive
    async getInactivestaff() {
        try {
            const response = await fetch(`${this.BASE_URL}/staffs/getInactive`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get staffs error:', error);
            throw error;
        }
    },

    async put_staff(id_staff) {
        try {
            const response = await fetch(`${this.BASE_URL}/staffs/fixStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_staff: id_staff,
                    status: 'active',
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Fix status error:', error);
            throw error;
        }
    },

    async put_staff_inactive(id_staff) {
        try {
            const response = await fetch(`${this.BASE_URL}/staffs/fixStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_staff: id_staff,
                    status: 'inactive',
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Fix status error:', error);
            throw error;
        }
    },

    //delete acc+res
    async deleteAccRes(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/staffs/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    },
};

// Export service
window.authService = AUTH_API; 