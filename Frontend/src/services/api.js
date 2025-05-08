// src/services/api.js
// Base API configuration with Axios
import axios from 'axios';

// Replace with your actual backend API URL
const API_URL = 'https://time-capsule-47ba.onrender.com';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle specific error codes here
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login or clear token
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
