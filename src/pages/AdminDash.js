// src/pages/AdminDash.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', photo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Add the scoped class to <body>
    document.body.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({ name: user.displayName, photo: user.photoURL });
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  const goToUserManagement = () => {
    navigate('/admin/management');
  };

  const goToBookingManagement = () => {
    window.location.href = 'AdminBooking.html';
  };

  return (
    <main className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      <h2 className="admin-username">{userInfo.name}</h2>

      {userInfo.photo && (
        <img src={userInfo.photo} alt="Profile" className="admin-profile" />
      )}

      <p className="admin-subtitle">You can manage users, events, and facility data.</p>

      <section>
        <button onClick={goToUserManagement} className="admin-button">
          User Management
        </button>

        <button onClick={goToBookingManagement} className="admin-button">
          Manage Bookings
        </button>

        <button onClick={handleLogout} className="admin-button admin-logout">
          Log Out
        </button>
      </section>
    </main>
  );
}
