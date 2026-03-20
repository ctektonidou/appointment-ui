import { Routes, Route, Navigate } from "react-router-dom";
import StaffPage from "./pages/Staff/StaffPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import ServicesPage from "./pages/Services/ServicesPage";
import AvailabilityPage from "./pages/Availability/AvailabilityPage";
import AppointmentsPage from "./pages/Appointments/AppointmentsPage";
import CreateAppointmentPage from "./pages/Appointments/CreateAppointmentPage";
import LandingPage from "./pages/Landing/LandingPage";
import BusinessesPage from "./pages/Businesses/BusinessesPage";
import AppLayout from "./pages/Layout/AppLayout";
import BlockedDatesPage from "./pages/BlockedDates/BlockedDatesPage";

function App() {
  const isLoggedIn = !!localStorage.getItem("authUser");

  return (
    <Routes>
      {!isLoggedIn ? (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/create-appointment" element={<CreateAppointmentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="my-appointments" element={<AppointmentsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="businesses" element={<BusinessesPage />} />
            <Route path="create-appointment" element={<CreateAppointmentPage />} />
            <Route path="blocked-dates" element={<BlockedDatesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;