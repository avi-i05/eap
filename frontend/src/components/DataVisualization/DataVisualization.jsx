import React, { useState } from 'react';
import axios from 'axios';
import FileSelector from './FileSelector';
import FileHistory from './FileHistory';
import ChartConfiguration from './ChartConfiguration';
import ChartDisplay from './ChartDisplay';
import ChartControls from './ChartControls';
import DataPreview from './DataPreview';
import { generateChartData } from '../utils/chartUtils';
import '../../styles/components/DataVisualization.css';
import { parseFileData } from '../../hooks/useLocalStorage';

const DataVisualization = ({ uploadedFiles, setSavedCharts }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [charts, setCharts] = useState([]);
  const [generatedCharts, setGeneratedCharts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load file data when file is selected
  const loadFileData = async (file) => {
    setLoading(true);
    console.log('Loading file data for:', file);
    
    try {
      let fileData;
      
      // Check if we have stored file data (for files loaded from localStorage)
      if (file.fileData) {
        fileData = file.fileData;
        console.log('Using stored file data for:', file.fileName);
        console.log('Stored file data:', fileData);
      } else if (file.file && file.file instanceof File) {
        // Parse the actual uploaded file
        console.log('Parsing actual file:', file.file.name);
        fileData = await parseFileData(file.file);
        console.log('Parsed file data for:', file.fileName);
        console.log('Parsed data:', fileData);
      } else {
        throw new Error('No file data available');
      }
      
      setFileData(fileData);
      
      // Initialize with one default chart using actual file fields
      if (fileData && fileData.length > 0) {
        const fields = Object.keys(fileData[0]);
        console.log('Available fields:', fields);
        
        if (fields.length >= 2) {
          setCharts([{
            id: 1,
            chartType: "auto",
            title: "Chart 1",
            selectedFields: [{ 
              label: fields[0], 
              value: fields[1], 
              color: "#4361ee" 
            }]
          }]);
        } else if (fields.length === 1) {
          setCharts([{
            id: 1,
            chartType: "auto",
            title: "Chart 1",
            selectedFields: [{ 
              label: fields[0], 
              value: fields[0], 
              color: "#4361ee" 
            }]
          }]);
        }
      }
      
    } catch (error) {
      console.error('Error loading file data:', error);
      // Fallback to sample data if parsing fails
      const sampleData = [
        { month: 'Jan', sales: 1200, profit: 800, customers: 150 },
        { month: 'Feb', sales: 1400, profit: 950, customers: 180 },
        { month: 'Mar', sales: 1100, profit: 700, customers: 120 },
        { month: 'Apr', sales: 1600, profit: 1100, customers: 200 },
        { month: 'May', sales: 1800, profit: 1300, customers: 250 },
        { month: 'Jun', sales: 2000, profit: 1500, customers: 300 }
      ];
      setFileData(sampleData);
      
      const fields = Object.keys(sampleData[0]);
      setCharts([{
        id: 1,
        chartType: "auto",
        title: "Chart 1",
        selectedFields: [{ 
          label: fields[0], 
          value: fields[1], 
          color: "#4361ee" 
        }]
      }]);
    } finally {
      setLoading(false);
    }
  };



  // Add new chart
  const addNewChart = () => {
    const newId = Math.max(...charts.map(c => c.id), 0) + 1;
    const fields = fileData ? Object.keys(fileData[0]) : ['field1', 'field2'];
    
    let selectedFields;
    if (fields.length >= 2) {
      selectedFields = [{ 
        label: fields[0], 
        value: fields[1], 
        color: `hsl(${(newId * 60) % 360}, 70%, 60%)` 
      }];
    } else if (fields.length === 1) {
      selectedFields = [{ 
        label: fields[0], 
        value: fields[0], 
        color: `hsl(${(newId * 60) % 360}, 70%, 60%)` 
      }];
    } else {
      selectedFields = [{ 
        label: 'field1', 
        value: 'field2', 
        color: `hsl(${(newId * 60) % 360}, 70%, 60%)` 
      }];
    }
    
    setCharts([...charts, {
      id: newId,
      chartType: "auto",
      title: `Chart ${newId}`,
      selectedFields
    }]);
  };

  // Remove chart
  const removeChart = (id) => {
    if (charts.length > 1) {
      setCharts(charts.filter(c => c.id !== id));
      setGeneratedCharts(generatedCharts.filter(c => c.id !== id));
    }
  };

  // Update chart configuration
  const updateChart = (id, updates) => {
    setCharts(charts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Generate all charts
  const generateAllCharts = async () => {
    if (!fileData || charts.length === 0) {
      console.error('Cannot generate charts: No file data or charts configured');
      alert('Please select a file and configure charts first');
      return;
    }

    setGenerating(true);
    
    try {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      if (!token) {
        alert('No authentication token found. Please log in again.');
        setGenerating(false);
        return;
      }

      const newGeneratedCharts = [];
      
      // Generate charts and track them in backend
      for (const chartConfig of charts) {
        const chartData = generateChartData(chartConfig, fileData);
        
        if (chartData) {
          // Track chart generation in backend
          try {
            const chartDataToTrack = {
              chartType: chartData.chartType || chartConfig.chartType,
              chartData: {
                labels: chartData.labels || [],
                datasets: chartData.datasets || []
              },
              chartOptions: {
                ...chartData.options,
                fileName: selectedFile?.fileName || 'Unknown File'
              },
              sourceFile: selectedFile?.id || null
            };

            const response = await axios.post(`${backendUrl}/api/charts/track-generation`, chartDataToTrack, {
              headers: { Authorization: `Bearer ${token}` }
            });

            const generatedChart = {
              id: chartConfig.id,
              chartType: chartData.chartType || chartConfig.chartType,
              title: chartConfig.title,
              chartData,
              config: chartConfig,
              backendId: response.data.chart._id
            };

            newGeneratedCharts.push(generatedChart);
          } catch (trackError) {
            console.error('Error tracking chart generation:', trackError);
            // Still create the chart locally even if tracking fails
            const generatedChart = {
              id: chartConfig.id,
              chartType: chartData.chartType || chartConfig.chartType,
              title: chartConfig.title,
              chartData,
              config: chartConfig
            };
            newGeneratedCharts.push(generatedChart);
          }
        } else {
          console.error('Failed to generate chart data for config:', chartConfig);
        }
      }
      
      setGeneratedCharts(newGeneratedCharts);
      
      if (newGeneratedCharts.length === 0) {
        alert('No charts were generated. Please check your data and chart configuration.');
      }
    } catch (error) {
      console.error('Error generating charts:', error);
      alert('Error generating charts: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Save individual chart
  const saveChart = async (chartId) => {
    const chart = generatedCharts.find(c => c.id === chartId);
    if (!chart) {
      console.error('Chart not found:', chartId);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      const chartData = {
        title: chart.title,
        chartType: chart.chartType,
        chartData: chart.chartData,
        chartOptions: chart.chartOptions,
        description: chart.description || `Saved ${chart.chartType} chart`,
        tags: [chart.chartType, 'saved'],
        isPublic: false
      };

      const response = await axios.post(`${backendUrl}/api/charts/save`, chartData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Chart saved successfully!');
      
      // Refresh the saved charts list
      if (setSavedCharts) {
        setSavedCharts(prev => [...prev, {
          ...chart,
          id: response.data.chart._id,
          fileName: selectedFile?.fileName || 'Unknown File',
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error saving chart:', error);
      alert('Failed to save chart. Please try again.');
    }
  };

  // Save all charts
  const saveAllCharts = async () => {
    if (generatedCharts.length === 0) {
      alert('No charts to save');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }

      let savedCount = 0;

      for (const chart of generatedCharts) {
        try {
          const chartDataToSend = {
            title: chart.title,
            chartType: chart.chartType,
            chartData: {
              labels: chart.chartData.labels || [],
              datasets: chart.chartData.datasets || []
            },
            chartOptions: {
              ...chart.chartOptions,
              fileName: selectedFile?.fileName || 'Unknown File'
            },
            description: `Saved ${chart.chartType} chart from ${selectedFile?.fileName || 'data'}`,
            tags: ['saved', chart.chartType],
            isPublic: false,
            sourceFile: null // Don't send file ID since it's not a valid MongoDB ObjectId
          };

          const response = await axios.post(`${backendUrl}/api/charts/save`, chartDataToSend, {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log('Chart saved to backend:', response.data);
          savedCount++;
        } catch (error) {
          console.error('Error saving chart:', chart.title, error);
          // Log specific error for debugging
          if (error.response) {
            console.error(`Status: ${error.response.status}, Message: ${error.response.data?.message}`);
          }
        }
      }

      if (savedCount > 0) {
        // Also save to local state for immediate UI update
        const chartsToSave = generatedCharts.map(chart => ({
          ...chart,
          id: Date.now() + Math.random(), // Generate unique ID for each chart
          fileName: selectedFile?.fileName || 'Unknown File',
          createdAt: new Date().toISOString()
        }));
        
        setSavedCharts(prev => [...prev, ...chartsToSave]);
        alert(`${savedCount} charts saved successfully!`);
      } else {
        alert('Failed to save any charts. Please try again.');
      }
    } catch (error) {
      console.error('Error saving all charts:', error);
      alert('Failed to save charts. Please try again.');
    }
  };

  // Download individual chart
  const downloadChart = async (chartId) => {
    const chart = generatedCharts.find(c => c.id === chartId);
    if (chart) {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        if (!token) {
          alert('No authentication token found. Please log in again.');
          return;
        }

        // Track download if we have a backend ID
        if (chart.backendId) {
          try {
            await axios.post(`${backendUrl}/api/charts/track-download/${chart.backendId}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (trackError) {
            console.error('Error tracking download:', trackError);
          }
        }

        // Create downloaded chart record
        try {
          const chartDataToTrack = {
            title: chart.title,
            chartType: chart.chartType,
            chartData: {
              labels: chart.chartData.labels || [],
              datasets: chart.chartData.datasets || []
            },
            chartOptions: {
              ...chart.chartData.options,
              fileName: selectedFile?.fileName || 'Unknown File'
            },
            sourceFile: selectedFile?.id || null
          };

          await axios.post(`${backendUrl}/api/charts/create-downloaded`, chartDataToTrack, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (downloadError) {
          console.error('Error creating downloaded chart record:', downloadError);
        }

        alert(`Chart "${chart.title}" downloaded successfully!`);
      } catch (error) {
        console.error('Error downloading chart:', error);
        alert('Error downloading chart. Please try again.');
      }
    }
  };

  // Download all charts as PDF
  const downloadAllChartsAsPDF = async () => {
    if (generatedCharts.length === 0) {
      alert('No charts to download');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }

      // Track downloads for all charts
      for (const chart of generatedCharts) {
        // Track download if we have a backend ID
        if (chart.backendId) {
          try {
            await axios.post(`${backendUrl}/api/charts/track-download/${chart.backendId}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (trackError) {
            console.error('Error tracking download:', trackError);
          }
        }

        // Create downloaded chart record
        try {
          const chartDataToTrack = {
            title: chart.title,
            chartType: chart.chartType,
            chartData: {
              labels: chart.chartData.labels || [],
              datasets: chart.chartData.datasets || []
            },
            chartOptions: {
              ...chart.chartData.options,
              fileName: selectedFile?.fileName || 'Unknown File'
            },
            sourceFile: selectedFile?.id || null
          };

          await axios.post(`${backendUrl}/api/charts/create-downloaded`, chartDataToTrack, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (downloadError) {
          console.error('Error creating downloaded chart record:', downloadError);
        }
      }

      // Import the required libraries dynamically
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      let yOffset = 20;
      const pageHeight = pdf.internal.pageSize.height;
      
      for (let i = 0; i < generatedCharts.length; i++) {
        const chart = generatedCharts[i];
        
        // Find the chart element in the DOM
        const chartElement = document.querySelector(`[data-chart-id="${chart.id}"]`);
        
        if (chartElement) {
          try {
            const canvas = await html2canvas(chartElement, {
              backgroundColor: 'white',
              scale: 1.5,
              useCORS: true,
              allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 170; // A4 width minus margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add chart title
            pdf.setFontSize(16);
            pdf.text(chart.title, 20, yOffset);
            yOffset += 10;
            
            // Add chart image
            if (yOffset + imgHeight > pageHeight - 20) {
              pdf.addPage();
              yOffset = 20;
            }
            
            pdf.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
            yOffset += imgHeight + 20;
            
            // Add page break between charts
            if (i < generatedCharts.length - 1) {
              pdf.addPage();
              yOffset = 20;
            }
          } catch (err) {
            console.error(`Error processing chart ${chart.title}:`, err);
          }
        }
      }
      
      pdf.save('all-generated-charts.pdf');
      alert('All charts downloaded as PDF successfully!');
    } catch (err) {
      console.error('Error downloading all charts as PDF:', err);
      alert('Failed to download all charts as PDF');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3>Data Visualization Dashboard</h3>
        
        {/* File History and Selection */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          marginBottom: '2rem' 
        }}>
          <div>
            {/* File Selection */}
            <FileSelector 
              uploadedFiles={uploadedFiles}
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (file) loadFileData(file);
              }}
            />
          </div>
          
          <div>
            {/* File History */}
            <FileHistory
              uploadedFiles={uploadedFiles}
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (file) loadFileData(file);
              }}
            />
          </div>
        </div>

        {/* Data Preview */}
        {fileData && selectedFile && (
          <DataPreview fileData={fileData} selectedFile={selectedFile} />
        )}

        {/* Chart Controls */}
        {fileData && (
          <ChartControls
            charts={charts}
            generatedCharts={generatedCharts}
            generating={generating}
            onAddChart={addNewChart}
            onGenerateCharts={generateAllCharts}
            onSaveAll={saveAllCharts}
            onDownloadAll={downloadAllChartsAsPDF}
          />
        )}

        {/* Chart Configuration */}
        {fileData && charts.length > 0 && (
          <ChartConfiguration
            charts={charts}
            fileData={fileData}
            onUpdateChart={updateChart}
            onRemoveChart={removeChart}
          />
        )}

        {/* Generated Charts */}
        {generatedCharts.length > 0 && (
          <ChartDisplay
            charts={generatedCharts}
            onSaveChart={saveChart}
            onDownloadChart={downloadChart}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#007bff' }}></i>
            <p>Loading file data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualization; 