import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Unauthorized from '../components/Unauthorized';
import '../styles/StaffManagement.css';
import { checkAdminRole } from '../utils/roleCheck';
import AdminSidebar from '../components/AdminSidebar';

const StaffForm = ({ staff, onClose, fetchStaffMembers, roles }) => {
  const [formData, setFormData] = useState({
    username: staff?.username || '',
    password: staff ? null : '',
    nameSurname: staff?.nameSurname || '',
    email: staff?.email || '',
    phoneNumber: staff?.phoneNumber || '',
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
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            roles: [`ROLE_${formData.role.toUpperCase()}`],
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
            nameSurname: formData.nameSurname,
            email: formData.email,
            phoneNumber: formData.phoneNumber
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
            <label>Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
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
      console.log("get all users")
      console.log(response.data)
      // Filter out users who have counselor or individual roles
      const filteredData = response.data.filter(user => 
        !user.roles.some(role => 
          ['ROLE_COUNSELOR', 'ROLE_INDIVIDUAL', 'ROLE_İNDİVİDUAL']
            .includes(role.toUpperCase())
        )
      );
      console.log(filteredData)

      setStaffMembers(filteredData);
      setFilteredStaff(filteredData);
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
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="staff-management-container">
          <div className="staff-header">
            <div className="filter-section">
              <div className="role-filter">
                <button 
                  className={`role-btn ${selectedRole === 'all' ? 'active' : ''}`}
                  onClick={() => handleRoleFilter('all')}
                >
                  All Staff
                </button>
                {roles.map(role => (
                  <button
                    key={role}
                    className={`role-btn ${selectedRole === role ? 'active' : ''}`}
                    onClick={() => handleRoleFilter(role)}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}s
                  </button>
                ))}
              </div>
            </div>
            <button className="add-staff-btn" onClick={() => setShowAddForm(true)}>
              <span className="material-icons">add</span>
              Add Staff
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
      </div>
    </div>
  );
};

export default StaffManagement;
