import { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getFirestore, doc, getDoc, onSnapshot, collection } from "firebase/firestore";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FACILITY_MAP = Object.freeze({
  1: { name: "Padel", emoji: "🎾" },
  2: { name: "Soccer", emoji: "⚽" },
  3: { name: "Tennis", emoji: "🎾" }
});

export default function TopPlayersReport({ sportId }) {
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sportName, setSportName] = useState("");
  const [error, setError] = useState(null);
  const chartRef = useRef();

  useEffect(() => {
    const db = getFirestore();
    let unsubscribeBookings = () => {};

    async function fetchData() {
      try {
        if (FACILITY_MAP[sportId]) {
          setSportName(`${FACILITY_MAP[sportId].emoji} ${FACILITY_MAP[sportId].name}`);
        }

        // Real-time bookings listener
        unsubscribeBookings = onSnapshot(
          collection(db, "bookings"),
          async (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            processBookings(bookings);
          },
          (error) => {
            console.error("Error listening to bookings:", error);
            setError("Failed to load real-time booking data");
          }
        );

        // Initial fetch from API
        const response = await fetch("https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/booking");
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const initialBookings = await response.json();
        processBookings(initialBookings);

      } catch (err) {
        console.error("Error in fetchData: ", err);
        setError(err.message);
        setLoading(false);
      }
    }

    async function processBookings(bookings) {
      try {
        const userBookings = bookings.reduce((acc, booking) => {
          if (Number(booking.facility_id) === Number(sportId)) {
            acc[booking.uid] = (acc[booking.uid] || 0) + 1;
          }
          return acc;
        }, {});

        const sortedPlayers = Object.entries(userBookings)
          .map(([userId, count]) => ({ userId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const playersWithDetails = await Promise.all(
          sortedPlayers.map(async (player) => {
            try {
              const userDoc = await getDoc(doc(db, "users", player.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                  ...player,
                  name: userData.displayName || userData.name || userData.email?.split('@')[0] || `Player ${player.userId.slice(0, 4)}`,
                  photoURL: userData.photoURL || null
                };
              }

              return {
                ...player,
                name: `Player ${player.userId.slice(0, 4)}`,
                photoURL: null
              };
            } catch (error) {
              console.error(`Error fetching user ${player.userId}:`, error);
              return {
                ...player,
                name: `Player ${player.userId.slice(0, 4)}`,
                photoURL: null
              };
            }
          })
        );

        setTopPlayers(playersWithDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error processing bookings: ", err);
        setError("Failed to process booking data");
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      unsubscribeBookings();
    };
  }, [sportId]);

  const chartData = {
    labels: topPlayers.map(player => player.name),
    datasets: [{
      label: "Bookings",
      data: topPlayers.map(player => player.count),
      backgroundColor: [
        "#36A2EB", "#4BC0C0", "#FFCE56", "#9966FF", "#FF9F40"
      ]
    }]
  };

  const exportToCSV = () => {
    const headers = ["Rank", "Player", "Bookings"];
    const rows = topPlayers.map((player, index) => [
      index + 1,
      player.name,
      player.count
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `top_players_${sportName.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.text(`Top Players Report - ${sportName}`, 20, 20);
      pdf.addImage(imgData, "PNG", 15, 30, 180, 100);
      pdf.save(`top_players_${sportName.replace(/\s+/g, '_')}.pdf`);
    });
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>🏆 Top Players - {sportName}</h1>

      {error && (
        <div style={{ color: "red", textAlign: "center", margin: "10px 0" }}>
          Error: {error}
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={exportToCSV} style={{ padding: "10px 20px", cursor: "pointer", marginRight: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ddd", borderRadius: "4px" }}>
          📁 Export CSV
        </button>
        <button onClick={exportToPDF} style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#f0f0f0", border: "1px solid #ddd", borderRadius: "4px" }}>
          🖨️ Export PDF
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading player data...</p>
      ) : topPlayers.length === 0 ? (
        <p style={{ textAlign: "center" }}>No bookings found for {sportName}</p>
      ) : (
        <>
          <section style={{ marginBottom: "40px" }} ref={chartRef}>
            <Bar 
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: `Top Players by Bookings (${sportName})`,
                    font: { size: 16 }
                  },
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Bookings'
                    }
                  }
                }
              }}
            />
          </section>

          <section style={{ background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Leaderboard</h2>
            <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 80px 50px", gap: "10px", alignItems: "center", marginBottom: "10px", padding: "0 20px", fontWeight: "bold", borderBottom: "1px solid #eee" }}>
              <div>Rank</div>
              <div>Player</div>
              <div style={{ textAlign: "right" }}>Bookings</div>
              <div></div>
            </div>

            {topPlayers.map((player, index) => (
              <div key={player.userId} style={{ display: "grid", gridTemplateColumns: "50px 1fr 80px 50px", gap: "10px", alignItems: "center", padding: "12px 20px", backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white", borderRadius: "4px" }}>
                <div style={{ fontWeight: "bold", color: index < 3 ? "#FF6384" : "#666" }}>
                  {index + 1}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {player.photoURL ? (
                    <img src={player.photoURL} alt={player.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{player.name}</span>
                </div>
                <div style={{ textAlign: "right", fontWeight: "500" }}>{player.count}</div>
                <div style={{ textAlign: "center" }}>
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
