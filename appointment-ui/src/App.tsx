import { Routes, Route, Navigate } from "react-router-dom";
import StaffPage from "./pages/Staff/StaffPage";
import BusinessesPage from "./pages/Businesses/BusinessesPage";
import ServicesPage from "./pages/Services/ServicesPage";
import AppointmentsPage from "./pages/Appointments/AppointmentsPage";
import AvailabilityPage from "./pages/Availability/AvailabilityPage";
import BlockedDatesPage from "./pages/BlockedDates/BlockedDatesPage";

export default function App() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/businesses" />} />

      <Route path="/businesses" element={<BusinessesPage />} />
      <Route path="/businesses/:businessId/staff" element={<StaffPage />} />
      <Route path="/businesses/:businessId/services" element={<ServicesPage />} />
      <Route path="/businesses/:businessId/appointments" element={<AppointmentsPage />} />
      <Route path="/businesses/:businessId/availability" element={<AvailabilityPage />} />
      <Route path="/businesses/:businessId/blocked-dates" element={<BlockedDatesPage />} />
    </Routes>
  );
}
