import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/TourManagement.css';

const TourManagement = () => {
  const [tourType, setTourType] = useState('group');
  const [tours, setTours] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('GUIDES_PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, [selectedStatus, tourType]);

  const fetchTours = async () => {
    try {
      const endpoint = tourType === 'group' 
        ? `http://localhost:8080/api/tours?status=${selectedStatus}`
        : `http://localhost:8080/api/individual-tours/status/${selectedStatus}`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTours(response.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (tourId, newStatus) => {
    try {
      if (tourType === 'group') {
        await axios.put(`http://localhost:8080/api/tours/${tourId}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
      } else {
        await axios.post(`http://localhost:8080/api/individual-tours/${tourId}/complete`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
      }
      fetchTours();
    } catch (error) {
      console.error('Error updating tour status:', error);
      alert('Failed to update tour status');
    }
  };

  const handleCancelTour = async (tourId) => {
    const reason = prompt("Please enter the cancellation reason:");
    if (!reason) return;

    try {
      const endpoint = tourType === 'group'
        ? `http://localhost:8080/api/tours/${tourId}/cancel`
        : `http://localhost:8080/api/individual-tours/${tourId}/cancel`;

      await axios.post(endpoint,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchTours();
    } catch (error) {
      console.error('Error cancelling tour:', error);
      alert('Failed to cancel tour');
    }
  };

  const renderTourCard = (tour) => {
    const isGroupTour = tourType === 'group';
    
    return (
      <div key={tour.id} className="tour-card">
        <div className="tour-header">
          <h3>{isGroupTour ? tour.schoolName : `Individual Tour #${tour.id}`}</h3>
          <span className={`status-badge ${tour.status?.toLowerCase()}`}>
            {tour.status}
          </span>
        </div>

        <div className="tour-details">
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{tour.date}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{tour.time}</span>
          </div>

          {isGroupTour ? (
            <>
              <div className="detail-row">
                <span className="detail-label">Group Size:</span>
                <span className="detail-value">{tour.groupSize}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Guides Required:</span>
                <span className="detail-value">{tour.requiredGuides}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Assigned Guides:</span>
                <span className="detail-value">{tour.assignedGuides?.length || 0}</span>
              </div>
            </>
          ) : (
            <>
              <div className="detail-row">
                <span className="detail-label">Visitor:</span>
                <span className="detail-value">{tour.username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{tour.contactNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{tour.email}</span>
              </div>
              {tour.specialRequirements && (
                <div className="detail-row">
                  <span className="detail-label">Special Requirements:</span>
                  <span className="detail-value">{tour.specialRequirements}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="tour-actions">
          {tour.status === 'GUIDES_PENDING' && (
            <>
              <button 
                className="action-button start"
                onClick={() => handleStatusChange(tour.id, 'WAITING_TO_FINISH')}
              >
                Start Tour
              </button>
              <button 
                className="action-button cancel"
                onClick={() => handleCancelTour(tour.id)}
              >
                Cancel Tour
              </button>
            </>
          )}
          {tour.status === 'WAITING_TO_FINISH' && (
            <button 
              className="action-button complete"
              onClick={() => handleStatusChange(tour.id, 'FINISHED')}
            >
              Complete Tour
            </button>
          )}
          {tour.status === 'CANCELLED' && tour.cancellationReason && (
            <p className="cancellation-reason">
              <strong>Cancellation Reason:</strong> {tour.cancellationReason}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="tour-management-container">
          <h1>Tour Management</h1>
          
          <div className="controls-container">
            <div className="tour-type-selector">
              <button 
                className={`selector-button ${tourType === 'group' ? 'active' : ''}`}
                onClick={() => setTourType('group')}
              >
                Group Tours
              </button>
              <button 
                className={`selector-button ${tourType === 'individual' ? 'active' : ''}`}
                onClick={() => setTourType('individual')}
              >
                Individual Tours
              </button>
            </div>

            <div className="status-filters">
              <button 
                className={`filter-button ${selectedStatus === 'GUIDES_PENDING' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('GUIDES_PENDING')}
              >
                Pending
              </button>
              <button 
                className={`filter-button ${selectedStatus === 'WAITING_TO_FINISH' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('WAITING_TO_FINISH')}
              >
                In Progress
              </button>
              <button 
                className={`filter-button ${selectedStatus === 'FINISHED' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('FINISHED')}
              >
                Finished
              </button>
              <button 
                className={`filter-button ${selectedStatus === 'GIVEN_FEEDBACK' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('GIVEN_FEEDBACK')}
              >
                With Feedback
              </button>
            </div>
          </div>

          <div className="tours-list">
            {loading ? (
              <div className="loading">Loading tours...</div>
            ) : tours.length === 0 ? (
              <div className="no-tours">No tours found for the selected status.</div>
            ) : (
              tours.map(tour => renderTourCard(tour))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourManagement; 