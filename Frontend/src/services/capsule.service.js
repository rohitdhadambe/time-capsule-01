
// src/services/capsule.service.js
// Time capsule related service functions
import api from './api';

/**
 * Create a new time capsule
 * @param {Object} capsuleData - Capsule data with message and unlock_at date
 * @returns {Promise} - Response with capsule ID and unlock code
 */
export const createCapsule = async (capsuleData) => {
  try {
    const response = await api.post('/capsules', capsuleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get a specific capsule with unlock code
 * @param {string} id - Capsule ID
 * @param {string} code - Unlock code
 * @returns {Promise} - Capsule data
 */
export const getCapsule = async (id, code) => {
  try {
    const response = await api.get(`/capsules/${id}?code=${code}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Get all capsules for the current user with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise} - Paginated capsules data
 */
export const getUserCapsules = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/capsules?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Update an existing capsule
 * @param {string} id - Capsule ID
 * @param {string} code - Unlock code
 * @param {Object} capsuleData - Updated capsule data
 * @returns {Promise} - Updated capsule data
 */
export const updateCapsule = async (id, code, capsuleData) => {
  try {
    const response = await api.put(`/capsules/${id}?code=${code}`, capsuleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

/**
 * Delete a capsule
 * @param {string} id - Capsule ID
 * @param {string} code - Unlock code
 * @returns {Promise} - Response data
 */
export const deleteCapsule = async (id, code) => {
  try {
    const response = await api.delete(`/capsules/${id}?code=${code}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};