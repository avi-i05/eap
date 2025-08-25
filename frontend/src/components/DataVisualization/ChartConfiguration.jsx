import React from 'react';
import FieldSelector from './FieldSelector';

const ChartConfiguration = ({ charts, fileData, onUpdateChart, onRemoveChart }) => {
  const addField = (chartId) => {
    const chart = charts.find(c => c.id === chartId);
    if (chart && !(["pie", "doughnut"].includes(chart.chartType))) {
      const fields = Object.keys(fileData[0]);
      const newField = {
        label: fields[0] || 'field1',
        value: fields[1] || 'field2',
        color: `hsl(${(chart.selectedFields.length * 60) % 360}, 70%, 60%)`
      };
      
      onUpdateChart(chartId, {
        selectedFields: [...chart.selectedFields, newField]
      });
    }
  };

  const removeField = (chartId, fieldIndex) => {
    const chart = charts.find(c => c.id === chartId);
    if (chart && chart.selectedFields.length > 1) {
      const updatedFields = chart.selectedFields.filter((_, index) => index !== fieldIndex);
      onUpdateChart(chartId, { selectedFields: updatedFields });
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h4>Chart Configuration</h4>
      {charts.map(chart => (
        <div key={chart.id} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h5 style={{ margin: 0 }}>{chart.title}</h5>
            <button
              onClick={() => onRemoveChart(chart.id)}
              disabled={charts.length === 1}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: charts.length === 1 ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: charts.length === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                Chart Type:
              </label>
              <select
                value={chart.chartType}
                onChange={(e) => {
                  const newChartType = e.target.value;
                  let updates = { chartType: newChartType };
                  
                  // If switching to pie/doughnut, limit to single field and ensure proper field structure
                  if (["pie", "doughnut"].includes(newChartType)) {
                    if (chart.selectedFields.length > 1) {
                      updates.selectedFields = [chart.selectedFields[0]];
                    }
                    // Ensure the field has both label and value set to the same field
                    if (chart.selectedFields.length > 0) {
                      const field = chart.selectedFields[0];
                      const fieldKey = field.value || field.label;
                      updates.selectedFields = [{
                        ...field,
                        label: fieldKey,
                        value: fieldKey
                      }];
                    }
                  }
                  
                  onUpdateChart(chart.id, updates);
                }}
                style={{
                  padding: '0.25rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="auto">Auto Detect</option>
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                Title:
              </label>
              <input
                type="text"
                value={chart.title}
                onChange={(e) => onUpdateChart(chart.id, { title: e.target.value })}
                style={{
                  padding: '0.25rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  width: '150px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Fields:</label>
              {(["pie", "doughnut"].includes(chart.chartType)) ? (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#6c757d', 
                  fontStyle: 'italic',
                  backgroundColor: '#f8f9fa',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  Single field only
                </div>
              ) : (
                <button
                  onClick={() => addField(chart.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  <i className="fas fa-plus"></i> Add Field
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(["pie", "doughnut"].includes(chart.chartType) && chart.selectedFields.length > 1) && (
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  color: '#856404',
                  fontSize: '0.8rem'
                }}>
                  <i className="fas fa-exclamation-triangle"></i> 
                  Pie/Doughnut charts can only use one field. Only the first field will be used.
                </div>
              )}
              {chart.selectedFields.map((field, fieldIndex) => (
                <div key={fieldIndex} style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  alignItems: 'center',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', minWidth: '80px' }}>
                    {fieldIndex === 0 ? 'Label Field:' : `Value Field ${fieldIndex}:`}
                  </div>
                  
                  <FieldSelector
                    field={field}
                    fieldIndex={fieldIndex}
                    fileData={fileData}
                    chartType={chart.chartType}
                    onFieldUpdate={(updatedField) => {
                      const updatedFields = [...chart.selectedFields];
                      updatedFields[fieldIndex] = updatedField;
                      onUpdateChart(chart.id, { selectedFields: updatedFields });
                    }}
                  />
                  
                  {chart.selectedFields.length > 1 && !(["pie", "doughnut"].includes(chart.chartType)) && (
                    <button
                      onClick={() => removeField(chart.id, fieldIndex)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChartConfiguration; 