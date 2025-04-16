import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function StaffUM() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [revokedUsers, setRevokedUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const active = [];
    const revoked = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const user = { id: docSnap.id, ...data };
      if (data.role === "resident") {
        if (data.access === 1) active.push(user);
        else revoked.push(user);
      }
    });

    setActiveUsers(active);
    setRevokedUsers(revoked);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      <h1 style={styles.heading}>User Management</h1>

      <section>
        <h2 style={styles.sectionTitle}>Active Users</h2>
        <ul style={styles.list}>
          {activeUsers.map((user) => (
            <li key={user.uid} style={styles.listItem}>
              {user.displayName}
              <button style={styles.revokeBtn} onClick={() => revokeAccess(user.uid)}>Revoke</button>
            </li>
          ))}
        </ul>
      </section>

      <hr />

      <section>
        <h2 style={styles.sectionTitle}>Revoked Users</h2>
        <ul style={styles.list}>
          {revokedUsers.map((user) => (
            <li key={user.uid} style={styles.listItem}>
              {user.displayName}
              <button style={styles.grantBtn} onClick={() => grantAccess(user.uid)}>Grant Access</button>
            </li>
          ))}
        </ul>
      </section>

      <button style={styles.backBtn} onClick={() => navigate("/staff")}>← Back to Staff Home</button>
    </main>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial",
    backgroundColor: "#fffbea",
    textAlign: "center",
    minHeight: "100vh",
    color: "#000" // base text color
  },
  heading: {
    fontSize: "32px",
    color: "#e65100",
    marginBottom: "30px",
  },
  sectionTitle: {
    color: "#000",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    margin: "10px 0",
    fontSize: "18px",
    color: "#000",
  },
  revokeBtn: {
    marginLeft: "10px",
    padding: "5px 10px",
    backgroundColor: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  grantBtn: {
    marginLeft: "10px",
    padding: "5px 10px",
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  backBtn: {
    marginTop: "40px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#6d4c41",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
