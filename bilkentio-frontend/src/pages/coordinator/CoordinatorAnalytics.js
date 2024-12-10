import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import '../../styles/AdminAnalytics.css';
import CoordinatorSidebar from '../../components/CoordinatorSidebar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const CoordinatorAnalytics = () => {
  const [selectedMonth, setSelectedMonth] = useState('October');
  
  const stats = {
    totalStaff: {
      count: 22,
      change: 8.5,
      period: 'month'
    },
    totalTours: {
      count: 36,
      change: 1.3,
      period: 'year'
    },
    totalStudents: {
      count: 6800,
      change: 1.8,
      period: 'year'
    }
  };

  const chartData = {
    labels: ['5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k'],
    datasets: [
      {
        fill: true,
        label: 'Student Visits',
        data: [20, 30, 45, 40, 50, 35, 45, 55, 40, 50, 45, 50],
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
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="admin-layout">
      <CoordinatorSidebar />
      <div className="admin-content">
        <div className="analytics-container">
          <h1>Analytics</h1>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <h3>Total Staff</h3>
                <div className="stat-number">{stats.totalStaff.count}</div>
                <div className="stat-change positive">
                  ↑ {stats.totalStaff.change}% Up from last {stats.totalStaff.period}
                </div>
              </div>
              <div className="stat-icon staff">
                <span className="material-icons">groups</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <h3>Total Tours</h3>
                <div className="stat-number">{stats.totalTours.count}</div>
                <div className="stat-change positive">
                  ↑ {stats.totalTours.change}% Up from past {stats.totalTours.period}
                </div>
              </div>
              <div className="stat-icon tours">
                <span className="material-icons">trending_up</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <h3>Total Students Visited</h3>
                <div className="stat-number">{stats.totalStudents.count}</div>
                <div className="stat-change positive">
                  ↑ {stats.totalStudents.change}% Up from last {stats.totalStudents.period}
                </div>
              </div>
              <div className="stat-icon students">
                <span className="material-icons">school</span>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-header">
              <h2>Student Visit Details</h2>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-selector"
              >
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorAnalytics;
