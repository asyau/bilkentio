import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GuideSidebar from "../../components/GuideSidebar";
import "../../styles/GuideDashboard.css";

const GuideDashboard = () => {
  const [pendingTours, setPendingTours] = useState([]);
  const [pendingIndividualTours, setPendingIndividualTours] = useState([]);
  const [myTours, setMyTours] = useState([]);
  const [myIndividualTours, setMyIndividualTours] = useState([]);
  const [selectedView, setSelectedView] = useState("PENDING"); // 'PENDING', 'INDIVIDUAL_PENDING', 'MY_TOURS', 'MY_INDIVIDUAL_TOURS'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTours();
  }, [selectedView]);

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));

      switch (selectedView) {
        case "PENDING":
          const groupResponse = await axios.get(
            "http://localhost:8080/api/tours?status=GUIDES_PENDING",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPendingTours(groupResponse.data);
          break;

        case "INDIVIDUAL_PENDING":
          const individualResponse = await axios.get(
            "http://localhost:8080/api/individual-tours/available",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPendingIndividualTours(individualResponse.data);
          break;

        case "MY_TOURS":
          const myGroupResponse = await axios.get(
            `http://localhost:8080/api/tours/guide/${decodedToken.userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setMyTours(myGroupResponse.data);
          break;

        case "MY_INDIVIDUAL_TOURS":
          const myIndividualResponse = await axios.get(
            `http://localhost:8080/api/individual-tours/guide/${decodedToken.userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setMyIndividualTours(myIndividualResponse.data);
          break;
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
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

      fetchTours();
      alert("Successfully joined the individual tour!");
    } catch (error) {
      console.error("Error joining individual tour:", error);
      alert("Failed to join tour");
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
      fetchTours();
    } catch (error) {
      console.error("Error updating tour status:", error);
      alert("Failed to update tour status");
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

      fetchTours();
      alert("Successfully joined the group tour!");
    } catch (error) {
      console.error("Error joining group tour:", error);
      alert("Failed to join tour");
    }
  };

  const handleUpdateIndividualTourStatus = async (tourId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/individual-tours/${tourId}/complete`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTours();
      alert('Tour marked as completed!');
    } catch (error) {
      console.error("Error updating individual tour status:", error);
      alert("Failed to update tour status");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "GUIDES_PENDING":
        return "status-badge pending";
      case "WAITING_TO_FINISH":
        return "status-badge in-progress";
      case "FINISHED":
        return "status-badge finished";
      case "GIVEN_FEEDBACK":
        return "status-badge feedback";
      case "CANCELLED":
        return "status-badge cancelled";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="admin-layout">
      <GuideSidebar />
      <div className="admin-content">
        <div className="guide-dashboard-container">
          <div className="view-selector">
            <button
              className={`view-btn ${
                selectedView === "PENDING" ? "active" : ""
              }`}
              onClick={() => setSelectedView("PENDING")}
            >
              Available Group Tours
            </button>
            <button
              className={`view-btn ${
                selectedView === "INDIVIDUAL_PENDING" ? "active" : ""
              }`}
              onClick={() => setSelectedView("INDIVIDUAL_PENDING")}
            >
              Available Individual Tours
            </button>
            <button
              className={`view-btn ${
                selectedView === "MY_TOURS" ? "active" : ""
              }`}
              onClick={() => setSelectedView("MY_TOURS")}
            >
              My Group Tours
            </button>
            <button
              className={`view-btn ${
                selectedView === "MY_INDIVIDUAL_TOURS" ? "active" : ""
              }`}
              onClick={() => setSelectedView("MY_INDIVIDUAL_TOURS")}
            >
              My Individual Tours
            </button>
          </div>

          <div className="tours-grid">
            {selectedView === "INDIVIDUAL_PENDING"
              ? pendingIndividualTours.map((tour) => (
                  <div key={tour.id} className="tour-card individual">
                    <div className="tour-header">
                      <h3>Individual Tour</h3>
                      <span className={getStatusBadgeClass(tour.status)}>
                        {tour.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="tour-details">
                      <p>
                        <strong>Date:</strong> {tour.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {tour.time}
                      </p>
                      <p>
                        <strong>City:</strong> {tour.city}
                      </p>
                      <p>
                        <strong>Interests:</strong> {tour.interests}
                      </p>
                      {tour.specialRequirements && (
                        <p>
                          <strong>Special Requirements:</strong>{" "}
                          {tour.specialRequirements}
                        </p>
                      )}
                    </div>
                    <div className="tour-actions">
                      <button
                        className="join-btn"
                        onClick={() => handleJoinIndividualTour(tour.id)}
                      >
                        Join Individual Tour
                      </button>
                    </div>
                  </div>
                ))
              : selectedView === "MY_INDIVIDUAL_TOURS"
              ? myIndividualTours.map((tour) => (
                  <div key={tour.id} className="tour-card individual">
                    <div className="tour-header">
                      <h3>Individual Tour</h3>
                      <span className={getStatusBadgeClass(tour.status)}>
                        {tour.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="tour-details">
                      <p>
                        <strong>Date:</strong> {tour.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {tour.time}
                      </p>
                      <p>
                        <strong>City:</strong> {tour.city}
                      </p>
                      {tour.feedback && (
                        <div className="feedback-section">
                          <p>
                            <strong>Feedback:</strong> {tour.feedback}
                          </p>
                          <p>
                            <strong>Rating:</strong> {tour.rating}/5
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="tour-actions">
                      {tour.status === "WAITING_TO_FINISH" && (
                        <button
                          onClick={() => handleUpdateIndividualTourStatus(tour.id, "FINISHED")}
                        >
                          Mark as Finished
                        </button>
                      )}
                    </div>
                  </div>
                ))
              : selectedView === "PENDING"
              ? pendingTours.map((tour) => (
                  <div key={tour.id} className="tour-card">
                    <div className="tour-header">
                      <h3>{tour.schoolName}</h3>
                      <span className={getStatusBadgeClass(tour.status)}>
                        {tour.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="tour-details">
                      <p>
                        <strong>Date:</strong> {tour.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {tour.time}
                      </p>
                      <p>
                        <strong>Group Size:</strong> {tour.groupSize}
                      </p>
                      <p>
                        <strong>Guides Required:</strong> {tour.requiredGuides}
                      </p>
                      <p>
                        <strong>Guides Assigned:</strong>{" "}
                        {tour.assignedGuides?.length || 0}
                      </p>
                      {tour.expectations && (
                        <p>
                          <strong>Expectations:</strong> {tour.expectations}
                        </p>
                      )}
                    </div>
                    <div className="tour-actions">
                      <button
                        className="join-btn"
                        onClick={() => handleJoinGroupTour(tour.id)}
                      >
                        Join Group Tour
                      </button>
                    </div>
                  </div>
                ))
              : myTours.map((tour) => (
                  <div key={tour.id} className="tour-card">
                    <div className="tour-header">
                      <h3>{tour.schoolName}</h3>
                      <span className={getStatusBadgeClass(tour.status)}>
                        {tour.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="tour-details">
                      <p>
                        <strong>Date:</strong> {tour.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {tour.time}
                      </p>
                      <p>
                        <strong>Group Size:</strong> {tour.groupSize}
                      </p>
                      <p>
                        <strong>Guides:</strong>{" "}
                        {tour.assignedGuides?.length || 0}/{tour.requiredGuides}
                      </p>
                      {tour.feedback && (
                        <div className="feedback-section">
                          <p>
                            <strong>Feedback:</strong> {tour.feedback}
                          </p>
                          <p>
                            <strong>Rating:</strong> {tour.rating}/5
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="tour-actions">
                      {tour.status === "WAITING_TO_FINISH" && (
                        <button
                          onClick={() =>
                            handleUpdateTourStatus(tour.id, "FINISHED")
                          }
                        >
                          Mark as Finished
                        </button>
                      )}
                      {tour.status === "CANCELLED" &&
                        tour.cancellationReason && (
                          <p className="cancellation-reason">
                            <strong>Cancelled:</strong>{" "}
                            {tour.cancellationReason}
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

export default GuideDashboard;
