import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Jobs.css";

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    useEffect(() => {
        fetchJobs(); // Initial fetch
    }, []);

    const fetchJobs = async (url = "/api/jobs/") => {
        setLoading(true);
        setError(null); // Reset error state before fetching
        try {
            const response = await api.get(url);
            console.log("Jobs API Response:", response.data);
            setJobs(response.data.results || []); // Set jobs from `results`
            setNextPage(response.data.next); // Set the next page URL
            setPreviousPage(response.data.previous); // Set the previous page URL
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError("Failed to fetch jobs. Please try again.");
        } finally {
            setLoading(false); // End loading state
        }
    };

    if (loading) return <div>Loading jobs...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="jobs-container">
            <h1>Available Jobs</h1>
            {jobs.length === 0 ? (
                <p>No jobs are currently available. Check back later!</p>
            ) : (
                <ul className="jobs-list">
                    {jobs.map((job) => (
                        <li key={job.id} className="job-item">
                            <h2>{job.in_game_name}</h2>
                            <p><strong>Server:</strong> {job.server}</p>
                            <p><strong>Node:</strong> {job.node}</p>
                            <p><strong>Category:</strong> {job.item_category}</p>
                            <p><strong>Status:</strong> {job.status}</p>
                            <p><strong>Posted:</strong> {job.date_posted ? new Date(job.date_posted).toLocaleDateString() : "N/A"}</p>
                            <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}</p>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination Controls */}
            <div className="pagination">
                <button
                    className="pagination-button"
                    disabled={!previousPage}
                    onClick={() => fetchJobs(previousPage)}
                >
                    Previous
                </button>
                <button
                    className="pagination-button"
                    disabled={!nextPage}
                    onClick={() => fetchJobs(nextPage)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Jobs;
