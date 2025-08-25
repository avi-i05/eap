import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/components/Navbar.css";

const Navbar = ({ token, role, setToken, setRole }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        setRole(null);
        navigate("/");
    };

    const mobileMenuVariants = {
        hidden: { x: "100%" },
        visible: { x: 0 },
        exit: { x: "100%" }
    };

    return (
        <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
            <div className="navbar-container">
                <div className="logo" onClick={() => navigate("/")}>
                    <span className="logo-text">Data</span>
                    <span className="logo-highlight">Insights</span>
                </div>

                <div className="desktop-links">
                    <NavLink to="/" className="nav-link">
                        Home
                    </NavLink>

                    {token && role === "admin" && (
                        <>
                            <NavLink to="/admin/dashboard" className="nav-link">
                                Dashboard
                            </NavLink>
                        </>
                    )}

                    {token && role === "user" && (
                        <NavLink to="/user/home" className="nav-link">
                            User Home
                        </NavLink>
                    )}

                    {!token && (
                        <NavLink to="/auth" className="nav-link">
                            Login
                        </NavLink>
                    )}

                    {token && (
                        <button className="logout-btn" onClick={handleLogout}>
                            <FiLogOut />
                            Logout
                        </button>
                    )}
                </div>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={mobileMenuVariants}
                        transition={{ type: "tween", duration: 0.3 }}
                    >
                        <NavLink
                            to="/"
                            className="mobile-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </NavLink>

                        {token && role === "admin" && (
                            <>
                                <NavLink
                                    to="/admin/dashboard"
                                    className="mobile-link"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/admin/users"
                                    className="mobile-link"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Users
                                </NavLink>
                                <NavLink
                                    to="/admin/files"
                                    className="mobile-link"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Files
                                </NavLink>
                            </>
                        )}

                        {token && role === "user" && (
                            <NavLink
                                to="/user/home"
                                className="mobile-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                User Home
                            </NavLink>
                        )}

                        {!token && (
                            <NavLink
                                to="/auth"
                                className="mobile-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Login
                            </NavLink>
                        )}

                        {token && (
                            <button
                                className="mobile-logout"
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <FiLogOut />
                                Logout
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
