import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { FiUpload, FiBarChart2, FiLock } from "react-icons/fi";
import "../styles/pages/PublicHomePage.css";

const PublicHomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FiUpload,
      title: "Easy Upload",
      desc: "Drag & drop Excel files for instant processing"
    },
    {
      icon: FiBarChart2,
      title: "Dynamic Visuals",
      desc: "2D charts and 3D models of your data"
    },
    {
      icon: FiLock,
      title: "Secure",
      desc: "End-to-end encrypted data storage"
    }
  ];

  return (
    <div className="public-homepage">
   
      
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero-section"
      >
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Transform <span className="text-gradient">Data</span> Into Insights
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Visualize your spreadsheets in stunning 2D/3D formats with our AI-powered analyzer
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hero-buttons"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
            >
              How It Works
            </motion.button>
          </motion.div>
        </div>
        <div className="hero-graphic">
          {/* Placeholder for animated graphic */}
          <div className="data-cube"></div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="features-section"
      >
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          Powerful Features
        </motion.h2>
        <div className="features-grid">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="feature-icon">
                <feature.icon size={24} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      <Footer />
    </div>
  );
};

export default PublicHomePage;