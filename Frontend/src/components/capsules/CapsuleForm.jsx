
// src/components/capsules/CapsuleForm.jsx
import React from "react";
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createCapsule, updateCapsule } from '../../services/capsule.service';

/**
 * Component for creating or updating time capsules
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback for successful submission
 * @param {Object} props.capsule - Existing capsule data (for updates)
 * @param {string} props.unlockCode - Unlock code (for updates)
 */
const CapsuleForm = ({ onSuccess, capsule, unlockCode: existingCode }) => {
  // Initialize form data - use provided capsule or default values
  const [capsuleData, setCapsuleData] = useState({
    message: capsule?.message || '',
    unlock_at: capsule?.unlock_at ? new Date(capsule.unlock_at) : new Date(Date.now() + 86400000) // Tomorrow by default
  });
  
  // State for form functionality
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unlockCode, setUnlockCode] = useState(existingCode || '');
  const [capsuleId, setCapsuleId] = useState(capsule?.id || '');
  
  // Determine if this is an edit operation
  const isEditing = !!capsule;

  /**
   * Handle text input changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setCapsuleData({
      ...capsuleData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handle date picker changes
   * @param {Date} date - Selected date
   */
  const handleDateChange = (date) => {
    setCapsuleData({
      ...capsuleData,
      unlock_at: date
    });
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // Format data for API - convert Date to ISO string
      const formattedData = {
        ...capsuleData,
        unlock_at: capsuleData.unlock_at.toISOString()
      };
      
      let response;
      
      if (isEditing) {
        // Update existing capsule
        response = await updateCapsule(capsule.id, unlockCode, formattedData);
        setSuccess('Time capsule updated successfully!');
      } else {
        // Create new capsule
        response = await createCapsule(formattedData);
        setCapsuleId(response.id);
        setUnlockCode(response.unlock_code);
        setSuccess('Time capsule created successfully!');
      }
      
      // Call success callback if provided
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to save time capsule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="capsule-form">
      <h2>{isEditing ? 'Update Time Capsule' : 'Create New Time Capsule'}</h2>
      
      {/* Error message display */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Success message and code display */}
      {success && (
        <div className="success-info">
          <div className="success-message">{success}</div>
          
          {/* Only show ID and code for new capsules */}
          {!isEditing && (
            <div className="code-info">
              <p><strong>Capsule ID:</strong> {capsuleId}</p>
              <p><strong>Unlock Code:</strong> {unlockCode}</p>
              <p className="important-note">
                <strong>Important:</strong> Save this code! You'll need it to access your capsule later.
              </p>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="message">Your Message</label>
          <textarea
            id="message"
            name="message"
            value={capsuleData.message}
            onChange={handleChange}
            required
            rows="5"
            placeholder="Write a message to your future self..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="unlock_at">Unlock Date</label>
          <DatePicker
            selected={capsuleData.unlock_at}
            onChange={handleDateChange}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
            className="date-picker"
            required
          />
          <small>The capsule will only be accessible after this date</small>
        </div>
        
        {/* Show unlock code field for updates */}
        {isEditing && (
          <div className="form-group">
            <label htmlFor="unlockCode">Unlock Code</label>
            <input
              type="text"
              id="unlockCode"
              name="unlockCode"
              value={unlockCode}
              onChange={(e) => setUnlockCode(e.target.value)}
              required
              placeholder="Enter the unlock code to make changes"
            />
          </div>
        )}
        
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ?
            (isEditing ? 'Updating...' : 'Creating...') :
            (isEditing ? 'Update Capsule' : 'Create Capsule')
          }
        </button>
      </form>
    </div>
  );
};

export default CapsuleForm;