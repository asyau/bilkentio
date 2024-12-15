import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { cities } from '../../constants/cities';
import { schools } from '../../constants/schools';

const InviteToFairForm = () => {
    const [formData, setFormData] = useState({
        schoolName: '',
        city: '',
        fairDate: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        expectedStudents: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/fairs/invite', formData);
            setSuccess('Fair invitation sent successfully!');
            setError('');
            setFormData({
                schoolName: '',
                city: '',
                fairDate: '',
                contactPerson: '',
                contactEmail: '',
                contactPhone: '',
                expectedStudents: '',
                notes: ''
            });
        } catch (error) {
            setError('Failed to send fair invitation. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="fair-form-container">
            <h2>Invite School to Fair</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>School Name</Form.Label>
                    <Form.Select
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select School</option>
                        {schools.map(school => (
                            <option key={school} value={school}>{school}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select City</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
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

                <Button variant="primary" type="submit">
                    Send Invitation
                </Button>
            </Form>
        </div>
    );
};

export default InviteToFairForm; 