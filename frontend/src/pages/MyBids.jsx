import React, { useEffect, useState } from "react"; 
import api from "../api";
import "../styles/Jobs.css";
import EditModal from "../components/EditModal";

function MyBids() {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBid, setCurrentBid] = useState(null);

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

    const handleEditBid = (bid) => {
        setCurrentBid(bid);
        setIsEditing(true);
    };

    const handleSubmitEdit = async (updatedBid) => {
        try {
            await api.put(`/api/bids/${updatedBid.id}/`, updatedBid);
            alert("Bid updated successfully!");
            fetchMyBids(); // Refresh bids
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating bid:", err);
            alert("Failed to update bid.");
        }
    };

    const handleMarkCompleted = async (bidId) => {
        if (window.confirm("Are you sure you want to mark this bid as completed?")) {
            try {
                await api.post(`/api/bids/${bidId}/mark-completed/`);
                alert("Bid marked as completed successfully!");
                fetchMyBids(); // Refresh bids
            } catch (err) {
                console.error("Error marking bid as completed:", err);
                alert("Failed to mark bid as completed.");
            }
        }
    };

    useEffect(() => {
        fetchMyBids();
    }, []);

    if (loading) return <div>Loading your bids...</div>;
    if (error) return <div>{error}</div>;

    const activeBids = bids.filter((bid) => bid.job.status === "posted");
    const acceptedBids = bids.filter((bid) => bid.job.status === "accepted");
    const completedBids = bids.filter((bid) => bid.job.status === "completed");

    return (
        <div className="jobs-container">
            <h1>Jobs You've Bid On</h1>

            <h2>Active Bids</h2>
            {activeBids.length === 0 ? (
                <p>No active bids.</p>
            ) : (
                <ul className="jobs-list">
                    {activeBids.map((bid) => (
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
                                <strong>Your Bid:</strong> {bid.gold} gold, {bid.silver} silver,{" "}
                                {bid.copper} copper
                            </p>
                            <p>
                                <strong>Estimated Completion Date:</strong>{" "}
                                {bid.estimated_completion_time || "Not specified"}
                            </p>
                            <p>
                                <strong>Deadline:</strong>{" "}
                                {bid.job.deadline || "Not specified"}
                            </p>
                            <button onClick={() => handleEditBid(bid)}>Edit Bid</button>
                        </li>
                    ))}
                </ul>
            )}

            <h2>Accepted Bids</h2>
            {acceptedBids.length === 0 ? (
                <p>No accepted bids.</p>
            ) : (
                <ul className="jobs-list">
                    {acceptedBids.map((bid) => (
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
                                <strong>Your Bid:</strong> {bid.gold} gold, {bid.silver} silver,{" "}
                                {bid.copper} copper
                            </p>
                            <p>
                                <strong>Estimated Completion Date:</strong>{" "}
                                {bid.estimated_completion_time || "Not specified"}
                            </p>
                            <p>
                                <strong>Deadline:</strong>{" "}
                                {bid.job.deadline || "Not specified"}
                            </p>
                            <button onClick={() => handleMarkCompleted(bid.id)}>Mark as Completed</button>
                        </li>
                    ))}
                </ul>
            )}

            <h2>Completed Bids</h2>
            {completedBids.length === 0 ? (
                <p>No completed bids.</p>
            ) : (
                <ul className="jobs-list">
                    {completedBids.map((bid) => (
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
                                <strong>Accepted Price:</strong> {bid.gold} gold, {bid.silver} silver,{" "}
                                {bid.copper} copper
                            </p>
                            <p>
                                <strong>Status:</strong> {bid.job.status}
                            </p>
                            <p>
                                <strong>Estimated Completion Date:</strong>{" "}
                                {bid.estimated_completion_time || "Not specified"}
                            </p>
                            <p>
                                <strong>Deadline:</strong>{" "}
                                {bid.job.deadline || "Not specified"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            {isEditing && currentBid && (
                <EditModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    initialData={currentBid}
                    onSubmit={handleSubmitEdit}
                    type="Bid"
                    canEditDescription={false} // Prevent editing the description
                />
            )}
        </div>
    );
}

export default MyBids;
