import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userType, setUserType] = useState('individual');
    const [school, setSchool] = useState('');
    const [studyLevel, setStudyLevel] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [schools, setSchools] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/schools/cities');
                setCities(response.data);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        const fetchSchools = async () => {
            if (selectedCity) {
                try {
                    const response = await axios.get(`http://localhost:8080/api/schools/city/${selectedCity}`);
                    setSchools(response.data);
                } catch (error) {
                    console.error('Error fetching schools:', error);
                }
            }
        };
        fetchSchools();
    }, [selectedCity]);

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

        const userData = {
            username,
            password,
            nameSurname: `${firstName} ${lastName}`,
            phoneNumber,
            email,
            roles: []
        };

        if (userType === 'counselor') {
            userData.school = { id: school };
        }
        try {
            console.log('Sending counselor data:', userData);
            const endpoint = userType === 'counselor' 
                ? 'http://localhost:8080/auth/register/counselor'
                : 'http://localhost:8080/auth/register/individual';

            const response = await axios.post(endpoint, userData);

            if (response && response.status === 200) {
                setSuccessMessage(response.data);
                setError('');
                alert('Registration successful! Please log in.');
                window.location.href = '/login';
            } else {
                setError('Unexpected response from the server.');
            }
        } catch (err) {
            console.log('Full error:', err);
            if (err.response) {
                console.log('Error response:', err.response);
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
                    
                    {userType === 'counselor' && (
                        <>
                            <select 
                                value={selectedCity} 
                                onChange={(e) => setSelectedCity(e.target.value)}
                                required
                            >
                                <option value="">Select City</option>
                                {cities.map((city, index) => (
                                    <option key={index} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>

                            <select 
                                value={school} 
                                onChange={(e) => setSchool(e.target.value)}
                                required
                                disabled={!selectedCity}
                            >
                                <option value="">Select School</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>
                        </>
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
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <div className="login-prompt">
                    <p>Already have an account? <button onClick={() => navigate('/login')} className="text-button">Login here</button></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
