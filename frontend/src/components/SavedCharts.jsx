import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChartRenderer from './DataVisualization/ChartRenderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SavedCharts = ({ isAdmin = false, charts: propCharts = null, showFilteredCharts = false }) => {
  const [savedCharts, setSavedCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewChart, setPreviewChart] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const chartRefs = useRef({});

  // New state for confirmation modal and notifications
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [chartToDelete, setChartToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    if (showFilteredCharts && propCharts) {
      console.log('Using prop charts:', propCharts.length);
      setSavedCharts(propCharts);
      setLoading(false);
    } else {
      fetchSavedCharts();
    }
  }, [showFilteredCharts, propCharts]);

  const fetchSavedCharts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Use different endpoints based on user role
      const endpoint = isAdmin ? '/api/charts/admin/charts' : '/api/charts/user';
      
      console.log('=== SavedCharts Debug Info ===');
      console.log('Backend URL:', backendUrl);
      console.log('Endpoint:', endpoint);
      console.log('Full URL:', `${backendUrl}${endpoint}`);
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('Is admin:', isAdmin);
      console.log('==============================');
      
      if (!token) {
        showNotification('No authentication token found. Please log in again.', 'error');
        setLoading(false);
        return;
      }
      
      // Decode the token to see what's in it
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', tokenPayload);
        console.log('User ID:', tokenPayload.id);
        console.log('User role:', tokenPayload.role);
      } catch (decodeErr) {
        console.error('Failed to decode token:', decodeErr);
      }
      
      // First, test backend connectivity
      try {
        console.log('Testing backend connectivity...');
        const healthResponse = await axios.get(`${backendUrl}/health`, {
          timeout: 5000
        });
        console.log('Backend health check successful:', healthResponse.data);
      } catch (healthErr) {
        console.error('Backend connectivity test failed:', healthErr.message);
        if (healthErr.code === 'ECONNREFUSED') {
          showNotification('Cannot connect to the server. Please check if the backend is running on port 5000.', 'error');
        } else if (healthErr.code === 'ENOTFOUND') {
          showNotification('Server not found. Please check the backend URL configuration.', 'error');
        } else {
          showNotification(`Connection failed: ${healthErr.message}`, 'error');
        }
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${backendUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response received:', response.data);
      const chartsData = response.data.charts || response.data || [];
      
      console.log('Charts data received:', {
        totalCharts: chartsData.length,
        isAdmin: isAdmin,
        sampleChart: chartsData[0] ? {
          id: chartsData[0]._id,
          title: chartsData[0].title,
          chartSource: chartsData[0].chartSource,
          owner: chartsData[0].owner
        } : null
      });
      
      // Set charts data directly - backend now handles proper filtering
      setSavedCharts(chartsData);
    } catch (err) {
      console.error('=== Error Details ===');
      console.error('Error message:', err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error config:', err.config);
      console.error('=====================');
      
      if (err.response?.status === 401) {
        showNotification('Authentication failed. Please log in again.', 'error');
      } else if (err.response?.status === 403) {
        showNotification('Access denied. You do not have permission to view these charts.', 'error');
      } else if (err.response?.status === 404) {
        showNotification('Charts endpoint not found. Please check the server configuration.', 'error');
      } else {
        showNotification(`Failed to load saved charts: ${err.response?.data?.message || err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteChart = async (chartId) => {
    const chart = savedCharts.find(c => c._id === chartId);
    const isOwnChart = chart && chart.owner && chart.owner === JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id;
    
    const confirmMessage = isAdmin 
      ? isOwnChart 
        ? 'Are you sure you want to delete this chart?'
        : `Are you sure you want to delete this chart? (Owned by: ${chart?.owner?.username || 'Unknown'})`
      : 'Are you sure you want to delete this chart?';
    
    // Set chart to delete and show confirmation modal
    setChartToDelete(chart);
    setShowConfirmModal(true);
  };

  // Handle actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!chartToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Use different endpoints based on user role
      const endpoint = isAdmin ? `/api/charts/admin/${chartToDelete._id}` : `/api/charts/user/${chartToDelete._id}`;
      
      console.log('Deleting chart with endpoint:', endpoint);
      
      await axios.delete(`${backendUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedCharts(savedCharts.filter(chart => chart._id !== chartToDelete._id));
      
      const successMessage = isAdmin 
        ? 'Chart deleted successfully by admin!' 
        : 'Chart deleted successfully!';
      
      showNotification(successMessage, 'success');
    } catch (err) {
      console.error('Error deleting chart:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete chart';
      showNotification(errorMessage, 'error');
    } finally {
      setShowConfirmModal(false);
      setChartToDelete(null);
    }
  };

  // Handle cancellation of deletion
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setChartToDelete(null);
  };

  const openPreview = (chart) => {
    setPreviewChart(chart);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewChart(null);
  };

  const downloadChartAsPNG = async (chart) => {
    try {
      setDownloadLoading(chart._id);
      const chartElement = chartRefs.current[chart._id];
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
      
      showNotification('Chart downloaded as PNG successfully!', 'success');
    } catch (err) {
      console.error('Error downloading chart as PNG:', err);
      showNotification('Failed to download chart as PNG', 'error');
    } finally {
      setDownloadLoading(null);
    }
  };

  const downloadChartAsPDF = async (chart) => {
    try {
      setDownloadLoading(chart._id);
      const chartElement = chartRefs.current[chart._id];
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
      
      showNotification('Chart downloaded as PDF successfully!', 'success');
    } catch (err) {
      console.error('Error downloading chart as PDF:', err);
      showNotification('Failed to download chart as PDF', 'error');
    } finally {
      setDownloadLoading(null);
    }
  };

  const downloadAllChartsAsPDF = async () => {
    try {
      setDownloadLoading('all');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      let yOffset = 20;
      const pageHeight = pdf.internal.pageSize.height;
      
      for (let i = 0; i < savedCharts.length; i++) {
        const chart = savedCharts[i];
        const chartElement = chartRefs.current[chart._id];
        
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
            if (i < savedCharts.length - 1) {
              pdf.addPage();
              yOffset = 20;
            }
          } catch (err) {
            console.error(`Error processing chart ${chart.title}:`, err);
          }
        }
      }
      
      pdf.save('all-charts.pdf');
      showNotification('All charts downloaded as PDF successfully!', 'success');
    } catch (err) {
      console.error('Error downloading all charts as PDF:', err);
      showNotification('Failed to download all charts as PDF', 'error');
    } finally {
      setDownloadLoading(null);
    }
  };

  const getChartTypeColor = (chartSource) => {
    const colors = {
      generated: "#6366f1",
      saved: "#10b981", 
      downloaded: "#f59e0b"
    };
    return colors[chartSource] || "#6b7280";
  };

  const getChartTypeIcon = (chartSource) => {
    const icons = {
      generated: "fas fa-magic",
      saved: "fas fa-save",
      downloaded: "fas fa-download"
    };
    return icons[chartSource] || "fas fa-chart-bar";
  };

  // Notification component
  const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? '#10b981' : '#ef4444';
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: bgColor,
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minWidth: '300px',
        maxWidth: '400px'
      }}>
        <i className={icon} style={{ fontSize: '1.2rem' }}></i>
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0'
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    );
  };

  // Confirmation Modal component
  const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText, cancelText }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <i className="fas fa-exclamation-triangle" style={{
              fontSize: '1.5rem',
              color: '#f59e0b',
              marginRight: '0.75rem'
            }}></i>
            <h3 style={{ margin: 0, color: '#1f2937' }}>{title}</h3>
          </div>
          
          <p style={{
            margin: '0 0 1.5rem 0',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            {message}
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {cancelText || 'Cancel'}
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {confirmText || 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
  };

  // Close notification function
  const closeNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div style={{ fontSize: '1.2rem', color: '#6c757d' }}>
          <i className="fas fa-spinner fa-spin"></i> Loading saved charts...
        </div>
      </div>
    );
  }

  if (savedCharts.length === 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#6c757d' 
      }}>
        <i className="fas fa-chart-pie" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
        <h3>No charts found</h3>
        <p>
          {showFilteredCharts 
            ? 'No charts match the selected filter.' 
            : isAdmin 
              ? 'No charts have been created yet.' 
              : 'You haven\'t saved any charts yet. Create and save charts to see them here!'
          }
        </p>
      </div>
    );
  }

  console.log('Rendering charts grid with', savedCharts.length, 'charts');

  return (
    <div style={{ padding: '1rem' }}>
      {!showFilteredCharts && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ margin: 0, color: '#495057' }}>
            {isAdmin ? 'All Charts' : 'My Saved Charts'}
          </h3>
          <button
            onClick={downloadAllChartsAsPDF}
            disabled={downloadLoading === 'all'}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: downloadLoading === 'all' ? 'not-allowed' : 'pointer',
              opacity: downloadLoading === 'all' ? 0.6 : 1
            }}
          >
            {downloadLoading === 'all' ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Generating PDF...
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf"></i> Download All as PDF
              </>
            )}
          </button>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '2rem' 
      }}>
        {savedCharts.map(chart => (
          <div key={chart._id} style={{
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Chart Header */}
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#495057' }}>{chart.title}</h4>
                <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' }}>
                  {chart.chartType} • {new Date(chart.createdAt).toLocaleDateString()}
                  {isAdmin && chart.chartSource && (
                    <span style={{ 
                      marginLeft: '0.5rem',
                      padding: '0.2rem 0.5rem',
                      backgroundColor: getChartTypeColor(chart.chartSource),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      <i className={getChartTypeIcon(chart.chartSource)} style={{ marginRight: '0.25rem' }}></i>
                      {chart.chartSource}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => openPreview(chart)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  title="Preview Chart"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={() => downloadChartAsPNG(chart)}
                    disabled={downloadLoading === chart._id}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: downloadLoading === chart._id ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      opacity: downloadLoading === chart._id ? 0.6 : 1
                    }}
                    title="Download as PNG"
                  >
                    {downloadLoading === chart._id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-image"></i>
                    )}
                  </button>
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={() => downloadChartAsPDF(chart)}
                    disabled={downloadLoading === chart._id}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#fd7e14',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: downloadLoading === chart._id ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      opacity: downloadLoading === chart._id ? 0.6 : 1
                    }}
                    title="Download as PDF"
                  >
                    {downloadLoading === chart._id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-file-pdf"></i>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => deleteChart(chart._id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: isAdmin ? '#ff6b35' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  title={isAdmin ? "Delete Chart (Admin)" : "Delete Chart"}
                >
                  <i className="fas fa-trash"></i>
                  {isAdmin && <span style={{ marginLeft: '0.25rem' }}>Admin</span>}
                </button>
              </div>
            </div>

            {/* Chart Content */}
            <div 
              ref={(el) => (chartRefs.current[chart._id] = el)}
              style={{ 
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}
            >
              <ChartRenderer chart={chart} />
            </div>

            {/* Chart Footer */}
            {isAdmin && (
              <div style={{
                padding: '0.5rem 1rem',
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                fontSize: '0.8rem',
                color: '#6c757d'
              }}>
                Owner: {chart.owner?.username || 'Unknown'} • 
                Downloads: {chart.downloadCount || 0}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreview && previewChart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
        onClick={closePreview}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            padding: '2rem'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              borderBottom: '1px solid #e9ecef',
              paddingBottom: '1rem'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#495057' }}>{previewChart.title}</h3>
                <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.25rem' }}>
                  {previewChart.chartType} • {new Date(previewChart.createdAt).toLocaleDateString()}
                  {isAdmin && previewChart.chartSource && (
                    <span style={{ 
                      marginLeft: '0.5rem',
                      padding: '0.2rem 0.5rem',
                      backgroundColor: getChartTypeColor(previewChart.chartSource),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      <i className={getChartTypeIcon(previewChart.chartSource)} style={{ marginRight: '0.25rem' }}></i>
                      {previewChart.chartSource}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closePreview}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '0.5rem'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ 
              marginBottom: '1rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              padding: '1rem'
            }}>
              <ChartRenderer chart={previewChart} />
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              borderTop: '1px solid #e9ecef',
              paddingTop: '1rem'
            }}>
              <button
                onClick={() => downloadChartAsPNG(previewChart)}
                disabled={downloadLoading === previewChart._id}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: downloadLoading === previewChart._id ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: downloadLoading === previewChart._id ? 0.6 : 1
                }}
              >
                {downloadLoading === previewChart._id ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-image"></i> Download PNG
                  </>
                )}
              </button>
              <button
                onClick={() => downloadChartAsPDF(previewChart)}
                disabled={downloadLoading === previewChart._id}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#fd7e14',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: downloadLoading === previewChart._id ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: downloadLoading === previewChart._id ? 0.6 : 1
                }}
              >
                {downloadLoading === previewChart._id ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-file-pdf"></i> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Chart"
        message={
          chartToDelete 
            ? (isAdmin 
                ? `Are you sure you want to delete "${chartToDelete.title}"?${chartToDelete.owner?.username && chartToDelete.owner.username !== JSON.parse(atob(localStorage.getItem("token").split('.')[1])).username ? ` (Owned by: ${chartToDelete.owner.username})` : ''}`
                : `Are you sure you want to delete "${chartToDelete.title}"?`
              )
            : 'Are you sure you want to delete this chart?'
        }
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Notification */}
      {notification && (
        <Notification
          message={notification}
          type={notificationType}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default SavedCharts; 