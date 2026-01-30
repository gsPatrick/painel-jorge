import axios from 'axios';

const api = axios.create({
    baseURL: 'https://geral-apijorge.r954jc.easypanel.host/api', // Production API
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Client-side only
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['x-access-token'] = token;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
