import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff";
import Resident from "./pages/Resident";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/resident" element={<Resident />} />
    </Routes>
  );
}

export default App;
