import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminUM() {
  const [residents, setResidents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [revoked, setRevoked] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const res = [], stf = [], rev = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const user = { id: docSnap.id, ...data };

      if (user.role === "resident") {
        if (user.access === 1) res.push(user);
        else rev.push(user);
      } else if (user.role === "staff") {
        stf.push(user);
      }
    });

    setResidents(res);
    setStaff(stf);
    setRevoked(rev);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const promoteToStaff = async (uid) => {
    await updateDoc(doc(db, "users", uid), { role: "staff" });
    fetchUsers();
  };

  const demoteToResident = async (uid) => {
    await updateDoc(doc(db, "users", uid), { role: "resident" });
    fetchUsers();
  };

  const revokeAccess = async (uid) => {
    await updateDoc(doc(db, "users", uid), { access: 0 });
    fetchUsers();
  };

  const grantAccess = async (uid) => {
    await updateDoc(doc(db, "users", uid), { access: 1 });
    fetchUsers();
  };

  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>Admin User Management</h1>

      <section>
        <h2 style={styles.subheading}>Staff</h2>
        <ul style={styles.list}>
          {staff.map((user) => (
            <li key={user.id} style={styles.item}>
              <span style={styles.text}>{user.displayName}</span>
              <button style={styles.demoteBtn} onClick={() => demoteToResident(user.id)}>Demote</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      <section>
        <h2 style={styles.subheading}>Residents</h2>
        <ul style={styles.list}>
          {residents.map((user) => (
            <li key={user.id} style={styles.item}>
              <span style={styles.text}>{user.displayName}</span>
              <button style={styles.promoteBtn} onClick={() => promoteToStaff(user.id)}>Promote</button>
              <button style={styles.revokeBtn} onClick={() => revokeAccess(user.id)}>Revoke</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      <section>
        <h2 style={styles.subheading}>Revoked Users</h2>
        <ul style={styles.list}>
          {revoked.map((user) => (
            <li key={user.id} style={styles.item}>
              <span style={styles.text}>{user.displayName}</span>
              <button style={styles.grantBtn} onClick={() => grantAccess(user.id)}>Grant Access</button>
            </li>
          ))}
        </ul>
      </section>

      <button style={styles.backBtn} onClick={() => navigate("/admin")}>← Back to Admin Home</button>
    </main>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial",
    backgroundColor: "#f4f6f8",
    textAlign: "center",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "32px",
    color: "#1a237e",
    marginBottom: "30px",
  },
  subheading: {
    fontSize: "24px",
    color: "#000",
    marginBottom: "10px",
  },
  list: {
    listStyleType: "none",
    padding: 0,
    marginBottom: "30px",
  },
  item: {
    margin: "10px 0",
  },
  text: {
    color: "#000",
    fontSize: "18px",
    marginRight: "10px",
  },
  promoteBtn: {
    padding: "5px 10px",
    backgroundColor: "#0277bd",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    marginRight: "5px",
    cursor: "pointer",
  },
  demoteBtn: {
    padding: "5px 10px",
    backgroundColor: "#6d4c41",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  revokeBtn: {
    padding: "5px 10px",
    backgroundColor: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    marginLeft: "5px",
    cursor: "pointer",
  },
  grantBtn: {
    padding: "5px 10px",
    backgroundColor: "#388e3c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  backBtn: {
    marginTop: "40px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#1a237e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
