// src/components/VoiceRecorder.jsx
import React, { useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { db, auth } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const VoiceRecorder = ({ friendId }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/ogg; codecs=opus" });
      chunks.current = [];

      const fileName = `voice_${Date.now()}.ogg`;
      const { data, error } = await supabase.storage
        .from("voice-messages")
        .upload(fileName, blob, { contentType: "audio/ogg" });

      if (error) {
        console.error("Upload failed:", error.message);
        return;
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("voice-messages")
        .getPublicUrl(fileName);

      // Save to Firestore as a chat message
      const user = auth.currentUser;
      if (!user) return;

      const chatId = [user.uid, friendId].sort().join("_"); // unique chat ID
      await addDoc(collection(db, "chats", chatId, "messages"), {
        from: user.uid,
        to: friendId,
        type: "audio",
        audioUrl: publicUrl.publicUrl,
        timestamp: serverTimestamp(),
      });
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="voice-recorder">
      {!recording ? (
        <button onClick={startRecording}>🎙️ Record</button>
      ) : (
        <button onClick={stopRecording}>⏹️ Stop</button>
      )}
    </div>
  );
};

export default VoiceRecorder;
