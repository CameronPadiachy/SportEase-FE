import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function AdminDash() {
  const [userInfo, setUserInfo] = useState({ name: "Loading...", photo: "" });
  const [announcement, setAnnouncement] = useState("");
  const [eventDetails, setEventDetails] = useState({
    title: "",
    facility: "tennis",
    date: "",
    maxParticipants: "",
    description: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("admin-page");
    return () => {
      document.body.classList.remove("admin-page");
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({ name: user.displayName, photo: user.photoURL });
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('uid'); 
    signOut(auth).then(() => navigate('/'));
  };

  const goToUserManagement = () => {
    navigate("/admin/management");
  };

  const goToBookingManagement = () => {
    window.location.href = "AdminBooking.html";
  };

  const handlePostAnnouncement = async () => {
    if (!announcement.trim()) {
      alert("Please enter an announcement");
      return;
    }

    try {
      const res = await fetch("https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/notif/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: null, message: announcement }) 
      });

      if (res.ok) {
        alert("Announcement posted!");
        setAnnouncement("");
      } else {
        const error = await res.json();
        alert("Failed: " + error.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to post announcement.");
    }
  };

  const handleCreateEventClick = () => {
    const section = document.getElementById("create-event");
    section.scrollIntoView({ behavior: "smooth" });
  };

  const handleEventChange = (e) => {
    setEventDetails({
      ...eventDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();

    const { title, facility, date, description, maxParticipants } = eventDetails;

    if (!title || !facility || !date || !description || !maxParticipants) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const facilityId = facility === "tennis" ? 1 : facility === "padel" ? 2 : 3;

      const res = await fetch("https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          desc: description,
          date,
          fac_id: facilityId,
          max_p: parseInt(maxParticipants),
          curr_p: 0
        })
      });

      if (res.ok) {
        alert("Event created successfully!");
        setEventDetails({
          title: "",
          facility: "tennis",
          date: "",
          maxParticipants: "",
          description: ""
        });
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <main className="admin-container">
      <header className="admin-header">
        <img className="admin-profile" src={userInfo.photo} alt="Profile" />
        <h1 className="admin-title">Admin Dashboard</h1>
        <h2 className="admin-username">{userInfo.name}</h2>
        <p className="admin-subtitle">You can manage users, events, and facility data.</p>
      </header>

      <section className="admin-cards">
        <article className="admin-card">
          <button onClick={goToUserManagement} className="admin-card-title">
            User Management
          </button>
          <p className="admin-card-description">
            View and manage registered users, roles, and access rights.
          </p>
        </article>

        <article className="admin-card">
          <button onClick={goToBookingManagement} className="admin-card-title">
            Manage Bookings
          </button>
          <p className="admin-card-description">
            Accept or decline bookings made by residents as well as booking edits.
          </p>
        </article>

        <article className="admin-card">
          <button onClick={handleCreateEventClick} className="admin-card-title">
            Create Event
          </button>
          <p className="admin-card-description">Create an upcoming event!</p>
        </article>
      </section>

      <section className="announcement-section">
        <h2 className="announcement-title">Post an Announcement</h2>
        <textarea
          className="announcement-input"
          rows={6}
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Write your announcement here..."
        />
        <br />
        <button className="announcement-post-btn" onClick={handlePostAnnouncement}>
          Post
        </button>
      </section>

      <section id="create-event" className="create-event-section">
        <h2>Create Event</h2>
        <form onSubmit={handleCreateEventSubmit}>
          <label htmlFor="event-title">Event Title:</label>
          <input
            type="text"
            id="event-title"
            name="title"
            placeholder="Enter event title"
            value={eventDetails.title}
            onChange={handleEventChange}
            required
          />

          <label htmlFor="facility">Facility:</label>
          <select
            id="facility"
            name="facility"
            value={eventDetails.facility}
            onChange={handleEventChange}
            required
          >
            <option value="tennis">Tennis</option>
            <option value="soccer">Soccer</option>
            <option value="padel">Padel</option>
          </select>

          <label htmlFor="event-date">Event Date:</label>
          <input
            type="date"
            id="event-date"
            name="date"
            value={eventDetails.date}
            onChange={handleEventChange}
            required
          />

          <label htmlFor="maxParticipants">Maximum Participants:</label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            placeholder="Enter max number of participants"
            value={eventDetails.maxParticipants}
            onChange={handleEventChange}
            required
            min="1"
          />

          <label htmlFor="event-description">Event Description:</label>
          <textarea
            id="event-description"
            name="description"
            value={eventDetails.description}
            onChange={handleEventChange}
            placeholder="Enter event description"
            rows="5"
            required
          ></textarea>

          <button type="submit" className="create-event-btn">Create Event</button>
        </form>
      </section>

      <button onClick={handleLogout} className="admin-logout">
        Log Out
      </button>
    </main>
  );
}
