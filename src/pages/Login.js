// src/pages/Login.js
import React, { useState } from "react";
import { auth, provider, db } from "../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          role,
          createdAt: serverTimestamp(),
        });
      } else {
        role = docSnap.data().role || "resident";
      }

      // Redirect
      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff");
      else navigate("/resident");
    } catch (error) {
      console.error("Login error:", error);
      setStatus("Something went wrong. Check the console.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to SportEase</h1>
      <button style={styles.button} onClick={handleLogin}>Sign in with Google</button>
      <p style={styles.status}>{status}</p>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f2f2f2",
    textAlign: "center",
    paddingTop: "100px",
    height: "100vh"
  },
  heading: {
    fontSize: "36px",
    color: "#2c3e50"
  },
  button: {
    backgroundColor: "#4285f4",
    color: "white",
    padding: "12px 24px",
    fontSize: "16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background 0.3s ease"
  },
  status: {
    marginTop: "20px",
    fontWeight: "bold",
    color: "#555"
  }
};
