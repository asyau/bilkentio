import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/StaffManagement.css';

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const roles = ['admin', 'president', 'advisor', 'coordinator', 'guide'];

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/staff', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStaffMembers(response.data);
      setFilteredStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    if (role === 'all') {
      setFilteredStaff(staffMembers);
    } else {
      setFilteredStaff(staffMembers.filter(staff => staff.role === role));
    }
  };

  const StaffForm = ({ staff, onClose }) => {
    const [formData, setFormData] = useState({
      firstName: staff?.firstName || '',
      lastName: staff?.lastName || '',
      email: staff?.email || '',
      role: staff?.role || 'guide',
      phoneNumber: staff?.phoneNumber || '',
      department: staff?.department || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (staff) {
          await axios.put(`http://localhost:8080/api/staff/${staff.id}`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        } else {
          await axios.post('http://localhost:8080/api/staff', formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        }
        fetchStaffMembers();
        onClose();
      } catch (error) {
        console.error('Error saving staff:', error);
      }
    };

    return (
      <div className="form-overlay">
        <div className="form-container">
          <h2>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
              <label>Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
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
              <label>Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
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

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`http://localhost:8080/api/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchStaffMembers();
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

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
                <h3>{staff.firstName} {staff.lastName}</h3>
                <p><strong>Role:</strong> {staff.role}</p>
                <p><strong>Email:</strong> {staff.email}</p>
                <p><strong>Phone:</strong> {staff.phoneNumber}</p>
                <p><strong>Department:</strong> {staff.department}</p>
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
        />
      )}
    </div>
  );
};

export default StaffManagement;
