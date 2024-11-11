import React, { useState } from "react";
import api from "../api";
import "../styles/PostJob.css";

function PostJob() {
    const [formData, setFormData] = useState({
        in_game_name: "",
        server: "",
        node: "",
        items_requested: "",
        item_category: "",
        gold: 0,
        silver: 0,
        copper: 0,
        deadline: "",
        special_notes: "",
    });

    const ITEM_CATEGORY_CHOICES = [
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
        "Scribing",
        "Stonemasonry",
        "Tailoring",
        "Tanning",
        "Weapon Smithing",
        "Weaving",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/api/jobs/", formData);
            if (response.status === 201) {
                alert("Job posted successfully!");
                setFormData({
                    in_game_name: "",
                    server: "",
                    node: "",
                    items_requested: "",
                    item_category: "",
                    gold: 0,
                    silver: 0,
                    copper: 0,
                    deadline: "",
                    special_notes: "",
                });
            }
        } catch (error) {
            console.error("Error posting job:", error);
            alert("Failed to post job. Please try again.");
        }
    };

    return (
        <div className="post-job-container">
            <h1>Post a Job</h1>
            <form onSubmit={handleSubmit} className="post-job-form">
                <label>
                    In-Game Name:
                    <input
                        type="text"
                        name="in_game_name"
                        value={formData.in_game_name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Server:
                    <input
                        type="text"
                        name="server"
                        value={formData.server}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Node:
                    <input
                        type="text"
                        name="node"
                        value={formData.node}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Items Requested:
                    <textarea
                        name="items_requested"
                        value={formData.items_requested}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Item Category:
                    <select
                        name="item_category"
                        value={formData.item_category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {ITEM_CATEGORY_CHOICES.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Price (Gold, Silver, Copper):
                    <div className="price-input">
                        <input
                            type="number"
                            name="gold"
                            value={formData.gold}
                            onChange={handleChange}
                            min="0"
                            placeholder="Gold"
                        />
                        <input
                            type="number"
                            name="silver"
                            value={formData.silver}
                            onChange={handleChange}
                            min="0"
                            max="99"
                            placeholder="Silver"
                        />
                        <input
                            type="number"
                            name="copper"
                            value={formData.copper}
                            onChange={handleChange}
                            min="0"
                            max="99"
                            placeholder="Copper"
                        />
                    </div>
                </label>
                <label>
                    Deadline:
                    <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Special Notes:
                    <textarea
                        name="special_notes"
                        value={formData.special_notes}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit" className="post-job-button">
                    Post Job
                </button>
            </form>
        </div>
    );
}

export default PostJob;
