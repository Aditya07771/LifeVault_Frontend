import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Memory API functions
export const memoryAPI = {
  // Get all memories
  getAll: (params = {}) => api.get('/memories', { params }),
  
  // Get single memory
  getOne: (id) => api.get(`/memories/${id}`),
  
  // Create memory
  create: (data) => api.post('/memories', data),
  
  // Delete memory
  delete: (id) => api.delete(`/memories/${id}`),
  
  // Verify memory on blockchain
  verify: (id) => api.get(`/memories/${id}/verify`),
  
  // Get stats
  getStats: () => api.get('/memories/stats')
};

// Auth API functions
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export default api;