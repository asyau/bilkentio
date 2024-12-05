import React from 'react';
import BaseSidebar from './BaseSidebar';

const AdvisorSidebar = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/advisor/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'Form Requests',
      path: '/advisor/forms',
      icon: 'description'
    },
    {
      title: 'Student Records',
      path: '/advisor/students',
      icon: 'school'
    }
  ];

  return <BaseSidebar logo="BilkentIO" menuItems={menuItems} />;
};

export default AdvisorSidebar; 