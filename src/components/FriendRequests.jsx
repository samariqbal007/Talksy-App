import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import "../styles/FriendRequests.css";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Track current logged-in user & fetch their friend requests
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);

        // ✅ Listen for incoming requests
        const q = query(
          collection(db, "friendRequests"),
          where("to", "==", user.uid),
          where("status", "==", "pending")
        );

        const unsub = onSnapshot(q, async (snapshot) => {
          const enrich = async (docSnap) => {
            const data = docSnap.data();
            if (!data.fromName || !data.fromEmail) {
              try {
                const senderRef = doc(db, "users", data.from);
                const senderSnap = await getDoc(senderRef);
                if (senderSnap.exists()) {
                  const s = senderSnap.data();
                  return {
                    id: docSnap.id,
                    ...data,
                    fromName: data.fromName || s.name || s.email || "Unknown User",
                    fromEmail: data.fromEmail || s.email || "",
                  };
                }
              } catch (_) {
                // ignore and fall back below
              }
            }
            return { id: docSnap.id, ...data };
          };

          const promises = snapshot.docs.map((d) => enrich(d));
          const reqs = await Promise.all(promises);
          setRequests(reqs);
        });

        return () => unsub();
      }
    });

    return () => unsubAuth();
  }, []);

  // Accept request
  const handleAccept = async (reqId) => {
    await updateDoc(doc(db, "friendRequests", reqId), { status: "accepted" });
  };

  // Decline request
  const handleDecline = async (reqId) => {
    await deleteDoc(doc(db, "friendRequests", reqId));
  };

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">
        <h1>📨 Incoming Friend Requests ({requests.length})</h1>

        {requests.length === 0 ? (
          <p className="empty-message">You have no new requests.</p>
        ) : (
          <section aria-label="Incoming Friend Requests">
            <ul className="request-list">
              {requests.map((req) => (
                <li key={req.id} className="request-item">
                  <div className="request-info">
                    <span className="username">
                      {req.fromName || "Unknown User"}
                    </span>
                    <span className="email">{req.fromEmail || ""}</span>
                  </div>

                  <div className="request-actions">
                    <button
                      className="btn accept"
                      onClick={() => handleAccept(req.id)}
                    >
                      ✅ Accept
                    </button>
                    <button
                      className="btn decline"
                      onClick={() => handleDecline(req.id)}
                    >
                      ❌ Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
