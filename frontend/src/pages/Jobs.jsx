import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Jobs.css";
import BidOnJob from "../components/BidOnJob";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [filters, setFilters] = useState({
    item_category: "",
    ordering: "",
  });

  // Helper function to format currency
  const formatCurrency = (copper) => {
    const gold = Math.floor(copper / 10000);
    const silver = Math.floor((copper % 10000) / 100);
    const remainingCopper = copper % 100;
    return `${gold} Gold, ${silver} Silver, ${remainingCopper} Copper`;
  };

  // Fetch jobs and current user
  const fetchJobs = async (url = "/api/jobs/") => {
    try {
      const [jobsResponse, userResponse] = await Promise.all([
        api.get(url, { params: filters }),
        api.get("/api/current-user/"), // Endpoint to fetch current user
      ]);

      setJobs(jobsResponse.data.results);
      setNextPage(jobsResponse.data.next);
      setPrevPage(jobsResponse.data.previous);
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
  }, [filters]); // Refetch jobs when filters change

  // Check if the user has already placed a bid on the job
  const hasUserBid = (job) => {
    if (!currentUser) return false;
    return job.bids.some((bid) => bid.bidder.id === currentUser.id);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
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

      {/* Filters */}
      <div className="filters">
        <label htmlFor="item_category">Filter by Item Category:</label>
        <select
          name="item_category"
          value={filters.item_category}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          <option value="Alchemy">Alchemy</option>
          <option value="Animal Husbandry">Animal Husbandry</option>
          <option value="Arcane Engineering">Arcane Engineering</option>
          <option value="Armor Smithing">Armor Smithing</option>
          <option value="Carpentry">Carpentry</option>
          <option value="Cooking">Cooking</option>
          <option value="Farming">Farming</option>
          <option value="Fishing">Fishing</option>
          <option value="Herbalism">Herbalism</option>
          <option value="Hunting">Hunting</option>
          <option value="Jewel Cutting">Jewel Cutting</option>
          <option value="Leatherworking">Leatherworking</option>
          <option value="Lumberjacking">Lumberjacking</option>
          <option value="Lumber Milling">Lumber Milling</option>
          <option value="Metalworking">Metalworking</option>
          <option value="Mining">Mining</option>
          <option value="Scribing">Scribing</option>
          <option value="Stonemasonry">Stonemasonry</option>
          <option value="Tailoring">Tailoring</option>
          <option value="Tanning">Tanning</option>
          <option value="Weapon Smithing">Weapon Smithing</option>
          <option value="Weaving">Weaving</option>
          <option value="Other">Other</option>
        </select>

              {/* Server */}
          <label htmlFor="server">Server:</label>
          <select
            name="server"
            value={filters.server}
            onChange={handleFilterChange}
          >
            <option value="">All Servers</option>
            <option value="Server1">Server1</option>
            <option value="Server2">Server2</option>
            {/* Add more servers here */}
          </select>

          {/* Node */}
          <label htmlFor="node">Node:</label>
          <select
            name="node"
            value={filters.node}
            onChange={handleFilterChange}
          >
            <option value="">All Nodes</option>
            <option value="Node1">Node1</option>
            <option value="Node2">Node2</option>
            {/* Add more nodes here */}
          </select>

          {/* Sorting */}
          <label htmlFor="ordering">Sort by:</label>
          <select name="ordering" value={filters.ordering} onChange={handleFilterChange}>
            <option value="">Default</option>
            <option value="average_bid">Average Bid</option>
            <option value="-average_bid">Average Bid (Descending)</option>
            <option value="bid_count">Total Bids</option>
            <option value="-bid_count">Total Bids (Descending)</option>
            <option value="deadline">Deadline</option>
            <option value="-deadline">Deadline (Descending)</option>
          </select>
        </div>

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

      {/* Pagination controls */}
      <div className="pagination-controls">
        {prevPage && <button onClick={() => fetchJobs(prevPage)}>Previous</button>}
        {nextPage && <button onClick={() => fetchJobs(nextPage)}>Next</button>}
      </div>

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
