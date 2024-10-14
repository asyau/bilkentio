// src/pages/Landing.js
import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <h1>Welcome to Our App</h1>
            <p>Please select an option:</p>
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