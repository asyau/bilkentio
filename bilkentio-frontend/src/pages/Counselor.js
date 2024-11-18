// src/GuideMode.js
import React, { useState, useEffect } from 'react';
import '../styles/GuideMode.css';
import TourHistory from '../components/TourHistory';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const schools = [
  'TED Ankara College',
  'Ankara Atatürk High School',
  'BLIS - British Language International School',
  'Ankara Science High School',
  'Other'
];

const cities = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 
    'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 
    'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 
    'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 
    'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 
    'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 
    'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 
    'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
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
    switch(slot.status) {
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
      schoolName: '',
      contactPhone: '',
      expectations: '',
      specialRequirements: '',
      groupLeaderRole: '',
      groupLeaderPhone: '',
      groupLeaderEmail: '',
      visitorNotes: '',
      city: '',
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
              <label>Number of Participants *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.groupSize}
                onChange={(e) => setFormData({...formData, groupSize: e.target.value})}
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
              <label>City *</label>
              <select
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                <option value="">Select a city</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
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
                onChange={(e) => setFormData({...formData, expectations: e.target.value})}
                placeholder="What would you like to see or learn about during the tour?"
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

  return (
    <div className="guide-mode-container">
      <div className="sidebar">
        <div className="user-profile">
          <span className="material-icons profile-icon">account_circle</span>
          <h3>Welcome, {user?.sub || 'User'}!</h3>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-btn ${!showTourHistory ? 'active' : ''}`} 
            onClick={() => setShowTourHistory(false)}
          >
            <span className="material-icons">calendar_today</span>
            See Schedule
          </button>
          <button 
            className={`sidebar-btn ${showTourHistory ? 'active' : ''}`}
            onClick={() => setShowTourHistory(true)}
          >
            <span className="material-icons">history</span>
            Tour History
          </button>
          <button 
            className={`sidebar-btn ${showMyForms ? 'active' : ''}`}
            onClick={() => setShowMyForms(true)}
          >
            <span className="material-icons">history</span>
            My Forms
          </button>
        </nav>
        
        <button className="logout-btn" onClick={handleLogout}>
          <span className="material-icons">logout</span>
          Log out
        </button>
      </div>

      <div className="main-content">
        {!showTourHistory && !showMyForms && (
          <>
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
                days.map((day) => (
                  <div key={day.id} className="day-column">
                    <div className="day-header">
                      <div>{format(new Date(day.date), 'dd MMM')}</div>
                      <div>{format(new Date(day.date), 'EEEE')}</div>
                    </div>
                    {day.slots && day.slots.map((slot) => (
                      <div 
                        key={slot.id} 
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
          </>
        )}
      </div>

      {showForm && (
        <TourRequestForm
          onClose={() => setShowForm(false)}
          slot={selectedSlot}
        />
      )}

      {showMyForms && (
        <div className="my-forms-container">
          <h2>My Form Submissions</h2>
          <div className="forms-list">
            {myForms.map(form => (
              <div key={form.id} className="form-card">
                <div className="form-header">
                  <h3>{form.schoolName || 'No School Name'}</h3>
                  <span className={`status-badge ${form.state?.toLowerCase()}`}>
                    {form.state}
                  </span>
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
      )}
    </div>
  );
};

export default Counselor;
