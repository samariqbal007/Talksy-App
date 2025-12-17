// src/pages/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (err) {
      console.error(err.message);
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2 className="form-title">Login</h2>

        <input
          type="email"
          placeholder="Email"
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

        {/* 👇 New Section for Signup Navigation */}
        <div className="signup-redirect">
          <p>Don't have an account?</p>
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/register')}
          >
            Create a new account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
