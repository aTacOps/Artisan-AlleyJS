import React, { useEffect, useState } from "react";
import api from "../api";
import CustomMessageForm from "../components/CustomMessageForm";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [bids, setBids] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchPaginatedData = async (endpoint, page = 1, search = "") => {
        try {
            const response = await api.get(`${endpoint}?page=${page}&search=${search}`);
            return response.data; // Contains `results`, `next`, `previous`, `count`
        } catch (err) {
            console.error(`Failed to fetch data from ${endpoint}:`, err);
            return { results: [], count: 0 };
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersData = await fetchPaginatedData("/api/admin/users/", currentPage, searchTerm);
            const jobsData = await fetchPaginatedData("/api/admin/jobs/", currentPage, searchTerm);
            const bidsData = await fetchPaginatedData("/api/admin/bids/", currentPage, searchTerm);
            const notificationsData = await fetchPaginatedData("/api/admin/notifications/", currentPage, searchTerm);

            setUsers(usersData.results || []);
            setJobs(jobsData.results || []);
            setBids(bidsData.results || []);
            setNotifications(notificationsData.results || []);

            setTotalPages(Math.max(
                Math.ceil(usersData.count / 10),
                Math.ceil(jobsData.count / 10),
                Math.ceil(bidsData.count / 10),
                Math.ceil(notificationsData.count / 10)
            )); // Assuming all categories have the same pagination count
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteOldEntries = async () => {
        try {
            await api.post("/api/admin/delete-old/");
            alert("Old entries deleted successfully!");
            fetchData();
        } catch (err) {
            console.error("Failed to delete old entries:", err);
        }
    };

    const handleEdit = async (type, id) => {
        const newValue = prompt(`Enter new value for ${type} ID ${id}:`);
        if (!newValue) return;

        try {
            await api.put(`/api/admin/${type}/${id}/`, { newValue }); // Adjust API endpoint and payload as needed
            alert(`${type} updated successfully!`);
            fetchData(); // Refresh the data after editing
        } catch (err) {
            console.error(`Failed to edit ${type}:`, err);
            alert(`Failed to edit ${type}.`);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            await api.delete(`/api/admin/${type}/${id}/`); // Adjust API endpoint as needed
            alert(`${type} deleted successfully!`);
            fetchData(); // Refresh the data after deletion
        } catch (err) {
            console.error(`Failed to delete ${type}:`, err);
            alert(`Failed to delete ${type}.`);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        fetchData(); // Fetch data for the new page
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm]);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <button onClick={() => setShowMessageForm(true)}>Send Global Message</button>
            <button onClick={deleteOldEntries}>Delete Entries Older than 100 Days</button>

            {showMessageForm && <CustomMessageForm onClose={() => setShowMessageForm(false)} />}

            {loading ? (
                <p>Loading data...</p>
            ) : (
                <>
                    <div>
                        <h2>Users</h2>
                        <input
                            type="text"
                            placeholder="Search Users"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {users.length === 0 ? (
                            <p>No users found.</p>
                        ) : (
                            <ul>
                                {users.map((user) => (
                                    <li key={user.id}>
                                        {user.username} ({user.email})
                                        <button onClick={() => handleEdit("user", user.id)}>Edit</button>
                                        <button onClick={() => handleDelete("user", user.id)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <h2>Jobs</h2>
                        <ul>
                            {jobs.map((job) => (
                                <li key={job.id}>
                                    {job.items_requested}
                                    <button onClick={() => handleEdit("job", job.id)}>Edit</button>
                                    <button onClick={() => handleDelete("job", job.id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2>Bids</h2>
                        <ul>
                            {bids.map((bid) => (
                                <li key={bid.id}>
                                    {bid.job}
                                    <button onClick={() => handleEdit("bid", bid.id)}>Edit</button>
                                    <button onClick={() => handleDelete("bid", bid.id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2>Notifications</h2>
                        <ul>
                            {notifications.map((notification) => (
                                <li key={notification.id}>
                                    {notification.content}
                                    <button onClick={() => handleEdit("notification", notification.id)}>Edit</button>
                                    <button onClick={() => handleDelete("notification", notification.id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3>Pagination</h3>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
