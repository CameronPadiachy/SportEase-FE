import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff";
import Resident from "./pages/Resident";
import StaffUM from "./pages/StaffUM";
import AdminUM from "./pages/AdminUM";




function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/resident" element={<Resident />} />
      <Route path="/staff/management" element={<StaffUM />} />
      <Route path="/admin/management" element={<AdminUM />} />

    </Routes>
  );
}

export default App;
