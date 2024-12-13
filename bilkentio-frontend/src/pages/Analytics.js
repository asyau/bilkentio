import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    Filler,
} from 'chart.js';
import { Line as ChartJSLine } from 'react-chartjs-2';
import '../styles/Analytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    ChartLegend,
    Filler
);

const Analytics = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [cities, setCities] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('October');
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [comparisonCities, setComparisonCities] = useState({
        city1: '',
        city2: ''
    });
    const [staffCounts, setStaffCounts] = useState({
        guides: 0,
        counselors: 0
    });

    const COLORS = ['#4299E1', '#48BB78', '#F6AD55', '#F56565', '#9F7AEA', '#ED64A6'];
    const CHART_COLORS = {
        primary: 'rgb(65, 105, 225)',
        primaryLight: 'rgba(65, 105, 225, 0.1)',
        secondary: '#48BB78',
        secondaryLight: 'rgba(72, 187, 120, 0.1)'
    };

    const chartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                fill: true,
                label: 'Student Visits',
                data: [analytics.totalStudentsVisited * 0.2, 
                       analytics.totalStudentsVisited * 0.4, 
                       analytics.totalStudentsVisited * 0.7, 
                       analytics.totalStudentsVisited],
                borderColor: 'rgb(65, 105, 225)',
                backgroundColor: 'rgba(65, 105, 225, 0.1)',
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'white',
                titleColor: '#2d3748',
                bodyColor: '#2d3748',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `${context.parsed.y} students`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f0f0f0'
                },
                ticks: {
                    color: '#718096'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#718096'
                }
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAnalytics();
        fetchCities();
        fetchStaffCounts();
    }, [navigate]);

    const fetchCities = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/schools/cities', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCities(response.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const fetchStaffCounts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            const guides = response.data.filter(user => 
                user.roles.includes('ROLE_GUIDE')
            ).length;

            const counselors = response.data.filter(user => 
                user.roles.includes('ROLE_COUNSELOR')
            ).length;

            setStaffCounts({
                guides,
                counselors
            });
        } catch (error) {
            console.error('Error fetching staff counts:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/analytics/${activeTab}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [activeTab]);

    const handleDateRangeSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/analytics/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching date range analytics:', error);
        }
    };

    const handleCityComparison = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/analytics/comparison?city1=${comparisonCities.city1}&city2=${comparisonCities.city2}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching city comparison:', error);
        }
    };

    const renderOverviewSection = () => (
        <div className="analytics-grid">
            <div className="stat-card">
                <div className="stat-content">
                    <h3>Total Students</h3>
                    <div className="stat-number">{analytics.totalStudentsVisited || 0}</div>
                </div>
                <div className="stat-icon students">
                    <span className="material-icons">groups</span>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-content">
                    <h3>Total Schools</h3>
                    <div className="stat-number">{analytics.totalSchoolsVisited || 0}</div>
                </div>
                <div className="stat-icon schools">
                    <span className="material-icons">school</span>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-content">
                    <h3>Total Counselors</h3>
                    <div className="stat-number">{staffCounts.counselors}</div>
                </div>
                <div className="stat-icon counselors">
                    <span className="material-icons">supervisor_account</span>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-content">
                    <h3>Total Guides</h3>
                    <div className="stat-number">{staffCounts.guides}</div>
                </div>
                <div className="stat-icon guides">
                    <span className="material-icons">tour</span>
                </div>
            </div>
        </div>
    );

    const renderSchoolAnalytics = () => {
        const schoolData = Object.entries(analytics.schoolVisitCounts || {})
            .map(([name, count]) => ({
                name,
                visits: count
            }))
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 10);

        return (
            <div className="analytics-section">
                <h3>Top 10 School Performance</h3>
                <div style={{ height: '600px', marginBottom: '40px', marginLeft: '60px', marginRight: '60px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={schoolData} 
                            margin={{ top: 20, right: 30, left: 40, bottom: 100 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '10px'
                                }} 
                            />
                            <Bar 
                                dataKey="visits" 
                                fill={CHART_COLORS.primary}
                                radius={[4, 4, 0, 0]}
                            >
                                {schoolData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderCityAnalytics = () => {
        const cityData = Object.entries(analytics.cityVisitCounts || {})
            .map(([name, value]) => ({
                name,
                value
            }))
            .sort((a, b) => b.value - a.value);

        return (
            <div className="analytics-section">
                <h3>City Distribution</h3>
                <div className="city-analytics-container">
                    <div className="city-chart" style={{ height: '400px', marginBottom: '40px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={cityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {cityData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => [`${value} visits`, name]}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="city-stats-grid">
                        {cityData.map((city, index) => (
                            <div key={city.name} className="city-stat-item">
                                <div className="city-color-indicator" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="city-name">{city.name}</span>
                                <span className="city-value">{city.value} visits</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderTimeAnalytics = () => (
        <div className="analytics-section">
            <h3>Time Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={Object.entries(analytics.monthlyVisits || {}).map(([month, count]) => ({
                    month,
                    visits: count
                }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderFeedbackAnalytics = () => (
        <div className="analytics-section">
            <h3>Feedback Distribution</h3>
            <div className="feedback-stats">
                <div className="stat-card">
                    <div className="stat-content">
                        <h4>Total Feedback</h4>
                        <div className="stat-number">{analytics.totalFeedbackCount || 0}</div>
                    </div>
                    <div className="stat-icon feedback">
                        <span className="material-icons">chat</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <h4>Pending Feedback</h4>
                        <div className="stat-number">{analytics.pendingFeedbackCount || 0}</div>
                    </div>
                    <div className="stat-icon pending">
                        <span className="material-icons">pending</span>
                    </div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                    data={Object.entries(analytics.ratingDistribution || {}).map(([rating, count]) => ({
                        rating: `${rating} Stars`,
                        count
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="rating" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                    <Legend />
                    <Bar 
                        dataKey="count" 
                        fill={CHART_COLORS.secondary}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );

    const renderDateRangeAnalytics = () => (
        <div className="analytics-section">
            <h3>Date Range Analysis</h3>
            <div className="date-range-inputs">
                <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="date-input"
                />
                <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="date-input"
                />
                <button onClick={handleDateRangeSubmit} className="analyze-button">
                    Analyze
                </button>
            </div>
            {analytics.dailyDistribution && (
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart 
                        data={Object.entries(analytics.dailyDistribution).map(([date, count]) => ({
                            date,
                            students: count
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                        <Legend />
                        <Area 
                            type="monotone" 
                            dataKey="students" 
                            stroke={CHART_COLORS.primary}
                            fill={CHART_COLORS.primaryLight}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );

    const renderCityComparison = () => (
        <div className="analytics-section">
            <h3>City Comparison</h3>
            <div className="city-comparison-inputs">
                <select
                    value={comparisonCities.city1}
                    onChange={(e) => setComparisonCities({ ...comparisonCities, city1: e.target.value })}
                    className="city-select"
                >
                    <option value="">Select First City</option>
                    {cities.map(city => (
                        <option key={`city1-${city}`} value={city}>{city}</option>
                    ))}
                </select>
                <select
                    value={comparisonCities.city2}
                    onChange={(e) => setComparisonCities({ ...comparisonCities, city2: e.target.value })}
                    className="city-select"
                >
                    <option value="">Select Second City</option>
                    {cities.map(city => (
                        <option key={`city2-${city}`} value={city}>{city}</option>
                    ))}
                </select>
                <button onClick={handleCityComparison} className="compare-button">
                    Compare
                </button>
            </div>
            {analytics.city1Stats && analytics.city2Stats && (
                <div className="comparison-container">
                    <div className="comparison-stats">
                        <div className="comparison-card">
                            <h4>{comparisonCities.city1}</h4>
                            <div className="comparison-metric">
                                <span className="metric-label">Tours</span>
                                <span className="metric-value">{analytics.city1Stats.totalTours}</span>
                            </div>
                            <div className="comparison-metric">
                                <span className="metric-label">Students</span>
                                <span className="metric-value">{analytics.city1Stats.totalStudents}</span>
                            </div>
                            <div className="comparison-metric">
                                <span className="metric-label">Rating</span>
                                <span className="metric-value">{analytics.city1Stats.averageRating.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="comparison-vs">VS</div>
                        <div className="comparison-card">
                            <h4>{comparisonCities.city2}</h4>
                            <div className="comparison-metric">
                                <span className="metric-label">Tours</span>
                                <span className="metric-value">{analytics.city2Stats.totalTours}</span>
                            </div>
                            <div className="comparison-metric">
                                <span className="metric-label">Students</span>
                                <span className="metric-value">{analytics.city2Stats.totalStudents}</span>
                            </div>
                            <div className="comparison-metric">
                                <span className="metric-label">Rating</span>
                                <span className="metric-value">{analytics.city2Stats.averageRating.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="comparison-chart">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={[
                                    {
                                        metric: 'Tours',
                                        [comparisonCities.city1]: analytics.city1Stats.totalTours,
                                        [comparisonCities.city2]: analytics.city2Stats.totalTours
                                    },
                                    {
                                        metric: 'Students',
                                        [comparisonCities.city1]: analytics.city1Stats.totalStudents,
                                        [comparisonCities.city2]: analytics.city2Stats.totalStudents
                                    },
                                    {
                                        metric: 'Rating',
                                        [comparisonCities.city1]: analytics.city1Stats.averageRating,
                                        [comparisonCities.city2]: analytics.city2Stats.averageRating
                                    }
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="metric" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey={comparisonCities.city1} fill={CHART_COLORS.primary} />
                                <Bar dataKey={comparisonCities.city2} fill={CHART_COLORS.secondary} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="analytics-container">
            <AdminSidebar />
            <div className="analytics-content">
                <div className="analytics-header">
                    <h2>Analytics Dashboard</h2>
                    <div className="tab-buttons">
                        <button
                            className={activeTab === 'overview' ? 'active' : ''}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={activeTab === 'schools' ? 'active' : ''}
                            onClick={() => setActiveTab('schools')}
                        >
                            Schools
                        </button>
                        <button
                            className={activeTab === 'cities' ? 'active' : ''}
                            onClick={() => setActiveTab('cities')}
                        >
                            Cities
                        </button>
                        <button
                            className={activeTab === 'time' ? 'active' : ''}
                            onClick={() => setActiveTab('time')}
                        >
                            Time
                        </button>
                        <button
                            className={activeTab === 'feedback' ? 'active' : ''}
                            onClick={() => setActiveTab('feedback')}
                        >
                            Feedback
                        </button>
                        <button
                            className={activeTab === 'date-range' ? 'active' : ''}
                            onClick={() => setActiveTab('date-range')}
                        >
                            Date Range
                        </button>
                        <button
                            className={activeTab === 'comparison' ? 'active' : ''}
                            onClick={() => setActiveTab('comparison')}
                        >
                            City Comparison
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading analytics...</div>
                ) : (
                    <div className="analytics-body">
                        {activeTab === 'overview' && renderOverviewSection()}
                        {activeTab === 'schools' && renderSchoolAnalytics()}
                        {activeTab === 'cities' && renderCityAnalytics()}
                        {activeTab === 'time' && renderTimeAnalytics()}
                        {activeTab === 'feedback' && renderFeedbackAnalytics()}
                        {activeTab === 'date-range' && renderDateRangeAnalytics()}
                        {activeTab === 'comparison' && renderCityComparison()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics; 