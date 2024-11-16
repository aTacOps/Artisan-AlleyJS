import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin } = useContext(AuthContext);

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;
