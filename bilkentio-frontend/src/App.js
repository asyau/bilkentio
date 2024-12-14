// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/styles.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CRUD from './pages/crud';
import StaffManagement from './pages/StaffManagement';
import Unauthorized from './components/Unauthorized';
import AdminAnalytics from './pages/AdminAnalytics';
import FormRequests from './pages/FormRequests';
import PuantajScores from './pages/PuantajScores';

import TourManagement from './pages/TourManagement';
import TourDetails from './pages/TourDetails';
import Counselor from './pages/Counselor';
import Individual from './pages/individual';

import DaySelection from './pages/advisor/DaySelection';

import AdvisorFormRequests from './pages/advisor/AdvisorFormRequests';

import PresidentDashboard from './pages/president/Dashboard';
import CoordinatorDashboard from './pages/coordinator/Dashboard';
import AdvisorDashboard from './pages/advisor/Dashboard';
import GuideDashboard from './pages/guide/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Guide pages
import MyTours from './pages/guide/MyTours';
import TourHistory from './pages/guide/TourHistory';
import GuideProfile from './pages/guide/Profile';

import CoordinatorAnalytics from './pages/coordinator/CoordinatorAnalytics';
import CoordinatorFormRequests from './pages/coordinator/CoordinatorFormRequests';
import CoordinatorStaffManagement from './pages/coordinator/CoordinatorStaffManagement';
import CoordinatorTourManagement from './pages/coordinator/CoordinatorTourManagement';
import CoordinatorPuantajScores from './pages/coordinator/CoordinatorPuantajScores';

import SchoolManagement from './pages/admin/SchoolManagement';
import Analytics from './pages/Analytics';

import ChatbotPage from './pages/ChatbotPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="analytics" element={<Analytics />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="scores" element={<PuantajScores />} />
          <Route path="tours" element={<TourManagement />} />
          <Route path="tours/:tourId" element={<TourDetails />} />
          <Route path="schools" element={<SchoolManagement />} />
        </Route>

        {/* Guide Routes */}
        <Route path="/guide">
          <Route path="dashboard" element={<GuideDashboard />} />
          <Route path="my-tours" element={<MyTours />} />
          <Route path="history" element={<TourHistory />} />
          <Route path="profile" element={<GuideProfile />} />
        </Route>

        {/* Other Role-specific Routes */}
        <Route path="/president/*" element={<PresidentDashboard />} />
        <Route path="/coordinator/*" element={<CoordinatorDashboard />} />
        <Route path="/advisor/*" element={<AdvisorFormRequests />} />
        <Route path="/advisor/AdvisorFormRequests" element={<AdvisorFormRequests />} />
        <Route path="/counselor/*" element={<Counselor />} />
        <Route path="/individual/*" element={<Individual />} />
        <Route path="/advisor/day-selection" element={<DaySelection />} />

        {/* Legacy Routes - Keep if still needed */}
        <Route path="/crud" element={<CRUD />} />
        <Route path="/form-request" element={<FormRequests />} />
        <Route path="/analytics" element={<Analytics />} />


        {/* Coordinator Routes */}
        <Route path="/coordinator">
          <Route path="dashboard" element={<CoordinatorDashboard />} />
          <Route path="analytics" element={<CoordinatorAnalytics />} />
          <Route path="form-requests" element={<CoordinatorFormRequests />} />
          <Route path="staff" element={<CoordinatorStaffManagement />} />
          <Route path="tours" element={<CoordinatorTourManagement />} />
          <Route path="scores" element={<CoordinatorPuantajScores />} />
        </Route>

        <Route path="/chatbot" element={<ChatbotPage />} />
      </Routes>
    </Router>
  );
}

export default App;
