import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GuideSidebar from "../../components/GuideSidebar";
import "../../styles/GuideDashboard.css";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MyTours = () => {
  const [myTours, setMyTours] = useState([]);
  const [myIndividualTours, setMyIndividualTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
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
      console.log(groupResponse.data);
      console.log(individualResponse.data);

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

  const getFilteredTours = (tours) => {
    if (selectedStatus === 'ALL') return tours;
    return tours.filter(tour => tour.status === selectedStatus);
  };

  const formatToursForCalendar = () => {
    const allTours = [];
    
    // Format filtered group tours
    getFilteredTours(myTours).forEach(tour => {
      const [startTime, endTime] = tour.time.split(' - ');
      const shortenedSchoolName = tour.schoolName.length > 20 
        ? tour.schoolName.substring(0, 20) + '...' 
        : tour.schoolName;
      
      const event = {
        id: `group-${tour.id}`,
        title: `${shortenedSchoolName} (${tour.groupSize})`,
        start: new Date(`${tour.date}T${startTime}`),
        end: new Date(`${tour.date}T${endTime || startTime}`),
        tourType: 'group',
        status: tour.status,
        allDay: false,
        tour: tour
      };
      allTours.push(event);
    });

    // Format filtered individual tours
    getFilteredTours(myIndividualTours).forEach(tour => {
      const event = {
        id: `individual-${tour.id}`,
        title: `Individual - ${tour.city}`,
        start: new Date(`${tour.date}T${tour.time}`),
        end: new Date(`${tour.date}T${tour.time}`),
        tourType: 'individual',
        status: tour.status,
        allDay: false,
        tour: tour
      };
      allTours.push(event);
    });

    return allTours;
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#3174ad',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    if (event.tourType === 'individual') {
      style.backgroundColor = '#9c27b0';
    }

    switch (event.status) {
      case 'GUIDES_PENDING':
        style.backgroundColor = '#ff9800'; // orange
        break;
      case 'WAITING_TO_FINISH':
        style.backgroundColor = '#2196f3'; // blue
        break;
      case 'FINISHED':
        style.backgroundColor = '#4CAF50'; // green
        break;
      case 'GIVEN_FEEDBACK':
        style.backgroundColor = '#9c27b0'; // purple
        break;
      case 'CANCELLED':
        style.backgroundColor = '#f44336'; // red
        break;
      default:
        break;
    }
    return { style };
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="guide-dashboard">
      <GuideSidebar />
      <div className="dashboard-content">
        <h1>My Tours</h1>
        
        <div className="controls-container">
          <div className="view-toggle">
            <button 
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <span className="material-icons">view_list</span>
              List View
            </button>
            <button 
              className={`view-btn ${view === 'calendar' ? 'active' : ''}`}
              onClick={() => setView('calendar')}
            >
              <span className="material-icons">calendar_today</span>
              Calendar View
            </button>
          </div>

          <div className="status-filters">
            <button 
              className={`filter-btn ${selectedStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('ALL')}
            >
              All Tours
            </button>
            <button 
              className={`filter-btn ${selectedStatus === 'GUIDES_PENDING' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('GUIDES_PENDING')}
            >
              Guides Pending
            </button>
            <button 
              className={`filter-btn ${selectedStatus === 'WAITING_TO_FINISH' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('WAITING_TO_FINISH')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${selectedStatus === 'FINISHED' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('FINISHED')}
            >
              Finished
            </button>
            <button 
              className={`filter-btn ${selectedStatus === 'GIVEN_FEEDBACK' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('GIVEN_FEEDBACK')}
            >
              With Feedback
            </button>
            <button 
              className={`filter-btn ${selectedStatus === 'CANCELLED' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('CANCELLED')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={formatToursForCalendar()}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 'calc(100vh - 200px)' }}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              defaultView="month"
              components={{
                event: (props) => (
                  <div title={props.event.tour.schoolName || props.title}>
                    <strong>{props.title}</strong>
                  </div>
                )
              }}
            />
          </div>
        ) : (
          <>
            <div className="tours-section">
              <h2>Group Tours</h2>
              <div className="tours-grid">
                {getFilteredTours(myTours).map((tour) => (
                  <div key={tour.id} className="tour-card">
                    <div className="tour-header">
                      <h3>{tour.schoolName}</h3>
                      <span className="badge badge-primary">{tour.status}</span>
                    </div>
                    <div className="tour-content">
                      <p><i className="material-icons">event</i> {tour.date}</p>
                      <p><i className="material-icons">schedule</i> {tour.time}</p>
                      <p><i className="material-icons">group</i> Group Size: {tour.groupSize}</p>
                      {tour.totalHours && (
                        <p><i className="material-icons">timer</i> Duration: {tour.totalHours.toFixed(1)} hours</p>
                      )}
                      
                      <div className="group-leader-info">
                        <h4>Group Leader Information</h4>
                        <p><i className="material-icons">person</i> Role: {tour.groupLeaderRole}</p>
                        <p><i className="material-icons">phone</i> Phone: {tour.groupLeaderPhone}</p>
                        <p><i className="material-icons">email</i> Email: {tour.groupLeaderEmail}</p>
                      </div>
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
                {getFilteredTours(myIndividualTours).map((tour) => (
                  <div key={tour.id} className="tour-card individual">
                    <div className="tour-header">
                      <h3>Individual Tour</h3>
                      <span className="badge badge-secondary">{tour.status}</span>
                    </div>
                    <div className="tour-content">
                      <p><i className="material-icons">event</i> {tour.date}</p>
                      <p><i className="material-icons">schedule</i> {tour.time}</p>
                      <p><i className="material-icons">location_city</i> {tour.city}</p>
                      {tour.totalHours && (
                        <p><i className="material-icons">timer</i> Duration: {tour.totalHours.toFixed(1)} hours</p>
                      )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default MyTours; 