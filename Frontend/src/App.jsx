import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Hello from './components/auth/CapsulesPage.jsx';


export default function App() {
  return (
    <Router>
      <Routes>
      
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Hello />} />
      </Routes>
    </Router>
  );
}
