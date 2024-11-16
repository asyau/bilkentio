// src/GuideMode.js
import React, { useState } from 'react';
import '../styles/GuideMode.css';
import TourHistory from '../components/TourHistory';

const daysOfWeek = [
  { date: '18 Kasım', day: 'Pazartesi' },
  { date: '19 Kasım', day: 'Salı' },
  { date: '20 Kasım', day: 'Çarşamba' },
  { date: '21 Kasım', day: 'Perşembe' },
  { date: '22 Kasım', day: 'Cuma' },
  { date: '23 Kasım', day: 'Cumartesi' },
];

const timeSlots = [
  { time: '11:00 - 12:00', status: 'unavailable' },
  { time: '13:00 - 14:00', status: 'form-requested' },
  { time: '16:00 - 17:00', status: 'available' }
];

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
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showTourHistory, setShowTourHistory] = useState(false);

  const getSlotClass = (status) => {
    switch(status) {
      case 'unavailable':
        return 'time-slot unavailable';
      case 'form-requested':
        return 'time-slot form-requested';
      default:
        return 'time-slot available';
    }
  };

  const handleSlotClick = (status, time, date) => {
    if (status === 'unavailable') {
      alert('This slot is not available');
      return;
    }
    
    if (status === 'form-requested') {
      if (!window.confirm('A form has already been requested for this slot. Would you still like to apply?')) {
        return;
      }
    }
    
    setSelectedSlot({ time, date });
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

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      onClose();
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

  return (
    <div className="guide-mode-container">
      <div className="sidebar">
        <div className="user-profile">
          <span className="material-icons profile-icon">account_circle</span>
          <h3>Welcome, User!</h3>
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
        </nav>
        
        <button className="logout-btn">
          <span className="material-icons">logout</span>
          Log out
        </button>
      </div>

      <div className="main-content">
        {showTourHistory ? (
          <TourHistory />
        ) : (
          <>
            <div className="schedule-header">
              <button className="nav-button prev-week">
                <span className="material-icons">chevron_left</span>
                Önceki Hafta
              </button>
              <span className="date-range">18 Kasım 2024 - 24 Kasım 2024</span>
              <button className="nav-button next-week">
                Sonraki Hafta
                <span className="material-icons">chevron_right</span>
              </button>
            </div>
            
            <div className="weekly-schedule">
              {daysOfWeek.map((day, dayIndex) => (
                <div key={dayIndex} className="day-column">
                  <div className="day-header">
                    <div>{day.date}</div>
                    <div>{day.day}</div>
                  </div>
                  {timeSlots.map((slot, slotIndex) => (
                    <div 
                      key={slotIndex} 
                      className={getSlotClass(slot.status)}
                      onClick={() => handleSlotClick(slot.status, slot.time, day.date)}
                    >
                      <span>{slot.time}</span>
                      {slot.status === 'form-requested' && (
                        <span className="material-icons status-icon">description</span>
                      )}
                      {slot.status === 'unavailable' && (
                        <span className="material-icons status-icon">block</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
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
    </div>
  );
};

export default Counselor;
