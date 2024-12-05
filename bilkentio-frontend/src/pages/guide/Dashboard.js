import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GuideSidebar from '../../components/GuideSidebar';
import '../../styles/GuideDashboard.css';

const GuideDashboard = () => {
  const [pendingTours, setPendingTours] = useState([]);
  const [myTours, setMyTours] = useState([]);
  const [selectedView, setSelectedView] = useState('PENDING'); // 'PENDING' or 'MY_TOURS'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTours();
  }, [selectedView]);

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      
      if (selectedView === 'PENDING') {
        const response = await axios.get('http://localhost:8080/api/tours?status=GUIDES_PENDING', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingTours(response.data);
      } else {
        const response = await axios.get(`http://localhost:8080/api/tours/guide/${decodedToken.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyTours(response.data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTour = async (tourId) => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      
      await axios.post(`http://localhost:8080/api/tours/${tourId}/guides/${decodedToken.userId}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchTours();
      alert('Successfully joined the tour!');
    } catch (error) {
      console.error('Error joining tour:', error);
      alert('Failed to join tour');
    }
  };

  const handleUpdateTourStatus = async (tourId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/tours/${tourId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchTours();
    } catch (error) {
      console.error('Error updating tour status:', error);
      alert('Failed to update tour status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'GUIDES_PENDING': return 'status-badge pending';
      case 'WAITING_TO_FINISH': return 'status-badge in-progress';
      case 'FINISHED': return 'status-badge finished';
      case 'GIVEN_FEEDBACK': return 'status-badge feedback';
      case 'CANCELLED': return 'status-badge cancelled';
      default: return 'status-badge';
    }
  };

  return (
    <div className="admin-layout">
      <GuideSidebar />
      <div className="admin-content">
        <div className="guide-dashboard-container">
          <div className="view-selector">
            <button 
              className={`view-btn ${selectedView === 'PENDING' ? 'active' : ''}`}
              onClick={() => setSelectedView('PENDING')}
            >
              Available Tours
            </button>
            <button 
              className={`view-btn ${selectedView === 'MY_TOURS' ? 'active' : ''}`}
              onClick={() => setSelectedView('MY_TOURS')}
            >
              My Tours
            </button>
          </div>

          <div className="tours-grid">
            {selectedView === 'PENDING' ? (
              pendingTours.map(tour => (
                <div key={tour.id} className="tour-card">
                  <div className="tour-header">
                    <h3>{tour.schoolName}</h3>
                    <span className={getStatusBadgeClass(tour.status)}>
                      {tour.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="tour-details">
                    <p><strong>Date:</strong> {tour.date}</p>
                    <p><strong>Time:</strong> {tour.time}</p>
                    <p><strong>Group Size:</strong> {tour.groupSize}</p>
                    <p><strong>Guides Required:</strong> {tour.requiredGuides}</p>
                    <p><strong>Guides Assigned:</strong> {tour.assignedGuides?.length || 0}</p>
                    {tour.expectations && (
                      <p><strong>Expectations:</strong> {tour.expectations}</p>
                    )}
                  </div>
                  <div className="tour-actions">
                    <button 
                      className="join-btn"
                      onClick={() => handleJoinTour(tour.id)}
                    >
                      Join Tour
                    </button>
                  </div>
                </div>
              ))
            ) : (
              myTours.map(tour => (
                <div key={tour.id} className="tour-card">
                  <div className="tour-header">
                    <h3>{tour.schoolName}</h3>
                    <span className={getStatusBadgeClass(tour.status)}>
                      {tour.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="tour-details">
                    <p><strong>Date:</strong> {tour.date}</p>
                    <p><strong>Time:</strong> {tour.time}</p>
                    <p><strong>Group Size:</strong> {tour.groupSize}</p>
                    <p><strong>Guides:</strong> {tour.assignedGuides?.length || 0}/{tour.requiredGuides}</p>
                    {tour.feedback && (
                      <div className="feedback-section">
                        <p><strong>Feedback:</strong> {tour.feedback}</p>
                        <p><strong>Rating:</strong> {tour.rating}/5</p>
                      </div>
                    )}
                  </div>
                  <div className="tour-actions">
                    {tour.status === 'WAITING_TO_FINISH' && (
                      <button 
                        onClick={() => handleUpdateTourStatus(tour.id, 'FINISHED')}
                      >
                        Mark as Finished
                      </button>
                    )}
                    {tour.status === 'CANCELLED' && tour.cancellationReason && (
                      <p className="cancellation-reason">
                        <strong>Cancelled:</strong> {tour.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard; 