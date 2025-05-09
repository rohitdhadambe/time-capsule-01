import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Hello from './components/auth/CapsulesPage.jsx';

import Create from './components/capsules/CapsuleForm.jsx';
import Update from './components/capsules/UpdateCapsule.jsx';
import Delete from './components/capsules/DeleteCapsule.jsx';
import List from './components/capsules/CapsulesList.jsx';
import Detail from './components/capsules/CapsuleDetail.jsx';



export default function App() {
  return (
    <Router>
      <Routes>
      
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Hello />} />

        <Route path="/capsules/create" element={<Create />} />
        <Route path="/capsules/update" element={<Update />} />
        <Route path="/capsules/delete" element={<Delete />} />
        <Route path="/capsules/list" element={<List />} />
        <Route path="/capsules/details" element={<Detail />} />
      </Routes>
    </Router>
  );
}
