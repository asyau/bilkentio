import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AdvisorInfoContainer from './AdvisorInfoContainer';
import '../styles/Sidebar.css';

const GuideSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/guide/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'My Schedule',
      path: '/guide/schedule',
      icon: 'event'
    },
    {
      title: 'Tour History',
      path: '/guide/history',
      icon: 'history'
    }
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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
        {menuItems.map((item, index) => (
          <NavLink key={index} to={item.path} className="nav-item" title={item.title}>
            <span className="material-icons">{item.icon}</span>
            {!isCollapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {!isCollapsed && <AdvisorInfoContainer />}
    </div>
  );
};

export default GuideSidebar; 