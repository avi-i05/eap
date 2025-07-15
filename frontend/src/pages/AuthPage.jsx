import React from "react";
import Auth from "../components/Auth";
import Footer from "../components/Footer";
import Squares from "../components/Squares";
import "../styles/pages/AuthPage.css";

const AuthPage = ({ setToken, setRole }) => {
  return (
    <div className="auth-page-container">
      <Squares
        speed={0.5}
        squareSize={40}
        direction="diagonal"
        borderColor="#caf0f8"
        hoverFillColor="#0077b6"
      />
      <Auth setToken={setToken} setRole={setRole} />
      <Footer />
    </div>
  );
};

export default AuthPage;
