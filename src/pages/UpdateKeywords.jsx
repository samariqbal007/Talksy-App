import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const UpdateKeywords = () => {
  const [status, setStatus] = useState('Updating...');

  const updateSearchKeywordsForUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      let updatedCount = 0;

      const promises = snapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        const name = userData.name?.toLowerCase();
        const email = userData.email?.toLowerCase();

        // Only update if searchKeywords don't exist
        if (!userData.searchKeywords && name && email) {
          await updateDoc(doc(db, 'users', userDoc.id), {
            searchKeywords: [name, email]
          });
          updatedCount++;
        }
      });

      await Promise.all(promises);

      setStatus(`✅ Done! ${updatedCount} users updated with search keywords.`);
    } catch (error) {
      console.error('Error updating searchKeywords:', error);
      setStatus('❌ Error occurred. See console.');
    }
  };

  useEffect(() => {
    updateSearchKeywordsForUsers();
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>🔄 Updating Users</h2>
      <p>{status}</p>
    </div>
  );
};

export default UpdateKeywords;
