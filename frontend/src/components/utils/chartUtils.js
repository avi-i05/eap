// Utility functions for data analysis
const isNumeric = (value) => {
  return !isNaN(value) && value !== null && value !== undefined && value !== '';
};

const isBoolean = (value) => {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no' || lower === '1' || lower === '0';
  }
  return false;
};

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  return false;
};

const getDataType = (values) => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'string';
  
  const numericCount = nonNullValues.filter(isNumeric).length;
  const booleanCount = nonNullValues.filter(isBoolean).length;
  const stringCount = nonNullValues.length - numericCount - booleanCount;
  
  if (numericCount > stringCount && numericCount > booleanCount) return 'numeric';
  if (booleanCount > stringCount) return 'boolean';
  return 'categorical';
};

const aggregateCategoricalData = (values) => {
  const counts = {};
  values.forEach(value => {
    // Handle different gender formats
    let key = value?.toString() || 'Unknown';
    
    // Normalize gender values
    if (key.toLowerCase() === 'm' || key.toLowerCase() === 'male') {
      key = 'Male';
    } else if (key.toLowerCase() === 'f' || key.toLowerCase() === 'female') {
      key = 'Female';
    } else if (key.toLowerCase() === 'other' || key.toLowerCase() === 'o') {
      key = 'Other';
    }
    
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
};

const aggregateBooleanData = (values) => {
  const counts = { 'True': 0, 'False': 0 };
  values.forEach(value => {
    const boolValue = normalizeBoolean(value);
    counts[boolValue ? 'True' : 'False']++;
  });
  return counts;
};

const aggregateNumericData = (values) => {
  const numericValues = values.filter(isNumeric).map(Number);
  if (numericValues.length === 0) return null;
  
  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
    avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
    sum: numericValues.reduce((a, b) => a + b, 0),
    count: numericValues.length
  };
};

// Generate chart data based on configuration and file data
export const generateChartData = (chartConfig, fileData) => {
  console.log('generateChartData called with:', { chartConfig, fileDataLength: fileData?.length });
  
  if (!fileData || fileData.length === 0) {
    console.error('No file data provided to generateChartData');
    return null;
  }

  const { chartType, selectedFields } = chartConfig;
  console.log('Chart config:', { chartType, selectedFields });
  
  // Handle different chart types based on data characteristics
  if (chartType === "auto") {
    console.log('Generating auto chart...');
    return generateAutoChart(fileData, selectedFields);
  } else if (["pie", "doughnut"].includes(chartType)) {
    console.log('Generating circular chart...');
    // Pie and doughnut charts can only use single field
    if (selectedFields.length !== 1) {
      console.error('Pie/Doughnut charts require exactly one field');
      return null;
    }
    return generateCircularChart(fileData, selectedFields, chartType);
  } else if (chartType === "bar") {
    console.log('Generating bar chart...');
    return generateBarChart(fileData, selectedFields);
  } else if (chartType === "line") {
    console.log('Generating line chart...');
    return generateLineChart(fileData, selectedFields);
  } else if (chartType === "scatter") {
    console.log('Generating scatter chart...');
    return generateScatterChart(fileData, selectedFields);
  }
  
  console.error('Unknown chart type:', chartType);
  return null;
};

// Auto-detect best chart type based on data
const generateAutoChart = (fileData, selectedFields) => {
  console.log('generateAutoChart called with:', { selectedFields, fileDataLength: fileData.length });
  
  if (selectedFields.length === 1) {
    const field = selectedFields[0];
    console.log('Single field selected:', field);
    
    const values = fileData.map(item => item[field.value]).filter(v => v !== null && v !== undefined);
    console.log('Field values:', values);
    
    const dataType = getDataType(values);
    console.log('Detected data type:', dataType);
    
    if (dataType === 'categorical' || dataType === 'boolean') {
      console.log('Generating pie chart for categorical/boolean data');
      return generateCircularChart(fileData, selectedFields, 'pie');
    } else if (dataType === 'numeric') {
      console.log('Generating bar chart for numeric data');
      return generateBarChart(fileData, selectedFields);
    }
  } else if (selectedFields.length === 2) {
    const labelField = selectedFields[0];
    const valueField = selectedFields[1];
    console.log('Two fields selected:', { labelField, valueField });
    
    const labelValues = fileData.map(item => item[labelField.label]);
    const valueValues = fileData.map(item => item[valueField.value]);
    console.log('Label values:', labelValues);
    console.log('Value values:', valueValues);
    
    const labelDataType = getDataType(labelValues);
    const valueDataType = getDataType(valueValues);
    console.log('Data types:', { labelDataType, valueDataType });
    
    if (labelDataType === 'categorical' && valueDataType === 'numeric') {
      console.log('Generating bar chart for categorical vs numeric');
      return generateBarChart(fileData, selectedFields);
    } else if (valueDataType === 'numeric') {
      console.log('Generating line chart for numeric values');
      return generateLineChart(fileData, selectedFields);
    }
  }
  
  console.log('Defaulting to bar chart');
  return generateBarChart(fileData, selectedFields);
};

// Generate circular charts (pie/doughnut) for categorical/boolean data
const generateCircularChart = (fileData, selectedFields, chartType) => {
  const field = selectedFields[0];
  
  // For pie charts, we need to determine which field to use
  // If field.value exists, use it, otherwise use field.label
  const fieldKey = field.value || field.label;
  console.log('Pie chart field key:', fieldKey);
  console.log('Field object:', field);
  
  const values = fileData.map(item => item[fieldKey]).filter(v => v !== null && v !== undefined);
  console.log('Pie chart values:', values);
  
  if (values.length === 0) {
    console.error('No valid values found for pie chart');
    return null;
  }
  
  const dataType = getDataType(values);
  console.log('Pie chart data type:', dataType);
  
  let aggregatedData;
  if (dataType === 'boolean') {
    aggregatedData = aggregateBooleanData(values);
  } else if (dataType === 'categorical') {
    aggregatedData = aggregateCategoricalData(values);
  } else if (dataType === 'numeric') {
    // For numeric data, create ranges/bins for pie chart
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binCount = Math.min(5, Math.ceil(Math.sqrt(values.length)));
    const binSize = range / binCount;
    
    aggregatedData = {};
    for (let i = 0; i < binCount; i++) {
      const binStart = min + (i * binSize);
      const binEnd = min + ((i + 1) * binSize);
      const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
      aggregatedData[binLabel] = 0;
    }
    
    values.forEach(value => {
      for (let i = 0; i < binCount; i++) {
        const binStart = min + (i * binSize);
        const binEnd = min + ((i + 1) * binSize);
        if (value >= binStart && value < binEnd) {
          const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
          aggregatedData[binLabel]++;
          break;
        }
      }
    });
  } else {
    console.error('Unsupported data type for pie chart:', dataType);
    return null;
  }
  
  const labels = Object.keys(aggregatedData);
  const data = Object.values(aggregatedData);
  const total = data.reduce((sum, val) => sum + val, 0);
  
  if (total === 0) {
    console.error('No data to display in pie chart');
    return null;
  }
  
  // Generate colors
  const colors = labels.map((_, i) => `hsl(${(i * 137.5) % 360}, 70%, 60%)`);
  
  console.log('Pie chart result:', {
    chartType,
    labels,
    data,
    total,
    percentages: data.map(val => ((val / total) * 100).toFixed(1))
  });
  
  return {
    chartType,
    labels,
    datasets: [{
      label: fieldKey,
      data,
      backgroundColor: colors,
      borderColor: "#fff",
      borderWidth: 2
    }],
    total,
    percentages: data.map(val => ((val / total) * 100).toFixed(1))
  };
};

// Generate bar chart for categorical vs numeric or categorical counts
const generateBarChart = (fileData, selectedFields) => {
  if (selectedFields.length === 1) {
    // Single field - show counts
    const field = selectedFields[0];
    const values = fileData.map(item => item[field.value]).filter(v => v !== null && v !== undefined);
    const dataType = getDataType(values);
    
    let aggregatedData;
    if (dataType === 'boolean') {
      aggregatedData = aggregateBooleanData(values);
    } else {
      aggregatedData = aggregateCategoricalData(values);
    }
    
    const labels = Object.keys(aggregatedData);
    const data = Object.values(aggregatedData);
    const colors = labels.map((_, i) => `hsl(${(i * 137.5) % 360}, 70%, 60%)`);
    
    return {
      chartType: 'bar',
      labels,
      datasets: [{
        label: `Count of ${field.value}`,
        data,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.6', '0.8')),
        borderWidth: 1
      }]
    };
  } else {
    // Multiple fields - show values by category
    const labelField = selectedFields[0]; // First field is always the label field
    const valueFields = selectedFields.slice(1); // All fields after the first are value fields
    
    const labels = fileData.map(item => item[labelField.label]).filter(v => v !== null && v !== undefined);
    
    // Create datasets for each value field
    const datasets = valueFields.map((valueField, index) => {
      const values = fileData.map(item => item[valueField.value]).filter(v => v !== null && v !== undefined);
      
      // If labels are categorical, group by them
      const labelDataType = getDataType(labels);
      if (labelDataType === 'categorical') {
        const groupedData = {};
        labels.forEach((label, idx) => {
          const key = label?.toString() || 'Unknown';
          if (!groupedData[key]) {
            groupedData[key] = [];
          }
          if (isNumeric(values[idx])) {
            groupedData[key].push(Number(values[idx]));
          }
        });
        
        const aggregatedLabels = Object.keys(groupedData);
        const aggregatedData = aggregatedLabels.map(label => {
          const vals = groupedData[label];
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        
        return {
          label: valueField.value,
          data: aggregatedData,
          backgroundColor: valueField.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
          borderColor: (valueField.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`).replace('0.6', '0.8'),
          borderWidth: 1
        };
      } else {
        // Simple bar chart with all data points
        const numericValues = values.filter(isNumeric).map(Number);
        const numericLabels = labels.slice(0, numericValues.length);
        
        return {
          label: valueField.value,
          data: numericValues,
          backgroundColor: valueField.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
          borderColor: (valueField.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`).replace('0.6', '0.8'),
          borderWidth: 1
        };
      }
    });
    
    // Use the labels from the first dataset (they should all be the same length)
    const finalLabels = datasets.length > 0 ? labels.slice(0, datasets[0].data.length) : labels;
    
    return {
      chartType: 'bar',
      labels: finalLabels,
      datasets
    };
  }
};

// Generate line chart for time series or continuous data
const generateLineChart = (fileData, selectedFields) => {
  const labelField = selectedFields[0]; // First field is always the label field
  const valueFields = selectedFields.slice(1); // All fields after the first are value fields
  
  const labels = fileData.map(item => item[labelField.label]).filter(v => v !== null && v !== undefined);
  
  // Create datasets for each value field
  const datasets = valueFields.map((valueField, index) => {
    const values = fileData.map(item => item[valueField.value]).filter(v => v !== null && v !== undefined);
    const numericValues = values.filter(isNumeric).map(Number);
    
    const color = valueField.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`;
    
    return {
      label: valueField.value,
      data: numericValues,
      backgroundColor: color.replace('0.6', '0.1'),
      borderColor: color,
      borderWidth: 2,
      fill: false,
      tension: 0.3
    };
  });
  
  // Use the labels from the first dataset (they should all be the same length)
  const finalLabels = datasets.length > 0 ? labels.slice(0, datasets[0].data.length) : labels;
  
  return {
    chartType: 'line',
    labels: finalLabels,
    datasets
  };
};



// Generate scatter plot for two numeric fields
const generateScatterChart = (fileData, selectedFields) => {
  if (selectedFields.length < 2) return null;
  
  const labelField = selectedFields[0]; // First field is always the label field
  const valueFields = selectedFields.slice(1); // All fields after the first are value fields
  
  const labels = fileData.map(item => item[labelField.label]).filter(v => v !== null && v !== undefined);
  
  // Create datasets for each value field
  const datasets = valueFields.map((valueField, index) => {
    const values = fileData.map(item => item[valueField.value]).filter(isNumeric).map(Number);
    
    const points = [];
    for (let i = 0; i < Math.min(labels.length, values.length); i++) {
      points.push({ x: i, y: values[i] }); // Use index as x-axis for scatter
    }
    
    const color = valueField.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`;
    
    return {
      label: valueField.value,
      data: points,
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1
    };
  });
  
  return {
    chartType: 'scatter',
    labels,
    datasets,
    xLabel: labelField.label,
    yLabel: valueFields.map(f => f.value).join(', ')
  };
};

// Export chart as image (placeholder function)
export const exportChartAsImage = (chartId, chartData) => {
  console.log('Exporting chart as image:', chartId, chartData);
  // Implementation would use html2canvas or similar library
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('chart-export.png');
    }, 1000);
  });
};

// Save chart configuration
export const saveChartConfig = (chartConfig) => {
  console.log('Saving chart configuration:', chartConfig);
  // Implementation would save to backend or localStorage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, id: Date.now() });
    }, 500);
  });
};

// Load chart configuration
export const loadChartConfig = (chartId) => {
  console.log('Loading chart configuration:', chartId);
  // Implementation would load from backend or localStorage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: chartId,
        chartType: "bar",
        title: "Loaded Chart",
        selectedFields: [{ label: "month", value: "sales", color: "#4361ee" }]
      });
    }, 500);
  });
}; 