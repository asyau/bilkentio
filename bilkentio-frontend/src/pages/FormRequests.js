import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/FormRequests.css';

const FormRequests = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Decode JWT token to get user info
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser(decodedToken);
    } catch (error) {
      console.error('Error decoding token:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchForms();
  }, [selectedStatus]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let endpoint = '/api/forms/all';
      if (selectedStatus !== 'ALL') {
        endpoint = `/api/forms/state/${selectedStatus}`;
      }
      
      const response = await axios.get(`http://localhost:8080${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormAction = async (formId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.put(`http://localhost:8080/api/forms/${formId}/status`, null, {
        params: { newState: action },
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchForms();
    } catch (error) {
      console.error('Error updating form status:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to update form status');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'DENIED': return 'red';
      case 'PENDING': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="form-requests-container">
          <div className="form-header">
            <div className="filter-section">
              <div className="status-filters">
                <button 
                  className={`filter-btn ${selectedStatus === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('ALL')}
                >
                  All Forms
                </button>
                <button 
                  className={`filter-btn ${selectedStatus === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('PENDING')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-btn ${selectedStatus === 'APPROVED' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('APPROVED')}
                >
                  Approved
                </button>
                <button 
                  className={`filter-btn ${selectedStatus === 'DENIED' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('DENIED')}
                >
                  Denied
                </button>
              </div>
            </div>
          </div>

          <div className="forms-content">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : forms.length > 0 ? (
              <div className="forms-list">
                {forms.map(form => (
                  <div key={form.id} className="form-card">
                    <div className="form-header">
                      <h3>{form.schoolName || 'No School Name'}</h3>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(form.state) }}>
                        {form.state}
                      </span>
                    </div>
                    <div className="form-details">
                      <p><strong>Date:</strong> {form.slotDate || 'Not specified'}</p>
                      <p><strong>Time:</strong> {form.slotTime || 'Not specified'}</p>
                      <p><strong>Group Size:</strong> {form.groupSize || 'Not specified'}</p>
                      <p><strong>Contact:</strong> {form.contactPhone || 'Not specified'}</p>
                      <p><strong>Leader:</strong> {form.groupLeaderRole || 'Not specified'}</p>
                      <p><strong>Leader Phone:</strong> {form.groupLeaderPhone || 'Not specified'}</p>
                      <p><strong>Leader Email:</strong> {form.groupLeaderEmail || 'Not specified'}</p>
                      <p><strong>City:</strong> {form.city || 'Not specified'}</p>
                      {form.expectations && (
                        <p><strong>Expectations:</strong> {form.expectations}</p>
                      )}
                      {form.specialRequirements && (
                        <p><strong>Special Requirements:</strong> {form.specialRequirements}</p>
                      )}
                      {form.visitorNotes && (
                        <p><strong>Notes:</strong> {form.visitorNotes}</p>
                      )}
                    </div>
                    {form.state === 'PENDING' && (
                      <div className="form-actions">
                        <button 
                          className="approve-btn"
                          onClick={() => handleFormAction(form.id, 'APPROVED')}
                        >
                          <span className="material-icons">check_circle</span>
                          Approve
                        </button>
                        <button 
                          className="deny-btn"
                          onClick={() => handleFormAction(form.id, 'DENIED')}
                        >
                          <span className="material-icons">cancel</span>
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-forms-message">
                No {selectedStatus.toLowerCase()} forms found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormRequests; 