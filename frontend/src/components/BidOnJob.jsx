import React, { useState } from "react";
import api from "../api";
import "../styles/BidOnJob.css";

function BidOnJob({ job, onClose }) {
  const [ingamename, setIngameName] = useState("");
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [copper, setCopper] = useState(0);
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState("");
  const [certificationLevel, setCertificationLevel] = useState("Novice");
  const [note, setNote] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        job: job.id,
        in_game_name: ingamename.trim(),
        gold: parseInt(gold) || 0,
        silver: parseInt(silver) || 0,
        copper: parseInt(copper) || 0,
        estimated_completion_time: estimatedCompletionTime.trim(),
        certification_level: certificationLevel,
        note: note.trim(),
      };
      console.log("Submitting payload:", payload);
      const response = await api.post(`/api/jobs/${job.id}/bids/`, payload);
      console.log("Bid submitted successfully:", response.data);
      alert("Bid submitted successfully!");
      onClose();
    } catch (err) {
      console.error("Error submitting bid:", err.response?.data || err.message);
      alert("Failed to submit bid. Please check your input.");
    }
  };
  

  return (
    <div className="bid-modal">
      <div className="bid-modal-content">
        <h2>Bid on {job.items_requested}</h2>
        <form onSubmit={handleSubmit}>
          <label>Ingame Name:</label>
          <input
            type="text"
            value={ingamename}
            onChange={(e) => setIngameName(e.target.value)}
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
          <label>Certification Level:</label>
          <select
            value={certificationLevel}
            onChange={(e) => setCertificationLevel(e.target.value)}
          >
            <option value="Novice">Novice</option>
            <option value="Apprentice">Apprentice</option>
            <option value="Journeyman">Journeyman</option>
            <option value="Master">Master</option>
            <option value="Grandmaster">Grandmaster</option>
          </select>
          <label>Note (optional):</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
          <button type="submit">Submit Bid</button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default BidOnJob;
