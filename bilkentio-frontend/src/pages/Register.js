import { useState } from 'react';
import axios from 'axios';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/auth/register', {
                username,
                password,
            });

            if (response && response.status === 200) {
                setSuccessMessage(response.data);
                setError('');
                alert('Registration successful! Please log in.');
                window.location.href = '/login';
            } else {
                setError('Unexpected response from the server.');
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data || 'Registration failed. Try again.');
            } else {
                setError('Network error or server is unreachable.');
            }
        }
    };

    return (
        <div className="register-container">
            <div className="logo-container">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/tr/e/ee/Bilkent%C3%9Cniversitesi-logo.png" 
                    alt="Bilkent University Logo" 
                    className="logo"
                />
            </div>
            <div className="form-container">
                <h1>Register</h1>
                <form onSubmit={handleRegister}>
                    {error && <p className="error">{error}</p>}
                    {successMessage && <p className="success">{successMessage}</p>}
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="landing-button">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
