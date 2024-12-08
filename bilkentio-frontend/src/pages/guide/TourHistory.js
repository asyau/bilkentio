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

      const [groupResponse, individualResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/guides/${decodedToken.userId}/tours/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:8080/api/guides/${decodedToken.userId}/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Combine and sort tours
      const allCompletedTours = [
        ...groupResponse.data.map(tour => ({ ...tour, isIndividual: false })),
        ...individualResponse.data.map(tour => ({ ...tour, isIndividual: true }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

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
            <div key={tour.id} className="tour-card">
              <div className="tour-header">
                <h3>{tour.isIndividual ? 'Individual Tour' : tour.schoolName}</h3>
                <span className="date">{tour.date}</span>
              </div>
              
              {tour.feedback && (
                <div className="feedback-section">
                  <div className="rating">
                    {'⭐'.repeat(tour.rating)}
                    <span className="rating-number">({tour.rating}/5)</span>
                  </div>
                  <p className="feedback-text">{tour.feedback}</p>
                </div>
              )}

              <div className="tour-content">
                <p><i className="material-icons">schedule</i> {tour.time}</p>
                <p><i className="material-icons">
                  {tour.isIndividual ? 'person' : 'group'}
                </i> {tour.isIndividual ? 'Individual' : `Group of ${tour.groupSize}`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourHistory; 