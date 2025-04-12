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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Staff Dashboard</h1>
      <h2 style={styles.username}>{userInfo.name}</h2>
      <img src={userInfo.photo} alt="Profile" style={styles.profile} />
      <p>You can view and update maintenance reports here.</p>
      <button onClick={handleLogout} style={styles.button}>
        Log Out
      </button>
    </div>
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
    marginTop: '30px',
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#ff7043',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
