import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { cities } from '../../constants/cities';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Fair.css';

const ViewFairApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [selectedCity, setSelectedCity] = useState('all');
    const [rankingFilter, setRankingFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/fairs', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setApplications(response.data);
            setFilteredApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const filterApplications = () => {
        let filtered = [...applications];

        if (selectedCity !== 'all') {
            filtered = filtered.filter(app => app.city === selectedCity);
        }

        if (rankingFilter !== 'all') {
            switch (rankingFilter) {
                case 'high':
                    filtered = filtered.filter(app => app.schoolRank >= 8);
                    break;
                case 'medium':
                    filtered = filtered.filter(app => app.schoolRank >= 5 && app.schoolRank < 8);
                    break;
                case 'low':
                    filtered = filtered.filter(app => app.schoolRank < 5);
                    break;
                default:
                    break;
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(app =>
                app.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredApplications(filtered);
    };

    useEffect(() => {
        filterApplications();
    }, [selectedCity, rankingFilter, searchTerm]);

    const handleStatusUpdate = async (fairId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/api/fairs/${fairId}/status`, null, {
                params: { status: newStatus },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchApplications();
        } catch (error) {
            alert('Error updating status: ' + error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <div className="applications-container">
                    <h1>Fair Applications</h1>

                    <div className="filters">
                        <input
                            type="text"
                            placeholder="Search schools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />

                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        <select
                            value={rankingFilter}
                            onChange={(e) => setRankingFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Rankings</option>
                            <option value="high">High Priority (8-10)</option>
                            <option value="medium">Medium Priority (5-7)</option>
                            <option value="low">Low Priority (1-4)</option>
                        </select>
                    </div>

                    <div className="applications-grid">
                        {filteredApplications.map(app => (
                            <div key={app.id} className={`application-card ${app.status.toLowerCase()}`}>
                                <div className="card-header">
                                    <h3>{app.schoolName}</h3>
                                    <span className={`rank-badge rank-${Math.floor(app.schoolRank || 0)}`}>
                                        {app.schoolRank ? `Rank: ${app.schoolRank.toFixed(1)}` : 'Unranked'}
                                    </span>
                                </div>
                                <div className="card-content">
                                    <p><strong>City:</strong> {app.city}</p>
                                    <p><strong>Date:</strong> {new Date(app.date).toLocaleDateString()}</p>
                                    <p><strong>Expected Students:</strong> {app.expectedStudents || 'Not specified'}</p>
                                    <p><strong>Contact:</strong> {app.contactPerson}</p>
                                    <p><strong>Status:</strong> {app.status}</p>
                                </div>
                                <div className="card-actions">
                                    {app.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                                                className="accept-btn"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                                className="reject-btn"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewFairApplications; 