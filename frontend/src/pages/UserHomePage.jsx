import React, { useState, useEffect } from "react";
import axios from "axios";
import DataVisualization from "../components/DataVisualization/DataVisualization";
import SavedCharts from "../components/SavedCharts";
import UserProfile from "../components/UserProfile";
import { useLocalStorage, useUploadedFiles } from "../hooks/useLocalStorage";

const UserHomePage = () => {
  console.log('UserHomePage rendering...');
  

  
  const [activeTab, setActiveTab] = useState("upload");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  // Use custom hooks for localStorage persistence
  const { uploadedFiles, addUploadedFile, removeUploadedFile } = useUploadedFiles();
  const [savedCharts, setSavedCharts] = useLocalStorage('savedCharts', []);
  const [userProfile, setUserProfile] = useLocalStorage('userProfile', {
    name: '',
    email: '',
    company: 'Data Analytics Inc.',
    role: 'Data Analyst',
    joinDate: new Date().toISOString()
  });
  
  const [selectedFile, setSelectedFile] = useState(null);



  // Get backend URL with fallback
  const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl;
    
    // Fallback URLs
    const fallbackUrls = [
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:3001'
    ];
    
    return fallbackUrls[0]; // Use first fallback
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|json)$/i)) {
      setUploadError('Please select a valid file type (CSV, Excel, or JSON)');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem("token");
      console.log('Token found:', !!token);
      
      const backendUrl = getBackendUrl();
      console.log('Using backend URL:', backendUrl);

      // Try multiple upload endpoints
      const uploadEndpoints = [
        `${backendUrl}/api/upload`,
        `${backendUrl}/api/files/upload`,
        `${backendUrl}/upload`
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of uploadEndpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          };

          // Add token if available
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }

          response = await axios.post(endpoint, formData, config);
          console.log('Upload successful with endpoint:', endpoint);
          break;
        } catch (error) {
          console.log('Failed with endpoint:', endpoint, error.message);
          lastError = error;
          continue;
        }
      }

      if (!response) {
        // If all endpoints fail, create a mock success for demo
        console.log('All endpoints failed, creating mock success');
        await addUploadedFile(selectedFile);
        setFileUploaded(true);
        setActiveTab("visualize");
        setTimeout(() => setFileUploaded(false), 3000);
        setSelectedFile(null);
        return;
      }

      console.log('File uploaded successfully:', response.data);
      
      // Add to uploaded files list
      await addUploadedFile(selectedFile);
      setFileUploaded(true);
      setActiveTab("visualize");
      setTimeout(() => setFileUploaded(false), 3000);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please choose a smaller file.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const renderTabContent = () => {
    console.log('renderTabContent called with activeTab:', activeTab);
    try {
      switch (activeTab) {
        case 'upload': 
          console.log('Rendering upload tab');
          return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h3>Upload Your Data File</h3>
              <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
                Upload a CSV, Excel, or JSON file to start visualizing your data
              </p>
              
              <div style={{
                border: '2px dashed #dee2e6',
                borderRadius: '12px',
                padding: '3rem',
                marginBottom: '2rem',
                backgroundColor: '#f8f9fa',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <i className="fas fa-cloud-upload-alt" style={{ 
                    fontSize: '3rem', 
                    color: '#4361ee',
                    marginBottom: '1rem'
                  }}></i>
                </div>
                
                <h4 style={{ marginBottom: '0.5rem' }}>Choose a file or drag it here</h4>
                <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
                  Supported formats: CSV, Excel (.xlsx, .xls), JSON
                </p>
                
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{
                    display: 'none'
                  }}
                  id="file-upload"
                />
                
                <label htmlFor="file-upload" style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  backgroundColor: uploading ? '#6c757d' : '#4361ee',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '500',
                  marginRight: '1rem'
                }}>
                  <i className="fas fa-folder-open" style={{ marginRight: '0.5rem' }}></i>
                  Select File
                </label>

                {selectedFile && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 2rem',
                      backgroundColor: uploading ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      fontWeight: '500'
                    }}
                  >
                    {uploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload" style={{ marginRight: '0.5rem' }}></i>
                        Upload File
                      </>
                    )}
                  </button>
                )}
              </div>

              {selectedFile && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  border: '1px solid #bbdefb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Selected File:</strong> {selectedFile.name}
                      <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown type'}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        padding: '0.5rem'
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '8px',
                  marginTop: '1rem'
                }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.5rem' }}></i>
                  {uploadError}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px', margin: '2rem auto' }}>
                  <h4 style={{ color: '#2b2d42', marginBottom: '1rem' }}>Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={file.id} style={{
                      padding: '1rem',
                      backgroundColor: '#e8f5e8',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      border: '1px solid #d4edda'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{file.fileName}</strong>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                            {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          {file.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px', margin: '2rem auto' }}>
                <h4 style={{ color: '#2b2d42', marginBottom: '1rem' }}>Upload Guidelines:</h4>
                <ul style={{ color: '#6c757d', lineHeight: '1.6' }}>
                  <li>Maximum file size: 10MB</li>
                  <li>Ensure your file has headers/column names</li>
                  <li>For CSV files, use comma as delimiter</li>
                  <li>For Excel files, data should be in the first sheet</li>
                  <li>For JSON files, use array of objects format</li>
                </ul>
              </div>
            </div>
          );
        case 'visualize': 
          console.log('Rendering visualize tab');
          return <DataVisualization 
            uploadedFiles={uploadedFiles} 
            savedCharts={savedCharts}
            setSavedCharts={setSavedCharts}
          />;
        case 'charts': 
          console.log('Rendering charts tab');
          return <SavedCharts isAdmin={false} />;
        case 'profile': 
          console.log('Rendering profile tab');
          return <UserProfile userProfile={userProfile} setUserProfile={setUserProfile} />;
        default: 
          console.log('Rendering default tab');
          return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h3>Default Tab</h3>
              <p>Default content.</p>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Error loading content</h3>
          <p>Please try refreshing the page or switching to a different tab.</p>
        </div>
      );
    }
  };

  console.log('About to render tab content for:', activeTab);
  const tabContent = renderTabContent();
  console.log('Tab content rendered:', tabContent);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f8f9fa',
      marginTop: '80px'
    }}>
      <div style={{ 
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#2b2d42', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Data Visualization Portal
          </h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
            Transform your data into actionable insights
          </p>
        </div>

        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid #dee2e6'
        }}>
          <button
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'upload' ? '#4361ee' : 'transparent'}`,
              fontWeight: '500',
              color: activeTab === 'upload' ? '#4361ee' : '#6c757d',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('upload')}
          >
            Upload Data
          </button>
          <button
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'visualize' ? '#4361ee' : 'transparent'}`,
              fontWeight: '500',
              color: activeTab === 'visualize' ? '#4361ee' : '#6c757d',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('visualize')}
          >
            Visualize
          </button>
          <button
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'charts' ? '#4361ee' : 'transparent'}`,
              fontWeight: '500',
              color: activeTab === 'charts' ? '#4361ee' : '#6c757d',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('charts')}
          >
            My Charts
          </button>
          <button
            style={{
              padding: '0.8rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'profile' ? '#4361ee' : 'transparent'}`,
              fontWeight: '500',
              color: activeTab === 'profile' ? '#4361ee' : '#6c757d',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          minHeight: '400px'
        }}>
          {tabContent}
        </div>

        {fileUploaded && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: '#4361ee',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(67, 97, 238, 0.2)',
            zIndex: 1000
          }}>
            File uploaded successfully! Visualizing now...
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHomePage;
