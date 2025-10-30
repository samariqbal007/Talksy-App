import React, { useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const UpdateUsers = () => {
  useEffect(() => {
    const updateUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));

        usersSnapshot.forEach(async (userDoc) => {
          const userData = userDoc.data();
          const name = userData.name || "";
          const email = userData.email || "";

          await updateDoc(doc(db, "users", userDoc.id), {
            searchKeywords: [name.toLowerCase(), email.toLowerCase()],
          });

          console.log(`✅ Updated user: ${email}`);
        });

        console.log("🎉 All users updated successfully!");
      } catch (err) {
        console.error("❌ Error updating users:", err);
      }
    };

    updateUsers();
  }, []);

  return <h2>Updating all users... check console logs ✅</h2>;
};

export default UpdateUsers;
