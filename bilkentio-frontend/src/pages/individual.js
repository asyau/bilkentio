import React, { useState } from 'react';
import '../styles/GuideMode.css'; // We can reuse most of the styles

const cities = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', /* ... other cities ... */
];

const schools = [
    'TED Ankara College',
    'Ankara Atatürk High School',
    'BLIS - British Language International School',
    'Ankara Science High School',
    'Other'
];

const Individual = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    schoolName: '',
    contactPhone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    expectations: '',
    specialRequirements: '',
    city: '',
    agreeToTerms: false
  });

  const [activeTab, setActiveTab] = useState('form'); // 'form', 'submitted', or 'upcoming'

  const submittedForms = [
    {
      id: 1,
      date: '2024-03-20',
      time: '14:00',
      status: 'Pending'
    },
    // ... more submissions
  ];

  const upcomingTours = [
    {
      id: 1,
      date: '2024-03-25',
      time: '10:00',
      confirmed: true
    },
    // ... more tours
  ];

  const pastTours = [
    {
      id: 1,
      date: '2024-02-15',
      time: '11:00',
      feedback: '',
      rating: 0,
      hasSubmittedFeedback: false
    },
    {
      id: 2,
      date: '2024-01-20',
      time: '14:00',
      feedback: 'Great experience! Very informative tour.',
      rating: 5,
      hasSubmittedFeedback: true
    }
  ];

  const handleFeedbackSubmit = (tourId, feedback, rating) => {
    console.log('Feedback submitted:', { tourId, feedback, rating });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="guide-mode-container">
      <div className="sidebar">
        <div className="user-profile">
          <span className="material-icons profile-icon">account_circle</span>
          <h3>Welcome, User!</h3>
        </div>
        
        <button className="logout-btn">
          <span className="material-icons">logout</span>
          Log out
        </button>

        <div className="nav-buttons">
          <button 
            className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            <span className="material-icons">edit_note</span>
            New Request
          </button>
          <button 
            className={`nav-btn ${activeTab === 'submitted' ? 'active' : ''}`}
            onClick={() => setActiveTab('submitted')}
          >
            <span className="material-icons">history</span>
            Submitted Forms
          </button>
          <button 
            className={`nav-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <span className="material-icons">event</span>
            Upcoming Tours
          </button>
          <button 
            className={`nav-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            <span className="material-icons">history_edu</span>
            Past Tours
          </button>
        </div>
      </div>

      <div className="main-content">
        {activeTab === 'form' ? (
          <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Individual Visit Request Form</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>School</label>
                <select
                  value={formData.schoolName}
                  onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                >
                  <option value="">Select a school</option>
                  {schools.map((school, index) => (
                    <option key={index} value={school}>{school}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Preferred Time *</label>
                <input
                  type="time"
                  required
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                >
                  <option value="">Select a city</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Visit Expectations</label>
                <textarea
                  value={formData.expectations}
                  onChange={(e) => setFormData({...formData, expectations: e.target.value})}
                  placeholder="What would you like to see or learn about during the visit?"
                />
              </div>

              <div className="form-group">
                <label>Special Requirements</label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                  placeholder="Any accessibility requirements or special accommodations needed?"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    required
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
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
        ) : activeTab === 'submitted' ? (
          <div className="submissions-container">
            <h2>Submitted Forms</h2>
            <div className="submissions-list">
              {submittedForms.map(form => (
                <div key={form.id} className="submission-card">
                  <div className="submission-header">
                    <span className="material-icons">description</span>
                    <span className="submission-date">{form.date}</span>
                  </div>
                  <div className="submission-details">
                    <p>Time: {form.time}</p>
                    <p>Status: <span className={`status ${form.status.toLowerCase()}`}>{form.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'upcoming' ? (
          <div className="upcoming-container">
            <h2>Upcoming Tours</h2>
            <div className="tours-list">
              {upcomingTours.map(tour => (
                <div key={tour.id} className="tour-card">
                  <div className="tour-header">
                    <span className="material-icons">event</span>
                    <span className="tour-date">{tour.date}</span>
                  </div>
                  <div className="tour-details">
                    <p>Time: {tour.time}</p>
                    <p>Status: {tour.confirmed ? 'Confirmed' : 'Pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="past-tours-container">
            <h2>Past Tours</h2>
            <div className="tours-list">
              {pastTours.map(tour => (
                <div key={tour.id} className="tour-card past-tour">
                  <div className="tour-header">
                    <span className="material-icons">event_available</span>
                    <span className="tour-date">{tour.date}</span>
                  </div>
                  <div className="tour-details">
                    <p>Time: {tour.time}</p>
                    {!tour.hasSubmittedFeedback ? (
                      <div className="feedback-form">
                        <h4>Leave Feedback</h4>
                        <div className="rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="material-icons star"
                              onClick={() => handleFeedbackSubmit(tour.id, tour.feedback, star)}
                            >
                              {tour.rating >= star ? 'star' : 'star_border'}
                            </span>
                          ))}
                        </div>
                        <textarea
                          placeholder="Share your experience..."
                          value={tour.feedback}
                          onChange={(e) => {
                            console.log('Feedback changed:', e.target.value);
                          }}
                        />
                        <button
                          className="submit-feedback-btn"
                          onClick={() => handleFeedbackSubmit(tour.id, tour.feedback, tour.rating)}
                        >
                          Submit Feedback
                        </button>
                      </div>
                    ) : (
                      <div className="submitted-feedback">
                        <h4>Your Feedback</h4>
                        <div className="rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="material-icons star"
                            >
                              {tour.rating >= star ? 'star' : 'star_border'}
                            </span>
                          ))}
                        </div>
                        <p>{tour.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Individual;
