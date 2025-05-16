import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export default function ResidentReports() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

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
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleAddReport(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "maintenance_reports"), {
        createdBy: name,
        reportMessage: message,
        createdAt: serverTimestamp(),
        status: "submitted"
      });
      alert("Report submitted successfully!");
      setShowForm(false);
      setName("");
      setMessage("");
      fetchReports();
    } catch (error) {
      console.error("Error adding report: ", error);
      alert("Failed to submit report.");
    }
  }

  function getStatusColor(status) {
    if (status === "submitted") return "red";
    if (status === "in progress") return "orange";
    if (status === "resolved") return "green";
    return "black";
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🛠️ Submit & View Maintenance Issues</h1>

      <section style={{ textAlign: "center", marginBottom: "30px" }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: showForm ? "#ccc" : "#007bff",
            color: showForm ? "#000" : "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          {showForm ? "Cancel" : "Add New Report"}
        </button>
      </section>

      {showForm && (
        <form
          onSubmit={handleAddReport}
          style={{
            marginBottom: "40px",
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0 0 8px rgba(0,0,0,0.1)"
          }}
        >
          <section style={{ marginBottom: "15px" }}>
            <label><strong>Your Name:</strong></label>
            <br />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginTop: "5px"
              }}
            />
          </section>

          <section>
            <label><strong>Describe the Issue:</strong></label>
            <br />
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginTop: "5px"
              }}
            />
          </section>

          <br />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Submit Report
          </button>
        </form>
      )}

      <section>
        {reports.length === 0 ? (
          <p style={{ textAlign: "center" }}>No reports yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reports.map((report) => (
              <li
                key={report.id}
                style={{
                  marginBottom: "30px",
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  backgroundColor: "#ffffff"
                }}
              >
                <p><strong>👤 Name:</strong> {report.createdBy}</p>
                <p><strong>📄 Issue:</strong> {report.reportMessage}</p>
                <p><strong>📅 Date:</strong> {report.createdAt?.toDate().toLocaleString()}</p>
                <p>
                  <strong>📌 Status:</strong>{" "}
                  <span style={{
                    fontWeight: "bold",
                    color: getStatusColor(report.status),
                    textTransform: "capitalize"
                  }}>
                    {report.status}
                  </span>
                </p>
                {report.feedback && (
                  <p style={{ backgroundColor: "#e7f3ff", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
                    <strong>💬 Staff Feedback:</strong> {report.feedback}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
