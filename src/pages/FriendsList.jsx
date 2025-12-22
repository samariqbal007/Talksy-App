// src/pages/FriendsList.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/FriendsList.css";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        fetchFriends(user.uid);
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
      ...sentSnap.docs.map((doc) => doc.data().to),
      ...receivedSnap.docs.map((doc) => doc.data().from),
    ];

    const usersCollection = collection(db, "users");
    const friendsList = [];

    for (let friendUid of friendUids) {
      const userSnap = await getDocs(
        query(usersCollection, where("uid", "==", friendUid))
      );
      userSnap.forEach((doc) => {
        friendsList.push(doc.data());
      });
    }

    setFriends(friendsList);
  };

  return (
    <div className="friends-container">
      <Navbar />
      <h2>My Friends</h2>
      {friends.length === 0 && <p>You don’t have any friends yet.</p>}
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
  );
};

export default FriendsList;
