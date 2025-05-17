import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";


export default function StaffReports() {
  const [reports, setReports] = useState([]);
  const [feedbackInputs, setFeedbackInputs] = useState({});

  async function fetchReports() {
    const querySnapshot = await getDocs(collection(db, "maintenance_reports"));
    const reportsList = querySnapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data()
    }));
    setReports(reportsList);
  }

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleStatusChange(reportId, newStatus) {
    try {
      const reportRef = doc(db, "maintenance_reports", reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        ...(newStatus === "resolved" && { resolvedAt: new Date() })
      });

      setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status: newStatus } : r)));
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  }

  async function handleFeedbackSubmit(e, reportId) {
    e.preventDefault();
    const feedback = feedbackInputs[reportId]?.trim();
    if (!feedback) return alert("Feedback cannot be empty.");

    try {
      const reportRef = doc(db, "maintenance_reports", reportId);
      await updateDoc(reportRef, { feedback });
      setReports(prev => prev.map(r => (r.id === reportId ? { ...r, feedback } : r)));
      setFeedbackInputs(prev => ({ ...prev, [reportId]: "" }));
      alert("Feedback submitted!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback.");
    }
  }

  async function handleDeleteReport(reportId) {
    const confirmDelete = window.confirm("Are you sure you want to delete this report?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "maintenance_reports", reportId));
      setReports(prev => prev.filter(r => r.id !== reportId));
      alert("Report deleted.");
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report.");
    }
  }

  function handleFeedbackChange(reportId, value) {
    setFeedbackInputs(prev => ({ ...prev, [reportId]: value }));
  }

  return (
    <main className="staff-reports-main">
      <h1 className="staff-reports-title">
        <img src="/icons/maintanence.png"></img> Manage Maintenance Reports
      </h1>

      <section>
        {reports.length === 0 ? (
          <p className="no-reports">No reports available.</p>
        ) : (
          <ul className="report-list">
            {reports.map((report) => (
              <li key={report.id} className="report-card">
                <p><strong><img src="/icons/person.png"></img> Reported By:</strong> {report.createdBy}</p>
                <p><strong><img src="/icons/report.png"></img> Issue:</strong> {report.reportMessage}</p>
                <p><strong><img src="/icons/calendar.png"></img> Date:</strong> {report.createdAt?.toDate().toLocaleString()}</p>
                <p>
                  <strong><img src="/icons/arrow.png"></img> Status:</strong>{" "}
                  <output className={`status-text ${report.status.replace(" ", "-")}`}>
                    {report.status}
                  </output>
                </p>

                {report.feedback && (
                  <p className="feedback-box">
                    <strong><img src="/icons/feedback.png"></img> Current Feedback:</strong> {report.feedback}
                  </p>
                )}

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const selectedStatus = e.target.elements.status.value;
                  handleStatusChange(report.id, selectedStatus);
                }}>
                  <label>
                    <strong><img src="/icons/edit.png"></img> Change Status:</strong>{" "}
                    <select name="status" defaultValue={report.status} className="status-dropdown">
                      <option value="submitted">Submitted</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </label>
                  <button type="submit" className="btn-status">Update Status</button>
                </form>

                <form onSubmit={(e) => handleFeedbackSubmit(e, report.id)}>
                  <label><strong><img src="/icons/comment.png"></img>Add Feedback:</strong></label>
                  <textarea
                    value={feedbackInputs[report.id] || ""}
                    onChange={(e) => handleFeedbackChange(report.id, e.target.value)}
                    placeholder="Type feedback here..."
                    className="feedback-input"
                  />
                  <button type="submit" className="btn-feedback">Submit Feedback</button>
                </form>

                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="btn-delete"
                >
                  <img src="/icons/bin.png"></img> Delete Report
                </button>
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
