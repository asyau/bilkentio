import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvisorSidebar from '../../components/AdvisorSidebar'; 
import '../../styles/DaySelection.css';

const DaySelection = () => {
  const [selectedDay, setSelectedDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSelectedDay();
  }, []);

  const fetchSelectedDay = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const advisorId = decodedToken.userId;
      console.log(advisorId);
      const response = await fetch(`http://localhost:8080/api/advisors/${advisorId}/responsible-day`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setSelectedDay(data.day || '');
        } else {
          const day = await response.text();
          if (['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].includes(day)) {
            setSelectedDay(day);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching selected day:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = async (day) => {
    try {
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const advisorId = decodedToken.userId;
        const response = await fetch(`http://localhost:8080/api/advisors/${advisorId}/responsible-day`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ day: day })
        });

        if (response.ok) {
            setSelectedDay(day);
            alert('Day updated successfully!');
        } else {
            const errorData = await response.text();
            console.error('Error response:', errorData);
            alert('Failed to update day: ' + errorData);
        }
    } catch (error) {
        console.error('Error updating day:', error);
        alert('Error updating day: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="day-selection-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="day-selection-page">
      <AdvisorSidebar />
      <div className="day-selection-content">
        <h2>Select Your Responsible Day</h2>
        {!isEditing && selectedDay ? (
          <div className="current-day-section">
            <p className="selected-day-info">
              You are currently responsible for: <strong>{selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}</strong>
            </p>
            <button 
              className="change-day-button"
              onClick={() => setIsEditing(true)}
            >
              Change Day
            </button>
          </div>
        ) : (
          <>
            <p>Please select the day you will be responsible for throughout the semester:</p>
            <div className="day-options">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => (
                <button
                  key={day}
                  className={`day-button ${selectedDay === day ? 'selected' : ''}`}
                  onClick={() => handleDaySelect(day)}
                >
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DaySelection;
