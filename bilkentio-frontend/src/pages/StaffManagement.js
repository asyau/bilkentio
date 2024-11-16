import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Unauthorized from '../components/Unauthorized';
import '../styles/StaffManagement.css';
import { checkAdminRole } from '../utils/roleCheck';

const StaffForm = ({ staff, onClose, fetchStaffMembers, roles }) => {
  const [formData, setFormData] = useState({
    username: staff?.username || '',
    password: staff ? null : '',
    nameSurname: staff?.nameSurname || '',
    role: staff?.roles?.[0]?.replace('ROLE_', '').toLowerCase() || 'guide'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (staff) {
        await axios.put(`http://localhost:8080/api/admin/users/${staff.id}`, 
          {
            username: formData.username,
            nameSurname: formData.nameSurname,
            ...(formData.password && { password: formData.password })
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      } else {
        await axios.post('http://localhost:8080/api/admin/users', 
          {
            username: formData.username,
            password: formData.password,
            nameSurname: formData.nameSurname
          },
          {
            params: { role: formData.role },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      fetchStaffMembers();
      onClose();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(error.response?.data?.message || 'Error saving staff member');
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>{staff ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
            <input
              type="password"
              required={!staff}
              value={formData.password || ''}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              value={formData.nameSurname}
              onChange={(e) => setFormData({...formData, nameSurname: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              disabled={staff !== null}
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {staff ? 'Update' : 'Add'} Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StaffManagement = () => {
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const roles = ['admin', 'president', 'advisor', 'coordinator', 'guide'];

  const fetchStaffMembers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStaffMembers(response.data);
      setFilteredStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  }, []);

  const handleRoleFilter = useCallback((role) => {
    setSelectedRole(role);
    if (role === 'all') {
      setFilteredStaff(staffMembers);
    } else {
      setFilteredStaff(staffMembers.filter(staff => 
        staff.roles.includes(`ROLE_${role.toUpperCase()}`)));
    }
  }, [staffMembers]);

  const handleDeleteStaff = useCallback(async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/users/${staffId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchStaffMembers();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert(error.response?.data?.message || 'Error deleting staff member');
      }
    }
  }, [fetchStaffMembers]);

  useEffect(() => {
    const initializeComponent = async () => {
      const { isAuthorized, error } = await checkAdminRole();
      
      if (!isAuthorized) {
        if (error === 'No token found') {
          navigate('/login');
        } else {
          navigate('/unauthorized');
        }
        return;
      }

      try {
        await fetchStaffMembers();
      } catch (error) {
        console.error('Error fetching staff members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [navigate, fetchStaffMembers]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="staff-management-container">
      <div className="sidebar">
        <div className="user-profile">
          <span className="material-icons profile-icon">admin_panel_settings</span>
          <h3>Staff Management</h3>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-btn ${selectedRole === 'all' ? 'active' : ''}`}
            onClick={() => handleRoleFilter('all')}
          >
            <span className="material-icons">group</span>
            All Staff
          </button>
          {roles.map(role => (
            <button
              key={role}
              className={`sidebar-btn ${selectedRole === role ? 'active' : ''}`}
              onClick={() => handleRoleFilter(role)}
            >
              <span className="material-icons">person</span>
              {role.charAt(0).toUpperCase() + role.slice(1)}s
            </button>
          ))}
        </nav>
      </div>

      <div className="main-content">
        <div className="staff-header">
          <h2>Staff Members</h2>
          <button className="add-staff-btn" onClick={() => setShowAddForm(true)}>
            <span className="material-icons">add</span>
            Add Staff Member
          </button>
        </div>

        <div className="staff-list">
          {filteredStaff.map(staff => (
            <div key={staff.id} className="staff-card">
              <div className="staff-info">
                <h3>{staff.nameSurname}</h3>
                <p><strong>Username:</strong> {staff.username}</p>
                <p><strong>Role:</strong> {staff.roles.map(role => 
                  role.replace('ROLE_', '').toLowerCase()
                ).join(', ')}</p>
              </div>
              <div className="staff-actions">
                <button onClick={() => setEditingStaff(staff)} className="edit-btn">
                  <span className="material-icons">edit</span>
                </button>
                <button onClick={() => handleDeleteStaff(staff.id)} className="delete-btn">
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(showAddForm || editingStaff) && (
        <StaffForm
          staff={editingStaff}
          onClose={() => {
            setShowAddForm(false);
            setEditingStaff(null);
          }}
          fetchStaffMembers={fetchStaffMembers}
          roles={roles}
        />
      )}
    </div>
  );
};

export default StaffManagement;
