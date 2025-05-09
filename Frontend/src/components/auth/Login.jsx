
// src/components/auth/Login.jsx
import React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../../services/auth.service';

/**
 * User login component
 */
const Login = () => {
  // State for login credentials
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  // State for error handling
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Navigation and location hooks
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handle form input changes
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Call login API
      await login(credentials);
      
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      
      {/* Success message from registration */}
      {location.state?.message && (
        <div className="success-message">{location.state.message}</div>
      )}
      
      {/* Error message display */}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>
        
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;