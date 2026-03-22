import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth Endpoints
export const login = (data) => api.post('/auth/login', data).then(r => r.data);
export const register = (data) => api.post('/auth/register', data).then(r => r.data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data).then(r => r.data);
export const getProfile = () => api.get('/auth/me').then(r => r.data);

// PGs
export const getPGs = () => api.get('/pgs').then(r => r.data);
export const getPGById = (id) => api.get(`/pgs/${id}`).then(r => r.data);
export const createPG = (data) => api.post('/pgs', data).then(r => r.data);
export const updatePG = (id, data) => api.put(`/pgs/${id}`, data).then(r => r.data);
export const deletePG = (id) => api.delete(`/pgs/${id}`).then(r => r.data);

// Upload
export const uploadImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData).then(r => r.data);
};

// Inquiries
export const getInquiries = () => api.get('/inquiries').then(r => r.data);
export const getUserInquiries = () => api.get('/user/inquiries').then(r => r.data);
export const createInquiry = (data) => api.post('/inquiries', data).then(r => r.data);
export const updateInquiryStatus = (id) => api.put(`/inquiries/${id}`).then(r => r.data);

// Favorites
export const getFavorites = () => api.get('/favorites').then(r => r.data);
export const addFavorite = (pgId) => api.post('/favorites', { pg_id: pgId }).then(r => r.data);
export const removeFavorite = (pgId) => api.delete(`/favorites/${pgId}`).then(r => r.data);

export default api;
