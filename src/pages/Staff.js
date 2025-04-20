import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function Staff() {
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', photo: '' });
  const navigate = useNavigate();

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
    {/*<header className="staff-header">
      <img src="soccerball (2).png" alt="Soccer" className="header-icon" />
      <img src="batt.png" alt="Tennis" className="header-icon" />
      <img src="rugby.png" alt="Badminton" className="header-icon" />
    </header>*/}
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

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff3e0',
    textAlign: 'center',
    paddingTop: '100px',
    height: '100vh',
  },
  title: {
    color: '#ef6c00',
    fontSize: '36px',
  },
  username: {
    fontSize: '24px',
    marginTop: '10px',
  },
  profile: {
    marginTop: '20px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '2px solid #ccc',
  },
  button: {
    marginTop: '20px',
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#ff7043',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  manageButton: {
    marginTop: '30px',
    marginBottom: '10px',
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#ffab40',
    color: 'black',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
