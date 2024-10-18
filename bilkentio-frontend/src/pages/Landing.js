// src/pages/Landing.js
import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="logo-container">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/tr/e/ee/Bilkent%C3%9Cniversitesi-logo.png" 
                    alt="Bilkent University Logo" 
                    className="logo"
                />
            </div>
            <h1 className="landing-title">Welcome to <span className="blue-accent">Bilkent</span>IO</h1>
            <p className="landing-subtitle">Your gateway to seamless campus connectivity</p>
            <div className="button-container">
                <button onClick={() => navigate('/login')} className="landing-button">
                    Login
                </button>
                <button onClick={() => navigate('/register')} className="landing-button">
                    Register
                </button>
            </div>
        </div>
    );
}

export default Landing;
