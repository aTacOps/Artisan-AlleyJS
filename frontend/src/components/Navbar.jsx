import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout(); // Call logout from context
        navigate("/"); // Redirect to the home page
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand" onClick={() => navigate("/")}>
                Artisan Alley
            </div>
            <div className="navbar-links">
                {isAuthenticated ? (
                    <>
                        <button className="nav-button" onClick={() => navigate("/")}>
                            Home
                        </button>
                        <button className="nav-button" onClick={() => navigate("/jobs")}>
                            Jobs
                        </button>
                        <button className="nav-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button className="nav-button" onClick={() => navigate("/login")}>
                            Login
                        </button>
                        <button className="nav-button" onClick={() => navigate("/register")}>
                            Register
                        </button>
                        <button className="nav-button" onClick={() => navigate("/jobs")}>
                            View Jobs
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
