// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/FriendsList.css";

const Dashboard = () => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchFriends(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchFriends = async (uid) => {
    const q1 = query(
      collection(db, "friendRequests"),
      where("from", "==", uid),
      where("status", "==", "accepted")
    );
    const q2 = query(
      collection(db, "friendRequests"),
      where("to", "==", uid),
      where("status", "==", "accepted")
    );
    const [sentSnap, receivedSnap] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);
    const friendUids = [
      ...sentSnap.docs.map((d) => d.data().to),
      ...receivedSnap.docs.map((d) => d.data().from),
    ];

    // fetch user documents for each friend uid
    const usersCol = collection(db, "users");
    const friendsList = [];
    for (let friendUid of friendUids) {
      const snap = await getDocs(query(usersCol, where("uid", "==", friendUid)));
      snap.forEach((doc) => friendsList.push(doc.data()));
    }
    setFriends(friendsList);
  };

  // show top three friends only

  return (
    <div className="page-with-navbar">
      <Navbar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Home</h1>

        <h3 className="section-title">Friends</h3>
        {friends.length === 0 && (
          <div className="friend-card-home empty">No friends yet</div>
        )}
        <ul className="friends-list">
          {friends.map((friend) => (
            <li key={friend.uid} className="friend-card">
              <div>
                <strong>{friend.name}</strong>
                <p>{friend.email}</p>
              </div>
              <div>
                <button
                  onClick={() => navigate(`/chat/${friend.uid}`)}
                  className="chat-btn"
                >
                  💬 Chat
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
