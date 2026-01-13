import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const currentUser = auth.currentUser;

  /* ===============================
     🔴 REAL-TIME MESSAGE LISTENER
  =============================== */
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filtered = allMessages.filter(
        (msg) =>
          msg.participants.includes(currentUser.uid) &&
          msg.participants.includes(friendId)
      );

      setMessages(filtered);
    });

    return () => unsubscribe();
  }, [currentUser, friendId]);

  /* ===============================
     📝 SEND TEXT MESSAGE
  =============================== */
  const sendTextMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "messages"), {
      from: currentUser.uid,
      to: friendId,
      participants: [currentUser.uid, friendId],
      text,
      audioUrl: null,
      timestamp: new Date(),
    });

    setText("");
  };

  /* ===============================
     🎙️ START RECORDING
  =============================== */
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

  /* ===============================
     ⏹️ STOP RECORDING
  =============================== */
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  /* ===============================
     🔊 SAVE AUDIO MESSAGE
  =============================== */
  const handleStopRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, {
      type: "audio/webm",
    });
    audioChunksRef.current = [];

    const fileName = `${Date.now()}-${currentUser.uid}.webm`;

    const { error } = await supabase.storage
      .from("voice-messages")
      .upload(fileName, audioBlob);

    if (error) {
      console.error("Audio upload failed:", error.message);
      return;
    }

    const { data } = supabase.storage
      .from("voice-messages")
      .getPublicUrl(fileName);

    await addDoc(collection(db, "messages"), {
      from: currentUser.uid,
      to: friendId,
      participants: [currentUser.uid, friendId],
      text: null,
      audioUrl: data.publicUrl,
      timestamp: new Date(),
    });
  };

  /* ===============================
     🖥️ UI
  =============================== */
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      
      {/* ⬅ Back to Home */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginBottom: 12,
          background: "transparent",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ⬅ Back to Home
      </button>

      <h2>Chat</h2>

      {/* Messages */}
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 12 }}>
            <strong>
              {msg.from === currentUser.uid ? "You" : "Friend"}:
            </strong>

            {msg.text && <p>{msg.text}</p>}

            {msg.audioUrl && (
              <audio
                src={msg.audioUrl}
                controls
                autoPlay={msg.from !== currentUser.uid}
              />
            )}
          </div>
        ))}
      </div>

      {/* Text Input */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "none",
          }}
        />
        <button onClick={sendTextMessage}>Send</button>
      </div>

      {/* Voice Controls */}
      <div style={{ marginTop: 16 }}>
        {!recording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
