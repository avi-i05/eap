import React from "react";
import Auth from "../components/Auth";
import Footer from "../components/Footer";
import Squares from "../components/Squares";
import "./Authpage.css";

const AuthPage = ({ setToken, setRole }) => {
  return (
    <div className="auth-page-container">
      {/* Square Background */}
      <Squares
        speed={0.5}
        squareSize={40}
        direction="diagonal"
        borderColor="#caf0f8" // Light blue border
        hoverFillColor="#0077b6" // Dark blue on hover
      />

      {/* Auth Form */}
      <Auth setToken={setToken} setRole={setRole} />
      <Footer />
    </div>
  );
};

export default AuthPage;
