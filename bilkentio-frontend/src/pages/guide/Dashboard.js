import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GuideSidebar from "../../components/GuideSidebar";
import "../../styles/GuideDashboard.css";

const Dashboard = () => {
  const [groupTours, setGroupTours] = useState([]);
  const [individualTours, setIndividualTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableTours();
  }, []);

  const fetchAvailableTours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const [groupResponse, individualResponse] = await Promise.all([
        axios.get("http://localhost:8080/api/tours?status=GUIDES_PENDING", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/api/individual-tours/available", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setGroupTours(groupResponse.data);
      setIndividualTours(individualResponse.data);
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroupTour = async (tourId) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = JSON.parse(atob(token.split(".")[1]));

      await axios.post(
        `http://localhost:8080/api/tours/${tourId}/guides/${decodedToken.userId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchAvailableTours();
      alert("Successfully joined the group tour!");
    } catch (error) {
      console.error("Error joining group tour:", error);
      alert("Failed to join tour");
    }
  };

  const handleJoinIndividualTour = async (tourId) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = JSON.parse(atob(token.split(".")[1]));

      await axios.post(
        `http://localhost:8080/api/individual-tours/${tourId}/join/${decodedToken.userId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchAvailableTours();
      alert("Successfully joined the individual tour!");
    } catch (error) {
      console.error("Error joining individual tour:", error);
      alert("Failed to join tour");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="guide-dashboard">
      <GuideSidebar />
      <div className="dashboard-content">
        <h1>Available Tours</h1>
        <div className="available-tours">
          <div className="tours-section">
            <h2>Available Group Tours</h2>
            <div className="tours-grid">
              {groupTours.map((tour) => (
                <div key={tour.id} className="tour-card">
                  <div className="tour-header">
                    <h3>{tour.schoolName}</h3>
                    <span className="badge badge-primary">
                      {tour.requiredGuides - (tour.assignedGuides?.length || 0)} spots left
                    </span>
                  </div>
                  <div className="tour-content">
                    <p><i className="material-icons">event</i> {tour.date}</p>
                    <p><i className="material-icons">schedule</i> {tour.time}</p>
                    <p><i className="material-icons">group</i> Group Size: {tour.groupSize}</p>
                    {tour.expectations && (
                      <p><i className="material-icons">info</i> {tour.expectations}</p>
                    )}
                  </div>
                  <button 
                    className="join-button"
                    onClick={() => handleJoinGroupTour(tour.id)}
                  >
                    Join Tour
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="tours-section">
            <h2>Available Individual Tours</h2>
            <div className="tours-grid">
              {individualTours.map((tour) => (
                <div key={tour.id} className="tour-card individual">
                  <div className="tour-header">
                    <h3>Individual Tour Request</h3>
                    <span className="badge badge-secondary">1-on-1</span>
                  </div>
                  <div className="tour-content">
                    <p><i className="material-icons">event</i> {tour.date}</p>
                    <p><i className="material-icons">schedule</i> {tour.time}</p>
                    <p><i className="material-icons">location_city</i> {tour.city}</p>
                    <p><i className="material-icons">interests</i> {tour.interests}</p>
                  </div>
                  <button 
                    className="join-button"
                    onClick={() => handleJoinIndividualTour(tour.id)}
                  >
                    Accept Request
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
