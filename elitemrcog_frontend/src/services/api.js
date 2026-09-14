import axios from 'axios';

// Get base URL from env or use relative URL in production / localhost:8000 in dev
const BASE_URL = process.env.REACT_APP_API_URL || 
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000'
        : '');

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT access token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 Unauthorized and we haven't already tried refreshing
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                
                if (refreshToken) {
                    const res = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
                        refresh: refreshToken
                    });
                    
                    if (res.status === 200) {
                        const newAccessToken = res.data.access;
                        localStorage.setItem('access_token', newAccessToken);
                        
                        // Retry the original request
                        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (err) {
                // If refresh fails, log out the user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
