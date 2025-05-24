import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import './ResidentReports.css';

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

  function getStatusClass(status) {
    return `status-text ${status.replace(" ", "-")}`;
  }

  return (
    <main className="resident-reports-main">
      <h1 className="resident-reports-title">
        <img src="/icons/maintanence.png" alt="" className="icon-blue" />
        Submit & View Maintenance Issues
      </h1>

      <section style={{ textAlign: "center", marginBottom: "30px" }}>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-status"
        >
          {showForm ? "Cancel" : "Add New Report"}
        </button>
      </section>

      {showForm && (
        <form onSubmit={handleAddReport} className="report-card">
          <section style={{ marginBottom: "15px" }}>
            <label><strong>Your Name:</strong></label>
            <br />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="feedback-input"
              style={{ height: "auto" }}
            />
          </section>

          <section>
            <label><strong>Describe the Issue:</strong></label>
            <br />
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="feedback-input"
            />
          </section>

          <br />
          <button type="submit" className="btn-feedback">Submit Report</button>
        </form>
      )}

      <section>
        {reports.length === 0 ? (
          <p className="no-reports">No reports yet.</p>
        ) : (
          <ul className="report-list">
            {reports.map((report) => (
              <li key={report.id} className="report-card">
                <p>
                  <strong><img src="/icons/person.png" alt="" className="icon-blue" /> Name:</strong> {report.createdBy}
                </p>
                <p>
                  <strong><img src="/icons/report.png" alt="" className="icon-blue" /> Issue:</strong> {report.reportMessage}
                </p>
                <p>
                  <strong><img src="/icons/calendar.png" alt="" className="icon-blue" /> Date:</strong> {report.createdAt?.toDate().toLocaleString()}
                </p>
                <p>
                  <strong><img src="/icons/arrow.png" alt="" className="icon-blue" /> Status:</strong>{" "}
                  <span className={getStatusClass(report.status)}>
                    {report.status}
                  </span>
                </p>
                {report.feedback && (
                  <p className="feedback-box">
                    <strong><img src="/icons/feedback.png" alt="" className="icon-blue" /> Staff Feedback:</strong> {report.feedback}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>
        <p>&copy; 2025 SportEase. All rights reserved.</p>
      </footer>
    </main>
  );
}
