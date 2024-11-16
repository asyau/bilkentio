import axios from 'axios';

export const checkAdminRole = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return { isAuthorized: false, error: 'No token found' };
    }

    const response = await axios.get('http://localhost:8080/auth/getRole', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Full response:', response.data);
    console.log('Roles:', response.data.roles);
    
    const hasAdminRole = response.data.roles.some(role => {
      console.log('Checking role:', role);
      return role === 'ROLE_ADMIN' || role.authority === 'ROLE_ADMIN';
    });
    
    console.log('Has admin role:', hasAdminRole);
    
    return { isAuthorized: hasAdminRole, error: null };
  } catch (error) {
    console.error('Error checking admin access:', error);
    return { isAuthorized: false, error: error.message };
  }
}; 

export const checkRole = async (requiredRole) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { isAuthorized: false, error: 'No token found' };
    }

    const response = await axios.get('http://localhost:8080/auth/getRole', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const hasRole = response.data.roles.some(role => 
      role === `ROLE_${requiredRole.toUpperCase()}` || 
      role.authority === `ROLE_${requiredRole.toUpperCase()}`
    );

    return { isAuthorized: hasRole, error: null };
  } catch (error) {
    return { isAuthorized: false, error: error.message };
  }
};

export const checkMultipleRoles = async (requiredRoles) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { isAuthorized: false, error: 'No token found' };
    }

    const response = await axios.get('http://localhost:8080/auth/getRole', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const hasRequiredRole = requiredRoles.some(requiredRole =>
      response.data.roles.some(role => 
        role === `ROLE_${requiredRole.toUpperCase()}` || 
        role.authority === `ROLE_${requiredRole.toUpperCase()}`
      )
    );

    return { isAuthorized: hasRequiredRole, error: null };
  } catch (error) {
    return { isAuthorized: false, error: error.message };
  }
};