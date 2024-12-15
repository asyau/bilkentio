import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const userRole = localStorage.getItem('userRole');

    const renderFairManagementLinks = () => {
        switch (userRole) {
            case 'ROLE_COUNSELOR':
                return (
                    <>
                        <Nav.Link as={Link} to="/counselor/request-fair">
                            Request Fair Visit
                        </Nav.Link>
                        <Nav.Link as={Link} to="/counselor/my-fairs">
                            My Fair Requests
                        </Nav.Link>
                    </>
                );
            case 'ROLE_COORDINATOR':
                return (
                    <>
                        <Nav.Link as={Link} to="/coordinator/fair-applications">
                            Manage Fair Requests
                        </Nav.Link>
                        <Nav.Link as={Link} to="/coordinator/assign-guides">
                            Assign Guides
                        </Nav.Link>
                    </>
                );
            case 'ROLE_GUIDE':
                return (
                    <Nav.Link as={Link} to="/guide/assigned-fairs">
                        My Assigned Fairs
                    </Nav.Link>
                );
            case 'ROLE_ADMIN':
                return (
                    <>
                        <Nav.Link as={Link} to="/admin/fair-management">
                            Fair Management
                        </Nav.Link>
                        <Nav.Link as={Link} to="/admin/fair-statistics">
                            Fair Statistics
                        </Nav.Link>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="sidebar">
            <Nav className="flex-column">
                {/* Common links */}
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>

                {/* Fair Management Section */}
                <div className="sidebar-section">
                    <h6 className="sidebar-heading">Fair Management</h6>
                    {renderFairManagementLinks()}
                </div>

                {/* Other sections... */}
            </Nav>
        </div>
    );
};

export default Sidebar; 