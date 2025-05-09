// src/components/capsules/DeleteCapsule.jsx
import React from "react";
import { useState } from 'react';
import { deleteCapsule } from '../../services/capsule.service';

/**
 * Component for deleting time capsules
 * @param {Object} props - Component props
 * @param {Object} props.capsule - Capsule data to delete
 * @param {Function} props.onSuccess - Callback for successful deletion
 * @param {Function} props.onCancel - Callback for canceling the deletion
 */
const DeleteCapsule = ({ capsule, onSuccess, onCancel }) => {
  // State for form functionality
  const [unlockCode, setUnlockCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Call the delete service
      await deleteCapsule(capsule.id, unlockCode);
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to delete time capsule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-capsule">
      <h2>Delete Time Capsule</h2>
      
      <div className="confirmation-message">
        <p>Are you sure you want to delete this time capsule?</p>
        <p>This action cannot be undone.</p>
      </div>
      
      {/* Error message display */}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="unlockCode">Unlock Code</label>
          <input
            type="text"
            id="unlockCode"
            name="unlockCode"
            value={unlockCode}
            onChange={(e) => setUnlockCode(e.target.value)}
            required
            placeholder="Enter the unlock code to confirm deletion"
          />
          <small>You must provide the correct unlock code to delete this capsule</small>
        </div>
        
        <div className="button-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn-danger"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Capsule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteCapsule;