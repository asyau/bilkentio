import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GuideSidebar from "../../components/GuideSidebar";
import "../../styles/GuideDashboard.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const response = await axios.get(
        `http://localhost:8080/api/guides/${decodedToken.userId}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="guide-dashboard">
      <GuideSidebar />
      <div className="dashboard-content">
        <h1>Guide Profile</h1>
        
        <div className="profile-header">
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <p className="level-badge">{profile.level}</p>
          </div>
          <div className="profile-score">
            <h3>Score</h3>
            <p className="score">{profile.score}</p>
          </div>
        </div>

        <div className="stats-summary">
          <div className="stat-card">
            <i className="material-icons stat-icon">work</i>
            <h3>Experience</h3>
            <p>{profile.yearsOfExperience}</p>
            <div className="stat-label">Years as Guide</div>
          </div>
          <div className="stat-card">
            <i className="material-icons stat-icon">star</i>
            <h3>Rating</h3>
            <p>
              {profile.averageRating.toFixed(1)}
              <span style={{ color: '#ffc107' }}>★</span>
            </p>
            <div className="stat-label">Average Tour Rating</div>
          </div>
          <div className="stat-card">
            <i className="material-icons stat-icon">tour</i>
            <h3>Total Tours</h3>
            <p>{profile.totalCompletedTours}</p>
            <div className="stat-label">Completed Tours</div>
          </div>
          <div className="stat-card">
            <i className="material-icons stat-icon">event</i>
            <h3>This Month</h3>
            <p>{profile.currentMonthTours}</p>
            <div className="stat-label">Tours in Current Month</div>
          </div>
          <div className="stat-card">
            <i className="material-icons stat-icon">calendar_today</i>
            <h3>This Year</h3>
            <p>{profile.currentYearTours}</p>
            <div className="stat-label">Tours in Current Year</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 