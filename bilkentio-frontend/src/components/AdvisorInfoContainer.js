import React, { useState, useEffect } from 'react';
import '../styles/AdvisorInfoContainer.css';

const AdvisorInfoContainer = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/advisors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out advisors without a responsible day and format the data
        const advisorsWithDays = data.filter(advisor => advisor.responsibleDay).map(advisor => ({
          ...advisor,
          // If responsibleDay is an object with a day property, extract it
          responsibleDay: advisor.responsibleDay?.day || advisor.responsibleDay
        }));
        const sortedAdvisors = sortAdvisorsByDay(advisorsWithDays);
        setAdvisors(sortedAdvisors);
      } else {
        console.error('Failed to fetch advisors:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching advisors:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDay = (day) => {
    if (!day) return '';
    // Handle case where day is an object with a day property
    const dayString = typeof day === 'object' ? day.day : day;
    // Convert to lowercase and capitalize first letter
    var daySt = dayString.substring(8) + ":";
    return daySt.slice(0, -3);
  };

  const sortAdvisorsByDay = (advisors) => {
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    return advisors.sort((a, b) => {
      const dayA = a.responsibleDay?.toUpperCase();
      const dayB = b.responsibleDay?.toUpperCase();
      return dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB);
    });
  };

  if (loading) {
    return <div className="advisor-info-loading">Loading advisor information...</div>;
  }

  if (advisors.length === 0) {
    return (
      <div className="advisor-info-container">
        <h3 className="advisor-info-title">Advisor Schedule</h3>
        <div className="no-advisors">No advisors have selected their days yet.</div>
      </div>
    );
  }

  return (
    <div className="advisor-info-container">
      <h3 className="advisor-info-title">Advisor Schedule</h3>
      <div className="advisor-list">
        {advisors.map((advisor, index) => (
          <div key={index} className="advisor-item">
            <div className="advisor-info">
              <strong>{formatDay(advisor.responsibleDay)}</strong>: {advisor.nameSurname}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvisorInfoContainer; 