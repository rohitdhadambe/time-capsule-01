// src/pages/CapsulesPage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import CapsuleForm from '../capsules/CapsuleForm';
import CapsulesList from '../capsules/CapsulesList';
import CapsuleDetail from '../capsules/CapsuleDetail';
import UpdateCapsule from '../capsules/UpdateCapsule';
import DeleteCapsule from '../capsules/DeleteCapsule';


/**
 * Main page for time capsule functionality
 * Handles routing between different capsule actions
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
   * Handle successful capsule operations
   * @param {Object} result - The operation result
   * @param {string} message - Custom success message
   */
  const handleSuccess = (result, message) => {
    // Navigate to the capsules home with a success message
    navigate('/capsules', { 
      state: { message: message || 'Operation completed successfully' } 
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
      
      <Routes>
        {/* Home/Dashboard with action buttons */}
        <Route 
          path="/" 
          element={
            <div className="capsule-dashboard">
              <h1>Time Capsule Manager</h1>
              <p>Select an action to manage your time capsules</p>
              
              <div className="action-buttons">
  <Link to="/capsules/create" className="btn">
    Create Capsule 
  </Link>
  <Link to="/capsules/update" className="btn">
    Update Capsule-----
  </Link>
  <Link to="/capsules/delete" className="btn">
    Delete Capsule-----
  </Link>
  <Link to="/capsules/list" className="btn">
    List Capsules-----
  </Link>
  <Link to="/capsules/details" className="btn">
    Capsule Details
  </Link>
</div>
            </div>
          } 
        />
        
        {/* Create new capsule */}
        <Route 
          path="/create" 
          element={
            <>
              <nav className="breadcrumb">
                <Link to="/capsules">Home</Link> &gt; Create Capsule
              </nav>
              <CapsuleForm 
                onSuccess={(capsule) => handleSuccess(capsule, 'Time capsule created successfully!')} 
              />
            </>
          } 
        />
        
        {/* Update existing capsule */}
        <Route 
          path="/update" 
          element={
            <>
              <nav className="breadcrumb">
                <Link to="/capsules">Home</Link> &gt; Update Capsule
              </nav>
              <UpdateCapsule 
                onSuccess={(capsule) => handleSuccess(capsule, 'Time capsule updated successfully!')}
                onCancel={() => navigate('/capsules')}
              />
            </>
          } 
        />
        
        {/* Update specific capsule with ID */}
        <Route 
          path="/update/:id" 
          element={
            <>
              <nav className="breadcrumb">
                <Link to="/capsules">Home</Link> &gt; 
                <Link to="/capsules/update">Update</Link> &gt; Capsule Details
              </nav>
              <UpdateCapsule 
                capsuleId={location.pathname.split('/').pop()}
                onSuccess={(capsule) => handleSuccess(capsule, 'Time capsule updated successfully!')}
                onCancel={() => navigate('/capsules/update')}
              />
            </>
          } 
        />
        
        {/* Delete capsule */}
        <Route 
          path="/delete" 
          element={
            <>
              <nav className="breadcrumb">
                <Link to="/capsules">Home</Link> &gt; Delete Capsule
              </nav>
              <DeleteCapsule 
                onSuccess={() => handleSuccess(null, 'Time capsule deleted successfully!')}
                onCancel={() => navigate('/capsules')}
              />
            </>
          } 
        />
        
        {/* Delete specific capsule with ID */}
        <Route 
          path="/delete/:id" 
          element={
            <>
              <nav className="breadcrumb">
                <Link to="/capsules">Home</Link> &gt; 
                <Link to="/capsules/delete">Delete</Link> &gt; Confirm Deletion
              </nav>
              <DeleteCapsule 
                capsuleId={location.pathname.split('/').pop()}
                onSuccess={() => handleSuccess(null, 'Time capsule deleted successfully!')}
                onCancel={() => navigate('/capsules/delete')}
              />
            </>
          } 
        />
        
        {/* View capsule details */}
        <Route 
          path="/details" 
          element={
            <>
              <nav className="breadcrumb">
                <Link to="/capsules">Home</Link> &gt; Capsule Details
              </nav>
              <CapsuleDetail 
                onBack={() => navigate('/capsules')}
              />
            </>
          } 
        />
        
        {/* View specific capsule details with ID */}
        <Route 
          path="/details/:id" 
          element={
            <>
              <nav className="breadcrumb">
                <Link to="/capsules">Home</Link> &gt; 
                <Link to="/capsules/details">Details</Link> &gt; Capsule Info
              </nav>
              <CapsuleDetail 
                capsuleId={location.pathname.split('/').pop()}
                onBack={() => navigate('/capsules/details')}
              />
            </>
          } 
        />
        
        {/* View all capsules */}
        <Route 
          path="/list" 
          element={
            <>
              <nav className="breadcrumb">
                <Link to="/capsules">Home</Link> &gt; List Capsules
              </nav>
              <CapsulesList 
                onViewDetails={(id) => navigate(`/capsules/details/${id}`)}
                onUpdateCapsule={(id) => navigate(`/capsules/update/${id}`)}
                onDeleteCapsule={(id) => navigate(`/capsules/delete/${id}`)}
              />
            </>
          } 
        />
      </Routes>
    </div>
  );
};

export default CapsulesPage;