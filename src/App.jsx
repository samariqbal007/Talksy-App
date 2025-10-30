// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import UsersList from './pages/UsersList';
import FriendRequests from './components/FriendRequests';
import FriendsList from './pages/FriendsList';
import Dashboard from './pages/Dashboard';
import SearchUsers from './pages/SearchUsers'; // ✅ Import fixed
import ChatPage from "./pages/ChatPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route → goes to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* App Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users-list" element={<UsersList />} />
        <Route path="/requests" element={<FriendRequests />} />
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/search" element={<SearchUsers />} />  {/* ✅ NEW SEARCH PAGE */}
        {/* existing routes */}
        <Route path="/chat/:friendId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
};

export default App;
