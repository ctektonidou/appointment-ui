// src/App.tsx
import { Routes, Route } from "react-router-dom";
import AppLayout from "./pages/Layout/AppLayout";
import StaffPage from "./pages/Staff/StaffPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import ServicesPage from "./pages/Services/ServicesPage";
import AvailabilityPage from "./pages/Availability/AvailabilityPage";
import AppointmentsPage from "./pages/Appointments/AppointmentsPage";
import CreateAppointmentPage from "./pages/Appointments/CreateAppointmentPage";
import LandingPage from "./pages/Landing/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* default redirect */}
        <Route path="/" element={<LandingPage />} />

        {/* owner/staff routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/my-appointments" element={<AppointmentsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/create-appointment" element={<CreateAppointmentPage />} />
        <Route path="/" element={<LandingPage />} />
      </Route>
    </Routes>
  );
}