import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetupOrganization from "./pages/SetupOrganization";
import ApplicationStatus from "./pages/ApplicationStatus";
import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-organization" element={<SetupOrganization />} />
        <Route path="/application-status" element={<ApplicationStatus />} />
      </Routes>
    </BrowserRouter>
  );
}