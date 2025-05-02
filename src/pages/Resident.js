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
    // ✅ Scoped CSS via class on <body>
    document.body.classList.add('resident-page');

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

    // Animated tennis ball
    const ball = document.createElement('img');
    ball.src = '/tennisball.png.png';
    ball.alt = 'Tennis Ball';
    ball.className = 'resident-ball';
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
      document.body.classList.remove('resident-page');
      document.body.removeChild(ball);
      unsubscribe();
    };
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  const goToFacility = (facilityId) => {
    localStorage.setItem('selectedFacility', facilityId);
    navigate('/booking');
  };

  return (
    <main className="resident-container">
  <img className="resident-profile" src={userInfo.photo} alt="User Profile" />

  <h1 className="resident-title">Logged in as</h1>
  <h2 className="resident-username">{userInfo.name}</h2>

  <button
    className={`resident-button logout ${hovered.logout ? 'hover' : ''}`}
    onClick={handleLogout}
    onMouseEnter={() => setHovered({ ...hovered, logout: true })}
    onMouseLeave={() => setHovered({ ...hovered, logout: false })}
  >
    Log Out
  </button>

  <div className="resident-booking-section">
    <div className="resident-column">
      <img className="resident-image" src="/padel.jpeg" alt="Padel" />
      <button className="resident-button" onClick={() => goToFacility(2)}>Book padel</button>
    </div>
    <div className="resident-column">
      <img className="resident-image" src="/tennis.jpeg" alt="Tennis" />
      <button className="resident-button" onClick={() => goToFacility(1)}>Book tennis</button>
    </div>
    <div className="resident-column">
      <img className="resident-image" src="/soccer.jpeg" alt="Soccer" />
      <button className="resident-button" onClick={() => goToFacility(3)}>Book soccer</button>
    </div>
  </div>

  <section style={{ marginTop: '30px', textAlign: 'center' }}>
    <button
      className="resident-button"
      onClick={() => navigate('/resident-reports')}
    >
      Report a Maintenance Issue
    </button>
  </section>
</main>

  );
}
