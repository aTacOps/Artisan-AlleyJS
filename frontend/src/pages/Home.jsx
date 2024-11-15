import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";

function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useContext(AuthContext); // Access currentUser

    if (!isAuthenticated) {
        return (
            <div className="home-container">
                <h1>Welcome to Artisan Alley</h1>
                <div className="home-buttons-container">
                    <button className="home-button" onClick={() => navigate("/login")}>
                        Login
                    </button>
                    <button className="home-button" onClick={() => navigate("/register")}>
                        Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <h1>Welcome Back to Artisan Alley{currentUser ? `, ${currentUser.username}` : ""}!</h1>
            {/* Uncomment below if logout functionality is added */}
            {/* <button className="home-button" onClick={() => navigate("/logout")}>
                Logout
            </button> */}
        </div>
    );
}

export default Home;
