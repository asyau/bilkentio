import React, { useState } from 'react';
import axios from 'axios';
import { cities } from '../../constants/cities';
import { schools } from '../../constants/schools';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Fair.css';

const InviteToFairForm = () => {
    const [formData, setFormData] = useState({
        schoolName: '',
        city: '',
        fairDate: null,
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        notes: '',
        expectedStudents: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:8080/api/fairs/invite',
                {
                    ...formData,
                    fairDate: formData.fairDate ? formData.fairDate.toISOString().split('T')[0] : null
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            alert('Invitation sent successfully!');
            setFormData({
                schoolName: '',
                city: '',
                fairDate: null,
                contactPerson: '',
                contactEmail: '',
                contactPhone: '',
                notes: '',
                expectedStudents: ''
            });
        } catch (error) {
            alert('Error sending invitation: ' + error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <div className="invite-form-container">
                    <h2>Invite School to Fair</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>School Name</label>
                            <select
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                required
                            >
                                <option value="">Select School</option>
                                {schools.map(school => (
                                    <option key={school} value={school}>{school}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <select
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            >
                                <option value="">Select City</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fair Date</label>
                            <DatePicker
                                selected={formData.fairDate}
                                onChange={(date) => setFormData({ ...formData, fairDate: date })}
                                dateFormat="yyyy-MM-dd"
                                minDate={new Date()}
                                className="date-picker"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Person</label>
                            <input
                                type="text"
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Email</label>
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input
                                type="tel"
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Expected Students</label>
                            <input
                                type="number"
                                value={formData.expectedStudents}
                                onChange={(e) => setFormData({ ...formData, expectedStudents: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="submit-btn">Send Invitation</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteToFairForm; 