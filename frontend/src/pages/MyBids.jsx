import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Jobs.css";

function MyBids() {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyBids = async () => {
        try {
            const response = await api.get("/api/bids/my-bids/");
            setBids(response.data);
        } catch (err) {
            setError("Failed to fetch your bids. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBids();
    }, []);

    if (loading) return <div>Loading your bids...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="jobs-container">
            <h1>Jobs You've Bid On</h1>
            {bids.length === 0 ? (
                <p>You have not placed any bids yet.</p>
            ) : (
                <ul className="jobs-list">
                    {bids.map((bid) => (
                        <li key={bid.id} className="job-card">
                            <h2>{bid.job.items_requested}</h2>
                            <p>
                                <strong>Server:</strong> {bid.job.server}
                            </p>
                            <p>
                                <strong>Node:</strong> {bid.job.node}
                            </p>
                            <p>
                                <strong>Customer:</strong> {bid.job.in_game_name}
                            </p>
                            <p>
                                <strong>Your Bid:</strong> {bid.gold} gold {bid.silver} silver {bid.copper} copper
                            </p>
                            <p>
                                <strong>Estimated Completion Date:</strong> {bid.estimated_completion_time}
                            </p>
                            <p>
                                <strong>Status:</strong> {bid.job.status}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MyBids;
