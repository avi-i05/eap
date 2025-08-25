import React from 'react';

const FileHistory = ({ uploadedFiles, onFileSelect, selectedFile }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return 'fas fa-file-csv';
      case 'xlsx':
      case 'xls':
        return 'fas fa-file-excel';
      case 'json':
        return 'fas fa-file-code';
      case 'txt':
        return 'fas fa-file-alt';
      case 'pdf':
        return 'fas fa-file-pdf';
      default:
        return 'fas fa-file';
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ marginBottom: '1rem', color: '#333' }}>
        <i className="fas fa-history" style={{ marginRight: '0.5rem' }}></i>
        Upload History
      </h4>
      
      {uploadedFiles.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px dashed #dee2e6'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '3rem', color: '#6c757d', marginBottom: '1rem' }}></i>
          <p style={{ color: '#6c757d', margin: 0 }}>No files uploaded yet</p>
          <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
            Upload files in the Upload tab to see them here
          </p>
        </div>
      ) : (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          {uploadedFiles.map((file, index) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file)}
              style={{
                padding: '1rem',
                borderBottom: index < uploadedFiles.length - 1 ? '1px solid #dee2e6' : 'none',
                cursor: 'pointer',
                backgroundColor: selectedFile?.id === file.id ? '#e3f2fd' : 'transparent',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
              onMouseEnter={(e) => {
                if (selectedFile?.id !== file.id) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFile?.id !== file.id) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* File Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: selectedFile?.id === file.id ? '#2196f3' : '#6c757d',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem'
              }}>
                <i className={getFileIcon(file.fileName)}></i>
              </div>

              {/* File Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '0.25rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {file.fileName}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#6c757d',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <span>
                    <i className="fas fa-weight-hanging" style={{ marginRight: '0.25rem' }}></i>
                    {formatFileSize(file.fileSize || 0)}
                  </span>
                  <span>
                    <i className="fas fa-calendar" style={{ marginRight: '0.25rem' }}></i>
                    {formatDate(file.uploadDate || new Date())}
                  </span>
                  {file.uploadStatus && (
                    <span style={{
                      color: file.uploadStatus === 'success' ? '#28a745' : 
                             file.uploadStatus === 'error' ? '#dc3545' : '#ffc107'
                    }}>
                      <i className={`fas fa-${file.uploadStatus === 'success' ? 'check-circle' : 
                                       file.uploadStatus === 'error' ? 'exclamation-circle' : 'clock'}`} 
                         style={{ marginRight: '0.25rem' }}></i>
                      {file.uploadStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedFile?.id === file.id && (
                <div style={{
                  color: '#2196f3',
                  fontSize: '1.2rem'
                }}>
                  <i className="fas fa-check-circle"></i>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                opacity: 0,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '0';
              }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add download functionality here
                    console.log('Downloading file:', file.fileName);
                  }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  title="Download file"
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {uploadedFiles.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '0.9rem',
          color: '#6c757d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
          </span>
          <span>
            Total size: {formatFileSize(uploadedFiles.reduce((total, file) => total + (file.fileSize || 0), 0))}
          </span>
        </div>
      )}
    </div>
  );
};

export default FileHistory; 