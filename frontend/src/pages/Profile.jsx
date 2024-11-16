import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/Profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        in_game_name: "",
        game_location: "",
        bio: "",
    });

    const fetchProfile = async () => {
        try {
            const response = await api.get("/api/profiles/me/");
            setProfile(response.data);
            setFormData({
                in_game_name: response.data.in_game_name || "",
                game_location: response.data.game_location || "",
                bio: response.data.bio || "",
            });
        } catch (err) {
            setError("Failed to fetch profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = profile ? "put" : "post";
            const response = await api[method]("/api/profiles/me/", formData);
            setProfile(response.data);
            setIsEditing(false);
            alert("Profile saved successfully!");
        } catch (err) {
            console.error("Error saving profile:", err);
            alert("Failed to save profile. Please try again.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) return <div>Loading your profile...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="profile-container">
            <h1>Your Profile</h1>
            {!isEditing ? (
                <div>
                    <p>
                        <strong>In-game Name:</strong> {profile.in_game_name || "Not set"}
                    </p>
                    <p>
                        <strong>Game Location:</strong> {profile.game_location || "Not set"}
                    </p>
                    <p>
                        <strong>Bio:</strong> {profile.bio || "Not set"}
                    </p>
                    <p>
                        <strong>Jobs Completed:</strong> {profile.completed_jobs}
                    </p>
                    <h2>Recent Completed Jobs</h2>
                    {profile.recent_completed_jobs.length === 0 ? (
                        <p>No jobs completed yet.</p>
                    ) : (
                        <ul>
                            {profile.recent_completed_jobs.map((job, index) => (
                                <li key={index}>
                                    <p>
                                        <strong>Item Requested:</strong> {job.items_requested}
                                    </p>
                                    <p>
                                        <strong>Date Completed:</strong> {job.delivered_date}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="profile-form">
                    <label>
                        In-game Name:
                        <input
                            type="text"
                            name="in_game_name"
                            value={formData.in_game_name}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Game Location:
                        <input
                            type="text"
                            name="game_location"
                            value={formData.game_location}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Bio:
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                        ></textarea>
                    </label>
                    <button type="submit">Save Profile</button>
                    <button type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}

export default Profile;
