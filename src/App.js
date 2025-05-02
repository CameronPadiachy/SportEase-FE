import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
// import Admin from "./pages/Admin"; //  Commented out original Admin
import Staff from "./pages/Staff";
import Resident from "./pages/Resident";
import StaffUM from "./pages/StaffUM";
import AdminUM from "./pages/AdminUM";
import AdminDash from './pages/AdminDash';
import BookingForm from "./pages/BookingForm"; // ✅ add this at the top
import ResidentsReports from "./pages/ResidentsReports";
import StaffReports from "./pages/StaffReports";
/*import ResidentCalendar from './pages/ResidentCalendar'; // Adjust path if needed
import EventDetails from './pages/EventDetails'; // Adjust path for event details page*/


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/admin" element={<Admin />} /> */} {/*  Original route disabled */}
      <Route path="/admin" element={<AdminDash />} />     {/*  Your custom dashboard */}
      <Route path="/staff" element={<Staff />} />
      <Route path="/resident" element={<Resident />} />
      <Route path="/staff/management" element={<StaffUM />} />
      <Route path="/booking" element={<BookingForm />} />



      <Route path="/staff-reports" element={<StaffReports />} />
      <Route path="/resident-reports" element={<ResidentsReports />} />
      <Route path="/admin/management" element={<AdminUM />} />
    </Routes>

  );
}

export default App;
