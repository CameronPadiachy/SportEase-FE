import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function MaintenanceStats() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      const snapshot = await getDocs(collection(db, "maintenance_reports"));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(list);
      setLoading(false);
    }

    fetchReports();
    const interval = setInterval(fetchReports, 2000);
    return () => clearInterval(interval);
  }, []);

  const total = reports.length;
  const open = reports.filter(r => r.status !== "resolved").length;
  const closed = reports.filter(r => r.status === "resolved").length;

  const resolutionTimes = reports
    .filter(r => r.status === "resolved" && r.createdAt && r.resolvedAt)
    .map(r => {
      const created = r.createdAt.toDate();
      const resolved = r.resolvedAt.toDate();
      return (resolved - created) / (1000 * 60 * 60);
    });

  const avgTime =
    resolutionTimes.length > 0
      ? (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(2)
      : "N/A";

  function exportToCSV() {
    const headers = ["Created By", "Message", "Status", "Created At", "Resolved At"];
    const rows = reports.map(r => [
      r.createdBy,
      r.reportMessage,
      r.status,
      r.createdAt?.toDate().toLocaleString() || "",
      r.resolvedAt?.toDate().toLocaleString() || ""
    ]);

    const csv = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "maintenance_reports.csv";
    link.click();
  }

  async function exportToPDF() {
    const input = document.getElementById("stats-section");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("maintenance_report_visual.pdf");
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", maxWidth: "700px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🛠️ Maintenance Report Stats</h1>

      <section style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={exportToCSV}
          style={{ marginRight: "10px", padding: "10px 20px", cursor: "pointer" }}
        >
          📁 Export CSV
        </button>
        <button
          onClick={exportToPDF}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          📄 Export PDF
        </button>
      </section>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading reports...</p>
      ) : (
        <section
          id="stats-section"
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div style={cardStyle}>
            <strong>Total Reports:</strong> {total}
          </div>

          <div style={{ ...cardStyle, backgroundColor: "#fff3cd" }}>
            <strong>Open Reports:</strong> {open}
          </div>

          <div style={{ ...cardStyle, backgroundColor: "#d4edda" }}>
            <strong>Resolved Reports:</strong> {closed}
          </div>

          <div style={{ ...cardStyle, backgroundColor: "#cce5ff" }}>
            <strong>Average Resolution Time:</strong>{" "}
            {avgTime === "N/A" ? "Not enough data" : `${avgTime} hrs`}
          </div>
        </section>
      )}
    </main>
  );
}

const cardStyle = {
  backgroundColor: "#f9f9f9",
  borderRadius: "10px",
  padding: "20px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  fontSize: "18px"
};
