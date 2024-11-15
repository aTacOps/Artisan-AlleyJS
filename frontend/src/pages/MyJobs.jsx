import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Jobs.css";
import BidModal from "../components/BidModal";
import EditModal from "../components/EditModal";

function MyJobs() {
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [bids, setBids] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);

    const fetchMyJobs = async () => {
        try {
            const response = await api.get("/api/jobs/my-jobs/");
            setMyJobs(response.data);
        } catch (err) {
            setError("Failed to fetch your jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchBids = async (jobId) => {
        try {
            const response = await api.get(`/api/jobs/${jobId}/bids/`);
            setBids(response.data);
        } catch (err) {
            console.error("Error fetching bids:", err);
            setError("Failed to fetch bids. Please try again.");
        }
    };

    const handleViewBids = (job) => {
        setSelectedJob(job);
        fetchBids(job.id);
    };

    const handleCloseModal = () => {
        setSelectedJob(null);
        setBids([]);
    };

    const handleEditJob = (job) => {
        setCurrentJob(job);
        setIsEditing(true);
    };
    
    const handleSubmitEdit = async (updatedJob) => {
        try {
            await api.put(`/api/jobs/${updatedJob.id}/`, updatedJob); // Update job
            alert("Job updated successfully!"); // Notify job poster
            fetchMyJobs(); // Refresh jobs after update
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating job:", err);
            alert("Failed to update job.");
        }
    };
    
    

    const handleDeleteJob = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await api.delete(`/api/jobs/${jobId}/`);
                alert("Job deleted successfully!");
                fetchMyJobs(); // Refresh jobs
            } catch (err) {
                console.error("Error deleting job:", err);
                alert("Failed to delete job.");
            }
        }
    };

    const handleAcceptBid = async (bidId) => {
        if (window.confirm("Are you sure you want to accept this bid?")) {
            try {
                await api.post(`/api/jobs/${selectedJob.id}/accept-bid/`, { bid_id: bidId });
                alert("Bid accepted successfully!");
                fetchMyJobs(); // Refresh jobs
                handleCloseModal(); // Close modal
            } catch (err) {
                console.error("Error accepting bid:", err);
                alert("Failed to accept bid.");
            }
        }
    };

    const handleMarkAsDelivered = async (jobId) => {
    if (window.confirm("Are you sure you want to mark this job as delivered?")) {
        try {
            await api.post(`/api/jobs/${jobId}/mark-delivered/`);
            alert("Job marked as delivered successfully!");
            fetchMyJobs(); // Refresh the list of jobs
        } catch (err) {
            console.error("Error marking job as delivered:", err);
            alert("Failed to mark job as delivered.");
        }
    }
};

    

    useEffect(() => {
        fetchMyJobs();
    }, []);

    if (loading) return <div>Loading your jobs...</div>;
    if (error) return <div>{error}</div>;

    const activeJobs = myJobs.filter((job) => job.status === "posted");
    const acceptedJobs = myJobs.filter((job) => job.status === "accepted");
    const completedJobs = myJobs.filter((job) => job.status === "completed");

    return (
        <div className="jobs-container">
            <h1>Your Posted Jobs</h1>

            <h2>Active Jobs</h2>
            {activeJobs.length === 0 ? (
                <p>No active jobs.</p>
            ) : (
                <ul className="jobs-list">
                    {activeJobs.map((job) => (
                        <li key={job.id} className="job-card">
                            <h2>{job.items_requested}</h2>
                            <p>
                                <strong>Server:</strong> {job.server}
                            </p>
                            <p>
                                <strong>Node:</strong> {job.node}
                            </p>
                            <p>
                                <strong>Status:</strong> {job.status}
                            </p>
                            <p>
                                <strong>Average Bid:</strong> {job.gold} Gold {job.silver} Silver {job.copper} Copper
                            </p>
                            <p>
                                <strong>Total Bids:</strong> {job.bid_count}
                            </p>
                            <button onClick={() => handleViewBids(job)}>View Bids</button>
                            <button onClick={() => handleEditJob(job)}>Edit Job</button>
                            <button onClick={() => handleDeleteJob(job.id)}>Delete Job</button>
                        </li>
                    ))}
                </ul>
            )}

            <h2>Accepted Jobs</h2>
            {acceptedJobs.length === 0 ? (
                <p>No accepted jobs.</p>
            ) : (
                <ul className="jobs-list">
                    {acceptedJobs.map((job) => (
                        <li key={job.id} className="job-card">
                            <h2>{job.items_requested}</h2>
                            <p>
                                <strong>Server:</strong> {job.server}
                            </p>
                            <p>
                                <strong>Node:</strong> {job.node}
                            </p>
                            <p>
                                <strong>Artisan:</strong> {job.accepted_bid?.in_game_name || "N/A"}
                            </p>
                            <p>
                                <strong>Status:</strong> {job.status}
                            </p>
                            <p>
                                <strong>Accepted Bid:</strong> {job.accepted_bid?.gold} gold,{" "}
                                {job.accepted_bid?.silver} silver, {job.accepted_bid?.copper} copper
                            </p>
                            <p>
                                <strong>Estimated Completion Date:</strong> {job.accepted_bid?.estimated_completion_time || "Unspecified"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            <h2>Completed Jobs</h2>
            {completedJobs.length === 0 ? (
                <p>No completed jobs.</p>
            ) : (
                <ul className="jobs-list">
                    {completedJobs.map((job) => (
                        <li key={job.id} className="job-card">
                            <h2>{job.items_requested}</h2>
                            <p>
                                <strong>Server:</strong> {job.server}
                            </p>
                            <p>
                                <strong>Node:</strong> {job.node}
                            </p>
                            <p>
                                <strong>Artisan:</strong> {job.accepted_bid?.in_game_name || "N/A"}
                            </p>
                            <p>
                                <strong>Status:</strong> {job.status}
                            </p>
                            <p>
                                <strong>Completed Date:</strong> {job.completed_date
                                    ? new Date(job.completed_date).toLocaleString()
                                    : "N/A"}
                            </p>
                            <button onClick={() => handleMarkAsDelivered(job.id)}>Mark as Delivered</button>
                        </li>
                    ))}
                </ul>
            )}

            {selectedJob && (
                <BidModal
                    bids={bids}
                    onClose={handleCloseModal}
                    onAcceptBid={handleAcceptBid}
                />
            )}

            {isEditing && currentJob && (
                <EditModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    initialData={currentJob}
                    onSubmit={handleSubmitEdit}
                    type="Job"
                    canEditDescription={true}
                />
            )}
        </div>
    );
}

export default MyJobs;
