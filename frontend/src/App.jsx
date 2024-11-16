import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import MyBids from "./pages/MyBids";
import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import { Helmet } from "react-helmet";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Helmet>
                    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                    <title>Artisan Alley</title> {/* Optionally set a title */}
                </Helmet>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/my-jobs" element={<MyJobs />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/my-bids" element={<MyBids />} />
                    <Route path="/post-job" element={<PostJob />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route
                        path="/admin-dashboard"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
