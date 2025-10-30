import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user info in Firestore with searchKeywords
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        searchKeywords: [
          name.toLowerCase(),
          email.toLowerCase()
        ]
      });

      alert('Registration successful! You can now log in.');
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleRegister}>
        <h2 className="form-title">Register</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="auth-input"
        />

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

        <button type="submit" className="auth-button">Register</button>

        {error && <p className="auth-error">{error}</p>}
      </form>
      </div>
    </div>
  );
};

export default Register;
