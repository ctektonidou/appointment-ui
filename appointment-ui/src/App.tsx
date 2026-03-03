// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/Layout/AppLayout";
import BusinessesPage from "./pages/Businesses/BusinessesPage";
import StaffPage from "./pages/Staff/StaffPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import ServicesPage from "./pages/Services/ServicesPage";
import AvailabilityPage from "./pages/Availability/AvailabilityPage";
import AppointmentsPage from "./pages/Appointments/AppointmentsPage";
import MyAppointmentsPage from "./pages/Appointments/MyAppointmentsPage";
import BlockedDatesPage from "./pages/BlockedDates/BlockedDatesPage";

export default function App() {
  return (
    <Routes>
      {/* All authenticated pages use the shared layout */}
      <Route element={<AppLayout />}>
        {/* default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* owner/staff routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/staff" element={<StaffPage />} />

        {/* business-scoped routes */}
        <Route path="/businesses" element={<BusinessesPage />} />
        <Route path="/businesses/:businessId/staff" element={<StaffPage />} />
        <Route path="/businesses/:businessId/services" element={<ServicesPage />} />
        <Route path="/businesses/:businessId/appointments" element={<AppointmentsPage />} />
        <Route path="/businesses/:businessId/availability" element={<AvailabilityPage />} />
        <Route path="/businesses/:businessId/blocked-dates" element={<BlockedDatesPage />} />

        {/* customer routes */}
        <Route path="/my-appointments" element={<MyAppointmentsPage />} />
        {/* <Route path="/create-appointment" element={<CreateAppointmentPage />} /> */}
      </Route>

      {/* later: /login etc outside AppLayout */}
    </Routes>
  );
}