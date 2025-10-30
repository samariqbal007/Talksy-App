// src/pages/UsersList.jsx
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, getDocs, addDoc, query, where, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/allUsers.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) return;

      const q = query(collection(db, 'users'), where('uid', '!=', user.uid));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map((d) => d.data());
      setUsers(usersData);
    });

    return () => unsub();
  }, []);

  const sendFriendRequest = async (toUserId) => {
    if (!currentUser) return;
    try {
      setSending((prev) => ({ ...prev, [toUserId]: true }));

      // fetch sender profile for name/email
      const senderDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const senderData = senderDoc.exists() ? senderDoc.data() : { name: currentUser.email, email: currentUser.email };

      // fetch receiver profile (optional, for future UI)
      const receiverDoc = await getDoc(doc(db, 'users', toUserId));
      const receiverData = receiverDoc.exists() ? receiverDoc.data() : {};

      await addDoc(collection(db, 'friendRequests'), {
        from: currentUser.uid,
        fromName: senderData.name || senderData.email || 'Unknown',
        fromEmail: senderData.email || '',
        to: toUserId,
        toName: receiverData.name || '',
        toEmail: receiverData.email || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setMessage('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      setMessage('Failed to send friend request.');
      setSending((prev) => ({ ...prev, [toUserId]: false }));
    }
  };

  return (
    <div className="all-users-container">
      <div className="all-users-content">
        <h2>Discover People</h2>
        {message && <p className="message">{message}</p>}
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.uid} className="user-card">
              <div>
                <strong>{user.name || user.email}</strong>
                <p>{user.email}</p>
              </div>
              <button onClick={() => sendFriendRequest(user.uid)} disabled={!!sending[user.uid]}>
                {sending[user.uid] ? 'Request Sent' : 'Add Friend'}
              </button>
            </li>
          ))}
          {users.length === 0 && <p>No users found.</p>}
        </ul>
      </div>
    </div>
  );
};

export default UsersList;
