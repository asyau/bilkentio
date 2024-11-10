import { useState } from 'react';
import axios from 'axios';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userType, setUserType] = useState('');
    const [school, setSchool] = useState('');
    const [studyLevel, setStudyLevel] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!acceptedTerms) {
            setError('You must accept the terms and conditions to register.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/auth/register', {
                username,
                password,
                userType,
                school,
                studyLevel: userType === 'individual' ? studyLevel : null,
                phoneNumber,
                firstName,
                lastName,
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
                    
                    <div className="user-type-buttons">
                        <button 
                            type="button" 
                            className={`type-button ${userType === 'individual' ? 'active' : ''}`}
                            onClick={() => setUserType('individual')}
                        >
                            Individual
                        </button>
                        <button 
                            type="button" 
                            className={`type-button ${userType === 'counselor' ? 'active' : ''}`}
                            onClick={() => setUserType('counselor')}
                        >
                            School Counselor
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    
                    <select 
                        value={school} 
                        onChange={(e) => setSchool(e.target.value)}
                        required
                    >
                        <option value="">Select School</option>
                        <option value="school1">School 1</option>
                        <option value="school2">School 2</option>
                        <option value="school3">School 3</option>
                    </select>

                    {userType === 'individual' && (
                        <select 
                            value={studyLevel} 
                            onChange={(e) => setStudyLevel(e.target.value)}
                            required
                        >
                            <option value="">Select Study Level</option>
                            <option value="high_school_1">High School 1</option>
                            <option value="high_school_2">High School 2</option>
                            <option value="high_school_3">High School 3</option>
                            <option value="high_school_4">High School 4</option>
                        </select>
                    )}

                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />

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
                    <div className="terms-container">
                        <label className="terms-label">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                required
                            />
                            I have read and accept the <a href="https://w3.bilkent.edu.tr/www/yonetmelikler/" target="_blank" rel="noopener noreferrer">terms and conditions</a>
                        </label>
                    </div>
                    <button type="submit" className="landing-button">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
