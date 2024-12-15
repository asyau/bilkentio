import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Modal } from 'react-bootstrap';
import CoordinatorSidebar from '../../components/CoordinatorSidebar';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/FormRequests.css';
import '../../styles/Fair.css';

const ManageFairs = () => {
    const [fairs, setFairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedFairId, setSelectedFairId] = useState(null);
    const [guides, setGuides] = useState([]);
    const [selectedGuideId, setSelectedGuideId] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFairId, setExpandedFairId] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const userRole = localStorage.getItem('userRole');

    const FairStatus = {
        PENDING: 'PENDING',
        GUIDE_ASSIGNED: 'GUIDE_ASSIGNED',
        GUIDE_ACCEPTED: 'GUIDE_ACCEPTED',
        GUIDE_REJECTED: 'GUIDE_REJECTED',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED'
    };

    useEffect(() => {
        fetchFairs();
        fetchGuides();
    }, []);

    const fetchFairs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/fairs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFairs(response.data);
        } catch (error) {
            console.error('Error fetching fairs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGuides = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const guideUsers = response.data.filter(user =>
                user.roles && user.roles.includes('ROLE_GUIDE')
            );
            setGuides(guideUsers);
        } catch (error) {
            console.error('Error fetching guides:', error);
        }
    };

    const handleAssignGuide = async () => {
        if (!selectedGuideId) {
            alert('Please select a guide first');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8080/api/fairs/${selectedFairId}/assign-guide/${selectedGuideId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setShowAssignModal(false);
            setSelectedGuideId('');
            fetchFairs();
        } catch (error) {
            console.error('Error assigning guide:', error);
            alert('Failed to assign guide. Please try again.');
        }
    };

    const handleRejectFair = async (fairId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8080/api/fairs/${fairId}/status`,
                {
                    status: 'CANCELLED',
                    reason: rejectReason || ''
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setShowRejectModal(false);
            setRejectReason('');
            fetchFairs();
        } catch (error) {
            console.error('Error rejecting fair:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to reject fair. Please try again.');
            }
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return '#ffa500';
            case 'GUIDE_ASSIGNED': return '#2ecc71';
            case 'GUIDE_ACCEPTED': return '#27ae60';
            case 'GUIDE_REJECTED': return '#e74c3c';
            case 'COMPLETED': return '#3498db';
            case 'CANCELLED': return '#e74c3c';
            default: return '#bdc3c7';
        }
    };

    const toggleFairDetails = (fairId, e) => {
        e.stopPropagation();
        setExpandedFairId(expandedFairId === fairId ? null : fairId);
    };

    const filteredFairs = fairs.filter(fair => {
        const matchesStatus = filterStatus === 'ALL' || fair.status === filterStatus;
        const matchesSearch = fair.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fair.city.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="admin-layout">
                {userRole === 'ROLE_ADMIN' ? <AdminSidebar /> : <CoordinatorSidebar />}
                <div className="admin-content">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            {userRole === 'ROLE_ADMIN' ? <AdminSidebar /> : <CoordinatorSidebar />}
            <div className="admin-content">
                <div className="form-requests-container">
                    <div className="form-header">
                        <h2>Manage Fair Applications</h2>
                        <div className="filter-section">
                            <Form.Control
                                type="text"
                                placeholder="Search by school or city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <div className="status-filters">
                                <button
                                    className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('ALL')}
                                >
                                    All Status
                                </button>
                                <button
                                    className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('PENDING')}
                                >
                                    Pending
                                </button>
                                <button
                                    className={`filter-btn ${filterStatus === 'GUIDE_ASSIGNED' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('GUIDE_ASSIGNED')}
                                >
                                    Guide Assigned
                                </button>
                                <button
                                    className={`filter-btn ${filterStatus === 'CANCELLED' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('CANCELLED')}
                                >
                                    Cancelled
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="forms-list">
                        {filteredFairs.map(fair => {
                            const isExpanded = expandedFairId === fair.id;
                            return (
                                <div
                                    key={fair.id}
                                    className={`form-card ${isExpanded ? 'expanded' : ''}`}
                                    onClick={(e) => toggleFairDetails(fair.id, e)}
                                >
                                    <div className="form-header">
                                        <h3>{fair.schoolName}</h3>
                                        <span className="status-badge" style={{ backgroundColor: getStatusBadgeVariant(fair.status) }}>
                                            {fair.status}
                                        </span>
                                    </div>

                                    <div className="form-content">
                                        <div className="form-basic-info">
                                            <p><strong>City:</strong> {fair.city}</p>
                                            <p><strong>Date:</strong> {new Date(fair.date).toLocaleDateString()}</p>
                                            <p><strong>Expected Students:</strong> {fair.expectedStudents}</p>
                                        </div>

                                        <div className={`form-details ${isExpanded ? 'show' : ''}`}>
                                            <p><strong>School Rank:</strong> {fair.schoolRank}</p>
                                            <p><strong>Contact Person:</strong> {fair.contactPerson}</p>
                                            <p><strong>Contact Email:</strong> {fair.contactEmail}</p>
                                            <p><strong>Contact Phone:</strong> {fair.contactPhone}</p>
                                            {fair.notes && (
                                                <p><strong>Notes:</strong> {fair.notes}</p>
                                            )}
                                            {fair.assignedGuide && (
                                                <p><strong>Assigned Guide:</strong> {fair.assignedGuide.nameSurname}</p>
                                            )}
                                        </div>
                                    </div>

                                    {fair.status === 'PENDING' && (
                                        <div className="form-actions">
                                            <Button
                                                variant="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFairId(fair.id);
                                                    setShowAssignModal(true);
                                                }}
                                            >
                                                Assign Guide
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFairId(fair.id);
                                                    setShowRejectModal(true);
                                                }}
                                                className="ms-2"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Assign Guide to Fair</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Select Guide</Form.Label>
                                <Form.Select
                                    value={selectedGuideId}
                                    onChange={(e) => setSelectedGuideId(e.target.value)}
                                >
                                    <option value="">Choose a guide...</option>
                                    {guides.map(guide => (
                                        <option key={guide.id} value={guide.id}>
                                            {guide.nameSurname || guide.username}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAssignGuide}
                                disabled={!selectedGuideId}
                            >
                                Assign
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Reject Fair Request</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Reason for Rejection</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a reason for rejection..."
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleRejectFair(selectedFairId)}
                            >
                                Reject Fair
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default ManageFairs; 