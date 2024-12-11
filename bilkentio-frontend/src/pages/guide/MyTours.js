import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GuideSidebar from "../../components/GuideSidebar";
import "../../styles/GuideDashboard.css";

const MyTours = () => {
  const [myTours, setMyTours] = useState([]);
  const [myIndividualTours, setMyIndividualTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTours();
  }, []);

  const fetchMyTours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));

      const [groupResponse, individualResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/tours/guide/${decodedToken.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:8080/api/individual-tours/guide/${decodedToken.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMyTours(groupResponse.data);
      setMyIndividualTours(individualResponse.data);
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTourStatus = async (tourId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/tours/${tourId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyTours();
    } catch (error) {
      console.error("Error updating tour status:", error);
      alert("Failed to update tour status");
    }
  };

  const handleCompleteIndividualTour = async (tourId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/individual-tours/${tourId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyTours();
    } catch (error) {
      console.error("Error completing individual tour:", error);
      alert("Failed to complete individual tour");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="guide-dashboard">
      <GuideSidebar />
      <div className="dashboard-content">
        <h1>My Tours</h1>
        <div className="tours-section">
          <h2>Group Tours</h2>
          <div className="tours-grid">
            {myTours.map((tour) => (
              <div key={tour.id} className="tour-card">
                <div className="tour-header">
                  <h3>{tour.schoolName}</h3>
                  <span className="badge badge-primary">{tour.status}</span>
                </div>
                <div className="tour-content">
                  <p><i className="material-icons">event</i> {tour.date}</p>
                  <p><i className="material-icons">schedule</i> {tour.time}</p>
                  <p><i className="material-icons">group</i> Group Size: {tour.groupSize}</p>
                </div>
                {tour.status === "WAITING_TO_FINISH" && (
                  <button
                    className="join-button"
                    onClick={() => handleUpdateTourStatus(tour.id, "FINISHED")}
                  >
                    Mark as Finished
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="tours-section">
          <h2>Individual Tours</h2>
          <div className="tours-grid">
            {myIndividualTours.map((tour) => (
              <div key={tour.id} className="tour-card individual">
                <div className="tour-header">
                  <h3>Individual Tour</h3>
                  <span className="badge badge-secondary">{tour.status}</span>
                </div>
                <div className="tour-content">
                  <p><i className="material-icons">event</i> {tour.date}</p>
                  <p><i className="material-icons">schedule</i> {tour.time}</p>
                  <p><i className="material-icons">location_city</i> {tour.city}</p>
                </div>
                {tour.status === "WAITING_TO_FINISH" && (
                  <button
                    className="join-button"
                    onClick={() => handleCompleteIndividualTour(tour.id)}
                  >
                    Mark as Finished
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTours; 