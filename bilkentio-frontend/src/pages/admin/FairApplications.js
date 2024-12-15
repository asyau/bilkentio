import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import '../../styles/Fair.css';

const FairApplications = () => {
    const [fairs, setFairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedFairId, setSelectedFairId] = useState(null);
    const [guides, setGuides] = useState([]);
    const [selectedGuideId, setSelectedGuideId] = useState('');
    const userRole = localStorage.getItem('userRole'); // Get user role from storage

    useEffect(() => {
        fetchFairs();
        if (userRole === 'ROLE_COORDINATOR') {
            fetchGuides();
        }
    }, [userRole]);

    const fetchFairs = async () => {
        try {
            const response = await axios.get('/api/fairs');
            setFairs(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching fairs:', error);
            setLoading(false);
        }
    };

    const fetchGuides = async () => {
        try {
            const response = await axios.get('/api/users/guides');
            setGuides(response.data);
        } catch (error) {
            console.error('Error fetching guides:', error);
        }
    };

    const handleAssignGuide = async () => {
        try {
            await axios.put(`/api/fairs/${selectedFairId}/assign-guide/${selectedGuideId}`);
            setShowAssignModal(false);
            fetchFairs(); // Refresh the list
        } catch (error) {
            console.error('Error assigning guide:', error);
        }
    };

    const handleGuideResponse = async (fairId, accepted) => {
        try {
            await axios.put(`/api/fairs/${fairId}/guide-response`, {
                guideId: localStorage.getItem('userId'),
                accepted: accepted
            });
            fetchFairs();
        } catch (error) {
            console.error('Error responding to fair assignment:', error);
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'GUIDE_ASSIGNED': return 'info';
            case 'GUIDE_ACCEPTED': return 'success';
            case 'GUIDE_REJECTED': return 'danger';
            case 'COMPLETED': return 'primary';
            case 'CANCELLED': return 'secondary';
            default: return 'light';
        }
    };

    const renderActionButtons = (fair) => {
        if (userRole === 'ROLE_COORDINATOR' && fair.status === 'PENDING') {
            return (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        setSelectedFairId(fair.id);
                        setShowAssignModal(true);
                    }}
                >
                    Assign Guide
                </Button>
            );
        } else if (userRole === 'ROLE_GUIDE' &&
            fair.status === 'GUIDE_ASSIGNED' &&
            fair.assignedGuideId === parseInt(localStorage.getItem('userId'))) {
            return (
                <>
                    <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleGuideResponse(fair.id, true)}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleGuideResponse(fair.id, false)}
                    >
                        Reject
                    </Button>
                </>
            );
        }
        return null;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="fair-applications-container">
            <h2>Fair Applications</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>School Name</th>
                        <th>City</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>School Rank</th>
                        <th>Contact Person</th>
                        <th>Expected Students</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {fairs.map(fair => (
                        <tr key={fair.id}>
                            <td>{fair.schoolName}</td>
                            <td>{fair.city}</td>
                            <td>{new Date(fair.date).toLocaleDateString()}</td>
                            <td>
                                <Badge bg={getStatusBadgeVariant(fair.status)}>
                                    {fair.status}
                                </Badge>
                            </td>
                            <td>{fair.schoolRank}</td>
                            <td>{fair.contactPerson}</td>
                            <td>{fair.expectedStudents}</td>
                            <td>{renderActionButtons(fair)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Guide to Fair</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Select Guide</Form.Label>
                            <Form.Select
                                value={selectedGuideId}
                                onChange={(e) => setSelectedGuideId(e.target.value)}
                            >
                                <option value="">Choose a guide...</option>
                                {guides.map(guide => (
                                    <option key={guide.id} value={guide.id}>
                                        {guide.nameSurname}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAssignGuide}>
                        Assign Guide
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FairApplications; 