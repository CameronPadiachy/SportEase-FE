import React, { useState } from "react";

export default function BookingForm() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const timeSlots = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "18:00 - 20:00"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uid = localStorage.getItem("uid");
    if (!uid) {
      alert("User not recognized. Please log in again.");
      return;
    }

    const facilityId = parseInt(localStorage.getItem("selectedFacility"), 10);
    if (!facilityId) {
      alert("No facility selected. Please go back and choose a sport.");
      return;
    }

    const [start, end] = time.split(" - ");
    const bookingData = {
      uid,
      facility_id: facilityId,
      start_time: new Date(`${date}T${start}:00`).toISOString(),
      end_time: new Date(`${date}T${end}:00`).toISOString(),
      status: "pending",
      approved: false
    };

    try {
      const response = await fetch(
        "https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/booking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData)
        }
      );

      if (response.ok) {
        alert("Booking submitted successfully!");
        setDate("");
        setTime("");
        setShowTimeSlots(false);
        localStorage.removeItem("selectedFacility");
      } else {
        const errData = await response.json();
        alert("Failed to submit booking: " + (errData.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server error occurred.");
    }
  };

  return (
    <main
      style={{
        backgroundColor: "#f2f6fa",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          padding: "30px 40px",
          maxWidth: "400px",
          width: "100%"
        }}
      >
        <fieldset style={{ border: "none", marginBottom: "20px" }}>
          <label htmlFor="date" style={{ fontWeight: "bold", color: "#333" }}>
            What is the date?
          </label>
          <br />
          <input
            type="date"
            id="date"
            required
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setShowTimeSlots(true);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginTop: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </fieldset>

        {showTimeSlots && (
          <fieldset
            style={{
              border: "none",
              marginBottom: "20px"
            }}
          >
            <legend style={{ marginBottom: "10px" }}>
              Select a 2-hour time slot:
            </legend>

            {/* Use <button> directly in fieldset instead of div/span */}
            {timeSlots.map((slot) => (
              <button
                type="button"
                key={slot}
                onClick={() => setTime(slot)}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #007bff",
                  borderRadius: "6px",
                  backgroundColor: time === slot ? "#007bff" : "#fff",
                  color: time === slot ? "#fff" : "#007bff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "8px",
                  transition: "all 0.2s ease-in-out"
                }}
              >
                {slot}
              </button>
            ))}
          </fieldset>
        )}

        <fieldset style={{ border: "none", marginBottom: "20px" }}>
          <label htmlFor="time" style={{ fontWeight: "bold", color: "#333" }}>
            What time?
          </label>
          <br />
          <input
            type="text"
            id="time"
            placeholder="Select from slots"
            value={time}
            readOnly
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginTop: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </fieldset>

        <fieldset style={{ border: "none" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "12px",
              width: "100%",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.2s ease-in-out"
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#218838")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "#28a745")
            }
          >
            SUBMIT
          </button>
        </fieldset>
      </form>
    </main>
  );
}
