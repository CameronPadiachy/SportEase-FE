import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config"; // adjust if your firebase.js is elsewhere

export default function ResidentReports() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all reports from Firestore
  async function fetchReports() {
    const querySnapshot = await getDocs(collection(db, "maintenance_reports"));
    const reportsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setReports(reportsList);
  }

  useEffect(() => {
    fetchReports();
  }, []);

  // Add a new maintenance report
  async function handleAddReport(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "maintenance_reports"), {
        createdBy: name, // store the resident's typed name
        reportMessage: message,
        createdAt: serverTimestamp(),
        status: "submitted"
      });
      alert("Report submitted successfully!");
      setShowForm(false);
      setName("");
      setMessage("");
      fetchReports(); // ✅ fetch updated reports instead of reloading the page
    } catch (error) {
      console.error("Error adding report: ", error);
      alert("Failed to submit report.");
    }
  }

  // Get color based on status
  function getStatusColor(status) {
    if (status === "submitted") return "red";
    if (status === "in progress") return "orange";
    if (status === "resolved") return "green";
    return "black";
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Maintenance Issues</h1>

      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: "20px" }}>
        {showForm ? "Cancel" : "Add New Report"}
      </button>

      {showForm && (
        <form onSubmit={handleAddReport} style={{ marginBottom: "20px" }}>
          <section>
            <label>Your Name:</label>
            <br />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "300px", padding: "8px", marginBottom: "10px" }}
            />
          </section>

          <section>
            <label>Describe the Issue:</label>
            <br />
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: "300px", height: "100px", padding: "8px" }}
            />
          </section>

          <br />
          <button type="submit">Submit Report</button>
        </form>
      )}

      <section>
        {reports.length === 0 ? (
          <p>No reports yet.</p>
        ) : (
          <ul>
            {reports.map((report) => (
              <li
                key={report.id}
                style={{
                  marginBottom: "20px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #ccc"
                }}
              >
                <p><strong>Name:</strong> {report.createdBy}</p>
                <p><strong>Issue:</strong> {report.reportMessage}</p>
                <p><strong>Date:</strong> {report.createdAt?.toDate().toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: getStatusColor(report.status), fontWeight: "bold" }}>
                    {report.status}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
