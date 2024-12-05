import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';

const AdminDashboard = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Admin Dashboard</h1>
        {/* Add your admin-specific content here */}
      </div>
    </div>
  );
};

export default AdminDashboard; 