import React, { useEffect, useState } from 'react';

const API_URL = 'https://sporteasebe-hka9fng7gaaue7c2.canadacentral-01.azurewebsites.net/api/booking';

export default function AdminBooking() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const updateBooking = (bookingId, newStatus) => {
    fetch(`${API_URL}/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(updated => {
        setBookings(prev =>
          prev.map(b =>
            b.booking_id === bookingId ? { ...b, status: newStatus, editing: false } : b
          )
        );
      })
      .catch(err => alert('Update failed'));
  };

  const editBooking = (bookingId) => {
    setBookings(prev =>
      prev.map(b =>
        b.booking_id === bookingId ? { ...b, editing: true } : b
      )
    );
  };

  return (
    <main style={{ background: 'lightyellow', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>Manage Booking Requests</h1>
      <table>
        <caption>Pending Bookings</caption>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Facility</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody data-testid="booking-table">
          {bookings.map(booking => (
            <tr key={booking.booking_id}>
              <td>{booking.booking_id}</td>
              <td>Facility {booking.facility_id}</td>
              <td>{booking.start_time ? booking.start_time.split('T')[0] : 'N/A'}</td>
              <td>{booking.end_time ? booking.end_time.split('T')[0] : 'N/A'}</td>
              <td>{booking.status || 'pending'}</td>
              <td>
                {booking.editing ? (
                  <>
                    <button className="accept" onClick={() => updateBooking(booking.booking_id, 'approved')}>Accept</button>
                    <button className="decline" onClick={() => updateBooking(booking.booking_id, 'blocked')}>Decline</button>
                  </>
                ) : (
                  <button className="edit" onClick={() => editBooking(booking.booking_id)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Debug output: show raw bookings data */}
      <pre>{JSON.stringify(bookings, null, 2)}</pre>
    </main>
  );
}
