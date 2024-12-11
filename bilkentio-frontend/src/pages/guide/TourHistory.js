import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GuideSidebar from "../../components/GuideSidebar";
import "../../styles/GuideDashboard.css";

const TourHistory = () => {
  const [completedTours, setCompletedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompletedTours();
  }, []);

  const fetchCompletedTours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      
      const response = await axios.get(
        `http://localhost:8080/api/guides/${decodedToken.userId}/tours`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const groupTours = response.data.completedGroupTours.map(tour => ({
        ...tour,
        tourType: 'group',
        uniqueId: `group-${tour.id}`
      }));

      const individualTours = response.data.completedIndividualTours.map(tour => ({
        ...tour,
        tourType: 'individual',
        uniqueId: `individual-${tour.id}`
      }));

      // Combine and sort tours
      const allCompletedTours = [...groupTours, ...individualTours]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setCompletedTours(allCompletedTours);
    } catch (error) {
      console.error("Error fetching completed tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalTours = completedTours.length;
    const ratedTours = completedTours.filter(tour => tour.rating);
    const averageRating = ratedTours.length > 0
      ? ratedTours.reduce((acc, tour) => acc + tour.rating, 0) / ratedTours.length
      : 0;

    return { totalTours, averageRating };
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const stats = calculateStats();

  return (
    <div className="guide-dashboard">
      <GuideSidebar />
      <div className="dashboard-content">
        <h1>Tour History</h1>
        
        <div className="stats-summary">
          <div className="stat-card">
            <h3>Total Completed Tours</h3>
            <p>{stats.totalTours}</p>
          </div>
          <div className="stat-card">
            <h3>Average Rating</h3>
            <p>{stats.averageRating.toFixed(1)} ⭐</p>
          </div>
        </div>

        <div className="tours-grid">
          {completedTours.map((tour) => (
            <div key={tour.uniqueId} className="tour-card">
              <div className="tour-header">
                <h3>{tour.tourType === 'individual' ? 'Individual Tour' : tour.schoolName}</h3>
                <span className="badge">{tour.tourType === 'individual' ? 'Individual Tour' : 'Group Tour'}</span>
              </div>
              <div className="tour-details">
                <p><i className="material-icons">event</i> {tour.date}</p>
                <p><i className="material-icons">schedule</i> {tour.time}</p>
                {tour.tourType === 'group' && tour.groupSize && (
                  <p><i className="material-icons">group</i> Group Size: {tour.groupSize}</p>
                )}
              </div>
              {tour.feedback && (
                <div className="feedback-section">
                  <h4>{tour.tourType === 'individual' ? 'Visitor Feedback' : 'Counselor Feedback'}</h4>
                  <div className="rating">
                    {'⭐'.repeat(tour.rating)}
                    <span className="rating-number">({tour.rating}/5)</span>
                  </div>
                  <p className="feedback-text">{tour.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourHistory; 