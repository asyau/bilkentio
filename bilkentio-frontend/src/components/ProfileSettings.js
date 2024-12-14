import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ProfileSettings.css';

const ProfileSettings = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  const checkUsername = async (username) => {
    if (!username) {
      setUsernameAvailable(true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/users/check-username/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setMessage({ text: 'Error checking username availability', type: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'username') {
      checkUsername(value);
    }
  };

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    if (!usernameAvailable) {
      setMessage({ text: 'Username is already taken. Please choose another one.', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:8080/api/users/update-username',
        { username: formData.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setMessage({ text: 'Username updated successfully!', type: 'success' });
      setFormData({ ...formData, username: '' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Error updating username', type: 'error' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: 'New passwords do not match!', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId;

      await axios.post(
        `http://localhost:8080/api/users/${userId}/change-password`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setFormData({
        ...formData,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Error changing password', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>Profile Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {message.text && (
          <div className={`alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-section">
          <h3>Change Username</h3>
          <form onSubmit={handleUsernameUpdate}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="New Username"
                className={!usernameAvailable ? 'input-error' : ''}
              />
              {!usernameAvailable && (
                <span className="error-message">Username is already taken</span>
              )}
            </div>
            <button type="submit" disabled={!usernameAvailable || !formData.username}>
              Update Username
            </button>
          </form>
        </div>

        <div className="settings-section">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Current Password"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="New Password"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
              />
            </div>
            <button 
              type="submit" 
              disabled={!formData.oldPassword || !formData.newPassword || !formData.confirmPassword}
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 