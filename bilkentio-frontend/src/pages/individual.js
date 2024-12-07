import React, { useState, useEffect } from "react";
import "../styles/GuideMode.css"; // We can reuse most of the styles
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const cities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkâri",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

const schools = [
  "TED Ankara College",
  "Ankara Atatürk High School",
  "BLIS - British Language International School",
  "Ankara Science High School",
  "Other",
];

const Individual = () => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    interests: '',
    contactNumber: '',
    email: '',
    specialRequirements: '',
    visitorNotes: '',
    city: ''
  });

  const [activeTab, setActiveTab] = useState("form");
  const [submittedForms, setSubmittedForms] = useState([]);
  const [upcomingTours, setUpcomingTours] = useState([]);
  const [pastTours, setPastTours] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Get user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        const userId = payload.userId;
        const response = await axios.get(
          `${API_BASE_URL}/api/users/${userId}`,
          getAuthHeader()
        );
        setUsername(response.data.username);
      } catch (err) {
        setError("Failed to fetch user information");
        console.error(err);
      }
    };
    fetchUserInfo();
  }, []);

  // Fetch tours when tab changes
  useEffect(() => {
    fetchMyTours();
  }, [activeTab]);

  const fetchMyTours = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/individual-tours/my-tours`,
        getAuthHeader()
      );
      const tours = response.data;
      console.log(tours);

      // Sort tours based on status
      setSubmittedForms(
        tours.filter((tour) => tour.status === "GUIDES_PENDING")
      );
      setUpcomingTours(
        tours.filter((tour) => tour.status === "WAITING_TO_FINISH")
      );
      setPastTours(
        tours.filter((tour) =>
          ["FINISHED", "GIVEN_FEEDBACK", "CANCELLED"].includes(tour.status)
        )
      );
    } catch (err) {
      setError("Failed to fetch tours");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tourData = {
        date: formData.date,
        time: formData.time,
        interests: formData.interests,
        contactNumber: formData.contactNumber,
        email: formData.email,
        specialRequirements: formData.specialRequirements,
        visitorNotes: formData.visitorNotes,
        city: formData.city
      };

      await axios.post(`${API_BASE_URL}/api/individual-tours`, tourData, getAuthHeader());
      setActiveTab('submitted');
      fetchMyTours();
      
      // Reset form
      setFormData({
        date: '',
        time: '',
        interests: '',
        contactNumber: '',
        email: '',
        specialRequirements: '',
        visitorNotes: '',
        city: ''
      });
    } catch (err) {
      setError('Failed to submit tour request');
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async (tourId, feedback, rating) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/individual-tours/${tourId}/feedback?feedback=${encodeURIComponent(
          feedback
        )}&rating=${rating}`,
        {},
        getAuthHeader()
      );
      fetchMyTours();
    } catch (err) {
      setError("Failed to submit feedback");
      console.error(err);
    }
  };

  const handleCancelTour = async (tourId, reason) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/individual-tours/${tourId}/cancel`,
        reason,
        getAuthHeader()
      );
      fetchMyTours();
    } catch (err) {
      setError("Failed to cancel tour");
      console.error(err);
    }
  };

  const renderSubmissions = () => (
    <div className="submissions-container">
      <h2>Submitted Forms</h2>
      <div className="submissions-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : submittedForms.length === 0 ? (
          <div className="no-data">No pending requests</div>
        ) : (
          submittedForms.map((form) => (
            <div key={form.id} className="submission-card">
              <div className="submission-header">
                <span className="material-icons">description</span>
                <span className="submission-date">{form.date}</span>
              </div>
              <div className="submission-details">
                <p>Time: {form.time}</p>
                <p>
                  Status:{" "}
                  <span className={`status ${form.status.toLowerCase()}`}>
                    {form.status}
                  </span>
                </p>
                <button
                  className="cancel-btn"
                  onClick={() =>
                    handleCancelTour(form.id, "Cancelled by visitor")
                  }
                >
                  Cancel Request
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderError = () =>
    error && (
      <div className="error-message">
        {error}
        <button onClick={() => setError(null)}>✕</button>
      </div>
    );

  const renderUpcomingTours = () => (
    <div className="upcoming-container">
      <h2>Upcoming Tours</h2>
      <div className="tours-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : upcomingTours.length === 0 ? (
          <div className="no-data">No upcoming tours</div>
        ) : (
          upcomingTours.map((tour) => (
            <div key={tour.id} className="tour-card">
              <div className="tour-header">
                <span className="material-icons">event</span>
                <span className="tour-date">{tour.date}</span>
              </div>
              <div className="tour-details">
                <p>Time: {tour.time}</p>
                <p>Status: {tour.status}</p>
                {tour.status === "WAITING_TO_FINISH" && (
                  <button
                    className="cancel-btn"
                    onClick={() =>
                      handleCancelTour(tour.id, "Cancelled by visitor")
                    }
                  >
                    Cancel Tour
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPastTours = () => (
    <div className="past-tours-container">
      <h2>Past Tours</h2>
      <div className="tours-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : pastTours.length === 0 ? (
          <div className="no-data">No past tours</div>
        ) : (
          pastTours.map((tour) => (
            <div key={tour.id} className="tour-card past-tour">
              <div className="tour-header">
                <span className="material-icons">event_available</span>
                <span className="tour-date">{tour.date}</span>
              </div>
              <div className="tour-details">
                <p>Time: {tour.time}</p>
                <p>Status: {tour.status}</p>

                {tour.status === "FINISHED" && (
                  <div className="feedback-form">
                    <h4>Leave Feedback</h4>
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-icons star ${
                            tour.rating >= star ? "filled" : ""
                          }`}
                          onClick={() => {
                            const updatedTour = { ...tour, rating: star };
                            setPastTours(
                              pastTours.map((t) =>
                                t.id === tour.id ? updatedTour : t
                              )
                            );
                          }}
                        >
                          {tour.rating >= star ? "star" : "star_border"}
                        </span>
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your experience..."
                      value={tour.feedback || ""}
                      onChange={(e) => {
                        const updatedTour = {
                          ...tour,
                          feedback: e.target.value,
                        };
                        setPastTours(
                          pastTours.map((t) =>
                            t.id === tour.id ? updatedTour : t
                          )
                        );
                      }}
                    />
                    <button
                      className="submit-feedback-btn"
                      onClick={() =>
                        handleFeedbackSubmit(
                          tour.id,
                          tour.feedback,
                          tour.rating
                        )
                      }
                      disabled={!tour.feedback || !tour.rating}
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}

                {tour.status === "GIVEN_FEEDBACK" && (
                  <div className="submitted-feedback">
                    <h4>Your Feedback</h4>
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="material-icons star">
                          {tour.rating >= star ? "star" : "star_border"}
                        </span>
                      ))}
                    </div>
                    <p>{tour.feedback}</p>
                  </div>
                )}

                {tour.status === "CANCELLED" && (
                  <div className="cancellation-info">
                    <p className="cancellation-reason">
                      Reason: {tour.cancellationReason || "No reason provided"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="guide-mode-container">
      {renderError()}
      <div className="sidebar">
        <div className="user-profile">
          <span className="material-icons profile-icon">account_circle</span>
          <h3>Welcome, {username}!</h3>
        </div>

        <div className="nav-buttons">
          <button
            className={`nav-btn ${activeTab === "form" ? "active" : ""}`}
            onClick={() => setActiveTab("form")}
          >
            <span className="material-icons">edit_note</span>
            New Request
          </button>
          <button
            className={`nav-btn ${activeTab === "submitted" ? "active" : ""}`}
            onClick={() => setActiveTab("submitted")}
          >
            <span className="material-icons">history</span>
            Submitted Forms
          </button>
          <button
            className={`nav-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            <span className="material-icons">event</span>
            Upcoming Tours
          </button>
          <button
            className={`nav-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            <span className="material-icons">history_edu</span>
            Past Tours
          </button>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="material-icons">logout</span>
          Log out
        </button>
      </div>

      <div className="main-content">
        {activeTab === "form" ? (
          <div
            className="form-container"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            <h2>Individual Visit Request Form</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Time *</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Interests</label>
                <textarea
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="What would you like to see or learn about during the visit?"
                />
              </div>

              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Special Requirements</label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  placeholder="Any accessibility requirements or special accommodations needed?"
                />
              </div>

              <div className="form-group">
                <label>Visitor Notes</label>
                <textarea
                  value={formData.visitorNotes}
                  onChange={(e) => setFormData({ ...formData, visitorNotes: e.target.value })}
                  placeholder="Additional notes about your visit"
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                >
                  <option value="">Select a city</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    required
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  />
                  I agree to the terms and conditions *
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === "submitted" ? (
          renderSubmissions()
        ) : activeTab === "upcoming" ? (
          renderUpcomingTours()
        ) : (
          renderPastTours()
        )}
      </div>
    </div>
  );
};

export default Individual;
