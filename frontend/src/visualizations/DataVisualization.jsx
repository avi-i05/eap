import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiBox, FiRefreshCw } from 'react-icons/fi';
import './DataVisualization.css';

// Register Chart.js components
ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, PointElement, LineElement
);

const DataVisualization = () => {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'three'
  const [chartType, setChartType] = useState('bar'); // 'bar', 'pie', 'line'
  const [chartColor, setChartColor] = useState('#4361ee');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFiles(data.files);
        if (data.files.length > 0) {
          setSelectedFile(data.files[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhanced Three.js scene setup
  useEffect(() => {
    if (viewMode !== 'three' || !selectedFile || selectedFile.data.length === 0) return;

    if (mountRef.current) {
      mountRef.current.innerHTML = '';
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 7, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    const maxSalary = Math.max(...selectedFile.data.map(item => item.Salary));
    const group = new THREE.Group();

    selectedFile.data.forEach((item, index) => {
      const targetHeight = (item.Salary / maxSalary) * 5;
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const color = new THREE.Color(`hsl(${(index * 40) % 360}, 70%, 50%)`);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.4,
        roughness: 0.5
      });
      const bar = new THREE.Mesh(geometry, material);

      bar.position.x = index - selectedFile.data.length / 2;
      bar.position.y = 0.25;

      bar.userData = { targetHeight };

      group.add(bar);
    });

    scene.add(group);

    const animate = () => {
      requestAnimationFrame(animate);

      group.children.forEach(bar => {
        if (bar.scale.y < bar.userData.targetHeight) {
          bar.scale.y += 0.05;
          if (bar.scale.y > bar.userData.targetHeight) {
            bar.scale.y = bar.userData.targetHeight;
          }
        }
      });

      group.rotation.y += 0.003;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }
    };
  }, [viewMode, selectedFile]);

  const generateChartData = () => {
    if (!selectedFile || selectedFile.data.length === 0) return null;

    const labels = selectedFile.data.map(item => item.Name);
    const salaries = selectedFile.data.map(item => item.Salary);

    const backgroundColors = labels.map((_, i) => {
      const hue = (i * 30 + parseInt(chartColor.slice(1, 3), 16)) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    });

    return {
      labels,
      datasets: [{
        label: 'Salary Distribution',
        data: salaries,
        backgroundColor: chartType === 'pie' ? backgroundColors : chartColor,
        borderColor: chartType === 'pie' ? '#fff' : chartColor,
        borderWidth: 1,
        tension: 0.1
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: chartType === 'pie' ? 'right' : 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.raw.toLocaleString()}`
        }
      }
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      }
    } : {}
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFiles(data.files);
      if (data.files.length > 0) {
        setSelectedFile(data.files[0]);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-viz-container">
      <div className="viz-header">
        <h2>Data Visualization</h2>

        <div className="viz-controls">
          {viewMode === 'chart' && (
            <div className="chart-type-selector">
              <button
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                <FiBarChart2 />
                <span>Bar</span>
              </button>
              <button
                className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                onClick={() => setChartType('pie')}
              >
                <FiPieChart />
                <span>Pie</span>
              </button>
              <button
                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                <FiTrendingUp />
                <span>Line</span>
              </button>
            </div>
          )}

          <div className="right-controls">
            {viewMode === 'chart' && (
              <div className="color-picker">
                <label>Color:</label>
                <input
                  type="color"
                  value={chartColor}
                  onChange={(e) => setChartColor(e.target.value)}
                />
              </div>
            )}

            <button
              className="refresh-btn"
              onClick={refreshData}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'spin' : ''} />
            </button>

            <button
              className="view-toggle-btn"
              onClick={() => {
                if (!loading && selectedFile && selectedFile.data.length > 0) {
                  setViewMode(viewMode === 'chart' ? 'three' : 'chart');
                }
              }}
            >
              <FiBox />
              <span>{viewMode === 'chart' ? '3D View' : 'Chart View'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="viz-main">
        <div className="file-sidebar">
          <h3>Your Datasets</h3>
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="file-list">
              {files.map(file => (
                <div
                  key={file._id}
                  className={`file-item ${selectedFile?._id === file._id ? 'active' : ''}`}
                  onClick={() => setSelectedFile(file)}
                >
                  {file.fileName}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="visualization-area">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading visualization...</p>
            </div>
          ) : error ? (
            <div className="error-overlay">{error}</div>
          ) : viewMode === 'chart' ? (
            <div className="chart-container">
              {selectedFile && generateChartData() && (
                <>
                  <h3 className="dataset-title">{selectedFile.fileName}</h3>
                  <div className="chart-wrapper">
                    {chartType === 'bar' && <Bar data={generateChartData()} options={chartOptions} />}
                    {chartType === 'pie' && <Pie data={generateChartData()} options={chartOptions} />}
                    {chartType === 'line' && <Line data={generateChartData()} options={chartOptions} />}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              ref={mountRef}
              className="three-container"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
