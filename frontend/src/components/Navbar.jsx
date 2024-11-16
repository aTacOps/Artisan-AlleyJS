import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";

function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, logout, currentUser } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout(); // Call logout from context
        navigate("/"); // Redirect to the home page
    };

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand" onClick={() => navigate("/")}>
                <img 
                    src={logo} 
                    alt="Artisan Alley Logo" 
                    className="navbar-logo"
                />
            </div>
            <div className="navbar-dropdown">
                <button className="nav-dropdown-button" onClick={toggleDropdown}>
                    Menu
                </button>
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        {isAuthenticated ? (
                            <>
                                <button className="dropdown-item" onClick={() => navigate("/")}>
                                    Home
                                </button>
                                <button className="dropdown-item" onClick={() => navigate("/jobs")}>
                                    Job Board
                                </button>
                                <button className="dropdown-item" onClick={() => navigate("/post-job")}>
                                    Post a Job
                                </button>
                                <button className="dropdown-item" onClick={() => navigate("/my-jobs")}>
                                    My Jobs
                                </button>
                                <button className="dropdown-item" onClick={() => navigate("/my-bids")}>
                                    My Bids
                                </button>
                                <button className="dropdown-item" onClick={() => navigate("/profile")}>
                                    Profile
                                </button>
                                <button className="dropdown-item" onClick={() => navigate("/inbox")}>
                                    Inbox
                                </button>
                                {currentUser?.is_staff && (
                                    <button className="dropdown-item" onClick={() => navigate("/admin-dashboard")}>
                                        Admin Dashboard
                                    </button>
                                )}
                                <button className="dropdown-item" onClick={handleLogout}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="dropdown-item" onClick={() => navigate("/login")}>
                                    Login
                                </button>
                                <button className="dropdown-item" onClick={() => navigate("/register")}>
                                    Register
                                </button>
                                <button className="dropdown-item" onClick={() => navigate("/jobs")}>
                                    View Jobs
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
