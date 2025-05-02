import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

export default function Resident() {
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', photo: '' });
  const [hovered, setHovered] = useState({ logout: false, padel: false, tennis: false, soccer: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Bookings');
  const [events, setEvents] = useState([]);
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
      } else {
        navigate('/');
      }
    });

    // Fetch events (bookings and events)
    const fetchEvents = async () => {
      const eventsCollection = collection(db, 'events'); // Adjust collection name if needed
      const querySnapshot = await getDocs(eventsCollection);
      const eventsData = querySnapshot.docs.map(doc => doc.data());

      // Format events for FullCalendar
      const formattedEvents = eventsData.map(event => ({
        title: event.title, 
        date: event.date, 
        description: event.description,
        facility: event.facility, // Optional
      }));
      setEvents(formattedEvents);
    };

    fetchEvents();

    return () => {
      document.body.classList.remove('resident-page');
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);

    // Scroll to the relevant section
    const section = document.getElementById(tab.toLowerCase());

    // If the clicked tab is "Bookings", scroll to the calendar section
    if (tab === 'Bookings') {
      const calendarSection = document.getElementById('calendar'); // Assuming the calendar section has id="calendar"
      calendarSection.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'Announcements' || tab === 'Notifications') {
      section.style.display = 'block';  // Show announcements or notifications when clicked
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigateToReports = () => {
    navigate('/resident-reports');
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
          <li onClick={navigateToReports}>Reports</li>
        </ul>

        {/* Logout Button at the Bottom of Sidebar */}
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </aside>

      {/* Header Section */}
      <header className="resident-header">
        {/* Sidebar Toggle Button inside header */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>

        <img className="resident-profile" src={userInfo.photo} alt="User Profile" />
        <h1 className="resident-username">{userInfo.name}</h1>

        <nav className="resident-tabs">
          <nav role="navigation" aria-label="Tabs">
            <ul style={{ display: 'flex', justifyContent: 'center' }}>
              <li onClick={() => handleTabClick('Bookings')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'Bookings' ? 'bold' : 'normal' }}>My Bookings</li>
              <li onClick={() => handleTabClick('Announcements')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'Announcements' ? 'bold' : 'normal' }}>Announcements</li>
              <li onClick={() => handleTabClick('Notifications')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'Notifications' ? 'bold' : 'normal' }}>Notifications</li>
              <li onClick={() => handleTabClick('Reports')} style={{ cursor: 'pointer', padding: '0 20px', fontWeight: activeTab === 'Reports' ? 'bold' : 'normal' }}>Reports</li>
            </ul>
          </nav>
        </nav>
      </header>

      {/* Booking Section */}
      <section className="resident-booking-section" id="bookings">
        <article className="resident-column" onClick={() => goToFacility(2)}>
          <img className="resident-image" src="/bookpadel.png" alt="Padel" />
          <p className="hover-description">Get your paddle on! Ready to unleash your skills? Padel combines fun, strategy, and speed—book your court now and dive into the action! Rally, smash, and enjoy an exciting match with friends. It's time to show off your moves!</p>
        </article>
        <article className="resident-column" onClick={() => goToFacility(3)}>
          <img className="resident-image" src="/booksoccer.png" alt="Soccer" />
          <p className="hover-description">Goal! Ready to kick it like a pro? Book your soccer field now and challenge your friends to an epic match. Whether you're playing for fun or aiming for the win, SportEase has your back! Lace up those boots and get ready for a game of skill, strategy, and teamwork!</p>
        </article>
        <article className="resident-column" onClick={() => goToFacility(1)}>
          <img className="resident-image" src="/booktennis.png" alt="Tennis" />
          <p className="hover-description">Serve it up! It’s time to smash your way to victory. Book a tennis court and step onto the court like a champion! Whether you’re practicing your serve or going for the winning point, tennis is all about precision, power, and a little bit of fun. Let’s play!</p>
        </article>
      </section>

      {/* Announcements Section */}
      <section id="announcements" className="resident-announcements-section">
        <h2>Announcements</h2>
        <section className="announcement-block">
          <p>No announcements yet! Stay tuned.</p>
        </section>
      </section>

      {/* Notifications Section */}
      <section id="notifications" className="resident-notifications-section" >
        <h2>Notifications</h2>
        <section className="notification-block">
          <p>No notifications yet! Stay tuned.</p>
        </section>
      </section>

      {/* Calendar Section (New feature for displaying events) */}
      <section id="calendar" className="resident-calendar-section" >
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events} // Display the fetched events here
        />
      </section>
    </main>
  );
}
