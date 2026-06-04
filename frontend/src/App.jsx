import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetupOrganization from "./pages/SetupOrganization";
import SetupFeed from "./pages/SetupFeed";
import ApplicationStatus from "./pages/ApplicationStatus";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import StudentLayout from "./components/layout/StudentLayout";
import OrganizerLayout from "./components/layout/OrganizerLayout";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import CreateEvent from "./pages/organizer/CreateEvent";
import AdminLayout from "./components/layout/AdminLayout";
import PendingEvents from "./pages/admin/PendingEvents";
import PendingOrganizations from "./pages/admin/PendingOrganizations";
import AccountSettings from "./pages/AccountSettings";
import Saved from "./pages/Saved";
import Feedback from "./pages/Feedback";
import { AuthProvider } from "./context/AuthContext";
import MyRegistrations from "./pages/MyRegistrations";


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
          <Route path="/my-registrations" element={
            <StudentLayout>
              <MyRegistrations />
            </StudentLayout>  
          } />
          <Route path="/organizer" element={
            <OrganizerLayout>
              <OrganizerDashboard />
            </OrganizerLayout>  
          } />
          <Route path="/organizer/events/new" element={
            <OrganizerLayout>
              <CreateEvent />
            </OrganizerLayout>  
          } />
          <Route path="/admin" element={
            <AdminLayout>
              <PendingEvents />
            </AdminLayout>  
          } />
          <Route path="/admin/organizations" element={
            <AdminLayout>
              <PendingOrganizations />
            </AdminLayout>  
          } />
          <Route path="/settings" element={
            <StudentLayout>
              <AccountSettings />
            </StudentLayout>  
          } />
          <Route path="/saved" element={
            <StudentLayout>
              <Saved />
            </StudentLayout>  
          } />
          <Route path="/events/:eventId/feedback" element={
            <StudentLayout>
              <Feedback />
            </StudentLayout>  
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}