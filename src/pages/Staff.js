import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function Staff() {
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', photo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('staff-page');
    return () => {
      document.body.classList.remove('staff-page');
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
    navigate('/staff/management');
  };

  const goToStaffReports = () => {
    navigate('/staff-reports');
  };

  return (
    <>
    <main className="staff-container">
      <header className="staff-header">
        <img
          src={userInfo.photo}
          alt="Profile"
          className="staff-profile"
        />
        <h1 className="staff-title">Staff Dashboard</h1>
        <h2 className="staff-username">{userInfo.name}</h2>
        <p className="staff-subtitle">You can view and update maintenance reports here.</p>
      </header>


        <section className="staff-cards">
          <article className="staff-card">
            <button onClick={goToUserManagement} className="staff-card-title">
              User Management
            </button>
            <p className="staff-card-description">
              View and manage registered users, roles, and access rights.
            </p>
          </article>

          <article className="staff-card">
            <button onClick={goToStaffReports} className="staff-card-title">
              Manage Maintenance Reports
            </button>
            <p className="staff-card-description">
              View and manage reports. Make updates and check progresses.
            </p>
          </article>
        </section>

        <button onClick={handleLogout} className="staff-logout">
          Log Out
        </button>


      </main>
    </>
  );
}
