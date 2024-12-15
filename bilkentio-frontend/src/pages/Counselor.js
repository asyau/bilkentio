// src/GuideMode.js
import React, { useState, useEffect } from 'react';
import '../styles/GuideMode.css';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { cities } from '../constants/cities';
import FairRequest from './counselor/FairRequest';

const schools = [
  'TED Ankara College',
  'Ankara Atatürk High School',
  'BLIS - British Language International School',
  'Ankara Science High School',
  'Other'
];

const Counselor = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showTourHistory, setShowTourHistory] = useState(false);
  const [myForms, setMyForms] = useState([]);
  const [showMyForms, setShowMyForms] = useState(false);
  const [days, setDays] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [feedback, setFeedback] = useState({ feedback: '', rating: 0 });
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [tourToCancel, setTourToCancel] = useState(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    city: '',
    fairDate: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    expectedStudents: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-icons star ${star <= rating ? 'filled' : ''}`}
            onClick={() => onRatingChange(star)}
          >
            {star <= rating ? 'star' : 'star_border'}
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Decode JWT token to get user info
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser(decodedToken);
      fetchMyForms(decodedToken.id); // Fetch forms when user is loaded
    } catch (error) {
      console.error('Error decoding token:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchWeekDays(currentWeekStart);
  }, [currentWeekStart]);

  const fetchWeekDays = async (date) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`http://localhost:8080/api/days/week?date=${formattedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        setDays(response.data);
      } else {
        console.error('Invalid data format received:', response.data);
        setDays([]);
      }
    } catch (error) {
      console.error('Error fetching days:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setDays([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const getSlotClass = (slot) => {
    switch (slot.status) {
      case 'UNAVAILABLE':
        return 'time-slot unavailable';
      case 'FORM_REQUESTED':
        return 'time-slot form-requested';
      default:
        return 'time-slot available';
    }
  };

  const handleSlotClick = (slot, day) => {
    if (slot.status === 'UNAVAILABLE') {
      alert('This slot is not available');
      return;
    }

    if (slot.status === 'FORM_REQUESTED') {
      if (!window.confirm('A form has already been requested for this slot. Would you still like to apply?')) {
        return;
      }
    }

    setSelectedSlot({ ...slot, day });
    setShowForm(true);
  };

  const TourRequestForm = ({ onClose, slot }) => {
    const [formData, setFormData] = useState({
      groupSize: '',
      contactPhone: '',
      expectations: '',
      specialRequirements: '',
      groupLeaderRole: '',
      groupLeaderPhone: '',
      groupLeaderEmail: '',
      visitorNotes: '',
      agreeToTerms: false
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.post('http://localhost:8080/api/forms', {
          ...formData,
          slotId: selectedSlot.id,
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Form submitted:', response.data);
        fetchWeekDays(currentWeekStart);
        if (user) {
          fetchMyForms(user.id);
        }
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 409) {
          alert('You already have a submitted form for this time slot.');
        } else {
          alert('Failed to submit form. Please try again.');
        }
      }
    };

    return (
      <div className="form-overlay">
        <div className="form-container">
          <h2>Tour Request Form</h2>
          <p className="selected-slot">Selected Time: {slot.time} on {slot.date}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Number of Participants *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.groupSize}
                onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Contact Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Group Leader Role *</label>
              <input
                type="text"
                required
                value={formData.groupLeaderRole}
                onChange={(e) => setFormData({ ...formData, groupLeaderRole: e.target.value })}
                placeholder="Example: Guide Teacher, Subject Teacher, Administrator, etc."
              />
            </div>

            <div className="form-group">
              <label>Group Leader Mobile Phone *</label>
              <input
                type="tel"
                required
                value={formData.groupLeaderPhone}
                onChange={(e) => setFormData({ ...formData, groupLeaderPhone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Group Leader Email *</label>
              <input
                type="email"
                required
                value={formData.groupLeaderEmail}
                onChange={(e) => setFormData({ ...formData, groupLeaderEmail: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Visitor Notes</label>
              <textarea
                value={formData.visitorNotes}
                onChange={(e) => setFormData({ ...formData, visitorNotes: e.target.value })}
                placeholder="Any additional information or special requests"
              />
            </div>

            <div className="form-group">
              <label>Tour Expectations</label>
              <textarea
                value={formData.expectations}
                onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                placeholder="What would you like to see or learn about during the tour?"
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
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const fetchMyForms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/forms/my-forms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('My Forms Response:', {
        raw: response.data,
        firstForm: response.data[0],
        structure: response.data[0] ? Object.keys(response.data[0]) : []
      });
      setMyForms(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchTours = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/tours/counselor/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTours(response.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedback.rating === 0) {
      alert('Please provide a rating');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/tours/${selectedTour.id}/feedback`,
        feedback,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setShowFeedbackForm(false);
      setSelectedTour(null);
      setFeedback({ feedback: '', rating: 0 });
      console.log(user)
      if (user) {
        fetchTours(user.userId);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'GUIDES_PENDING': return 'status-badge pending';
      case 'WAITING_TO_FINISH': return 'status-badge in-progress';
      case 'FINISHED': return 'status-badge finished';
      case 'GIVEN_FEEDBACK': return 'status-badge feedback';
      case 'CANCELLED': return 'status-badge cancelled';
      default: return 'status-badge';
    }
  };

  const handleCancelForm = async (formId) => {
    if (!window.confirm('Are you sure you want to cancel this form? The form will be automatically denied.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/forms/${formId}/status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { newState: 'DENIED' }
        }
      );

      // Refresh the forms list
      fetchMyForms();
    } catch (error) {
      console.error('Error cancelling form:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to cancel this form.');
      } else {
        alert('Failed to cancel form. Please try again.');
      }
    }
  };

  const handleCancelTour = async (tour) => {
    setTourToCancel(tour);
    setShowCancellationForm(true);
  };

  const submitCancellation = async (e) => {
    e.preventDefault();
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/tours/${tourToCancel.id}/cancel`,
        { reason: cancellationReason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh tours list
      if (user) {
        fetchTours(user.userId);
      }

      // Reset form
      setShowCancellationForm(false);
      setTourToCancel(null);
      setCancellationReason('');
    } catch (error) {
      console.error('Error cancelling tour:', error);
      alert('Failed to cancel tour: ' + (error.response?.data || error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/fairs/request', {
        ...formData,
        counselorId: localStorage.getItem('userId'),
        fairDate: new Date(formData.fairDate).toISOString().split('T')[0]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSuccess('Fair request submitted successfully!');
      setError('');
      setFormData({
        schoolName: '',
        city: '',
        fairDate: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        expectedStudents: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting fair request');
      setSuccess('');
    }
  };

  return (
    <div className="guide-mode-container">
      <div className="sidebar">
        <div className="user-profile">
          <span className="material-icons profile-icon">account_circle</span>
          <h3>Welcome, {user?.sub || 'User'}!</h3>
        </div>

        <nav className="sidebar-nav">
          <button
            className="sidebar-btn"
            onClick={() => navigate('/counselor')}
          >
            <span className="material-icons">calendar_today</span>
            See Schedule
          </button>
          <button
            className="sidebar-btn"
            onClick={() => {
              navigate('/counselor/tour-history');
              if (user) {
                fetchTours(user.userId);
              }
            }}
          >
            <span className="material-icons">history</span>
            Tour History
          </button>
          <button
            className="sidebar-btn"
            onClick={() => navigate('/counselor/my-forms')}
          >
            <span className="material-icons">history</span>
            My Forms
          </button>
          <button
            className="sidebar-btn"
            onClick={() => navigate('/counselor/request-fair')}
          >
            <span className="material-icons">event_available</span>
            Request Fair
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="material-icons">logout</span>
          Log out
        </button>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={
            <div className="schedule-view">
              <div className="schedule-header">
                <button className="nav-button prev-week" onClick={handlePrevWeek}>
                  <span className="material-icons">chevron_left</span>
                  Previous Week
                </button>
                <span className="date-range">
                  {format(currentWeekStart, 'dd MMM yyyy')} - {format(addDays(currentWeekStart, 6), 'dd MMM yyyy')}
                </span>
                <button className="nav-button next-week" onClick={handleNextWeek}>
                  Next Week
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
              <div className="weekly-schedule">
                {loading ? (
                  <div className="loading-spinner">Loading...</div>
                ) : days.length > 0 ? (
                  days.map((day, index) => (
                    <div key={`${day.date}-${index}`} className="day-column">
                      <div className="day-header">
                        <div>{format(new Date(day.date), 'dd MMM')}</div>
                        <div>{format(new Date(day.date), 'EEEE')}</div>
                      </div>
                      {day.slots && day.slots.map((slot, slotIndex) => (
                        <div
                          key={`${slot.id}-${slotIndex}`}
                          className={getSlotClass(slot)}
                          onClick={() => handleSlotClick(slot, day)}
                        >
                          <span>{slot.time}</span>
                          {slot.status === 'FORM_REQUESTED' && (
                            <span className="material-icons status-icon">description</span>
                          )}
                          {slot.status === 'UNAVAILABLE' && (
                            <span className="material-icons status-icon">block</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="no-days-message">No available days for this week</div>
                )}
              </div>
            </div>
          } />
          <Route path="/request-fair" element={<FairRequest />} />
          <Route path="/tour-history" element={
            <div className="tour-history-container">
              <h2>My Tours</h2>
              <div className="tour-list">
                {tours.map(tour => (
                  <div key={tour.id} className="tour-item">
                    <div className="tour-info">
                      <h3>{tour.schoolName}</h3>
                      <p>Date: {tour.date} at {tour.time}</p>
                      <p>Group Size: {tour.groupSize}</p>
                      <p>Guides: {tour.assignedGuides?.length || 0}/{tour.requiredGuides}</p>
                      {tour.feedback && (
                        <div className="feedback-status">
                          <p>Feedback: {tour.feedback}</p>
                          <p>Rating: {tour.rating}/5</p>
                        </div>
                      )}
                      {tour.status === 'CANCELLED' && tour.cancellationReason && (
                        <p className="cancellation-reason">
                          <strong>Cancelled:</strong> {tour.cancellationReason}
                        </p>
                      )}
                    </div>
                    <div className="tour-actions">
                      <span className={getStatusBadgeClass(tour.status)}>
                        {tour.status.replace('_', ' ')}
                      </span>
                      {tour.status === 'FINISHED' && !tour.feedback && (
                        <button
                          className="feedback-btn"
                          onClick={() => {
                            setSelectedTour(tour);
                            setShowFeedbackForm(true);
                          }}
                        >
                          Give Feedback
                        </button>
                      )}
                      {(tour.status === 'GUIDES_PENDING' || tour.status === 'WAITING_TO_FINISH') && (
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelTour(tour)}
                        >
                          Cancel Tour
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          } />
          <Route path="/my-forms" element={
            <div className="my-forms-container">
              <h2>My Form Submissions</h2>
              <div className="forms-list">
                {myForms.map((form, index) => (
                  <div
                    key={`form-${form.id || index}`}
                    className="form-card"
                  >
                    <div className="form-header">
                      <h3>{form.schoolName || 'No School Name'}</h3>
                      <div className="form-header-actions">
                        <span className={`status-badge ${form.state?.toLowerCase()}`}>
                          {form.state || 'PENDING'}
                        </span>
                        {form.state === 'PENDING' && (
                          <button
                            className="deny-form-btn"
                            onClick={() => handleCancelForm(form.id)}
                          >
                            <span className="material-icons">cancel</span>
                            Cancel Form
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="form-details">
                      <p><strong>Date:</strong> {form.slotDate || 'Not specified'}</p>
                      <p><strong>Time:</strong> {form.slotTime || 'Not specified'}</p>
                      <p><strong>Group Size:</strong> {form.groupSize || 'Not specified'}</p>
                      <p><strong>Contact:</strong> {form.contactPhone || 'Not specified'}</p>
                      <p><strong>Leader Role:</strong> {form.groupLeaderRole || 'Not specified'}</p>
                      <p><strong>Leader Phone:</strong> {form.groupLeaderPhone || 'Not specified'}</p>
                      <p><strong>Leader Email:</strong> {form.groupLeaderEmail || 'Not specified'}</p>
                      <p><strong>City:</strong> {form.city || 'Not specified'}</p>
                      {form.expectations && (
                        <p><strong>Expectations:</strong> {form.expectations}</p>
                      )}
                      {form.specialRequirements && (
                        <p><strong>Special Requirements:</strong> {form.specialRequirements}</p>
                      )}
                      {form.visitorNotes && (
                        <p><strong>Notes:</strong> {form.visitorNotes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          } />
        </Routes>
      </div>

      {showForm && (
        <TourRequestForm
          onClose={() => setShowForm(false)}
          slot={selectedSlot}
        />
      )}

      {showFeedbackForm && selectedTour && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>Tour Feedback</h3>
            <div className="selected-tour-info">
              <p><strong>{selectedTour.schoolName}</strong></p>
              <p>Date: {selectedTour.date} at {selectedTour.time}</p>
            </div>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group">
                <label>Feedback:</label>
                <textarea
                  value={feedback.feedback}
                  onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rating:</label>
                <StarRating
                  rating={feedback.rating}
                  onRatingChange={(rating) => setFeedback({ ...feedback, rating })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowFeedbackForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancellationForm && tourToCancel && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>Cancel Tour</h3>
            <div className="selected-tour-info">
              <p><strong>{tourToCancel.schoolName}</strong></p>
              <p>Date: {tourToCancel.date} at {tourToCancel.time}</p>
            </div>
            <form onSubmit={submitCancellation}>
              <div className="form-group">
                <label>Reason for Cancellation:</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                  placeholder="Please provide a reason for cancellation"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowCancellationForm(false);
                    setTourToCancel(null);
                    setCancellationReason('');
                  }}
                >
                  Back
                </button>
                <button type="submit" className="submit-btn">
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Counselor;
