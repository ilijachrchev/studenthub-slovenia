import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetupOrganization from "./pages/SetupOrganization";
import SetupFeed from "./pages/SetupFeed";
import ApplicationStatus from "./pages/ApplicationStatus";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import StudentLayout from "./components/layout/StudentLayout";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <StudentLayout>
              <Home />
            </StudentLayout>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-organization" element={<SetupOrganization />} />
          <Route path="/setup-feed" element={<SetupFeed />} />
          <Route path="/application-status" element={<ApplicationStatus />} />
          <Route path="/events/:id" element={
            <StudentLayout>
              <EventDetail />
            </StudentLayout>  
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}