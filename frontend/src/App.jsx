import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs"; // Add this import
import MyBids from "./pages/MyBids";
import Profile from "./pages/Profile";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
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
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
