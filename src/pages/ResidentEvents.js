import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import './ResidentEvents.css';  


export default function ResidentEvents() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('resident-events-page');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/');
      }
    });

    const fetchEvents = async () => {
      try {
        const res = await fetch('https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/event');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      document.body.classList.remove('resident-events-page');
    };
  }, [navigate]);

  const joinEvent = async (eventId) => {
    try {
      const user = auth.currentUser;
      if (!user) return alert('You must be logged in');

      const res = await fetch(`https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/event/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Joined event successfully!');
      } else {
        alert(result.error || 'Failed to join');
      }
    } catch (err) {
      console.error('Join error:', err);
    }
  };

  return (
    <main className="resident-events-container">
      <h1 className="events-header">Join Upcoming Events</h1>
      {events.length > 0 ? (
        events.map((event) => (
          <section key={event.event_id} className="event-card">
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
            <p><strong>Max Participants:</strong> {event.max_p}</p>
            <p><strong>Current Participants:</strong> {event.curr_p}</p>
            <button onClick={() => joinEvent(event.event_id)}>Join Event</button>
          </section>
        ))
      ) : (
        <p>No events available right now.</p>
      )}
    </main>
  );
}
