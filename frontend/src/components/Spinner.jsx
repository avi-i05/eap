import React from "react";
import "../styles/components/Spinner.css";

const Spinner = ({ text = "Loading..." }) => {
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
      <p className="spinner-text">{text}</p>
    </div>
  );
};

export default Spinner;