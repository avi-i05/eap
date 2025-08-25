import React from 'react';

const DataPreview = ({ fileData, selectedFile }) => {
  if (!fileData || !selectedFile) return null;

  // Validate that fileData is actually an array of objects
  if (!Array.isArray(fileData) || fileData.length === 0) {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#dc3545' }}>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.5rem' }}></i>
          Data Preview Error: {selectedFile.fileName}
        </h4>
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '1rem',
          color: '#721c24'
        }}>
          <p><strong>Error:</strong> Invalid data format detected.</p>
          <p>The file appears to contain raw XML or binary content instead of parsed data.</p>
          <p>This usually happens when Excel files are not properly parsed. Please try:</p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>Re-uploading the file</li>
            <li>Ensuring the file is a valid Excel (.xlsx or .xls) format</li>
            <li>Checking that the file is not corrupted</li>
          </ul>
        </div>
      </div>
    );
  }

  // Check if the first row contains XML-like content
  const firstRow = fileData[0];
  if (firstRow && typeof firstRow === 'object') {
    const firstRowValues = Object.values(firstRow);
    const hasXmlContent = firstRowValues.some(value => 
      typeof value === 'string' && (
        value.includes('<?xml') || 
        value.includes('<') || 
        value.includes('PK') ||
        value.includes('Content_Types')
      )
    );

    if (hasXmlContent) {
      return (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', color: '#dc3545' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.5rem' }}></i>
            Data Preview Error: {selectedFile.fileName}
          </h4>
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '1rem',
            color: '#721c24'
          }}>
            <p><strong>Error:</strong> XML content detected in data.</p>
            <p>The file appears to contain raw XML content instead of parsed Excel data.</p>
            <p>This indicates that the Excel file was not properly parsed. Please try:</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Re-uploading the file</li>
              <li>Ensuring the file is a valid Excel format</li>
            </ul>
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Raw Data (First Row)</summary>
              <pre style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.8rem', 
                backgroundColor: '#f8f9fa', 
                padding: '0.5rem',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(firstRow, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      );
    }
  }

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ marginBottom: '1rem', color: '#333' }}>
        <i className="fas fa-table" style={{ marginRight: '0.5rem' }}></i>
        Data Preview: {selectedFile.fileName}
      </h4>
      
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Data Summary */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Rows:</strong> {fileData.length} | 
            <strong> Columns:</strong> {fileData.length > 0 ? Object.keys(fileData[0]).length : 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
            Showing first 10 rows
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef' }}>
                {fileData.length > 0 && Object.keys(fileData[0]).map((header, index) => (
                  <th key={index} style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                    fontWeight: 'bold',
                    color: '#495057'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fileData.slice(0, 10).map((row, rowIndex) => (
                <tr key={rowIndex} style={{
                  backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f8f9fa'
                }}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex} style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #dee2e6',
                      color: typeof value === 'number' ? '#28a745' : '#495057'
                    }}>
                      {formatValue(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show more indicator */}
        {fileData.length > 10 && (
          <div style={{
            padding: '0.75rem',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            fontSize: '0.9rem',
            borderTop: '1px solid #dee2e6'
          }}>
            ... and {fileData.length - 10} more rows
          </div>
        )}
      </div>

      {/* Column Types */}
      {fileData.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          <strong style={{ color: '#495057' }}>Column Types:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
            {Object.keys(fileData[0]).map((header, index) => {
              const sampleValues = fileData.slice(0, 5).map(row => row[header]);
              const hasNumbers = sampleValues.some(val => typeof val === 'number');
              const type = hasNumbers ? 'Number' : 'Text';
              
              return (
                <span key={index} style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: hasNumbers ? '#d4edda' : '#d1ecf1',
                  color: hasNumbers ? '#155724' : '#0c5460',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {header}: {type}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPreview; 