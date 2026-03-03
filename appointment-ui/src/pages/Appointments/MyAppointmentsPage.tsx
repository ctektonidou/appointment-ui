// src/pages/Appointments/MyAppointmentsPage.tsx
import AppointmentsPage from "./AppointmentsPage";

export default function MyAppointmentsPage() {
  // for now this will just use CURRENT_ROLE from AppointmentsPage;
  // later we can pass the role as a prop from auth context
  return <AppointmentsPage />;
}