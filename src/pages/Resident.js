import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

import FacilityStats from './facilityStats';

export default function Resident() {
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', photo: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Bookings');
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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

        try {
          await fetch('https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/weather/check', {
            method: 'POST',
          });
          console.log(' Weather check triggered');
        } catch (err) {
          console.error(' Weather check failed:', err);
        }
        const fetchNotifications = async (uid) => {
          try {
            const res = await fetch(`https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/notif/${uid}`);
            const data = await res.json();
            const personal = data.filter(n => n.uid === uid);
            const general = data.filter(n => n.uid === null);

            setNotifications(personal);
            setAnnouncements(general);
          } catch (err) {
            console.error('Failed to fetch notifications:', err);
          }
        };

        fetchNotifications(user.uid);
        const intervalId = setInterval(() => {
          fetchNotifications(user.uid);
        }, 30000);

        const fetchEvents = async () => {
          try {
            const eventsCollection = collection(db, 'events');
            const querySnapshot = await getDocs(eventsCollection);
            const eventsData = querySnapshot.docs.map(doc => doc.data());

            const formattedEvents = eventsData.map(event => ({
              title: event.title,
              date: event.date,
              description: event.description,
              facility: event.facility,
            }));
            setEvents(formattedEvents);
          } catch (err) {
            console.error('Failed to fetch events:', err);
          }
        };

        fetchEvents();

        return () => {
          document.body.classList.remove('resident-page');
          unsubscribe();
          clearInterval(intervalId);
        };
      } else {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('uid');  
    signOut(auth).then(() => navigate('/'));
  };

  const goToFacility = (facilityId) => {
    localStorage.setItem('selectedFacility', facilityId);
    navigate('/booking');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const section = document.getElementById(tab.toLowerCase());
    if (section) {
      const offset = window.innerHeight / 2 - section.offsetHeight / 2;
      const topPos = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateToReports = () => {
    navigate('/resident-reports');
  };

  const navigateToEvents = () => {
    navigate('/resident-events');
  };

  return (
    <main className="resident-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSidebar}>×</button>
        <ul>
          <li onClick={() => handleTabClick('Bookings')}>My Bookings</li>
          <li onClick={() => handleTabClick('Announcements')}>Announcements</li>
          <li onClick={() => handleTabClick('Notifications')}>Notifications</li>
          <li onClick={() => handleTabClick('FacilityTrends')}>Facility Trends</li>
          <li onClick={navigateToEvents}>Join Events</li>
          <li onClick={navigateToReports}>Reports</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </aside>

      <header className="resident-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
        <img className="resident-profile" src={userInfo.photo} alt="User Profile" />
        <h1 className="resident-username">{userInfo.name}</h1>
        <nav className="resident-tabs">
          <ul>
            <li><a href="#bookings">Bookings</a></li>
            <li><a href="#bookings">Facilities</a></li>
            <li><a href="#announcements">Announcements</a></li>
            <li><a href="#notifications">Notifications</a></li>
            <li><a href="#facilitytrends">Trends</a></li>
          </ul>
        </nav>
      </header>

      <section className="resident-booking-section" id="bookings">
        <article className="resident-column" onClick={() => goToFacility(2)}>
          <img className="resident-image" src="/images/padel.jpeg" alt="Padel" />
          <p className="hover-description">Get your paddle on! Book now and enjoy a fun match with friends!</p>
        </article>
        <article className="resident-column" onClick={() => goToFacility(3)}>
          <img className="resident-image" src="/images/soccer.jpeg" alt="Soccer" />
          <p className="hover-description">Goal time! Book your soccer field and get ready to score!</p>
        </article>
        <article className="resident-column" onClick={() => goToFacility(1)}>
          <img className="resident-image" src="/images/racket.jpeg" alt="Tennis" />
          <p className="hover-description">Serve it up! Book your tennis court and smash the competition!</p>
        </article>
      </section>

      <section id="announcements" className="resident-announcements-section">
        <h2>Announcements</h2>
        <section className="announcement-block">
          {announcements.length > 0 ? (
            announcements.map((msg, idx) => (
              <p key={idx}>{msg.message}</p>
            ))
          ) : (
            <p>No announcements yet! Stay tuned.</p>
          )}
        </section>
      </section>

      <section id="notifications" className="resident-notifications-section">
        <h2>Notifications</h2>
        <section className="notification-block">
          {notifications.length > 0 ? (
            notifications.map((msg, idx) => (
              <p key={idx}>{msg.message}</p>
            ))
          ) : (
            <p>No notifications yet! Stay tuned.</p>
          )}
        </section>
      </section>

      <section id="facilitytrends" className="facility-trend-section">
        <FacilityStats />
      </section>

      <footer className="footer-bar">
        <section className="footer-left">
          <p>&copy; 2025 SportEase. All rights reserved.</p>
        </section>
        <section className="footer-right">
          <h2>Contact</h2>
          <ul>
            <li>support@sportease.com</li>
            <li>Call 123-456-7890</li>
            <li>Talk to our support staff – we’re always here to help!</li>
          </ul>
        </section>
      </footer>
    </main>
  );
}
