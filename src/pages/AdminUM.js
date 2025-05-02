import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminUM() {
  const [residents, setResidents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [revoked, setRevoked] = useState([]);
 // const [announcement, setAnnouncement] = useState("");   // use with new apis
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
    document.body.classList.add("userM-page");
    return () => {
      document.body.classList.remove("userM-page");
    };
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

  /*const handlePostAnnouncement = () => {
    alert("Announcement posted: " + announcement);
    setAnnouncement("");
  };*/    //uncomment when using apis

  return (
    <main className="admin-container">
      <header className="admin-heading">
        <h1>Admin User Management</h1>
      </header>

      <section className="user-management-container">
        <section className="user-management-section">
          <h2 className="admin-subheading">Staff</h2>
          <ul className="admin-user-list">
            {staff.map((user) => (
              <li key={user.id} className="admin-user-item">
                {user.displayName}
                <button className="btn-demote" onClick={() => demoteToResident(user.id)}>Demote</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="user-management-section">
          <h2 className="admin-subheading">Residents</h2>
          <ul className="admin-user-list">
            {residents.map((user) => (
              <li key={user.id} className="admin-user-item">
                {user.displayName}
                <button className="btn-promote" onClick={() => promoteToStaff(user.id)}>Promote</button>
                <button className="btn-revoke" onClick={() => revokeAccess(user.id)}>Revoke</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="user-management-section">
          <h2 className="admin-subheading">Revoked Users</h2>
          <ul className="admin-user-list">
            {revoked.map((user) => (
              <li key={user.id} className="admin-user-item">
                {user.displayName}
                <button className="btn-grant" onClick={() => grantAccess(user.id)}>Grant Access</button>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <button className="btn-back" onClick={() => navigate("/admin")}>← Back to Admin Home</button>
    </main>
  );
}
