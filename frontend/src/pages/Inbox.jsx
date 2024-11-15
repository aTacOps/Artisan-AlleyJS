import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Inbox.css";

function Inbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/api/notifications/");
        if (response.data.results) {
          setNotifications(response.data.results); // Use the results array
        } else {
          console.error("Notifications data is not in the expected format:", response.data);
          setError("Failed to load notifications.");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (notifications.length === 0) {
    return <div>No notifications available.</div>;
  }

  return (
    <div className="inbox-container">
      <h1>Inbox</h1>
      <ul className="notifications-list">
        {notifications.map((notification) => (
          <li key={notification.id} className="notification-item">
            <p>
              <strong>{notification.type}</strong>: {notification.content}
            </p>
            {notification.link && (
              <a href={notification.link} className="notification-link">
                View Details
              </a>
            )}
            <small>{new Date(notification.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Inbox;
