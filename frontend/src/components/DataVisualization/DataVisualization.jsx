import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Chart as ChartJS,
} from "chart.js";
import { toast } from "react-toastify";
import "../../styles/components/DataVisualization.css";
import FileSidebar from "./FileSidebar";
import ChartControls from "./ChartControls";
import FieldSelector from "./FieldSelector";
import ChartPanel from "./ChartPanel";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const DataVisualization = () => {
  const [chartType, setChartType] = useState("bar");
  const [chartColor, setChartColor] = useState("#4361ee");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [labelField, setLabelField] = useState("");
  const [valueField, setValueField] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(data.files);
        if (data.files.length > 0) {
          setSelectedFile(data.files[0]);
          const keys = Object.keys(data.files[0].data[0]);
          setLabelField(keys[0]);
          setValueField(keys[1] || keys[0]);
        }
      } catch {
        setError("Failed to load data");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateChartData = useMemo(() => {
    if (!selectedFile || selectedFile.data.length === 0) return null;

    const firstRow = selectedFile.data[0];
    if (
      !labelField ||
      !valueField ||
      !(labelField in firstRow) ||
      !(valueField in firstRow)
    ) {
      setFieldError("Please select valid fields from the dropdown.");
      return null;
    }

    const labels = selectedFile.data.map((item) => item[labelField]);
    const values = selectedFile.data.map((item) => Number(item[valueField]));

    const isCircular = ["pie", "doughnut", "pie-3d", "doughnut-3d"].includes(
      chartType
    );
    const allValid = values.every((v) => typeof v === "number" && !isNaN(v));

    if (isCircular && !allValid) {
      setFieldError("Circular charts require numeric fields.");
      return null;
    }

    setFieldError("");

    const backgroundColors = labels.map(
      (_, i) =>
        `hsl(${
          (i * 37 + parseInt(chartColor.slice(1, 3), 16)) % 360
        }, 70%, 60%)`
    );

    return {
      labels,
      datasets: [
        {
          label: `${valueField} Distribution`,
          data: values,
          backgroundColor: isCircular ? backgroundColors : chartColor,
          borderColor: isCircular ? "#fff" : chartColor,
          borderWidth: 1,
          tension: 0.3,
        },
      ],
    };
  }, [selectedFile, labelField, valueField, chartType, chartColor]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position:
          chartType === "pie" || chartType === "doughnut" ? "right" : "top",
        labels: {
          color: "#333",
          font: { size: 12, family: "Arial" },
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
        backgroundColor: "rgba(0,0,0,0.7)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
      },
    },
    scales:
      chartType !== "pie" && chartType !== "doughnut"
        ? {
            y: { beginAtZero: true, grid: { color: "rgba(0, 0, 0, 0.05)" } },
            x: { grid: { display: false } },
          }
        : {},
    animation: {
      duration: 1500,
      easing: "easeOutQuart",
      animateScale: true,
      animateRotate: true,
    },
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(data.files);
      if (data.files.length > 0) setSelectedFile(data.files[0]);
      toast.success("Data refreshed");
    } catch {
      toast.error("Error refreshing data");
    } finally {
      setLoading(false);
    }
  };

  const downloadChart = (format) => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const link = document.createElement("a");

    if (format === "png") {
      link.href = chart.toBase64Image();
      link.download = `${chartType}-chart.png`;
      link.click();
      toast.success("Chart downloaded as PNG");
    } else if (format === "pdf") {
      const imgData = chart.toBase64Image();
      const pdfWindow = window.open("");
      pdfWindow.document.write(`<img src="${imgData}" style="width:100%" />`);
      toast.success("Chart opened as PDF");
    }

    setShowDropdown(false);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const keys = Object.keys(file.data[0]);
    setLabelField(keys[0]);
    setValueField(keys[1] || keys[0]);
    setChartReady(false);
  };

  const handleGenerateChart = () => {
    if (!selectedFile) return;

    const keys = Object.keys(selectedFile.data[0]);
    if (!keys.includes(labelField) || !keys.includes(valueField)) {
      setFieldError("Invalid field selection. Please select valid fields.");
      setChartReady(false);
      toast.error("Invalid field selection");
      return;
    }

    setFieldError("");
    setGenerating(true);
    setTimeout(() => {
      setChartReady(true);
      setGenerating(false);
      toast.success("Chart generated");
    }, 500);
  };

  return (
    <div className="data-viz-container">
      <div className="viz-header">
        <h2>Data Visualization Dashboard</h2>
        <ChartControls
          chartType={chartType}
          chartColor={chartColor}
          showDropdown={showDropdown}
          loading={loading}
          setChartType={setChartType}
          setChartColor={setChartColor}
          setShowDropdown={setShowDropdown}
          refreshData={refreshData}
          downloadChart={downloadChart}
        />
      </div>

      <div className="viz-main">
        <FileSidebar
          files={files}
          loading={loading}
          error={error}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
        />

        <div className="visualization-area">
          {selectedFile && (
            <>
              <div className="chart-header">
                <h3 className="dataset-title">
                  <span className="dataset-icon">📈</span>
                  {selectedFile.fileName}
                </h3>
                <div className="chart-stats">
                  <span className="stat-item">
                    <span className="stat-label">Records:</span>
                    <span className="stat-value">
                      {selectedFile.data.length}
                    </span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">Fields:</span>
                    <span className="stat-value">
                      {Object.keys(selectedFile.data[0]).length}
                    </span>
                  </span>
                </div>
              </div>

              <FieldSelector
                selectedFile={selectedFile}
                labelField={labelField}
                setLabelField={setLabelField}
                valueField={valueField}
                setValueField={setValueField}
              />

              {fieldError && <div className="field-error">{fieldError}</div>}

              <button
                className="auth-submit generate-btn"
                onClick={handleGenerateChart}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="spinner"></span>
                    <span>Generating...</span>
                  </>
                ) : (
                  "Generate Chart"
                )}
              </button>

              <ChartPanel
                chartType={chartType}
                chartData={generateChartData}
                chartOptions={chartOptions}
                chartReady={chartReady}
                generating={generating}
                chartRef={chartRef}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
