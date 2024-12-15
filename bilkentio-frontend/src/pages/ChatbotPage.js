import React from 'react';
import ChatAssistant from '../components/ChatAssistant';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatbotPage.css';

const ChatbotPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="chatbot-page">
            <nav className="chatbot-navbar">
                <button className="nav-button" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h1>Bilkent University AI Assistant</h1>
                <button className="nav-button logout" onClick={handleLogout}>
                    Logout
                </button>
            </nav>
            <div className="chatbot-container">
                <ChatAssistant />
            </div>
        </div>
    );
};

export default ChatbotPage; 