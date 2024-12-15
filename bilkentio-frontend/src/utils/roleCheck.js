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
    
    const hasAdminRole = response.data.roles.some(role => {
      const authority = role.authority || role;
      return authority === 'ROLE_ADMIN' || 
             authority === 'ROLE_COORDINATOR' || 
             authority === 'ROLE_COORDİNATOR';
    });
    
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