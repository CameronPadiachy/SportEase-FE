import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
// import Admin from "./pages/Admin"; //  Commented out original Admin
import Staff from "./pages/Staff";
import Resident from "./pages/Resident";
import StaffUM from "./pages/StaffUM";
import AdminUM from "./pages/AdminUM";
import AdminDash from './pages/AdminDash';
import BookingForm from "./pages/BookingForm";
import ResidentsReports from "./pages/ResidentsReports";
import StaffReports from "./pages/StaffReports";
import ResidentEvents from "./pages/ResidentEvents"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/admin" element={<Admin />} /> */}
      <Route path="/admin" element={<AdminDash />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/resident" element={<Resident />} />
      <Route path="/staff/management" element={<StaffUM />} />
      <Route path="/booking" element={<BookingForm />} />
      <Route path="/staff-reports" element={<StaffReports />} />
      <Route path="/resident-reports" element={<ResidentsReports />} />
      <Route path="/admin/management" element={<AdminUM />} />

      <Route path="/resident-events" element={<ResidentEvents />} />

    </Routes>
  );
}

export default App;
