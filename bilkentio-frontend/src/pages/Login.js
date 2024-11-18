// src/pages/Login.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/auth/login', {
                username,
                password,
            });
            localStorage.setItem('token', response.data.jwt);
            navigate('/crud');
        } catch (error) {
            setError('Incorrect username or password.');
        }
    };

    return (
        <div className="login-container">
            <div className="logo-container">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/tr/e/ee/Bilkent%C3%9Cniversitesi-logo.png" 
                    alt="Bilkent University Logo" 
                    className="logo"
                />
            </div>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    {error && <p className="error">{error}</p>}
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="landing-button">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
