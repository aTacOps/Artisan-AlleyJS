import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Jobs.css";
import BidModal from "../components/BidModal";

function MyJobs() {
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [bids, setBids] = useState([]);

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

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const handleViewBids = (job) => {
        setSelectedJob(job);
        fetchBids(job.id);
    };

    const handleCloseModal = () => {
        setSelectedJob(null);
        setBids([]);
    };

    if (loading) return <div>Loading your jobs...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="jobs-container">
            <h1>Your Posted Jobs</h1>
            {myJobs.length === 0 ? (
                <p>You have not created any jobs yet.</p>
            ) : (
                <ul className="jobs-list">
                    {myJobs.map((job) => (
                        <li key={job.id} className="job-card">
                            <h2>{job.items_requested}</h2>
                            <p>
                                <strong>Server:</strong> {job.server}
                            </p>
                            <p>
                                <strong>Status:</strong> {job.status}
                            </p>
                            <p>
                                <strong>Total Bids:</strong> {job.bid_count}
                            </p>
                            <button onClick={() => handleViewBids(job)}>View Bids</button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Modal for Viewing Bids */}
            {selectedJob && (
                <BidModal
                    bids={bids}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default MyJobs;
