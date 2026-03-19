// src/pages/Dashboard/DashboardPage.tsx
import "./DashboardPage.css";
import { useNavigate } from "react-router-dom";

type UserRole = "owner" | "staff" | "customer";

function getUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (
    storedRole === "owner" ||
    storedRole === "staff" ||
    storedRole === "customer"
  ) {
    return storedRole;
  }

  return "customer";
}

type StatCardProps = {
  value: string;
  label: string;
  subLabel?: string;
};

function StatCard({ value, label, subLabel }: StatCardProps) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-label">{label}</div>
      {subLabel && <div className="dash-stat-sublabel">{subLabel}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const role: UserRole = getUserRole();

  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const isCustomer = role === "customer";

  const title =
    role === "owner"
      ? "Appointments Business Status"
      : "Appointments Status";

  function onCreateAppointment() {
    navigate("/create-appointment");
  }

  function shareLink() {
    const url = window.location.origin;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Booking link copied!");
      })
      .catch(() => {
        alert("Failed to copy link");
      });
  }

  return (
    <div className="dashboard-page">
      <div className="dash-header-row">
        <h1 className="dash-title">{title}</h1>
        <div className="dash-date">08/01/2026</div>
      </div>

      <div className="dash-stat-row">
        <StatCard
          value={isCustomer ? "1" : isStaff ? "3" : "7"}
          label="TODAY"
        />
        <StatCard value="32" label="THIS WEEK" />
        <StatCard value="3%" label="CANCEL RATE" />
        {isOwner && (
          <StatCard value="7" label="NO-SHOWS" subLabel="THIS WEEK" />
        )}
      </div>

      <div className="dash-actions-row">
        <button className="dash-btn dash-btn-primary" onClick={onCreateAppointment}>
          Create Appointment
        </button>

        {(isOwner || isStaff) && (
          <button className="dash-btn dash-btn-secondary" onClick={shareLink}>
            Share Book Link
          </button>
        )}
      </div>

      <div className="dash-grid">
        <section className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Today&apos;s Appointments</span>
            <button className="dash-card-icon-btn" aria-label="Collapse">
              –
            </button>
          </div>

          <table className="dash-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Client</th>
                <th>Service</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>9:00</td>
                <td>Name Name</td>
                <td>Service A</td>
              </tr>
              <tr>
                <td>10:00</td>
                <td>Name Name</td>
                <td>Service B</td>
              </tr>
              {!isCustomer && (
                <tr>
                  <td>11:30</td>
                  <td>Name Name</td>
                  <td>Service C</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {(isOwner || isStaff) && (
          <section className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">
                Appointments Per Day (This week)
              </span>
            </div>

            <div className="dash-chart-placeholder">
              Chart area
            </div>
          </section>
        )}
      </div>
    </div>
  );
}