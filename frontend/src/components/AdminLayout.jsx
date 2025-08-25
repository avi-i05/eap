import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/components/AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/auth");
    window.location.reload();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle mobile responsiveness
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle navbar positioning based on sidebar state
  React.useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (!sidebarOpen) {
        navbar.classList.add('sidebar-collapsed');
      } else {
        navbar.classList.remove('sidebar-collapsed');
      }
    }
  }, [sidebarOpen]);

  const sidebarVariants = {
    open: { width: "280px" },
    closed: { width: "80px" }
  };

  const NavItem = ({ to, icon, text }) => (
    <li className={`nav-item ${location.pathname === to ? "active" : ""}`}>
      <Link to={to} className="nav-link">
        <i className={`fas fa-${icon}`}></i>
        {sidebarOpen && <span>{text}</span>}
      </Link>
    </li>
  );

  return (
    <div className="admin-layout">
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
        </button>
      )}

      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <motion.aside
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        initial={false}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="sidebar-brand">
          <div className="brand-logo">
            <i className="fas fa-shield-alt"></i>
          </div>
          {sidebarOpen && <h2>Admin Console</h2>}
          <button className="toggle-btn" onClick={toggleSidebar}>
            <i className={`fas fa-chevron-${sidebarOpen ? "left" : "right"}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <NavItem to="/admin/dashboard" icon="tachometer-alt" text="Dashboard" />
            <NavItem to="/admin/users" icon="users" text="Users" />
            <NavItem to="/admin/files" icon="file-archive" text="Files" />
            <NavItem to="/admin/charts" icon="chart-pie" text="Charts" />
            <NavItem to="/admin/settings" icon="cog" text="Settings" />
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      <main className={`main-content ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
