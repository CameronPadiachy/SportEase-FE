import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function MaintenanceStats() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: "Loading...", photo: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({ name: user.displayName, photo: user.photoURL });
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    async function fetchReports() {
      const snapshot = await getDocs(collection(db, "maintenance_reports"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReports(list);
      setLoading(false);
    }

    fetchReports();
    const interval = setInterval(fetchReports, 2000);
    return () => clearInterval(interval);
  }, []);


  const total = reports.length;
  const open = reports.filter((r) => r.status !== "resolved").length;
  const closed = reports.filter((r) => r.status === "resolved").length;

  const resolutionTimes = reports
    .filter((r) => r.status === "resolved" && r.createdAt && r.resolvedAt)
    .map((r) => {
      const created = r.createdAt.toDate();
      const resolved = r.resolvedAt.toDate();
      return (resolved - created) / (1000 * 60 * 60);
    });

  const avgTime =
    resolutionTimes.length > 0
      ? (
          resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        ).toFixed(2)
      : "N/A";

  function exportToCSV() {
    const headers = [
      "Created By",
      "Message",
      "Status",
      "Created At",
      "Resolved At",
    ];
    const rows = reports.map((r) => [
      r.createdBy,
      r.reportMessage,
      r.status,
      r.createdAt?.toDate().toLocaleString() || "",
      r.resolvedAt?.toDate().toLocaleString() || "",
    ]);

    const csv = [headers, ...rows].map((e) => e.join(",")).join("\n");
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
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("maintenance_report_visual.pdf");
  }

  return (
    <main className="maintenance-stats-main">
      <header className="stats-header">
        <img src={userInfo.photo} alt="Profile" className="stats-profile" />
        <h1 className="maintenance-title"><img src="/icons/maintanence.png" alt=""></img>Maintenance Report Stats</h1>
    
        <h2 className="stats-username">{userInfo.name}</h2>
        <p className="stats-subtitle">
          Below is an overview of facility report analytics and trends.
        </p>
      </header>


      {loading ? (
        <p className="loading-message">Loading reports...</p>
      ) : (
        <section id="stats-section" className="stats-section">
          <article className="stats-card neutral">
            <h2>Total Reports:</h2>
            <p>{total}</p>
          </article>

          <article className="stats-card warning">
            <h2>Open Reports:</h2>
            <p>{open}</p>
          </article>

          <article className="stats-card success">
            <h2>Resolved Reports:</h2>
            <p>{closed}</p>
          </article>

          <article className="stats-card info">
            <h2>Average Resolution Time:</h2>
            <p>{avgTime === "N/A" ? "Not enough data" : `${avgTime} hrs`}</p>
          </article>
        </section>
      )}

      <section className="export-buttons">
        <button onClick={exportToCSV} className="btn-export-csv">
          <img src="/icons/export.png" alt="CSV" /> Export CSV
        </button>
        <button onClick={exportToPDF} className="btn-export-pdf">
          <img src="/icons/pdf.png" alt="PDF" /> Export PDF
        </button>
      </section>

      <footer>
        <p>&copy; 2025 SportEase. All rights reserved.</p>
      </footer>

    </main>
  );
}