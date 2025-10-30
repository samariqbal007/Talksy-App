import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import "../styles/searchUsers.css";

const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState({}); // track requests sent

  // Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const keyword = searchTerm.toLowerCase();

      const q = query(
        collection(db, "users"),
        where("searchKeywords", "array-contains", keyword)
      );

      const querySnapshot = await getDocs(q);
      const foundUsers = [];

      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser?.uid) {
          foundUsers.push({ uid: doc.id, ...doc.data() });
        }
      });

      if (foundUsers.length === 0) {
        setMessage("No users found.");
      } else {
        setMessage("");
      }

      setResults(foundUsers);
    } catch (err) {
      console.error("Error searching:", err);
      setMessage("Something went wrong while searching.");
    }
  };

  // Send Friend Request
  const sendFriendRequest = async (toUserId) => {
    if (!currentUser) return;

    try {
      setSending((prev) => ({ ...prev, [toUserId]: true }));

      // fetch sender/receiver details for better display
      const senderDoc = await getDoc(doc(db, "users", currentUser.uid));
      const senderData = senderDoc.exists() ? senderDoc.data() : { name: currentUser.email, email: currentUser.email };

      const receiverDoc = await getDoc(doc(db, "users", toUserId));
      const receiverData = receiverDoc.exists() ? receiverDoc.data() : {};

      await addDoc(collection(db, "friendRequests"), {
        from: currentUser.uid,
        fromName: senderData.name || senderData.email || "Unknown",
        fromEmail: senderData.email || "",
        to: toUserId,
        toName: receiverData.name || "",
        toEmail: receiverData.email || "",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage("Friend request sent!");
    } catch (error) {
      console.error("Error sending request:", error.message);
      setMessage("Failed to send friend request.");
      setSending((prev) => ({ ...prev, [toUserId]: false }));
    }
  };

  return (
    <div className="search-users-container">
      <Navbar />

      <div className="search-box">
        <h2>🔍 Search for Friends</h2>
        <input
          type="text"
          placeholder="Enter name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>

        {message && <p className="message">{message}</p>}

        <ul className="results-list">
          {results.map((user) => (
            <li key={user.uid} className="user-card">
              <div>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </div>
              <button
                onClick={() => sendFriendRequest(user.uid)}
                disabled={sending[user.uid]}
                className="add-friend-button"
              >
                {sending[user.uid] ? "Request Sent" : "Add Friend"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchUsers;
