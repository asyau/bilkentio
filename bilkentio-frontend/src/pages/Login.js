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
            // First, authenticate user
            const response = await axios.post('http://localhost:8080/auth/login', {
                username,
                password,
            });
            const token = response.data.jwt;
            localStorage.setItem('token', token);

            // Then, fetch user role
            const roleResponse = await axios.get('http://localhost:8080/auth/getRole', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Log the role response to understand its structure
            console.log('Role Response:', roleResponse.data);

            // Check if roles exist and extract the first role
            if (roleResponse.data.roles && roleResponse.data.roles.length > 0) {
                const userRole = roleResponse.data.roles[0].authority; // Access the authority property
                console.log('User Role:', userRole); // Log the user role

                // Navigate based on role
                switch (userRole) {
                    case 'ROLE_ADMIN':
                        navigate('/admin/analytics');
                        break;
                    case 'ROLE_PRESIDENT':
                        navigate('/president');
                        break;
                    case 'ROLE_COORDINATOR', 'ROLE_COORDİNATOR':
                        navigate('/coordinator/analytics');
                        break;
                    case 'ROLE_ADVISOR':
                        navigate('/advisor');
                        break;
                    case 'ROLE_GUİDE':
                        navigate('/guide/dashboard');
                        break;
                    case 'ROLE_GUIDE':
                        navigate('/guide/dashboard');
                        break;
                    case 'ROLE_COUNSELOR':
                        navigate('/counselor');
                        break;
                    case 'ROLE_INDIVIDUAL':
                        navigate('/individual');
                        break;
                    default:
                        setError('Invalid role');
                        localStorage.removeItem('token');
                }
            } else {
                setError('No roles found');
                localStorage.removeItem('token');
            }
        } catch (error) {
            setError('Incorrect username or password.');
            localStorage.removeItem('token');
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
