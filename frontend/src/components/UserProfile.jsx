import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ userProfile, setUserProfile }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userStats, setUserStats] = useState({
    filesUploaded: 0,
    chartsCreated: 0,
    storageUsed: '0 MB',
    lastLogin: 'N/A'
  });

  // Get backend URL
  const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl;
    return 'http://localhost:5000';
  };

  // Load real user data on component mount
  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      
      // Check if we have a token first
      if (!token) {
        console.log('No token found, using default profile data');
        // Use default profile data if no token
        const defaultProfile = {
          name: 'Demo User',
          email: 'demo@example.com',
          joinDate: new Date().toISOString()
        };
        setUserProfile(defaultProfile);
        setEditedProfile(defaultProfile);
        return;
      }

      console.log('Attempting to load profile from backend:', `${backendUrl}/api/auth/profile`);
      
      const response = await axios.get(`${backendUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // 5 second timeout
      });

      const realUserData = {
        name: response.data.user.username,
        email: response.data.user.email,
        joinDate: response.data.user.joinDate || new Date().toISOString()
      };

      setUserProfile(realUserData);
      setEditedProfile(realUserData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Backend server is not running. Please start the backend server first.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        setError('Profile endpoint not found. The backend is running but the profile route is not configured properly.');
      } else {
        setError('Failed to load user profile. Please try again later.');
      }
      
      // Fallback to default profile data
      const defaultProfile = {
        name: 'Demo User',
        email: 'demo@example.com',
        joinDate: new Date().toISOString()
      };
      setUserProfile(defaultProfile);
      setEditedProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      
      if (!token) {
        // If no token, just update local state for demo
        setUserProfile(editedProfile);
        setIsEditing(false);
        setSuccess('Profile updated successfully! (Demo mode)');
        setTimeout(() => setSuccess(null), 3000);
        return;
      }

      const response = await axios.put(`${backendUrl}/api/auth/profile`, {
        username: editedProfile.name,
        email: editedProfile.email
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      setUserProfile(editedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Backend server is not running. Profile changes saved locally only.');
        // Still update local state for demo purposes
        setUserProfile(editedProfile);
        setIsEditing(false);
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const loadUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      
      if (!token) {
        console.log('No token found, using default stats');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user files
      const filesResponse = await axios.get(`${backendUrl}/api/history`, { headers });
      const files = filesResponse.data.files || [];

      // Fetch user charts
      const chartsResponse = await axios.get(`${backendUrl}/api/charts/user`, { headers });
      const charts = chartsResponse.data.charts || [];

      // Calculate storage used (sum of file sizes)
      const totalStorageBytes = files.reduce((total, file) => {
        return total + (file.fileSize || 0);
      }, 0);

      // Convert to MB
      const storageUsedMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

      // Get last login from user profile data
      const profileResponse = await axios.get(`${backendUrl}/api/auth/profile`, { headers });
      const lastLogin = profileResponse.data.user?.lastLogin || new Date().toISOString();

      setUserStats({
        filesUploaded: files.length,
        chartsCreated: charts.length,
        storageUsed: `${storageUsedMB} MB`,
        lastLogin: new Date(lastLogin).toLocaleString()
      });

    } catch (error) {
      console.error('Error loading user stats:', error);
      // Use default stats if there's an error
      setUserStats({
        filesUploaded: 0,
        chartsCreated: 0,
        storageUsed: '0 MB',
        lastLogin: 'N/A'
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setError('All password fields are required.');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match!');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long!');
        return;
      }

      const token = localStorage.getItem('token');
      const backendUrl = getBackendUrl();
      
      if (!token) {
        setError('Please log in to change your password.');
        return;
      }

      const response = await axios.post(`${backendUrl}/api/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('Backend server is not running. Password change requires backend connection.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRedirect = () => {
    navigate('/forgot-password');
  };





  return (
    <div style={{ padding: '2rem' }}>
      {/* Error and Success Messages */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>
          {success}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h3>User Profile</h3>
        <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
          Manage your account information and preferences
        </p>
      </div>

      {loading && !userProfile.name && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#007bff' }}></i>
          <p>Loading profile...</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Profile Information */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: 0, color: '#495057' }}>
              <i className="fas fa-user" style={{ marginRight: '0.5rem' }}></i>
              Profile Information
            </h4>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <i className="fas fa-edit" style={{ marginRight: '0.5rem' }}></i>
                Edit Profile
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  {userProfile.name}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  {userProfile.email}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                Member Since
              </label>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                {new Date(userProfile.joinDate).toLocaleDateString()}
              </div>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #dee2e6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 1.5rem 0', color: '#495057' }}>
            <i className="fas fa-cog" style={{ marginRight: '0.5rem' }}></i>
            Account Settings
          </h4>

          {/* Change Password */}
          <div style={{ marginBottom: '2rem' }}>
            <h5 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Change Password</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter your current password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter your new password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm your new password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

                             <button
                 onClick={handleChangePassword}
                 disabled={loading}
                 style={{
                   padding: '0.75rem 1.5rem',
                   backgroundColor: '#17a2b8',
                   color: 'white',
                   border: 'none',
                   borderRadius: '6px',
                   cursor: loading ? 'not-allowed' : 'pointer',
                   fontSize: '1rem',
                   opacity: loading ? 0.6 : 1
                 }}
               >
                 <i className="fas fa-key" style={{ marginRight: '0.5rem' }}></i>
                 {loading ? 'Changing...' : 'Change Password'}
               </button>
             </div>
           </div>

           {/* Forgot Password Link */}
           <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
             <h5 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
               <i className="fas fa-question-circle" style={{ marginRight: '0.5rem' }}></i>
               Forgot Password?
             </h5>
             <p style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
               If you've forgotten your password, click the link below to reset it.
             </p>
             <button
               onClick={handleForgotPasswordRedirect}
               style={{
                 padding: '0.75rem 1.5rem',
                 backgroundColor: '#6f42c1',
                 color: 'white',
                 border: 'none',
                 borderRadius: '6px',
                 cursor: 'pointer',
                 fontSize: '1rem',
                 transition: 'all 0.3s ease'
               }}
               onMouseEnter={(e) => {
                 e.target.style.backgroundColor = '#5a32a3';
                 e.target.style.transform = 'translateY(-1px)';
               }}
               onMouseLeave={(e) => {
                 e.target.style.backgroundColor = '#6f42c1';
                 e.target.style.transform = 'translateY(0)';
               }}
             >
               <i className="fas fa-external-link-alt" style={{ marginRight: '0.5rem' }}></i>
               Go to Forgot Password Page
             </button>
           </div>

          

                     {/* Account Statistics */}
           <div style={{ marginBottom: '2rem' }}>
             <h5 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Account Statistics</h5>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8f9fa' }}>
                 <span style={{ color: '#6c757d' }}>Files Uploaded:</span>
                 <span style={{ fontWeight: 'bold', color: '#495057' }}>{userStats.filesUploaded}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8f9fa' }}>
                 <span style={{ color: '#6c757d' }}>Charts Created:</span>
                 <span style={{ fontWeight: 'bold', color: '#495057' }}>{userStats.chartsCreated}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8f9fa' }}>
                 <span style={{ color: '#6c757d' }}>Storage Used:</span>
                 <span style={{ fontWeight: 'bold', color: '#495057' }}>{userStats.storageUsed}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                 <span style={{ color: '#6c757d' }}>Last Login:</span>
                 <span style={{ fontWeight: 'bold', color: '#495057' }}>{userStats.lastLogin}</span>
               </div>
             </div>
           </div>


        </div>
      </div>
    </div>
  );
};

export default UserProfile; 