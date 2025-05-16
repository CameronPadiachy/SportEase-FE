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

  function getStatusColor(status) {
    if (status === "submitted") return "red";
    if (status === "in progress") return "orange";
    if (status === "resolved") return "green";
    return "black";
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>📋 Manage Maintenance Reports</h1>

      <section>
        {reports.length === 0 ? (
          <p style={{ textAlign: "center" }}>No reports available.</p>
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
                  backgroundColor: "#f9f9f9"
                }}
              >
                <p><strong>🧍 Reported By:</strong> {report.createdBy}</p>
                <p><strong>📄 Issue:</strong> {report.reportMessage}</p>
                <p><strong>📅 Date:</strong> {report.createdAt?.toDate().toLocaleString()}</p>
                <p>
                  <strong>🟢 Status:</strong>{" "}
                  <span style={{
                    fontWeight: "bold",
                    color: getStatusColor(report.status),
                    textTransform: "capitalize"
                  }}>
                    {report.status}
                  </span>
                </p>

                {report.feedback && (
                  <p style={{ backgroundColor: "#e7f3ff", padding: "10px", borderRadius: "5px" }}>
                    <strong>💬 Current Feedback:</strong> {report.feedback}
                  </p>
                )}

                {/* Change Status */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const selectedStatus = e.target.elements.status.value;
                    handleStatusChange(report.id, selectedStatus);
                  }}
                  style={{ marginTop: "15px" }}
                >
                  <label>
                    <strong>🔄 Change Status:</strong>{" "}
                    <select
                      name="status"
                      defaultValue={report.status}
                      style={{
                        padding: "6px 10px",
                        marginLeft: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                      }}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </label>
                  <br /><br />
                  <button
                    type="submit"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Update Status
                  </button>
                </form>

                {/* Feedback */}
                <form
                  onSubmit={(e) => handleFeedbackSubmit(e, report.id)}
                  style={{ marginTop: "20px" }}
                >
                  <label><strong>📝 Add Feedback:</strong></label>
                  <br />
                  <textarea
                    value={feedbackInputs[report.id] || ""}
                    onChange={(e) => handleFeedbackChange(report.id, e.target.value)}
                    placeholder="Type feedback here..."
                    style={{
                      width: "100%",
                      height: "80px",
                      padding: "10px",
                      marginTop: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      fontFamily: "Arial"
                    }}
                  />
                  <br />
                  <button
                    type="submit"
                    style={{
                      marginTop: "10px",
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Submit Feedback
                  </button>
                </form>

                {/* Delete Report */}
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  style={{
                    marginTop: "15px",
                    padding: "8px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  🗑 Delete Report
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
