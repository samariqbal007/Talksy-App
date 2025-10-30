// src/pages/Login.jsx
import React, { useState } from "react";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Login successful!");
      navigate("/dashboard"); // redirect after login
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleLogin}>
        <h2 className="form-title">Login</h2>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />

        <button type="submit" className="auth-button">
          Login
        </button>

        {error && <p className="auth-error">{error}</p>}
      </form>
      </div>
    </div>
  );
};

export default Login;
