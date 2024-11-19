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
import Unauthorized from './components/Unauthorized';
import AdminAnalytics from './pages/AdminAnalytics';
import FormRequests from './pages/FormRequests';
import PuantajScores from './pages/PuantajScores';

function AppContent() {
  const location = useLocation();
  const hideFooterPaths = ['/register', '/login', '/guide', '/individual', '/staffmanagement', '/unauthorized', '/admin','/FormRequests',"/counselor"];
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
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/admin">
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="scores" element={<PuantajScores />} />
        </Route>
        <Route path="/form-request" element={<FormRequests />} />
      </Routes>
      {shouldShowFooter && (
        <footer>
          <p>
            <span className="material-icons" style={{ fontSize: '16px', marginRight: '8px' }}>copyright</span>
            2024 BilkentIO - All rights reserved
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
