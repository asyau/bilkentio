import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AdvisorInfoContainer from './AdvisorInfoContainer';
import ProfileSettings from './ProfileSettings';
import '../styles/Sidebar.css';
import '../styles/GuideMode.css';

const GuideSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/guide/dashboard',
      icon: 'dashboard',
      description: 'View available tours'
    },
    {
      title: 'My Tours',
      path: '/guide/my-tours',
      icon: 'tour',
      description: 'View your joined tours'
    },
    {
      title: 'Tour History',
      path: '/guide/history',
      icon: 'history',
      description: 'View completed tours and feedback'
    },
    {
      title: 'Profile',
      path: '/guide/profile',
      icon: 'person',
      description: 'View your profile and stats'
    }
  ];

  return (
    <>
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
        {!isCollapsed && <AdvisorInfoContainer />} 
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <NavLink key={index} to={item.path} className="nav-item" title={item.title}>
              <span className="material-icons">{item.icon}</span>
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
          
          <button 
            className="nav-item"
            onClick={() => setIsSettingsOpen(true)}
          >
            <span className="material-icons">settings</span>
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button 
            className="nav-item logout-btn"
            onClick={handleLogout}
          >
            <span className="material-icons">logout</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </nav>
      </div>
      <ProfileSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default GuideSidebar; 