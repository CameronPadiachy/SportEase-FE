import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config"; // Adjust if your path is different

export default function StaffReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function fetchReports() {
      const querySnapshot = await getDocs(collection(db, "maintenance_reports"));
      const reportsList = querySnapshot.docs.map(docItem => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setReports(reportsList);
    }

    fetchReports();
  }, []);

  async function handleStatusChange(reportId, newStatus) {
    try {
      const reportRef = doc(db, "maintenance_reports", reportId);
      await updateDoc(reportRef, { status: newStatus });

      // Update local state after changing
      setReports(prevReports =>
        prevReports.map(r =>
          r.id === reportId ? { ...r, status: newStatus } : r
        )
      );
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  }

  function getStatusColor(status) {
    if (status === "submitted") return "red";
    if (status === "in progress") return "orange";
    if (status === "resolved") return "green";
    return "black";
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Manage Maintenance Reports</h1>

      <section>
        {reports.length === 0 ? (
          <p>No reports available.</p>
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
                <p><strong>Reported By:</strong> {report.createdBy}</p>
                <p><strong>Issue:</strong> {report.reportMessage}</p>
                <p><strong>Date:</strong> {report.createdAt?.toDate().toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: getStatusColor(report.status), fontWeight: "bold" }}>
                    {report.status}
                  </span>
                </p>

                {/* Dropdown to change status */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const selectedStatus = e.target.elements.status.value;
                    handleStatusChange(report.id, selectedStatus);
                  }}
                >
                  <label>
                    Change Status:
                    <select name="status" defaultValue={report.status} style={{ marginLeft: "10px" }}>
                      <option value="submitted">Submitted</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </label>
                  <br /><br />
                  <button type="submit">Update Status</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
