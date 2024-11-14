import React from "react";

function BidModal({ bids, onClose, onAcceptBid }) {
    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Bid Details</h2>
                {bids.length === 0 ? (
                    <p>No bids have been placed on this job yet.</p>
                ) : (
                    <ul className="bids-list">
                        {bids.map((bid) => (
                            <li key={bid.id} className="bid-card">
                                <p>
                                    <strong>Bidder:</strong> 
                                    <span 
                                        className="link" 
                                        onClick={() => navigate(`/profile/${bid.bidder.id}`)}
                                    >
                                        {bid.bidder.username}
                                    </span>
                                </p>
                                <p>
                                    <strong>Proposed Price:</strong> {bid.gold} gold {bid.silver} silver {bid.copper} copper
                                </p>
                                <p>
                                    <strong>Estimated Completion Date:</strong> {bid.estimated_completion_time}
                                </p>
                                <p>
                                    <strong>Placed At:</strong> {new Date(bid.date_bid).toLocaleString()}
                                </p>
                                <p>
                                    <strong>Notes:</strong> {bid.note}
                                </p>
                                {/* Accept Bid Button */}
                                <button
                                    className="accept-bid-button"
                                    onClick={() => onAcceptBid(bid.id)}
                                >
                                    Accept Bid
                                </button><button className="close-button" onClick={onClose}>Close</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default BidModal;
