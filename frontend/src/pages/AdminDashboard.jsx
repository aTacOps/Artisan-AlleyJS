import React, { useState } from "react";
import CustomMessageForm from "../components/CustomMessageForm";

function AdminDashboard() {
    const [showMessageForm, setShowMessageForm] = useState(false);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <button onClick={() => setShowMessageForm(true)}>Send Custom Message</button>

            {showMessageForm && (
                <CustomMessageForm onClose={() => setShowMessageForm(false)} />
            )}

            {/* Other admin functionalities go here */}
        </div>
    );
}

export default AdminDashboard;
