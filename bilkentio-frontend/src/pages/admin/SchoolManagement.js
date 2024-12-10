import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';
import '../../styles/SchoolManagement.css';

const cities = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 
  'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 
  'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [rankingFilter, setRankingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

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
              <div key={school.id} className="school-card">
                <div className="school-header">
                  <h3>{school.name}</h3>
                  <span className={`ranking-badge rank-${Math.floor(school.priorityRank)}`}>
                    Priority Rank: {school.priorityRank}
                  </span>
                </div>
                <div className="school-info">
                  <p><span className="material-icons">location_on</span> {school.city}</p>
                  {/* <p><span className="material-icons">phone</span> {school.phone}</p>
                  <p><span className="material-icons">email</span> {school.email}</p>
                  <p><span className="material-icons">person</span> {school.contactPerson}</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolManagement; 