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

  const goToUserManagement = () => {
    navigate('/admin/management');
  };

  return (
    <>
      <header className="admin-header">
        <img src="soccerball (2).png" alt="Soccer" className="header-icon" />
        <img src="batt.png" alt="Tennis" className="header-icon" />
        <img src="rugby.png" alt="Badminton" className="header-icon" />
      </header>

      <main className="admin-container">
        <h1 className="admin-title">Admin Dashboard</h1>
        <h2 className="admin-username">{userInfo.name}</h2>
        {userInfo.photo && (
          <img src={userInfo.photo} alt="Profile" className="admin-profile" />
        )}
        <p className="admin-subtext">You can manage users, events, and facility data.</p>


        <nav>
          <button onClick={goToUserManagement} className="admin-button manage">
            User Management
          </button>
          <br />
          <button onClick={handleLogout} className="admin-button logout">
            Log Out
          </button>
        </nav>
      </main>
    </>
  );
}

const styles = {
  header: {
    backgroundColor: 'rgba(255, 244, 91, 0.78)',
    padding: '20px 0',
    textAlign: 'center',
  },
 
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor:'#c7c3c3',
    textAlign: 'center',
    padding: '40px 0',
    minHeight: '100vh',
    color: 'rgba(255, 244, 91, 0.78)',
  },

  title: {
    fontSize: '36px',
    marginBottom: '10px',
  },

  username: {
    fontSize: '22px',
    fontWeight: 'normal',
    opacity: 0.8,
    margin: '10px 0',
  },
  subtext: {
    fontSize: '16px',
    marginBottom: '30px',
  },
  profile: {
    marginTop: '10px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '2px solid rgba(0, 16, 51, 0.795)',
    objectFit: 'cover',
  },
  cardLayout: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: 'rgba(0, 16, 51, 0.795)',
    color: '#c7c3c3',
    padding: '30px 20px',
    borderRadius: '12px',
    width: '150px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  button: {
    marginTop: '10px',
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: 'rgba(0, 16, 51, 0.795)',
    color: '#c7c3c3',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  manageButton: {
    marginTop: '20px',
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: 'rgba(0, 16, 51, 0.795)',
    color: '#c7c3c3',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
