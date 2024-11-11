import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Jobs.css";
import BidOnJob from "../components/BidOnJob";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Store current user info

  // Helper function to format currency
  const formatCurrency = (copper) => {
    const gold = Math.floor(copper / 10000);
    const silver = Math.floor((copper % 10000) / 100);
    const remainingCopper = copper % 100;
    return `${gold} Gold, ${silver} Silver, ${remainingCopper} Copper`;
  };

  // Fetch jobs and current user
  const fetchJobs = async () => {
    try {
      const [jobsResponse, userResponse] = await Promise.all([
        api.get("/api/jobs/"),
        api.get("/api/current-user/"), // Endpoint to fetch current user
      ]);
      console.log("Jobs API Response:", jobsResponse.data);
      setJobs(jobsResponse.data.results);
      setCurrentUser(userResponse.data);
    } catch (err) {
      console.error("Error fetching jobs or user info:", err);
      setError("Failed to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Check if the user has already placed a bid on the job
  const hasUserBid = (job) => {
    if (!currentUser) return false;
    return job.bids.some((bid) => bid.bidder.id === currentUser.id);
  };

  // Loading state
  if (loading) {
    return <div>Loading jobs...</div>;
  }

  // Error state
  if (error) {
    return <div>{error}</div>;
  }

  // Render jobs list
  return (
    <div className="jobs-container">
      <h1>Available Jobs</h1>
      {jobs.length === 0 ? (
        <p>No jobs available at the moment.</p>
      ) : (
        <ul className="jobs-list">
          {jobs.map((job) => (
            <li key={job.id} className="job-card">
              <h2>{job.items_requested}</h2>
              <p>
                <strong>Server:</strong> {job.server}
              </p>
              <p>
                <strong>Node:</strong> {job.node}
              </p>
              <p>
                <strong>Total Bids:</strong> {job.bid_count}
              </p>
              <p>
                <strong>Average Bid:</strong>{" "}
                {job.average_bid ? formatCurrency(job.average_bid) : "No bids yet"}
              </p>
              <button
                className="job-bid-button"
                onClick={() => setSelectedJob(job)}
                disabled={hasUserBid(job)} // Disable button if user has bid
              >
                {hasUserBid(job) ? "Bid Submitted" : "Bid On Job"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal for bidding */}
      {selectedJob && (
        <BidOnJob
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

export default Jobs;
