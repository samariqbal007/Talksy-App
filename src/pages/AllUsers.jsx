// src/pages/AllUsers.jsx
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar'; // ✅ Add Navbar
import '../styles/allUsers.css';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];

        querySnapshot.forEach((doc) => {
          if (doc.id !== user.uid) {
            usersList.push({ uid: doc.id, ...doc.data() });
          }
        });

        setUsers(usersList);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendFriendRequest = async (toUserId) => {
    if (!currentUser) return;

    try {
      const existingReq = query(
        collection(db, 'friendRequests'),
        where('from', '==', currentUser.uid),
        where('to', '==', toUserId)
      );
      const result = await getDocs(existingReq);

      if (!result.empty) {
        setMessage('Friend request already sent.');
        return;
      }

      await addDoc(collection(db, 'friendRequests'), {
        from: currentUser.uid,
        to: toUserId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setMessage('Friend request sent!');
    } catch (error) {
      console.error('Error sending request:', error.message);
      setMessage('Failed to send friend request.');
    }
  };

  return (
    <div className="all-users-container">
      <Navbar /> {/* ✅ Add Navbar */}
      <div className="all-users-content">
        <h2>All Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <>
            {message && <p className="message">{message}</p>}
            <ul className="user-list">
              {users.map((user) => (
                <li key={user.uid} className="user-card">
                  <div>
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                  </div>
                  <button onClick={() => sendFriendRequest(user.uid)}>
                    Add Friend
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
