import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/ChatAssistant.css';

const ChatAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [error, setError] = useState(null);

    // Initial welcome message
    useEffect(() => {
        setMessages([{
            type: 'assistant',
            content: 'Hello! I am your Bilkent University assistant. How can I help you today? You can ask me about:\n\n' +
                    '• Campus facilities and locations\n' +
                    '• Academic programs and departments\n' +
                    '• Student services\n' +
                    '• Campus life and activities\n' +
                    '• Transportation\n'
        }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.userId;

        const userMessage = input;
        setInput('');
        setLoading(true);
        setError(null);

        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

        try {
            const response = await axios.post('http://localhost:8080/api/assistant/chat', 
                {
                    userId: userId,
                    message: userMessage,
                    language: "en"
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setMessages(prev => [...prev, { 
                type: 'assistant', 
                content: response.data.message 
            }]);
        } catch (error) {
            console.error('Error:', error);
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            
            if (error.response?.status === 401) {
                errorMessage = 'Please log in to use the assistant.';
            } else if (error.response?.status === 429) {
                errorMessage = 'The service is currently busy. Please try again in a few moments.';
            }
            
            setError(errorMessage);
            setMessages(prev => [...prev, { 
                type: 'error', 
                content: errorMessage
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>🤖 Bilkent AI Assistant</h2>
                <p className="chat-subtitle">Ask me anything about Bilkent University!</p>
            </div>
            
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        <div className="message-icon">
                            {message.type === 'assistant' ? '🤖' : '👤'}
                        </div>
                        <div className="message-content">
                            {message.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message assistant">
                        <div className="message-icon">🤖</div>
                        <div className="message-content loading">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="input-container">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question here... (Press Enter to send)"
                    disabled={loading}
                    rows={1}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
            
            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ChatAssistant; 