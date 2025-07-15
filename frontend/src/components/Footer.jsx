import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/components/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", url: "/features" },
        { name: "Pricing", url: "/pricing" },
        { name: "API", url: "/api" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", url: "/about" },
        { name: "Blog", url: "/blog" },
        { name: "Careers", url: "/careers" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Documentation", url: "/docs" },
        { name: "Community", url: "/community" },
        { name: "Contact Us", url: "/contact" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaGithub />, url: "https://github.com/avi-i05" },
    { icon: <FaLinkedin />, url: "https://linkedin.com/in/avi-sharma-4189b1278" },
    { icon: <FaTwitter />, url: "https://twitter.com" },
  ];

  return (
    <footer className="footer">
      <div className="footer-wave"></div>

      <div className="footer-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="footer-brand"
        >
          <h3 className="footer-logo">
            Data<span>Insights</span>
          </h3>
          <p className="footer-description">
            Transforming raw data into actionable intelligence with powerful visualization tools.
          </p>

          <div className="footer-social">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="social-icon"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>


        <div className="footer-links">
          {footerLinks.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="footer-section"
            >
              <h4 className="footer-heading">{section.title}</h4>
              <ul className="footer-list">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.url} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="footer-section"
          >
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-list">
              <li className="footer-contact-item">
                <FaEnvelope className="contact-icon" />
                <span>avisharmaaa373@gmail.com</span>
              </li>
              <li className="footer-contact-item">
                <FaPhoneAlt className="contact-icon" />
                <span>+91 92582 47887</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="footer-bottom"
      >
        <div className="footer-bottom-container">
          <p>© {currentYear} Data Insights. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
