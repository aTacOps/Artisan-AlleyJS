import React, { useState } from "react";
import api from "../api";

function CustomMessageForm({ onClose }) {
    const [recipients, setRecipients] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRecipients = async () => {
        try {
            const response = await api.get("/api/admin/users/");
            setRecipients(response.data);
        } catch (err) {
            setError("Failed to fetch recipients. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/api/admin/custom-message/", { content });
            alert("Message sent successfully!");
            setContent("");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to send message.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRecipients();
    }, []);

    if (error) return <div>{error}</div>;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Send Custom Message</h2>
                {loading && <p>Loading...</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <p><strong>Recipients:</strong></p>
                        <ul>
                            {recipients.map((user) => (
                                <li key={user.id}>{user.username} ({user.email})</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <label htmlFor="content">Message:</label>
                        <textarea
                            id="content"
                            rows="5"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{ width: "100%" }}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>Send</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
}

export default CustomMessageForm;
