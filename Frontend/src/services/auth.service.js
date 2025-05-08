// Authentication related service functions
import api from './api';
import { jwtDecode } from 'jwt-decode'; // Corrected import

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Response data
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Login user and store JWT token
 * @param {Object} credentials - User login credentials
 * @returns {Promise} - Response data including token
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Log out user by removing the token
 */
export const logout = () => {
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Check if token is expired
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    // If token is invalid, remove it
    localStorage.removeItem('token');
    return false;
  }
};

/**
 * Get current user information from token
 * @returns {Object|null} - User data from token or null
 */
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      return jwtDecode(token);
    }
    return null;
  } catch (error) {
    return null;
  }
};
