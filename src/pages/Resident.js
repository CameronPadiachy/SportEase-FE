import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
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
      section.scrollIntoView({ behavior: 'smooth' });
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
      {/* Sidebar */}
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

      {/* Header */}
      <header className="resident-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>☰</button>
        <img className="resident-profile" src={userInfo.photo} alt="User Profile" />
        <h1 className="resident-username">{userInfo.name}</h1>
        <nav className="resident-tabs">
          <ul style={{ display: 'flex', justifyContent: 'center' }}>
            <li onClick={() => handleTabClick('Bookings')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'Bookings' ? 'bold' : 'normal' }}>My Bookings</li>
            <li onClick={() => handleTabClick('Announcements')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'Announcements' ? 'bold' : 'normal' }}>Announcements</li>
            <li onClick={() => handleTabClick('Notifications')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'Notifications' ? 'bold' : 'normal' }}>Notifications</li>
            <li onClick={() => handleTabClick('Reports')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'Reports' ? 'bold' : 'normal' }}>Reports</li>
            <li onClick={() => handleTabClick('FacilityTrends')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'FacilityTrends' ? 'bold' : 'normal' }}>Facility Trends</li>
          </ul>
        </nav>
      </header>

      {/* Booking Section */}
      <section className="resident-booking-section" id="bookings">
        <article className="resident-column" onClick={() => goToFacility(2)}>
          <img className="resident-image" src="/bookpadel.png" alt="Padel" />
          <p className="hover-description">Get your paddle on! Book now and enjoy a fun match with friends!</p>
        </article>
        <article className="resident-column" onClick={() => goToFacility(3)}>
          <img className="resident-image" src="/booksoccer.png" alt="Soccer" />
          <p className="hover-description">Goal time! Book your soccer field and get ready to score!</p>
        </article>
        <article className="resident-column" onClick={() => goToFacility(1)}>
          <img className="resident-image" src="/booktennis.png" alt="Tennis" />
          <p className="hover-description">Serve it up! Book your tennis court and smash the competition!</p>
        </article>
      </section>

      {/* Announcements Section */}
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

      {/* Notifications Section */}
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

      {/* Calendar Section */}
      <section id="calendar" className="resident-calendar-section">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
        />
      </section>

      {/* Facility Trend Section */}
      <section id="facilitytrends" className="facility-trend-section">
        <FacilityStats />
      </section>
    </main>
  );
}
