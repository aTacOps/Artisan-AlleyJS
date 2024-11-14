import React, { useState } from "react";

function EditModal({ isOpen, onClose, initialData, onSubmit, type, canEditDescription }) {
    if (!isOpen) return null;

    const [itemsRequested, setItemsRequested] = useState(initialData?.items_requested || "");
    const [gold, setGold] = useState(initialData?.gold || 0);
    const [silver, setSilver] = useState(initialData?.silver || 0);
    const [copper, setCopper] = useState(initialData?.copper || 0);
    const [estimatedCompletionTime, setEstimatedCompletionTime] = useState(initialData?.estimated_completion_time || "");
    const [note, setNote] = useState(initialData?.note || "");

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedData = {
            ...initialData,
            items_requested: itemsRequested.trim(),
            gold: parseInt(gold),
            silver: parseInt(silver),
            copper: parseInt(copper),
            estimated_completion_time: estimatedCompletionTime,
            note: note.trim(),
        };

        onSubmit(updatedData);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Edit {type}</h2>
                <form onSubmit={handleSubmit}>
                    <label>Item Description:</label>
                    <input
                        type="text"
                        value={itemsRequested}
                        onChange={(e) => setItemsRequested(e.target.value)}
                        readOnly={!canEditDescription} // Make field read-only if the user can't edit
                    />
                    <label>Gold:</label>
                    <input
                        type="number"
                        min="0"
                        value={gold}
                        onChange={(e) => setGold(e.target.value)}
                    />
                    <label>Silver:</label>
                    <input
                        type="number"
                        min="0"
                        max="99"
                        value={silver}
                        onChange={(e) => setSilver(e.target.value)}
                    />
                    <label>Copper:</label>
                    <input
                        type="number"
                        min="0"
                        max="99"
                        value={copper}
                        onChange={(e) => setCopper(e.target.value)}
                    />
                    <label>Estimated Completion Date:</label>
                    <input
                        type="date"
                        value={estimatedCompletionTime}
                        onChange={(e) => setEstimatedCompletionTime(e.target.value)}
                    />
                    <label>Note:</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                    <button type="submit">Save</button> <button className="close-button" onClick={onClose}>Close</button>
                </form>
            </div>
        </div>
    );
}

export default EditModal;
