import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/FormRequests.css';
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

const FormRequests = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [view, setView] = useState('calendar');

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
    } catch (error) {
      console.error('Error decoding token:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchForms();
  }, [selectedStatus]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let endpoint = '/api/forms/all';
      if (selectedStatus !== 'ALL') {
        endpoint = `/api/forms/state/${selectedStatus}`;
      }
      
      const response = await axios.get(`http://localhost:8080${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched forms data:', response.data);
      // Validate the date and time format of each form
      const validatedForms = response.data.map(form => {
        if (!form.slotDate || !form.slotTime) {
          console.warn('Form missing date or time:', form);
        }
        return form;
      });
      setForms(validatedForms);
    } catch (error) {
      console.error('Error fetching forms:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormAction = async (formId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (action === 'APPROVED') {
        // Prompt for required guides
        const requiredGuides = prompt('Enter the number of required guides for this tour:');
        if (!requiredGuides || isNaN(requiredGuides) || requiredGuides < 1) {
          alert('Please enter a valid number of guides (minimum 1)');
          return;
        }
        
        try {
          // First update form status
          const updateResponse = await axios.put(`http://localhost:8080/api/forms/${formId}/status`, null, {
            params: { newState: action },
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Form status updated:', updateResponse.data);
          
          // After successful form approval, create the tour
          const createTour = async () => {
            try {
              console.log('Creating tour for form:', updateResponse.data);
              
              const response = await axios.post(
                'http://localhost:8080/api/tours',
                {
                  formId: formId,
                  requiredGuides: parseInt(requiredGuides),
                },
                {
                  headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              console.log('Tour created successfully:', response.data);
              alert('Form approved and tour created successfully!');
            } catch (error) {
              console.error('Error creating tour:', error);
              alert(`Failed to create tour: ${error.response?.data || error.message}`);
              
              // Revert form status if tour creation fails
              await axios.put(`http://localhost:8080/api/forms/${formId}/status`, null, {
                params: { newState: 'PENDING' },
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // Refresh form data
              await fetchForms();
            }
          };
          
          // Call createTour after form approval
          await createTour();
          
        } catch (error) {
          console.error('Error approving form:', error);
          alert(`Failed to approve form: ${error.response?.data || error.message}`);
          return;
        }
      } else {
        // Just update form status for denial
        await axios.put(`http://localhost:8080/api/forms/${formId}/status`, null, {
          params: { newState: action },
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchForms();
    } catch (error) {
      console.error('Error updating form status:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(`Failed to update form status: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'DENIED': return 'red';
      case 'PENDING': return 'orange';
      default: return 'gray';
    }
  };

  const toggleFormDetails = (formId, e) => {
    e.stopPropagation();
    setExpandedFormId(expandedFormId === formId ? null : formId);
  };

  const formatFormsForCalendar = (forms) => {
    // Group forms by date and time slot
    const groupedForms = forms.reduce((acc, form) => {
      // Skip if form doesn't have required date/time
      if (!form.slotDate || !form.slotTime) {
        return acc;
      }
      const key = `${form.slotDate}-${form.slotTime}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(form);
      return acc;
    }, {});
    
    // Create calendar events for each group
    const events = Object.entries(groupedForms).map(([key, groupForms]) => {
      const form = groupForms[0]; // Use first form for date/time
      const [startTime, endTime] = form.slotTime.split(' - ');

      try {
        const startDateTime = new Date(`${form.slotDate}T${startTime}`);
        const endDateTime = new Date(`${form.slotDate}T${endTime}`);

        // Validate the dates
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          console.error('Invalid date created for:', {
            date: form.slotDate,
            startTime,
            endTime
          });
          return null;
        }

        return {
          id: key,
          title: groupForms.map(f => 
            `${f.schoolName} (${f.groupSize} students)`
          ).join('\n'),
          start: startDateTime,
          end: endDateTime,
          forms: groupForms,
          allDay: false,
          state: groupForms.some(f => f.state === 'PENDING') ? 'PENDING' : 
                 groupForms.some(f => f.state === 'APPROVED') ? 'APPROVED' : 'DENIED'
        };
      } catch (error) {
        console.error('Error creating event:', error, {
          date: form.slotDate,
          startTime,
          endTime
        });
        return null;
      }
    });

    // Filter out any null events from errors
    const validEvents = events.filter(event => event !== null);
    return validEvents;
  };

  const handleEventClick = (event) => {
    // If there are multiple forms, show them in a modal or expand all
    if (event.forms && event.forms.length > 1) {
      event.forms.forEach(form => {
        setExpandedFormId(prevId => prevId === form.id ? null : form.id);
      });
    } else if (event.forms && event.forms.length === 1) {
      setExpandedFormId(event.forms[0].id);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    let style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    switch (event.state) {
      case 'PENDING':
        style.backgroundColor = '#ffa500';
        break;
      case 'APPROVED':
        style.backgroundColor = '#4CAF50';
        break;
      case 'DENIED':
        style.backgroundColor = '#f44336';
        break;
      default:
        break;
    }
    return { style };
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="form-requests-container">
          <div className="form-header">
            <div className="filter-section">
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
                  All Forms
                </button>
                <button 
                  className={`filter-btn ${selectedStatus === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('PENDING')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-btn ${selectedStatus === 'APPROVED' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('APPROVED')}
                >
                  Approved
                </button>
                <button 
                  className={`filter-btn ${selectedStatus === 'DENIED' ? 'active' : ''}`}
                  onClick={() => setSelectedStatus('DENIED')}
                >
                  Denied
                </button>
              </div>
            </div>
          </div>

          <div className="forms-content">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : forms.length > 0 ? (
              view === 'calendar' ? (
                <div className="calendar-container">
                  {console.log('Rendering calendar with forms:', forms)}
                  <Calendar
                    localizer={localizer}
                    events={formatFormsForCalendar(forms)}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ 
                      height: 'calc(100vh - 200px)',
                      width: '100%',
                      margin: '0 auto'
                    }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleEventClick}
                    defaultView="month"
                    views={['month', 'week', 'day']}
                    step={60}
                    timeslots={1}
                    components={{
                      event: (props) => (
                        <div title={props.title.split('\n').join(', ')}>
                          <div style={{ fontWeight: '500' }}>
                            {props.forms?.length > 1 ? `${props.forms.length} Forms` : props.title}
                          </div>
                          {props.forms?.length > 1 && (
                            <small style={{ fontSize: '0.8em' }}>
                              {`${props.forms.reduce((sum, f) => sum + f.groupSize, 0)} total students`}
                            </small>
                          )}
                        </div>
                      )
                    }}
                  />
                </div>
              ) : (
                <div className="forms-list">
                  {forms.map((form, index) => {
                    const isExpanded = expandedFormId === form.id;
                    return (
                      <div 
                        key={`form-${form.id || index}`}
                        className={`form-card ${isExpanded ? 'expanded' : ''}`}
                        onClick={(e) => toggleFormDetails(form.id, e)}
                      >
                        <div className="form-header">
                          <h3>{form.schoolName || 'No School Name'}</h3>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(form.state) }}>
                            {form.state}
                          </span>
                        </div>
                        
                        <div className="form-content">
                          <div className="form-basic-info">
                            <p><strong>Date:</strong> {form.slotDate || 'Not specified'}</p>
                            <p><strong>Time:</strong> {form.slotTime || 'Not specified'}</p>
                            <p><strong>Group Size:</strong> {form.groupSize || 'Not specified'}</p>
                          </div>

                          <div className={`form-details ${isExpanded ? 'show' : ''}`}>
                            <p><strong>Contact:</strong> {form.contactPhone || 'Not specified'}</p>
                            <p><strong>Submission Date:</strong> {form.submissionDate || 'Not specified'}</p>
                            <p><strong>Leader:</strong> {form.groupLeaderRole || 'Not specified'}</p>
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

                        {form.state === 'PENDING' && (
                          <div className="form-actions">
                            <button 
                              className="approve-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFormAction(form.id, 'APPROVED');
                              }}
                            >
                              <span className="material-icons">check_circle</span>
                              Approve
                            </button>
                            <button 
                              className="deny-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFormAction(form.id, 'DENIED');
                              }}
                            >
                              <span className="material-icons">cancel</span>
                              Deny
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="no-forms-message">
                No {selectedStatus.toLowerCase()} forms found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormRequests; 