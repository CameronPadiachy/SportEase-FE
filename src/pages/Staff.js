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

  return (
    <>
      {/* Optional Header (commented out by you) */}
      {/* <header className="staff-header">
        <img src="soccerball (2).png" alt="Soccer" className="header-icon" />
        <img src="batt.png" alt="Tennis" className="header-icon" />
        <img src="rugby.png" alt="Badminton" className="header-icon" />
      </header> */}

      <main className="staff-page">
        <h1 className="staff-title">Staff Dashboard</h1>
        <h2 className="staff-username">{userInfo.name}</h2>

        {userInfo.photo && (
          <img src={userInfo.photo} alt="Profile" className="staff-profile" />
        )}

        <p className="staff-subtext">
          You can view and update maintenance reports here.
        </p>

        <nav>
          <button onClick={goToUserManagement} className="staff-button manage">
            User Management
          </button>
          <br />
          <button onClick={handleLogout} className="staff-button logout">
            Log Out
          </button>
        </nav>
      </main>
    </>
  );
}
