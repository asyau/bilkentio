// src/pages/Landing.js
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import axios from 'axios';
import '../styles/Chat.css';

function Landing() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [days, setDays] = useState([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeekDays(currentWeekStart);
    }, [currentWeekStart]);

    const fetchWeekDays = async (date) => {
        setLoading(true);
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const response = await axios.get(`http://localhost:8080/api/days/week?date=${formattedDate}`);
            
            if (response.data && Array.isArray(response.data)) {
                setDays(response.data);
            }
        } catch (error) {
            console.error('Error fetching days:', error);
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

    const handleSlotClick = () => {
        navigate('/login');
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        // Add user message to chat
        setChatHistory(prev => [...prev, { role: 'user', content: message }]);

        try {
            const response = await fetch('http://localhost:8080/api/assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'anonymous',
                    message: message,
                    language: 'en'
                })
            });

            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setChatHistory(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.' 
            }]);
        }

        setMessage('');
    };

    return (
        <div className="landing-container">
            <div className="header">
                <button 
                    className="header-button"
                    onClick={() => navigate('/login')}
                >
                    Login
                </button>
                <button 
                    className="header-button"
                    onClick={() => navigate('/register')}
                >
                    Register
                </button>
            </div>

            <div className="logo-container">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/tr/e/ee/Bilkent%C3%9Cniversitesi-logo.png" 
                    alt="Bilkent University Logo" 
                    className="logo"
                />
            </div>
            <h1 className="landing-title">Welcome to <span className="blue-accent">Bilkent</span>IO</h1>
            <p className="landing-subtitle">Your gateway to seamless campus connectivity</p>

            {/* Schedule Section */}
            <div className="schedule-section">
                <div className="schedule-header">
                    <button className="nav-button prev-week" onClick={handlePrevWeek}>
                        <span className="material-icons" style={{color: '#333'}}>chevron_left</span>
                        <span style={{color: '#333'}}>Previous Week</span>
                    </button>
                    <span className="date-range">
                        {format(currentWeekStart, 'dd MMM yyyy')} - {format(addDays(currentWeekStart, 6), 'dd MMM yyyy')}
                    </span>
                    <button className="nav-button next-week" onClick={handleNextWeek}>
                        <span style={{color: '#333'}}>Next Week</span>
                        <span className="material-icons" style={{color: '#333'}}>chevron_right</span>
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
                                {day.slots && day.slots
                                    .sort((a, b) => {
                                        // Convert time strings to comparable values (e.g., "09:00" to 900)
                                        const timeA = parseInt(a.time.replace(':', ''));
                                        const timeB = parseInt(b.time.replace(':', ''));
                                        return timeA - timeB;
                                    })
                                    .map((slot, slotIndex) => (
                                        <div 
                                            key={`${slot.id}-${slotIndex}`}
                                            className={getSlotClass(slot)}
                                            onClick={() => handleSlotClick()}
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

            {/* Chat Widget */}
            <div className="chat-widget">
                <div className="chat-container">
                    <div className="chat-header">
                        BilkentIO Assistant
                    </div>
                    <div className="chat-messages">
                        {chatHistory.length === 0 && (
                            <div className="message assistant">
                                Hello! 👋 I'm your BilkentIO assistant. How can I help you today?
                            </div>
                        )}
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message here..."
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;
