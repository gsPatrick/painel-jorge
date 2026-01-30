import api from './api';

const login = async (email, password) => {
    const response = await api.post('/auth/login', {
        email,
        password,
    });
    if (response.data.accessToken) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
    }
    return response.data;
};

const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('user'));
    }
    return null;
};

const authService = {
    login,
    logout,
    getCurrentUser,
};

export default authService;
