// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

const ChatPage = () => {
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const currentUser = auth.currentUser;

  // ✅ Listen to Firestore messages in real-time
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Filter only messages between current user and friend
      const filtered = data.filter(
        (msg) =>
          msg.participants.includes(currentUser.uid) &&
          msg.participants.includes(friendId)
      );
      setMessages(filtered);
    });

    return () => unsub();
  }, [currentUser, friendId]);

  // ✅ Start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = handleStopRecording;
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  // ✅ Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // ✅ Handle saving audio to Supabase + Firestore
  const handleStopRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];

    const fileName = `${Date.now()}-${currentUser.uid}.webm`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("voice-messages")
      .upload(fileName, audioBlob);

    if (error) {
      console.error("Upload error:", error.message);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("voice-messages")
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;

    // Save message to Firestore
    await addDoc(collection(db, "messages"), {
      from: currentUser.uid,
      to: friendId,
      participants: [currentUser.uid, friendId],
      audioUrl,
      timestamp: new Date(),
    });
  };

  return (
    <div className="friends-container">
      <h2>Chat</h2>
      <div className="user-card" style={{ maxWidth: 800, margin: '0 auto 16px auto' }}>
        <div>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 10 }}>
              <strong>{msg.from === currentUser?.uid ? "You" : "Friend"}:</strong>
              {msg.audioUrl ? (
                <audio src={msg.audioUrl} controls autoPlay={msg.from !== currentUser?.uid} />
              ) : (
                <span>Unknown message</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {!recording ? (
        <button onClick={startRecording}>🎙️ Start Recording</button>
      ) : (
        <button onClick={stopRecording}>⏹️ Stop Recording</button>
      )}
    </div>
  );
};

export default ChatPage;
