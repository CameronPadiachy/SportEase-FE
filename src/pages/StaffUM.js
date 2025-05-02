import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function StaffUM() {
  const [residents, setActiveUsers] = useState([]);
  const [revoked, setRevokedUsers] = useState([]);
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
    document.body.classList.add('staffUM-page');
    fetchUsers();
    
    return () => {
      document.body.classList.remove('staffUM-page');
    };
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
    <main className="staff-container">
      <header className="staff-heading">
        <h1>Staff User Management</h1>
      </header>

      <section className="user-management-container">

        <section className="user-management-section">
          <h2 className="staff-subheading">Residents</h2>
          <ul className="staff-user-list">
            {residents.map((user) => (
              <li key={user.id} className="staff-user-item">
                {user.displayName}
                
                <button className="btn-revoke" onClick={() => revokeAccess(user.id)}>Revoke</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="user-management-section">
          <h2 className="staff-subheading">Revoked Users</h2>
          <ul className="staff-user-list">
            {revoked.map((user) => (
              <li key={user.id} className="staff-user-item">
                {user.displayName}
                <button className="btn-grant" onClick={() => grantAccess(user.id)}>Grant Access</button>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <button className="btn-back" onClick={() => navigate("/staff")}>← Back to Staff Home</button>
    </main>
  );
}
