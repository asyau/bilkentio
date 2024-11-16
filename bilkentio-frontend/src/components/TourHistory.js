import React, { useState } from 'react';
import '../styles/TourHistory.css';

const previousTours = [
  {
    id: 1,
    date: '15 Kasım 2024',
    time: '14:00 - 15:00',
    school: 'TED Ankara College',
    groupSize: 25,
    hasGivenFeedback: false,
    status: 'completed'
  },
  {
    id: 2,
    date: '10 Kasım 2024',
    time: '11:00 - 12:00',
    school: 'TED Ankara College',
    groupSize: 30,
    hasGivenFeedback: true,
    status: 'completed'
  },
  {
    id: 3,
    date: '25 Kasım 2024',
    time: '13:00 - 14:00',
    school: 'TED Ankara College',
    groupSize: 20,
    hasGivenFeedback: false,
    status: 'upcoming'
  }
];

const FeedbackForm = ({ tour, onClose, onSubmit }) => {
  const [feedbackData, setFeedbackData] = useState({
    rating: '',
    punctuality: '',
    engagement: '',
    behavior: '',
    comments: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(tour.id, feedbackData);
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2>Tour Feedback</h2>
        <div className="selected-tour-info">
          <h3>{tour.school}</h3>
          <p>{tour.date} | {tour.time}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Overall Rating *</label>
            <select
              required
              value={feedbackData.rating}
              onChange={(e) => setFeedbackData({...feedbackData, rating: e.target.value})}
            >
              <option value="">Select rating</option>
              {[5,4,3,2,1].map(num => (
                <option key={num} value={num}>{num} Stars</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Group Punctuality *</label>
            <select
              required
              value={feedbackData.punctuality}
              onChange={(e) => setFeedbackData({...feedbackData, punctuality: e.target.value})}
            >
              <option value="">Select rating</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Student Engagement *</label>
            <select
              required
              value={feedbackData.engagement}
              onChange={(e) => setFeedbackData({...feedbackData, engagement: e.target.value})}
            >
              <option value="">Select rating</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="form-group">
            <label>Group Behavior *</label>
            <select
              required
              value={feedbackData.behavior}
              onChange={(e) => setFeedbackData({...feedbackData, behavior: e.target.value})}
            >
              <option value="">Select rating</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Comments</label>
            <textarea
              value={feedbackData.comments}
              onChange={(e) => setFeedbackData({...feedbackData, comments: e.target.value})}
              placeholder="Please provide any additional comments or observations"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TourHistory = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tours, setTours] = useState(previousTours);

  const handleFeedbackSubmit = (tourId, feedbackData) => {
    console.log('Feedback submitted for tour', tourId, ':', feedbackData);
    // Update the tour's feedback status
    setTours(tours.map(tour => 
      tour.id === tourId ? {...tour, hasGivenFeedback: true} : tour
    ));
    setShowFeedbackForm(false);
    setSelectedTour(null);
  };

  const openFeedbackForm = (tour) => {
    setSelectedTour(tour);
    setShowFeedbackForm(true);
  };

  return (
    <div className="tour-history-container">
      <h2 style={{ fontWeight: 'bold' }}>Tour History</h2>
      
      <div className="tour-list">
        <div className="tour-list-header">
          <h3>Completed Tours</h3>
        </div>
        {tours
          .filter(tour => tour.status === 'completed')
          .map(tour => (
            <div key={tour.id} className="tour-item">
              <div className="tour-info">
                <h3 style={{ fontWeight: 'bold' }}>{tour.date} | {tour.time}</h3>
                <p style={{ fontWeight: 'normal' }}>{tour.school}</p>
                <p>Group Size: {tour.groupSize}</p>
              </div>
              {!tour.hasGivenFeedback ? (
                <button 
                  className="feedback-btn"
                  onClick={() => openFeedbackForm(tour)}
                >
                  Give Feedback
                </button>
              ) : (
                <span className="feedback-status">Feedback Submitted</span>
              )}
            </div>
          ))}
          
        <div className="tour-list-header">
          <h3>Upcoming Tours</h3>
        </div>
        {tours
          .filter(tour => tour.status === 'upcoming')
          .map(tour => (
            <div key={tour.id} className="tour-item upcoming">
              <div className="tour-info">
                <h3>{tour.school}</h3>
                <p>{tour.date} | {tour.time}</p>
                <p>Group Size: {tour.groupSize}</p>
              </div>
              <span className="status-badge">Upcoming</span>
            </div>
          ))}
      </div>

      {showFeedbackForm && selectedTour && (
        <FeedbackForm
          tour={selectedTour}
          onClose={() => {
            setShowFeedbackForm(false);
            setSelectedTour(null);
          }}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default TourHistory; 