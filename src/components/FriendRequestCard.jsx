// src/components/FriendRequestCard.jsx
import React from "react";
import "../styles/friendRequestCard.css";

const FriendRequestCard = ({ request, onAccept, onDecline }) => {
  return (
    <div className="friend-request-card">
      <div className="user-info">
        <h4>{request.fromName}</h4>
        <p>{request.fromEmail}</p>
      </div>
      <div className="actions">
        <button className="accept-btn" onClick={() => onAccept(request.id)}>
          ✅ Accept
        </button>
        <button className="decline-btn" onClick={() => onDecline(request.id)}>
          ❌ Decline
        </button>
      </div>
    </div>
  );
};

export default FriendRequestCard;
