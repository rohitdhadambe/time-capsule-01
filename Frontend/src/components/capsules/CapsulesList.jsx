// src/components/capsules/CapsulesList.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getUserCapsules } from '../../services/capsule.service';

/**
 * Component for displaying a list of user's time capsules
 * @param {Object} props - Component props
 * @param {Function} props.onCapsuleSelect - Callback when a capsule is selected (optional)
 */
const CapsulesList = ({ onCapsuleSelect }) => {
  const [capsules, setCapsules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch capsules on component mount or pagination change
  useEffect(() => {
    fetchCapsules(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  /**
   * Fetch capsules from the API
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  const fetchCapsules = async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getUserCapsules(page, limit);
      setCapsules(response.items || response.capsules || response || []);
      
      // Update pagination if available in response
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total || 0,
          totalPages: response.pagination.totalPages || Math.ceil(response.pagination.total / prev.limit) || 1
        }));
      }
    } catch (err) {
      setError('Failed to fetch capsules. Please try again later.');
      console.error('Error fetching capsules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle page change
   * @param {number} newPage - Page number to navigate to
   */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  /**
   * Handle sorting change
   * @param {string} field - Field to sort by
   */
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with default direction
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  /**
   * Get sorted and filtered capsules
   * @returns {Array} Filtered and sorted capsules
   */
  const getSortedAndFilteredCapsules = () => {
    // Filter capsules by search term
    const filtered = searchTerm.trim() === '' 
      ? [...capsules]
      : capsules.filter(capsule => 
          capsule && capsule.message && 
          capsule.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    // Sort capsules
    return filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      
      // Handle different field types
      if (sortBy === 'unlock_at' || sortBy === 'created_at') {
        comparison = new Date(a[sortBy] || 0) - new Date(b[sortBy] || 0);
      } else if (a[sortBy] && b[sortBy]) {
        comparison = String(a[sortBy]).localeCompare(String(b[sortBy]));
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  /**
   * Determine if a capsule is unlocked
   * @param {Object} capsule - Capsule object
   * @returns {boolean} Whether the capsule is unlocked
   */
  const isUnlocked = (capsule) => {
    return capsule && capsule.unlock_at && new Date(capsule.unlock_at) <= new Date();
  };

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Handle refresh with current pagination
  const handleRefresh = () => {
    fetchCapsules(pagination.page, pagination.limit);
  };

  const sortedAndFilteredCapsules = getSortedAndFilteredCapsules();

  return (
    <div className="capsules-list">
      <h2>Your Time Capsules</h2>
      
      {/* Controls bar */}
      <div className="controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search capsules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={handleRefresh} 
          className="refresh-button"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
        
        <Link to="/capsules/new" className="btn-primary">
          Create New Capsule
        </Link>
      </div>
      
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Loading state */}
      {isLoading && <div className="loading-spinner">Loading capsules...</div>}
      
      {/* Empty state */}
      {!isLoading && !error && sortedAndFilteredCapsules.length === 0 && (
        <div className="empty-state">
          <p>You don't have any time capsules yet.</p>
          <Link to="/capsules/new" className="btn-primary">
            Create Your First Capsule
          </Link>
        </div>
      )}
      
      {/* Capsules table */}
      {!isLoading && !error && sortedAndFilteredCapsules.length > 0 && (
        <>
          <table className="capsules-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('created_at')} 
                  className={sortBy === 'created_at' ? `sorted-${sortDirection}` : ''}
                >
                  Created Date
                </th>
                <th 
                  onClick={() => handleSort('unlock_at')} 
                  className={sortBy === 'unlock_at' ? `sorted-${sortDirection}` : ''}
                >
                  Unlock Date
                </th>
                <th>Preview</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredCapsules.map(capsule => {
                // Skip rendering if capsule is invalid
                if (!capsule || !capsule.id) return null;
                
                return (
                  <tr key={capsule.id} className={isUnlocked(capsule) ? 'unlocked' : 'locked'}>
                    <td>{formatDate(capsule.created_at)}</td>
                    <td>{formatDate(capsule.unlock_at)}</td>
                    <td className="message-preview">
                      {capsule.message && capsule.message.length > 50 
                        ? `${capsule.message.substring(0, 50)}...` 
                        : (capsule.message || 'No message')}
                    </td>
                    <td>
                      <span className={`status-badge ${isUnlocked(capsule) ? 'unlocked' : 'locked'}`}>
                        {isUnlocked(capsule) ? 'Unlocked' : 'Locked'}
                      </span>
                    </td>
                    <td className="actions">
                      {isUnlocked(capsule) ? (
                        <>
                          <Link 
                            to={`/capsules/${capsule.id}`}
                            className="btn-view"
                            onClick={() => onCapsuleSelect && onCapsuleSelect(capsule)}
                          >
                            View
                          </Link>
                          <Link 
                            to={`/capsules/${capsule.id}/edit`}
                            className="btn-edit"
                          >
                            Edit
                          </Link>
                        </>
                      ) : (
                        <span className="locked-info" title={`Unlocks on ${formatDate(capsule.unlock_at)}`}>
                          Locked until {formatDate(capsule.unlock_at)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={pagination.page === 1 || isLoading}
                className="pagination-button"
              >
                &laquo; First
              </button>
              
              <button 
                onClick={() => handlePageChange(pagination.page - 1)} 
                disabled={pagination.page === 1 || isLoading}
                className="pagination-button"
              >
                &lsaquo; Prev
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)} 
                disabled={pagination.page === pagination.totalPages || isLoading}
                className="pagination-button"
              >
                Next &rsaquo;
              </button>
              
              <button 
                onClick={() => handlePageChange(pagination.totalPages)} 
                disabled={pagination.page === pagination.totalPages || isLoading}
                className="pagination-button"
              >
                Last &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CapsulesList;