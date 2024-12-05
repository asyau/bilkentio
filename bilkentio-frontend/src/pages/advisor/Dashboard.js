import React from 'react';
import AdvisorSidebar from '../../components/AdvisorSidebar';

const AdvisorDashboard = () => {
  return (
    <div className="admin-layout">
      <AdvisorSidebar />
      <div className="admin-content">
        <h1>Advisor Dashboard</h1>
        {/* Add your advisor-specific content here */}
      </div>
    </div>
  );
};

export default AdvisorDashboard; 