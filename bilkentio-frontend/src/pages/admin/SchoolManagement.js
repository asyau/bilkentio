import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';
import '../../styles/SchoolManagement.css';

const CounselorPopup = ({ school, onClose }) => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/schools/${school.id}/counselors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCounselors(response.data);
      } catch (error) {
        console.error('Error fetching counselors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounselors();
  }, [school.id]);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>{school.name} - Counselors</h2>
          <button className="close-button" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="popup-body">
          {loading ? (
            <div className="loading">Loading counselors...</div>
          ) : counselors.length === 0 ? (
            <div className="no-counselors">No counselors assigned to this school</div>
          ) : (
            <div className="counselors-grid">
              {counselors.map(counselor => (
                <div key={counselor.id} className="counselor-card">
                  <div className="counselor-info">
                    <h3>{counselor.nameSurname}</h3>
                    <p><span className="material-icons">email</span> {counselor.email}</p>
                    <p><span className="material-icons">phone</span> {counselor.phoneNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [rankingFilter, setRankingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchSchools();
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/schools/cities', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/schools', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSchools(response.data);
      setFilteredSchools(response.data);
      console.log('Schools Data:', schools);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const filterSchools = () => {
    let filtered = [...schools];

    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(school => 
        school.city.trim().toLowerCase() === selectedCity.trim().toLowerCase()
      );
    }

    // Filter by ranking
    if (rankingFilter !== 'all') {
      switch (rankingFilter) {
        case 'low':
          filtered = filtered.filter(school => school.priorityRank >= 8);
          break;
        case 'medium':
          filtered = filtered.filter(school => school.priorityRank >= 5 && school.priorityRank < 8);
          break;
        case 'high':
          filtered = filtered.filter(school => school.priorityRank < 5);
          break;
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSchools(filtered);
  };

  useEffect(() => {
    filterSchools();
  }, [selectedCity, rankingFilter, searchTerm]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="school-management-container">
          <div className="dashboard-header">
            <h1>School Management</h1>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="material-icons">search</span>
            </div>
          </div>

          <div className="filters-section">
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
              <option value="high">High Priority (1-4)</option>
              <option value="medium">Medium Priority (5-7)</option>
              <option value="low">Low Priority (8-15)</option>
            </select>
          </div>

          <div className="schools-grid">
            {filteredSchools.map(school => (
              <div 
                key={school.id} 
                className="school-card"
                onClick={() => setSelectedSchool(school)}
              >
                <div className="school-header">
                  <h3>{school.name}</h3>
                  <span className={`ranking-badge rank-${Math.floor(school.priorityRank)}`}>
                    Priority Rank: {school.priorityRank}
                  </span>
                </div>
                <div className="school-info">
                  <p><span className="material-icons">location_on</span> {school.city}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedSchool && (
            <CounselorPopup 
              school={selectedSchool} 
              onClose={() => setSelectedSchool(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolManagement; 