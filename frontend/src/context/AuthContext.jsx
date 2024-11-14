import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Fetch current user details
    const fetchCurrentUser = async () => {
        try {
            const response = await api.get("/api/current-user/");
            setCurrentUser(response.data);
        } catch (err) {
            console.error("Failed to fetch current user:", err);
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        setIsAuthenticated(!!token);
        if (token) {
            fetchCurrentUser(); // Fetch user details if token exists
        }
    }, []);

    const login = (accessToken, refreshToken) => {
        localStorage.setItem("ACCESS_TOKEN", accessToken);
        localStorage.setItem("REFRESH_TOKEN", refreshToken);
        setIsAuthenticated(true);
        fetchCurrentUser(); // Fetch user details after login
    };

    const logout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        setIsAuthenticated(false);
        setCurrentUser(null); // Clear user details on logout
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
