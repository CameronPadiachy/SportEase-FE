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

    const facilityId = parseInt(localStorage.getItem("selectedFacility"), 10);
    if (!facilityId) {
      alert("No facility selected. Please go back and choose a sport.");
      return;
    }

    const [start, end] = time.split(" - ");
    const bookingData = {
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
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bookingData)
        }
      );

      if (response.ok) {
        alert("Booking submitted successfully!");
        setDate("");
        setTime("");
        setShowTimeSlots(false);
        localStorage.removeItem("selectedFacility"); // optional: clear it after booking
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
    <main className="form-background">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="date">What is the date?</label><br />
          <input
            type="date"
            id="date"
            required
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setShowTimeSlots(true);
            }}
          />
        </fieldset>

        {showTimeSlots && (
          <fieldset className="time-slot-fieldset time-options" id="timeSlots">
            <legend>Select a 2-hour time slot:</legend>
            {timeSlots.map((slot) => (
              <button
                type="button"
                key={slot}
                className={`time-option ${time === slot ? "selected" : ""}`}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </fieldset>
        )}

        <fieldset>
          <label htmlFor="time">What time?</label><br />
          <input
            type="text"
            id="time"
            placeholder="Select from slots"
            value={time}
            readOnly
            required
          />
        </fieldset>

        <fieldset>
          <button type="submit" className="button" id="submit">
            SUBMIT
          </button>
        </fieldset>
      </form>
    </main>
  );
}
