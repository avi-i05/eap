import React from 'react';

const FieldSelector = ({ field, fieldIndex, fileData, onFieldUpdate, chartType }) => {
  const availableFields = Object.keys(fileData[0] || {});
  
  // For pie/doughnut charts, we only need one field
  const isPieChart = ["pie", "doughnut"].includes(chartType);
  
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#6c757d' }}>
          {isPieChart ? 'Field:' : (fieldIndex === 0 ? 'Label Field (X-axis):' : 'Value Field (Y-axis):')}
        </label>
        <select
          value={isPieChart ? (field.value || field.label) : (fieldIndex === 0 ? field.label : field.value)}
          onChange={(e) => {
            if (isPieChart) {
              // For pie charts, update both label and value to the same field
              onFieldUpdate({ ...field, label: e.target.value, value: e.target.value });
            } else {
              if (fieldIndex === 0) {
                onFieldUpdate({ ...field, label: e.target.value });
              } else {
                onFieldUpdate({ ...field, value: e.target.value });
              }
            }
          }}
          style={{
            padding: '0.25rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            width: '100%',
            fontSize: '0.9rem'
          }}
        >
          {availableFields.map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#6c757d' }}>
          Color:
        </label>
        <input
          type="color"
          value={field.color}
          onChange={(e) => onFieldUpdate({ ...field, color: e.target.value })}
          style={{
            width: '40px',
            height: '30px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
};

export default FieldSelector; 