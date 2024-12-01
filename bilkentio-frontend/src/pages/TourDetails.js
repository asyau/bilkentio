import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/TourDetails.css';

const TourDetails = () => {
  const { tourId } = useParams();
  const [tour, setTour] = useState(null);
  const [availableGuides, setAvailableGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    fetchTourDetails();
    fetchAvailableGuides();
  }, [tourId]);

  const fetchTourDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/tours/${tourId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTour(response.data);
    } catch (error) {
      console.error('Error fetching tour details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGuides = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/guides/available?tourId=${tourId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableGuides(response.data);
    } catch (error) {
      console.error('Error fetching available guides:', error);
    }
  };

  const assignGuide = async (guideId) => {
    try {
      await axios.post(`http://localhost:8080/api/tours/${tourId}/guides/${guideId}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTourDetails();
      fetchAvailableGuides();
    } catch (error) {
      console.error('Error assigning guide:', error);
    }
  };

  const handleCancelTour = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/tours/${tourId}/cancel`,
        { reason: cancellationReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setShowCancellationForm(false);
      fetchTourDetails();
    } catch (error) {
      if (error.response?.status === 400) {
        alert("Cannot cancel a tour that has already started or finished");
      } else {
        console.error('Error cancelling tour:', error);
        alert('Failed to cancel tour');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="tour-details-container">
          <h1>Tour Details</h1>
          
          {tour && (
            <>
              <div className="tour-info">
                <h2>{tour.schoolName}</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Date:</label>
                    <span>{tour.date}</span>
                  </div>
                  <div className="info-item">
                    <label>Time:</label>
                    <span>{tour.time}</span>
                  </div>
                  <div className="info-item">
                    <label>Group Size:</label>
                    <span>{tour.groupSize}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${tour.status.toLowerCase()}`}>
                      {tour.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="guides-section">
                <h3>Assigned Guides</h3>
                <div className="guides-list">
                  {tour.assignedGuides?.map(guide => (
                    <div key={guide.id} className="guide-card">
                      <span className="material-icons">person</span>
                      <div className="guide-info">
                        <h4>{guide.nameSurname}</h4>
                        <p>@{guide.username}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {tour.status === 'GUIDES_PENDING' && (
                  <div className="available-guides">
                    <h3>Available Guides</h3>
                    <div className="guides-list">
                      {availableGuides.map(guide => (
                        <div key={guide.id} className="guide-card">
                          <span className="material-icons">person_add</span>
                          <div className="guide-info">
                            <h4>{guide.nameSurname}</h4>
                            <p>@{guide.username}</p>
                          </div>
                          <button onClick={() => assignGuide(guide.id)}>
                            Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {tour && tour.status === 'GUIDES_PENDING' && !showCancellationForm && (
                <button 
                  className="cancel-tour-btn"
                  onClick={() => setShowCancellationForm(true)}
                >
                  Cancel Tour
                </button>
              )}

              {showCancellationForm && (
                <form className="cancellation-form" onSubmit={handleCancelTour}>
                  <h3>Cancel Tour</h3>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation"
                    required
                  />
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowCancellationForm(false)}>
                      Cancel
                    </button>
                    <button type="submit">
                      Confirm Cancellation
                    </button>
                  </div>
                </form>
              )}

              {tour && tour.status === 'CANCELLED' && tour.cancellationReason && (
                <div className="cancellation-info">
                  <h3>Cancellation Information</h3>
                  <p>{tour.cancellationReason}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourDetails; 