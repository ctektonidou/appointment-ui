// src/pages/Dashboard/DashboardPage.tsx
import "./DashboardPage.css";

type UserRole = "owner" | "staff" | "customer";

// TODO: replace with real role from auth / context
const CURRENT_ROLE: UserRole = "staff";

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
  const role = CURRENT_ROLE;

  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const isCustomer = role === "customer";

  const title =
    role === "owner"
      ? "Appointments Business Status"
      : "Appointments Status";

  const primaryActionText =
    role === "customer" ? "Create Appointment" : "Create Application";

  return (
    <div className="dashboard-page">
      {/* title row */}
      <div className="dash-header-row">
        <h1 className="dash-title">{title}</h1>
        <div className="dash-date">08/01/2026</div>
      </div>

      {/* KPI row */}
      <div className="dash-stat-row">
        <StatCard value={isCustomer ? "1" : isStaff ? "3" : "7"} label="TODAY" />
        <StatCard value="32" label="THIS WEEK" />
        <StatCard value="3%" label="CANCEL RATE" />
        {isOwner && (
          <StatCard value="7" label="NO-SHOWS" subLabel="THIS WEEK" />
        )}
      </div>

      {/* actions row */}
      <div className="dash-actions-row">
        <button className="dash-btn dash-btn-primary">
          {primaryActionText}
        </button>

        {(isOwner || isStaff) && (
          <button className="dash-btn dash-btn-secondary">
            Share Book Link
          </button>
        )}
      </div>

      {/* main grid */}
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

            {/* Placeholder chart area – later we can replace with real chart */}
            <div className="dash-chart-placeholder">
              Chart area
            </div>
          </section>
        )}
      </div>
    </div>
  );
}