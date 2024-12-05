import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/TourManagement.css';

const TourManagement = () => {
  const [tours, setTours] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('GUIDES_PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, [selectedStatus]);

  const fetchTours = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/tours?status=${selectedStatus}`, {
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
      await axios.put(`http://localhost:8080/api/tours/${tourId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchTours();
    } catch (error) {
      console.error('Error updating tour status:', error);
    }
  };

  const handleCancelTour = async (tourId) => {
    const reason = prompt("Please enter the cancellation reason:");
    if (!reason) return;

    try {
      await axios.post(`http://localhost:8080/api/tours/${tourId}/cancel`, 
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchTours();
    } catch (error) {
      if (error.response?.status === 400) {
        alert("Cannot cancel a tour that has already started or finished");
      } else {
        console.error('Error cancelling tour:', error);
        alert('Failed to cancel tour');
      }
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="tour-management-container">
          <h1>Tour Management</h1>
          
          <div className="status-filters">
            <button 
              className={selectedStatus === 'GUIDES_PENDING' ? 'active' : ''}
              onClick={() => setSelectedStatus('GUIDES_PENDING')}
            >
              Guides Pending
            </button>
            <button 
              className={selectedStatus === 'WAITING_TO_FINISH' ? 'active' : ''}
              onClick={() => setSelectedStatus('WAITING_TO_FINISH')}
            >
              In Progress
            </button>
            <button 
              className={selectedStatus === 'FINISHED' ? 'active' : ''}
              onClick={() => setSelectedStatus('FINISHED')}
            >
              Finished
            </button>
            <button 
              className={selectedStatus === 'GIVEN_FEEDBACK' ? 'active' : ''}
              onClick={() => setSelectedStatus('GIVEN_FEEDBACK')}
            >
              With Feedback
            </button>
          </div>

          <div className="tours-list">
            {tours.map(tour => (
              <div key={tour.id} className="tour-card">
                <div className="tour-header">
                  <h3>{tour.schoolName}</h3>
                  <span className={`status-badge ${tour.status.toLowerCase()}`}>
                    {tour.status}
                  </span>
                </div>
                <div className="tour-details">
                  <p><strong>Date:</strong> {tour.date}</p>
                  <p><strong>Time:</strong> {tour.time}</p>
                  <p><strong>Group Size:</strong> {tour.groupSize}</p>
                  <p><strong>Guides Required:</strong> {tour.requiredGuides}</p>
                  <p><strong>Assigned Guides:</strong> {tour.assignedGuides?.length || 0}</p>
                </div>
                <div className="tour-actions">
                  {tour.status === 'GUIDES_PENDING' && (
                    <>
                      <button onClick={() => handleStatusChange(tour.id, 'WAITING_TO_FINISH')}>
                        Start Tour
                      </button>
                      <button 
                        className="cancel"
                        onClick={() => handleCancelTour(tour.id)}
                      >
                        Cancel Tour
                      </button>
                    </>
                  )}
                  {tour.status === 'WAITING_TO_FINISH' && (
                    <button onClick={() => handleStatusChange(tour.id, 'FINISHED')}>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourManagement; 