import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CoordinatorSidebar from '../../components/CoordinatorSidebar';
import '../../styles/PuantajScores.css';
import { checkAdminRole } from '../../utils/roleCheck';

const PuantajScores = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [guideDetails, setGuideDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', or 'reviews'

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

  const processMonthlyStats = (tours) => {
    const monthlyData = {};
    const currentDate = new Date();
    const lastYear = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));

    tours.forEach(tour => {
      const tourDate = new Date(tour.date);
      if (tourDate >= lastYear) {
        const monthKey = tourDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, tours]) => ({ month, tours }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const getLastMonthTours = (tours) => {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    return tours.filter(tour => {
      const tourDate = new Date(tour.date);
      return tourDate.getMonth() === lastMonth.getMonth() && 
             tourDate.getFullYear() === lastMonth.getFullYear();
    }).length;
  };

  const fetchGuideDetails = async (guideId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [stats, reviews, completedGroupTours, completedIndividualTours, upcomingTours] = await Promise.all([
        axios.get(`http://localhost:8080/api/guides/${guideId}/stats`, { headers }),
        axios.get(`http://localhost:8080/api/guides/${guideId}/reviews`, { headers }),
        axios.get(`http://localhost:8080/api/guides/${guideId}/tours/completed`, { headers }),
        axios.get(`http://localhost:8080/api/individual-tours/guide/${guideId}`, { headers }),
        axios.get(`http://localhost:8080/api/guides/${guideId}/tours/upcoming`, { headers })
      ]);

      // Filter completed individual tours
      const completedIndividuals = completedIndividualTours.data.filter(
        tour => tour.status === 'FINISHED' || tour.status === 'GIVEN_FEEDBACK'
      );

      // Filter upcoming individual tours
      const upcomingIndividuals = completedIndividualTours.data.filter(
        tour => tour.status === 'WAITING_TO_FINISH'
      );

      // Combine all completed tours
      const allCompletedTours = [...completedGroupTours.data, ...completedIndividuals];

      setGuideDetails({
        stats: {
          ...stats.data,
          lastMonthTours: getLastMonthTours(allCompletedTours),
          totalTours: allCompletedTours.length
        },
        reviews: reviews.data || [],
        tours: {
          completed: allCompletedTours,
          upcoming: {
            groupTours: upcomingTours.data.groupTours || [],
            individualTours: upcomingIndividuals || []
          }
        },
        monthlyStats: processMonthlyStats(allCompletedTours)
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

  const renderTourCard = (tour, type = 'upcoming') => (
    <div key={tour.id} className={`tour-card ${type}`}>
      <div className="tour-date">
        <span className="material-icons">
          {type === 'upcoming' ? 'event' : 'event_available'}
        </span>
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
      {type === 'completed' && tour.rating && (
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
  );

  const renderContent = () => {
    if (!guideDetails) return null;

    switch (activeTab) {
      case 'upcoming':
        return (
          <div className="tours-grid">
            {[
              ...(guideDetails.tours.upcoming.groupTours || []),
              ...(guideDetails.tours.upcoming.individualTours || [])
            ].map(tour => renderTourCard(tour, 'upcoming'))}
          </div>
        );
      case 'completed':
        return (
          <div className="tours-grid">
            {guideDetails.tours.completed.map(tour => renderTourCard(tour, 'completed'))}
          </div>
        );
      case 'reviews':
        return (
          <div className="reviews-grid">
            {guideDetails.reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="review-info">
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                      ))}
                    </div>
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  {review.tourType && (
                    <div className="review-tour-type">
                      {review.tourType}
                    </div>
                  )}
                </div>
                <div className="review-content">
                  <p className="review-text">"{review.feedback}"</p>
                  {review.schoolName && (
                    <div className="review-school">
                      <span className="material-icons">school</span>
                      {review.schoolName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-layout">
      <CoordinatorSidebar />
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
                      <span>{guide.level}</span>
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
                  <div className="tour-stats-section">
                    <div className="section-header">
                      <span className="material-icons">analytics</span>
                      <h3>Tour Statistics</h3>
                    </div>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <span className="material-icons">calendar_month</span>
                        <div className="stat-info">
                          <h4>Last Month Tours</h4>
                          <p>{guideDetails.stats.lastMonthTours || 0}</p>
                        </div>
                      </div>
                      <div className="stat-card">
                        <span className="material-icons">history</span>
                        <div className="stat-info">
                          <h4>Total Tours</h4>
                          <p>{guideDetails.stats.totalTours || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="monthly-chart">
                      <h4>Monthly Tour Activity</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={guideDetails.monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="tours" stroke="#6c63ff" name="Tours" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="content-tabs">
                    <button
                      className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      <span className="material-icons">event</span>
                      Upcoming Tours
                    </button>
                    <button
                      className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                      onClick={() => setActiveTab('completed')}
                    >
                      <span className="material-icons">task_alt</span>
                      Completed Tours
                    </button>
                    <button
                      className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      <span className="material-icons">reviews</span>
                      Reviews
                    </button>
                  </div>

                  <div className="tab-content">
                    {renderContent()}
                  </div>
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
