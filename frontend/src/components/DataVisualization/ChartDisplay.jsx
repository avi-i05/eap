import React, { useRef, useState } from 'react';
import ChartRenderer from './ChartRenderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ChartDisplay = ({ charts, onSaveChart, onDownloadChart }) => {
  const [downloadLoading, setDownloadLoading] = useState(null);
  const chartRefs = useRef({});

  const downloadChartAsPNG = async (chart) => {
    try {
      setDownloadLoading(chart.id);
      const chartElement = chartRefs.current[chart.id];
      if (!chartElement) {
        throw new Error('Chart element not found');
      }

      const canvas = await html2canvas(chartElement, {
        backgroundColor: 'white',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `${chart.title || 'chart'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading chart as PNG:', err);
      alert('Failed to download chart as PNG');
    } finally {
      setDownloadLoading(null);
    }
  };

  const downloadChartAsPDF = async (chart) => {
    try {
      setDownloadLoading(chart.id);
      const chartElement = chartRefs.current[chart.id];
      if (!chartElement) {
        throw new Error('Chart element not found');
      }

      const canvas = await html2canvas(chartElement, {
        backgroundColor: 'white',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      if (heightLeft >= pdf.internal.pageSize.height) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -(pdf.internal.pageSize.height), imgWidth, imgHeight);
      }

      pdf.save(`${chart.title || 'chart'}.pdf`);
    } catch (err) {
      console.error('Error downloading chart as PDF:', err);
      alert('Failed to download chart as PDF');
    } finally {
      setDownloadLoading(null);
    }
  };

  return (
    <div>
      <h4>Generated Charts</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
        {charts.map(chart => (
          <div key={chart.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h5 style={{ margin: 0, color: '#495057' }}>{chart.title}</h5>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onSaveChart(chart.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  title="Save Chart"
                >
                  <i className="fas fa-save"></i> Save
                </button>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={() => downloadChartAsPNG(chart)}
                    disabled={downloadLoading === chart.id}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: downloadLoading === chart.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      opacity: downloadLoading === chart.id ? 0.6 : 1
                    }}
                    title="Download as PNG"
                  >
                    {downloadLoading === chart.id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-image"></i>
                    )}
                  </button>
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={() => downloadChartAsPDF(chart)}
                    disabled={downloadLoading === chart.id}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#fd7e14',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: downloadLoading === chart.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      opacity: downloadLoading === chart.id ? 0.6 : 1
                    }}
                    title="Download as PDF"
                  >
                    {downloadLoading === chart.id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-file-pdf"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div 
              ref={(el) => (chartRefs.current[chart.id] = el)}
              data-chart-id={chart.id}
              style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}
            >
              <ChartRenderer chart={chart} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartDisplay; 