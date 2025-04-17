import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export default function Resident() {
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', photo: '' });
  const [hovered, setHovered] = useState({ logout: false, padel: false, tennis: false, soccer: false });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style = '';
    document.documentElement.style = '';
    document.body.style.backgroundColor = '#c7c3c3';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'hidden';

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

    const ball = document.createElement('img');
    ball.src = '/tennisball.png.png';
    ball.alt = 'Tennis Ball';
    Object.assign(ball.style, {
      width: '50px',
      height: '50px',
      position: 'absolute',
      top: '100px',
      left: '100px',
      zIndex: 5,
      pointerEvents: 'none',
    });
    document.body.appendChild(ball);

    let x = 100, y = 100;
    let dx = 3 + Math.random() * 3;
    let dy = 3 + Math.random() * 3;

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      x += dx;
      y += dy;

      if (x <= 0 || x + 50 >= w) dx *= -1;
      if (y <= 0 || y + 50 >= h) dy *= -1;

      ball.style.left = x + 'px';
      ball.style.top = y + 'px';

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      document.body.removeChild(ball);
      unsubscribe();
    };
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  const goToPadel = () => window.location.href = 'padel.html';
  const goToTennis = () => window.location.href = 'tennis.html';
  const goToSoccer = () => window.location.href = 'soccer.html';

  const getButtonStyle = (key) => ({
    marginTop: '10px',
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: hovered[key] ? 'green' : 'rgba(0, 16, 51, 0.795)',
    color: '#c7c3c3',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  });

  const imageStyle = {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
  };

  const columnStyle = {
    display: 'inline-block',
    margin: '0 20px',
    textAlign: 'center',
  };

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Logged in as</h1>
      <h2 style={styles.username}>{userInfo.name}</h2>

      <img style={styles.profile} src={userInfo.photo} alt="User Profile" />

      <br />
      <button
        style={getButtonStyle('logout')}
        onClick={handleLogout}
        onMouseEnter={() => setHovered({ ...hovered, logout: true })}
        onMouseLeave={() => setHovered({ ...hovered, logout: false })}
      >
        Log Out
      </button>

      <br /><br /><br />

      <>
        <div style={columnStyle}>
          <img style={imageStyle} src="/padel.jpeg" alt="Padel" />
          <br />
          <button
            style={getButtonStyle('padel')}
            onClick={goToPadel}
            onMouseEnter={() => setHovered({ ...hovered, padel: true })}
            onMouseLeave={() => setHovered({ ...hovered, padel: false })}
          >
            Book padel
          </button>
        </div>

        <div style={columnStyle}>
          <img style={imageStyle} src="/tennis.jpeg" alt="Tennis" />
          <br />
          <button
            style={getButtonStyle('tennis')}
            onClick={goToTennis}
            onMouseEnter={() => setHovered({ ...hovered, tennis: true })}
            onMouseLeave={() => setHovered({ ...hovered, tennis: false })}
          >
            Book tennis
          </button>
        </div>

        <div style={columnStyle}>
          <img style={imageStyle} src="/soccer.jpeg" alt="Soccer" />
          <br />
          <button
            style={getButtonStyle('soccer')}
            onClick={goToSoccer}
            onMouseEnter={() => setHovered({ ...hovered, soccer: true })}
            onMouseLeave={() => setHovered({ ...hovered, soccer: false })}
          >
            Book soccer
          </button>
        </div>
      </>
    </main>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#c7c3c3',
    color: 'rgba(0, 16, 51, 0.795)',
    textAlign: 'center',
    paddingTop: '100px',
    paddingBottom: '100px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    position: 'relative',
  },
  title: {
    color: 'rgba(0, 16, 51, 0.795)',
    fontSize: '36px',
    marginBottom: '10px',
  },
  username: {
    fontSize: '24px',
    marginTop: '10px',
    color: 'rgba(0, 16, 51, 0.795)',
  },
  profile: {
    marginTop: '20px',
    marginBottom: '10px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '2px solid rgba(0, 16, 51, 0.795)',
  },
};
