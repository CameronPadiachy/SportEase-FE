import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; // adjust the path to your firebase.js
import { useNavigate } from 'react-router-dom';

export default function Resident() {
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', photo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const name = user.displayName;
        const photo = user.photoURL;

        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const role = docSnap.data().role;
            console.log('User role:', role);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }

        setUserInfo({ name, photo });
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
      <h1 style={styles.title}>Logged in as</h1>
      <h2 style={styles.username}>{userInfo.name}</h2>
      <img
        style={styles.profile}
        src={userInfo.photo}
        alt="User Profile Picture"
      />
      <br />
      <button style={styles.button} onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#e8f0fe',
    textAlign: 'center',
    paddingTop: '100px',
    height: '100vh',
  },
  title: {
    color: '#2c3e50',
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
    backgroundColor: '#ff5252',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
