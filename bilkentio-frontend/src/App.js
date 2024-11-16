// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './styles/styles.css';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CRUD from './pages/crud';
import StaffManagement from './pages/StaffManagement';
import Counselor from './pages/Counselor';
import Individual from './pages/individual';

// Create a wrapper component to use useLocation
function AppContent() {
  const location = useLocation();
  const hideFooterPaths = ['/register', '/login', '/guide', '/individual', '/staffmanagement']; // Add any paths where you don't want the footer

  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/crud" element={<CRUD />} />
        <Route path="/counselor" element={<Counselor />} />
        <Route path="/individual" element={<Individual />} />
        <Route path="/staffmanagement" element={<StaffManagement />} />
      </Routes>
      {shouldShowFooter && (
        <footer>
          <p>
            <span className="material-icons" style={{ fontSize: '16px', marginRight: '8px' }}>copyright</span>
            2023 BilkentIO - All rights reserved
          </p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
