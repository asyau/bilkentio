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
            console.log('Sending request to backend...');
            const response = await axios.post('http://localhost:8080/auth/register', {
                username,
                password,
            });

            console.log('Response received:', response);

            // Check if response data is available
            if (response && response.status === 200) {
                setSuccessMessage(response.data); // Assuming backend sends a success message
                setError('');
                alert('Registration successful! Please log in.');
                window.location.href = '/login'; // Redirect to login page
            } else {
                setError('Unexpected response from the server.');
                console.error('Unexpected response:', response);
            }
        } catch (err) {
            // Log the error for better debugging
            console.error('Error during registration:', err);

            if (err.response) {
                console.error('Error response from backend:', err.response);
                setError(err.response.data || 'Registration failed. Try again.');
            } else {
                setError('Network error or server is unreachable.');
            }
        }
    };

    return (
        <div className="register-container">
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
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;