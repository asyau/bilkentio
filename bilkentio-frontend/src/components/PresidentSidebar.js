import React from 'react';
import BaseSidebar from './BaseSidebar';

const PresidentSidebar = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/president/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'Analytics',
      path: '/president/analytics',
      icon: 'analytics'
    },
    {
      title: 'Staff Overview',
      path: '/president/staff',
      icon: 'groups'
    },
    {
      title: 'Reports',
      path: '/president/reports',
      icon: 'description'
    },
    
  ];

  return <BaseSidebar logo="BilkentIO" menuItems={menuItems} />;
};

export default PresidentSidebar; 