import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
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
      <h1 style={styles.title}>Admin Dashboard</h1>
      <h2 style={styles.username}>{userInfo.name}</h2>
      <img src={userInfo.photo} alt="Profile" style={styles.profile} />
      <p>You can manage users, events, and facility data.</p>
      <button onClick={handleLogout} style={styles.button}>
        Log Out
      </button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#e3f2fd',
    textAlign: 'center',
    paddingTop: '100px',
    height: '100vh',
  },
  title: {
    color: '#1565c0',
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
    backgroundColor: '#1e88e5',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

