import React from 'react';
import GuideSidebar from '../../components/GuideSidebar';
import '../../styles/GuideDashboard.css';

const GuideDashboard = () => {
  return (
    <div className="guide-dashboard">
      <GuideSidebar />
      <div className="guide-content">
        <h1>Guide Dashboard</h1>
        {/* Your existing dashboard content */}
      </div>
    </div>
  );
};

export default GuideDashboard; 