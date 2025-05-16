import { auth, provider, db } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");

  const addUserToSQL = async (uid) => {
    try {
      const response = await fetch(
        'https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/users/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid })
        }
      );
      if (!response.ok) throw new Error('Failed to add user to SQL database');
      return await response.json();
    } catch (error) {
      console.error('SQL user creation error:', error);
    }
  };

  const handleLogin = async () => {
    setStatus("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      localStorage.setItem('uid', user.uid);
      let role = "resident";
      let access = 1;

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          role,
          access,
          createdAt: serverTimestamp(),
        });
        await addUserToSQL(user.uid);
      } else {
        const data = docSnap.data();
        role = data.role || "resident";
        access = data.access ?? 0;
      }

      if (access === 0) {
        setStatus("Your access has been revoked.");
        return;
      }

      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff");
      else navigate("/resident");

    } catch (error) {
      console.error("Login error:", error);
      setStatus("Something went wrong. Check the console.");
    }
  };

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  return (
    <main>
      <section className="hero">
        <video autoPlay loop muted playsInline id="video">
          <source src="/images/motionbackground.mp4" type="video/mp4" />
        </video>
        <h1 className="title">Sportease</h1>
        <section className="loginblock">
          <button className="google-btn" onClick={handleLogin}>
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
            />
            Sign in with Google
          </button>
          <p className="status-text">{status}</p>
        </section>
      </section>

      <section className="section" id="facilities">
        <h2>Facilities</h2>
        <p>
          At SportEase, we pride ourselves on offering world-class sports
          facilities designed to inspire excellence and elevate every athlete's
          experience. Our venues are equipped with state-of-the-art surfaces,
          lighting, and safety features, ensuring the highest standards for
          training and competition. From pristine tennis courts and
          professional-grade football fields to indoor arenas with climate
          control and spectator seating, every space is built with precision and
          passion. Whether you're a seasoned athlete or a casual player, you'll
          find the perfect environment to play, grow, and achieve your goals.
        </p>
        <section className="courts">
          <img src="/images/black court.jpeg" alt="court1" />
          <img src="/images/download (3).jpeg" alt="court2" />
          <img src="/images/soccerlanding.jpeg" alt="soccerlanding" />
        </section>
      </section>

      <section className="section" id="about">
        <h2>About Us</h2>
        <p>
          At SportEase, we’re passionate about making sports accessible,
          efficient, and enjoyable. Our platform streamlines facility bookings,
          event management, and community engagement — all in one place. Whether
          you're an athlete, organizer, or enthusiast, SportEase empowers you to
          focus on what matters: the game.
        </p>
      </section>

      <section className="section" id="contact">
        <h2>Contact</h2>
        <ul>
          <li>support@sportease.com</li>
          <li>call 123-456-7890</li>
          <li>Or talk to our support staff. We’re always here to help!</li>
        </ul>
      </section>

      <footer>
        <p>&copy; 2025 SportEase. All rights reserved.</p>
        <nav>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
          <a href="#facilities">Facilities</a>
        </nav>
      </footer>
    </main>
  );
}
