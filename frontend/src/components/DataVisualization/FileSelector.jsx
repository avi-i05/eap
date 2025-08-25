import React from 'react';

const FileSelector = ({ uploadedFiles, selectedFile, onFileSelect }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Select File to Visualize:
      </label>
      <select
        value={selectedFile?.id || ''}
        onChange={(e) => {
          const file = uploadedFiles.find(f => f.id == e.target.value);
          onFileSelect(file);
        }}
        style={{
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ddd',
          width: '300px'
        }}
      >
        <option value="">Choose a file...</option>
        {uploadedFiles.map(file => (
          <option key={file.id} value={file.id}>
            {file.fileName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FileSelector; 