import React from 'react';
import BaseSidebar from './BaseSidebar';

const GuideSidebar = () => {
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

  return <BaseSidebar logo="BilkentIO" menuItems={menuItems} />;
};

export default GuideSidebar; 