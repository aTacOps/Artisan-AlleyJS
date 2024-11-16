import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/PostJob.css";

function PostJob() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        in_game_name: "",
        server: "",
        node: "",
        item_category: "Alchemy", // Default category
        items_requested: "",
        gold: 0,
        silver: 0,
        copper: 0,
        deadline: "",
        special_notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post("/api/jobs/", formData);
            alert("Job posted successfully!");
            navigate("/jobs");
        } catch (err) {
            console.error("Error posting job:", err);
            setError("Failed to post the job. Please check your input.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-job-container">
            <h1>Post a Job</h1>
            <form onSubmit={handleSubmit} className="post-job-form">
                <label>In-Game Name</label>
                <input
                    type="text"
                    name="in_game_name"
                    value={formData.in_game_name}
                    onChange={handleChange}
                    required
                />
                <label>Server</label>
                <input
                    type="text"
                    name="server"
                    value={formData.server}
                    onChange={handleChange}
                    required
                />
                <label>Node</label>
                <input
                    type="text"
                    name="node"
                    value={formData.node}
                    onChange={handleChange}
                />
                <label>Item Category</label>
                <select
                    name="item_category"
                    value={formData.item_category}
                    onChange={handleChange}
                >
                    {[
                        "Alchemy",
                        "Animal Husbandry",
                        "Arcane Engineering",
                        "Armor Smithing",
                        "Carpentry",
                        "Cooking",
                        "Farming",
                        "Fishing",
                        "Herbalism",
                        "Hunting",
                        "Jewel Cutting",
                        "Leatherworking",
                        "Lumberjacking",
                        "Lumber Milling",
                        "Metalworking",
                        "Mining",
                        "Other",
                        "Scribing",
                        "Stonemasonry",
                        "Tailoring",
                        "Tanning",
                        "Weapon Smithing",
                        "Weaving",
                    ].map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <label>Items Requested</label>
                <textarea
                    name="items_requested"
                    value={formData.items_requested}
                    onChange={handleChange}
                    required
                />
                <label>Gold</label>
                <input
                    type="number"
                    name="gold"
                    value={formData.gold}
                    onChange={handleChange}
                    min="0"
                />
                <label>Silver</label>
                <input
                    type="number"
                    name="silver"
                    value={formData.silver}
                    onChange={handleChange}
                    min="0"
                    max="99"
                />
                <label>Copper</label>
                <input
                    type="number"
                    name="copper"
                    value={formData.copper}
                    onChange={handleChange}
                    min="0"
                    max="99"
                />
                <label>Deadline</label>
                <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                />
                <label>Special Notes</label>
                <textarea
                    name="special_notes"
                    value={formData.special_notes}
                    onChange={handleChange}
                />
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <button type="submit">Post Job</button>
                )}
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}

export default PostJob;
