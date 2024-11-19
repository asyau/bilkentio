import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/PuantajScores.css';
import { checkAdminRole } from '../utils/roleCheck';

const PuantajScores = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeComponent = async () => {
      const { isAuthorized, error } = await checkAdminRole();
      
      if (!isAuthorized) {
        if (error === 'No token found') {
          navigate('/login');
        } else {
          navigate('/unauthorized');
        }
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/api/guides', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setGuides(response.data);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="puantaj-container">
          <h1>Guide List</h1>
          <div className="scores-grid">
            {guides.map(guide => (
              <div key={guide.id} className="score-card">
                <div className="guide-info">
                  <h3>{guide.nameSurname}</h3>
                  <p className="username">@{guide.username}</p>
                </div>
                <div className="score-details">
                  <div className="score-item">
                    <span className="material-icons">star</span>
                    <div className="score-text">
                      <p>Points</p>
                      <h4>{guide.score}</h4>
                    </div>
                  </div>
                  <div className="score-item">
                    <span className="material-icons">military_tech</span>
                    <div className="score-text">
                      <p>Level</p>
                      <h4>{guide.level}</h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuantajScores; 