import { useEffect, useRef, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FacilityUsageReport() {
  const [usageData, setUsageData] = useState({});
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(); // NEW: for capturing the chart

  useEffect(() => {
    const facilityMap = {
      1: "Padel",
      2: "Soccer",
      3: "Tennis"
    };

    async function fetchBookings() {
      try {
        const resp = await fetch("https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/booking");
        const data = await resp.json();

        const counts = {};
        data.forEach(booking => {
          const facilityId = booking.facility_id;
          const facilityName = facilityMap[facilityId] || `Facility ${facilityId}`;
          counts[facilityName] = (counts[facilityName] || 0) + 1;
        });

        setUsageData(counts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data: ", err);
      }
    }

    fetchBookings();
  }, []);

  const chartData = {
    labels: Object.keys(usageData),
    datasets: [
      {
        label: "Bookings",
        data: Object.values(usageData),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
        ]
      }
    ]
  };

  function exportToCSV() {
    const headers = ["Facility", "Booking Count"];
    const rows = Object.entries(usageData);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "facility_usage_report.csv";
    link.click();
  }

  // ✅ NEW: Export chart as PDF
  function exportToPDF() {
    if (!chartRef.current) return;

    html2canvas(chartRef.current).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.text("Facility Usage Report", 20, 20);
      pdf.addImage(imgData, "PNG", 15, 30, 180, 100); // (img, type, x, y, width, height)
      pdf.save("facility_usage_report.pdf");
    });
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>🏢 Facility Usage Report</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={exportToCSV} style={{ padding: "10px 20px", cursor: "pointer", marginRight: "10px" }}>
          📁 Export CSV
        </button>
        <button onClick={exportToPDF} style={{ padding: "10px 20px", cursor: "pointer" }}>
          🖨️ Export PDF
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading booking data...</p>
      ) : (
        <section style={{ maxWidth: "500px", margin: "auto" }} ref={chartRef}>
          <Pie data={chartData} />
        </section>
      )}
    </main>
  );
}
