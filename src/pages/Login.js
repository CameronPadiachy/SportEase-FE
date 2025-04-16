// src/pages/Login.js
import { auth, provider, db } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");

  const handleLogin = async () => {
    setStatus("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      let role = "resident";
      let access = 1;

      if (!docSnap.exists()) {
        // New user — create Firestore document
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          role,
          access,
          createdAt: serverTimestamp(),
        });
      } else {
        // Existing user — get their role and access
        const data = docSnap.data();
        role = data.role || "resident";
        access = data.access ?? 0;
      }

      if (access === 0) {
        setStatus("Your access has been revoked.");
        return;
      }

      // Redirect based on role
      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff");
      else navigate("/resident");

    } catch (error) {
      console.error("Login error:", error);
      setStatus("Something went wrong. Check the console.");
    }
  };

  useEffect(() => {
    const images = ["slideF.jpeg", "slide2.jpeg", "slide3.jpeg"];
    let index = 0;
    const interval = setInterval(() => {
      const slideshow = document.getElementById("slideshow");
      if (slideshow) {
        index = (index + 1) % images.length;
        slideshow.src = images[index];
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="page-wrapper">
      <header>
        <h1 className="header-title">SportEase</h1>
        <p className="header-motto"><br /><br />CTRL ALT COMPLETE</p>
        <img
          src="slideF.jpeg"
          alt="SportEase Banner"
          className="hero-image"
          id="slideshow"
        />
      </header>

      <section className="text-panel">
        <h2 className="text-heading">Experience it now!</h2>
        <p>
          Smart booking, made simple — Reserve your favourite padel, soccer and tennis facilities all in one place.
          <br /><br />
          Instant Issue Reporting — Spotted a maintenance issue? Report it in seconds.
          <br /><br />
          Stay connected — Get notified instantly about upcoming events and updates.
        </p>
      </section>

      <section className="login-box">
        <button className="btn-google" onClick={handleLogin}>
          Sign in with Google
        </button>
        <p className="status-text">{status}</p>
        <img src="finalLogo.png" alt="SportEase Logo" className="login-logo" />
      </section>

      <img src="boy.png" alt="Tennis Boy" className="boy-image" />
    </main>
  );
}


