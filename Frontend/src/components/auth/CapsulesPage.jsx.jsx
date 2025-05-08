// src/pages/CapsulesPage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import CapsulesList from '../capsules/CapsuleForm';
import CapsuleForm from '../capsules/CapsulesList';
import CapsuleDetail from '../capsules/CapsuleDetail';

/**
 * Main page for time capsule functionality
 * Handles routing between list, detail, create, and edit views
 */
const CapsulesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notification, setNotification] = useState('');
  
  // Handle notifications passed via location state
  useEffect(() => {
    if (location.state?.message) {
      setNotification(location.state.message);
      // Clear location state
      navigate(location.pathname, { replace: true });
      
      // Auto-clear notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  /**
   * Handle successful capsule creation or update
   * @param {Object} capsule - The created/updated capsule
   */
  const handleCapsuleSuccess = (capsule) => {
    // Navigate to the capsules list with a success message
    navigate('/capsules', { 
      state: { 
        message: capsule.id ? 'Time capsule saved successfully!' : 'Operation completed successfully'
      } 
    });
  };

  return (
    <div className="capsules-page">
      {/* Notification banner */}
      {notification && (
        <div className="notification-banner">
          <p>{notification}</p>
          <button onClick={() => setNotification('')} className="close-button">
            &times;
          </button>
        </div>
      )}
      
      {/* Routing for capsule views */}
      <Routes>
        {/* List all capsules */}
        <Route path="/" element={<CapsulesList />} />
        
        {/* Create new capsule */}
        <Route 
          path="/new" 
          element={<CapsuleForm onSuccess={handleCapsuleSuccess} />} 
        />
        
        {/* View capsule details */}
        <Route path="/:id" element={<CapsuleDetail />} />
        
        {/* Edit existing capsule */}
        <Route 
          path="/:id/edit" 
          element={
            <CapsuleDetail>
              {(capsule, unlockCode) => (
                <CapsuleForm 
                  capsule={capsule} 
                  unlockCode={unlockCode}
                  onSuccess={handleCapsuleSuccess}
                />
              )}
            </CapsuleDetail>
          } 
        />
      </Routes>
    </div>
  );
};

export default CapsulesPage;