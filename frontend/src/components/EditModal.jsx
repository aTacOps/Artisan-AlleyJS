import React, { useState, useEffect } from "react";

function EditModal({ isOpen, onClose, initialData, onSubmit, type, canEditDescription = true }) {
    const [itemsRequested, setItemsRequested] = useState(initialData?.items_requested || "");
    const [gold, setGold] = useState(initialData?.gold || 0);
    const [silver, setSilver] = useState(initialData?.silver || 0);
    const [copper, setCopper] = useState(initialData?.copper || 0);
    const [estimatedCompletionTime, setEstimatedCompletionTime] = useState(initialData?.estimated_completion_time || "");
    const [note, setNote] = useState(initialData?.note || "");

    useEffect(() => {
        if (initialData) {
            setItemsRequested(initialData.items_requested || "");
            setGold(initialData.gold || 0);
            setSilver(initialData.silver || 0);
            setCopper(initialData.copper || 0);
            setEstimatedCompletionTime(initialData.estimated_completion_time || "");
            setNote(initialData.note || "");
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            ...initialData,
            items_requested: itemsRequested.trim(),
            gold: parseInt(gold, 10),
            silver: parseInt(silver, 10),
            copper: parseInt(copper, 10),
            estimated_completion_time: estimatedCompletionTime,
            note: note.trim(),
        };
        onSubmit(updatedData);
    };

    if (!isOpen) return null;

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
                        readOnly={!canEditDescription} // Toggle field based on permission
                    />
                    <label>Gold:</label>
                    <input type="number" min="0" value={gold} onChange={(e) => setGold(e.target.value)} />
                    <label>Silver:</label>
                    <input type="number" min="0" max="99" value={silver} onChange={(e) => setSilver(e.target.value)} />
                    <label>Copper:</label>
                    <input type="number" min="0" max="99" value={copper} onChange={(e) => setCopper(e.target.value)} />
                    <label>Estimated Completion Date:</label>
                    <input
                        type="date"
                        value={estimatedCompletionTime}
                        onChange={(e) => setEstimatedCompletionTime(e.target.value)}
                    />
                    <label>Note:</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                    <button type="submit">Save</button>
                    <button type="button" className="close-button" onClick={onClose}>
                        Close
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditModal;
