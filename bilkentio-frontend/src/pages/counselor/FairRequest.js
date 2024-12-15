import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { turkishCities } from '../../constants/turkishCities';
import '../../styles/Fair.css';
import { useNavigate } from 'react-router-dom';

const FairRequest = () => {
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        schoolName: '',
        city: '',
        fairDate: '',
        expectedStudents: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (formData.city) {
            fetchSchoolsByCity(formData.city);
        }
    }, [formData.city]);

    const fetchSchoolsByCity = async (city) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/schools/city/${city}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Schools fetched:', response.data); // Debug log
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
            setError('Error loading schools. Please try again later.');
            setSchools([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            // Reset schoolName when city changes
            if (name === 'city') {
                return {
                    ...prev,
                    [name]: value,
                    schoolName: ''
                };
            }
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const userId = decodedToken.userId || decodedToken.id || decodedToken.sub;

            if (!token || !userId) {
                setError('You must be logged in to submit a fair request');
                return;
            }

            const response = await axios.post(
                'http://localhost:8080/api/fairs/request',
                {
                    ...formData,
                    counselorId: userId,
                    fairDate: new Date(formData.fairDate).toISOString().split('T')[0]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                setSuccess('Fair request submitted successfully!');
                setFormData({
                    schoolName: '',
                    city: '',
                    fairDate: '',
                    expectedStudents: '',
                    contactPerson: '',
                    contactEmail: '',
                    contactPhone: '',
                    notes: ''
                });

                setTimeout(() => {
                    navigate('/counselor');
                }, 2000);
            }
        } catch (err) {
            console.error('Error submitting fair request:', err);
            setError(
                err.response?.data?.message ||
                'Error submitting fair request. Please try again.'
            );
        }
    };

    return (
        <div className="fair-request-container">
            <div className="fair-request-header">
                <h2>Request a Fair Visit</h2>
                <Button
                    variant="secondary"
                    onClick={() => navigate('/counselor')}
                    className="back-button"
                >
                    Back to Dashboard
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select City</option>
                        {turkishCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>School Name</Form.Label>
                    <Form.Select
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                        disabled={!formData.city || loading}
                    >
                        <option value="">
                            {!formData.city
                                ? 'Please select a city first'
                                : loading
                                    ? 'Loading schools...'
                                    : schools.length === 0
                                        ? 'No schools found in this city'
                                        : 'Select School'
                            }
                        </option>
                        {schools.map(school => (
                            <option key={school.id} value={school.name}>
                                {school.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Fair Date</Form.Label>
                    <Form.Control
                        type="date"
                        name="fairDate"
                        value={formData.fairDate}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Contact Person</Form.Label>
                    <Form.Control
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Contact Phone</Form.Label>
                    <Form.Control
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Expected Students</Form.Label>
                    <Form.Control
                        type="number"
                        name="expectedStudents"
                        value={formData.expectedStudents}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                    />
                </Form.Group>

                <div className="form-actions">
                    <Button variant="primary" type="submit">
                        Submit Request
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default FairRequest; 