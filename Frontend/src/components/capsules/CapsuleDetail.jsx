// src/components/capsules/CapsuleDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getCapsule, deleteCapsule } from '../../services/capsule.service';

/**
 * Component for viewing a single time capsule in detail
 * @param {Object} props - Component props
 * @param {Object} props.preloadedCapsule - Optional pre-loaded capsule data
 */
const CapsuleDetail = ({ preloadedCapsule }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [capsule, setCapsule] = useState(preloadedCapsule || null);
  const [unlockCode, setUnlockCode] = useState('');
  const [isLoading, setIsLoading] = useState(!preloadedCapsule);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(!!preloadedCapsule);

  // If a capsule wasn't provided, we'll need the user to enter the unlock code
  const needsUnlockCode = !preloadedCapsule;
  
  useEffect(() => {
    // If we have preloaded data, no need to fetch
    if (preloadedCapsule) return;
    
    // Clear any existing capsule data when ID changes
    setCapsule(null);
    setUnlockCode('');
    setUnlocked(false);
    setError('');
  }, [id, preloadedCapsule]);

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM d, yyyy h:mm a');
  };

  /**
   * Handle unlock form submission
   * @param {Event} e - Form submit event
   */
  const handleUnlock = async (e) => {
    e.preventDefault();
    
    if (!unlockCode.trim()) {
      setError('Please enter the unlock code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getCapsule(id, unlockCode);
      setCapsule(data);
      setUnlocked(true);
    } catch (err) {
      setError(err.message || 'Invalid unlock code or capsule not found');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle capsule deletion
   */
  const handleDelete = async () => {
    setDeleteLoading(true);
    
    try {
      await deleteCapsule(id, unlockCode);
      navigate('/capsules', { 
        state: { message: 'Time capsule deleted successfully' } 
      });
    } catch (err) {
      setError(err.message || 'Failed to delete capsule');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="capsule-detail">
      <div className="capsule-detail-header">
        <Link to="/capsules" className="back-link">
          &larr; Back to all capsules
        </Link>
        <h2>Time Capsule</h2>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Loading state */}
      {isLoading && <div className="loading-spinner">Loading capsule...</div>}
      
      {/* Unlock form */}
      {!isLoading && needsUnlockCode && !unlocked && (
        <div className="unlock-form-container">
          <h3>This capsule is locked</h3>
          <p>Enter the unlock code to view this time capsule</p>
          
          <form onSubmit={handleUnlock} className="unlock-form">
            <div className="form-group">
              <label htmlFor="unlockCode">Unlock Code</label>
              <input
                type="text"
                id="unlockCode"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                placeholder="Enter your unlock code"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Unlocking...' : 'Unlock Capsule'}
            </button>
          </form>
        </div>
      )}
      
      {/* Capsule content */}
      {!isLoading && capsule && unlocked && (
        <div className="capsule-content">
          <div className="capsule-meta">
            <div className="meta-item">
              <span className="meta-label">Created:</span>
              <span className="meta-value">{formatDate(capsule.created_at)}</span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Unlocked:</span>
              <span className="meta-value">{formatDate(capsule.unlock_at)}</span>
            </div>
          </div>
          
          <div className="capsule-message">
            <h3>Your Message</h3>
            <div className="message-content">
              {capsule.message.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          <div className="capsule-actions">
            <Link to={`/capsules/${id}/edit`} className="btn-edit">
              Edit Capsule
            </Link>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="btn-delete"
            >
              Delete Capsule
            </button>
          </div>
          
          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="delete-confirm-modal">
              <div className="delete-confirm-content">
                <h3>Delete Time Capsule?</h3>
                <p>This action cannot be undone.</p>
                
                <div className="delete-confirm-actions">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)} 
                    className="btn-cancel"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="btn-confirm-delete"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CapsuleDetail;