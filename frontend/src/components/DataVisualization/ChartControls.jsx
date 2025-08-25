import React from 'react';

const ChartControls = ({ 
  charts, 
  generatedCharts, 
  generating, 
  onAddChart, 
  onGenerateCharts, 
  onSaveAll, 
  onDownloadAll 
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={onAddChart}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-plus"></i> Add Chart
        </button>
        
        <button
          onClick={onGenerateCharts}
          disabled={generating || charts.length === 0}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: generating ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: generating ? 'not-allowed' : 'pointer'
          }}
        >
          {generating ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Generating...
            </>
          ) : (
            <>
              <i className="fas fa-chart-bar"></i> Generate All Charts
            </>
          )}
        </button>

        <button
          onClick={onSaveAll}
          disabled={generatedCharts.length === 0}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: generatedCharts.length === 0 ? '#6c757d' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: generatedCharts.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          <i className="fas fa-save"></i> Save All
        </button>

        <button
          onClick={onDownloadAll}
          disabled={generatedCharts.length === 0}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: generatedCharts.length === 0 ? '#6c757d' : '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: generatedCharts.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          <i className="fas fa-download"></i> Download All
        </button>
      </div>
    </div>
  );
};

export default ChartControls; 