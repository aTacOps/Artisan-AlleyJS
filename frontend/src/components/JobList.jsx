import React, { useEffect, useState } from "react";
import apiClient from "./apiClient";

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const fetchJobs = (url = "jobs/") => {
    apiClient
      .get(url)
      .then((response) => {
        setJobs(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div>
      <h1>Job Listings</h1>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            {job.items_requested} - {job.server}
          </li>
        ))}
      </ul>
      <div>
        {prevPage && <button onClick={() => fetchJobs(prevPage)}>Previous</button>}
        {nextPage && <button onClick={() => fetchJobs(nextPage)}>Next</button>}
      </div>
    </div>
  );
};

export default JobsList;
