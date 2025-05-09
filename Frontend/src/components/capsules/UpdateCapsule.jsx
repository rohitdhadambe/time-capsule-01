// src/components/capsules/UpdateCapsule.jsx
import React from "react";
import { useState } from 'react';
import { getCapsule } from '../../services/capsule.service';
import CapsuleForm from './CapsuleForm';

/**
 * Component for updating time capsules
 * @param {Object} props - Component props
 * @param {string} props.capsuleId - ID of the capsule to update
 * @param {Function} props.onSuccess - Callback for successful update
 * @param {Function} props.onCancel - Callback for canceling the update
 */
const UpdateCapsule = ({ capsuleId, onSuccess, onCancel }) => {
  // State for component functionality
  const [capsule, setCapsule] = useState(null);
  const [unlockCode, setUnlockCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  /**
   * Handle verification of the unlock code
   * @param {Event} e - Form submit event
   */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Fetch capsule data with the provided code
      const capsuleData = await getCapsule(capsuleId, unlockCode);
      setCapsule(capsuleData);
      setShowForm(true);
    } catch (err) {
      setError(err.message || 'Failed to verify unlock code');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle successful update from the CapsuleForm component
   * @param {Object} updatedCapsule - Updated capsule data
   */
  const handleUpdateSuccess = (updatedCapsule) => {
    if (onSuccess) onSuccess(updatedCapsule);
  };

  return (
    <div className="update-capsule">
      {!showForm ? (
        // Step 1: Verify unlock code
        <>
          <h2>Access Time Capsule</h2>
          
          {/* Error message display */}
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="unlockCode">Unlock Code</label>
              <input
                type="text"
                id="unlockCode"
                name="unlockCode"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                required
                placeholder="Enter the unlock code for this capsule"
              />
            </div>
            
            <div className="button-group">
              {onCancel && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Access Capsule'}
              </button>
            </div>
          </form>
        </>
      ) : (
        // Step 2: Show the capsule form with existing data
        <CapsuleForm
          capsule={capsule}
          unlockCode={unlockCode}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default UpdateCapsule;