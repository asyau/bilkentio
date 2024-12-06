import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/AdminSidebar.css';

const AdvisorSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo-section">
          {!isCollapsed && <h2>BilkentIO</h2>}
        </div>
        
        <button 
          className={`collapse-btn ${!isCollapsed ? 'is-active' : ''}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="hamburger-icon">
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
        </button>
        
        <nav className="sidebar-nav">
          <NavLink to="/advisor/dashboard" className="nav-item" title="Dashboard">
            <span className="material-icons">dashboard</span>
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
          
          <NavLink to="/advisor/forms" className="nav-item" title="Form Requests">
            <span className="material-icons">description</span>
            {!isCollapsed && <span>Form Requests</span>}
          </NavLink>
          
          <NavLink to="/advisor/students" className="nav-item" title="Student Records">
            <span className="material-icons">school</span>
            {!isCollapsed && <span>Student Records</span>}
          </NavLink>

          <NavLink to="/advisor/day-selection" className="nav-item" title="Choose Day">
            <span className="material-icons">event</span>
            {!isCollapsed && <span>Choose Day</span>}
          </NavLink>
        </nav>
      </div>
      <div className={`sidebar-placeholder ${isCollapsed ? 'collapsed' : ''}`} />
    </>
  );
};

export default AdvisorSidebar; 