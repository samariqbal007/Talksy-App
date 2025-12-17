// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import '../styles/Navbar.css'; // Match actual filename

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const titleMap = {
    '/dashboard': 'Home',
    '/friends': 'Friends',
    '/requests': 'Friend Requests',
    '/search': 'Search Friends',
  };
  const pageTitle = titleMap[location.pathname] || 'Talksy';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-glass">
      <div className="navbar-left">
        <div className="navbar-logo">Talksy</div>
      </div>
      <div className="navbar-center">
        <div className="navbar-title">{pageTitle}</div>
      </div>
      <ul className="navbar-right navbar-links">
        <li><Link to="/dashboard" title="Home">🏠</Link></li>
        <li><Link to="/friends" title="Friends">👥</Link></li>
        <li><Link to="/requests" title="Requests">📨</Link></li>
        <li><Link to="/search" title="Search">🔍</Link></li>
        <li><button onClick={handleLogout} className="logout-button" title="Logout">🚪</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
