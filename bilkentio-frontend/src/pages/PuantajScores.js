import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/PuantajScores.css';
import { checkAdminRole } from '../utils/roleCheck';

const PuantajScores = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [guideDetails, setGuideDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initializeComponent = async () => {
      const { isAuthorized, error } = await checkAdminRole();
      if (!isAuthorized) {
        navigate(error === 'No token found' ? '/login' : '/unauthorized');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/guides', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setGuides(response.data);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [navigate]);

  const fetchGuideDetails = async (guideId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [stats, reviews, tours] = await Promise.all([
        axios.get(`http://localhost:8080/api/guides/${guideId}/stats`, { headers }),
        axios.get(`http://localhost:8080/api/guides/${guideId}/reviews`, { headers }),
        axios.get(`http://localhost:8080/api/guides/${guideId}/tours`, { headers })
      ]);

      setGuideDetails({
        stats: stats.data,
        reviews: reviews.data || [],
        tours: tours.data || {}
      });
    } catch (error) {
      console.error('Error fetching guide details:', error);
      setGuideDetails(null);
    }
  };

  const handleGuideSelect = (guide) => {
    if (selectedGuide?.id === guide.id) {
      setSelectedGuide(null);
      setGuideDetails(null);
    } else {
      setSelectedGuide(guide);
      fetchGuideDetails(guide.id);
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.nameSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="puantaj-container">
          <div className="dashboard-header">
            <h1>Guide Performance Dashboard</h1>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="material-icons">search</span>
            </div>
          </div>

          <div className="guides-section">
            {filteredGuides.map(guide => (
              <div 
                key={guide.id}
                className="guide-card"
                onClick={() => handleGuideSelect(guide)}
              >
                <div className="guide-header">
                  <div className="guide-info">
                    <h3>{guide.nameSurname}</h3>
                    <span className="username">@{guide.username}</span>
                  </div>
                  <div className="guide-stats">
                    <div className="stat">
                      <span className="material-icons">military_tech</span>
                      <span>Level {guide.level}</span>
                    </div>
                    <div className="stat">
                      <span className="material-icons">stars</span>
                      <span>{guide.score} pts</span>
                    </div>
                    <div className="stat">
                      <span className="material-icons">grade</span>
                      <span>{guide.averageRating?.toFixed(1) || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedGuide && guideDetails && (
            <div className="modal-overlay" onClick={() => setSelectedGuide(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="guide-profile">
                    <h2>{selectedGuide.nameSurname}</h2>
                    <span className="username">@{selectedGuide.username}</span>
                  </div>
                  <div className="guide-metrics">
                    <div className="metric">
                      <span className="material-icons">military_tech</span>
                      <div className="metric-details">
                        <span className="label">Level</span>
                        <span className="value">{selectedGuide.level}</span>
                      </div>
                    </div>
                    <div className="metric">
                      <span className="material-icons">stars</span>
                      <div className="metric-details">
                        <span className="label">Total Score</span>
                        <span className="value">{selectedGuide.score}</span>
                      </div>
                    </div>
                    <div className="metric">
                      <span className="material-icons">grade</span>
                      <div className="metric-details">
                        <span className="label">Rating</span>
                        <span className="value">{selectedGuide.averageRating?.toFixed(1) || '-'} ★</span>
                      </div>
                    </div>
                  </div>
                  <button className="close-btn" onClick={() => setSelectedGuide(null)}>
                    <span className="material-icons">close</span>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="tours-section">
                    <div className="section-header">
                      <span className="material-icons">event</span>
                      <h3>Upcoming Tours</h3>
                    </div>
                    <div className="tours-list">
                      {[...guideDetails.tours.upcomingIndividualTours || [], 
                        ...guideDetails.tours.upcomingGroupTours || []
                      ].map((tour, index) => (
                        <div key={index} className="tour-card">
                          <div className="tour-date">
                            <span className="material-icons">calendar_today</span>
                            {new Date(tour.date).toLocaleDateString()}
                          </div>
                          <div className="tour-badge">
                            {tour.schoolName ? 'Group Tour' : 'Individual Tour'}
                          </div>
                          <div className="tour-info">
                            <p><span className="material-icons">location_on</span> {tour.city}</p>
                            {tour.schoolName && <p><span className="material-icons">school</span> {tour.schoolName}</p>}
                            {tour.groupSize && <p><span className="material-icons">group</span> {tour.groupSize} people</p>}
                            {tour.interests && <p><span className="material-icons">interests</span> {tour.interests}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="completed-tours-section">
                    <div className="section-header">
                      <span className="material-icons">task_alt</span>
                      <h3>Completed Tours</h3>
                    </div>
                    <div className="tours-list">
                      {[...guideDetails.tours.completedIndividualTours || [], 
                        ...guideDetails.tours.completedGroupTours || []
                      ].map((tour, index) => (
                        <div key={index} className="tour-card completed">
                          <div className="tour-date">
                            <span className="material-icons">event_available</span>
                            {new Date(tour.date).toLocaleDateString()}
                          </div>
                          <div className="tour-badge">
                            {tour.schoolName ? 'Group Tour' : 'Individual Tour'}
                          </div>
                          <div className="tour-info">
                            <p><span className="material-icons">location_on</span> {tour.city}</p>
                            {tour.schoolName && <p><span className="material-icons">school</span> {tour.schoolName}</p>}
                            {tour.groupSize && <p><span className="material-icons">group</span> {tour.groupSize} people</p>}
                          </div>
                          {tour.rating && (
                            <div className="tour-feedback">
                              <div className="rating">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`star ${i < tour.rating ? 'filled' : ''}`}>★</span>
                                ))}
                              </div>
                              {tour.feedback && <p className="feedback-text">"{tour.feedback}"</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="reviews-section">
                <div className="section-header">
                  <span className="material-icons">reviews</span>
                      <h3>Recent Reviews</h3>
                    </div>
                    <div className="reviews-list">
                      {guideDetails.reviews.map((review, index) => (
                        <div key={index} className="review-card">
                          <div className="review-header">
                            <div className="rating">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                              ))}
                            </div>
                            <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <p className="review-text">"{review.feedback}"</p>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuantajScores;
