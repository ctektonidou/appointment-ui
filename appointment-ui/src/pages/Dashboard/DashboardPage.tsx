import "./DashboardPage.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCustomerDashboard,
  getCustomerStats,
  getStaffStats,
  getOwnerStats,
  type CustomerDashboardResponse,
  type DashboardStatsResponse,
} from "../../api/dashboardApi";

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

function getUserId(): number | null {
  const storedUserId = localStorage.getItem("userId");
  if (!storedUserId) return null;

  const parsed = Number(storedUserId);
  return Number.isNaN(parsed) ? null : parsed;
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

function formatTime(value: string): string {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const role: UserRole = getUserRole();

  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const isCustomer = role === "customer";

  const [customerDashboard, setCustomerDashboard] =
    useState<CustomerDashboardResponse | null>(null);
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStatsResponse | null>(null);

  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingCustomerTable, setLoadingCustomerTable] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const title =
    role === "owner"
      ? "Appointments Business Status"
      : "Appointments Status";

  useEffect(() => {
    const userId = getUserId();

    if (!userId) {
      setErrorMessage("User id not found");
      return;
    }

    setLoadingStats(true);
    setErrorMessage("");

    const statsPromise = isCustomer
      ? getCustomerStats(userId)
      : isStaff
      ? getStaffStats(userId)
      : getOwnerStats(userId);

    statsPromise
      .then((data) => {
        setDashboardStats(data);
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load dashboard stats"
        );
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, [isCustomer, isStaff, isOwner]);

  useEffect(() => {
    if (!isCustomer) {
      setCustomerDashboard(null);
      return;
    }

    const userId = getUserId();

    if (!userId) {
      setErrorMessage("User id not found");
      return;
    }

    setLoadingCustomerTable(true);
    setErrorMessage("");

    getCustomerDashboard(userId)
      .then((data) => {
        setCustomerDashboard(data);
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load customer appointments"
        );
      })
      .finally(() => {
        setLoadingCustomerTable(false);
      });
  }, [isCustomer]);

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
        <div className="dash-date">
          {new Date().toLocaleDateString("en-GB")}
        </div>
      </div>

      {errorMessage && (
        <div className="auth-modal-message auth-modal-message--error">
          {errorMessage}
        </div>
      )}

      <div className="dash-stat-row">
        <StatCard
          value={loadingStats ? "..." : String(dashboardStats?.todayCount ?? 0)}
          label="TODAY"
        />
        <StatCard
          value={loadingStats ? "..." : String(dashboardStats?.weekCount ?? 0)}
          label="THIS WEEK"
        />
        <StatCard
          value={loadingStats ? "..." : `${dashboardStats?.cancelRate ?? 0}%`}
          label="CANCEL RATE"
        />
        {isOwner && (
          <StatCard
            value={loadingStats ? "..." : String(dashboardStats?.noShowsCount ?? 0)}
            label="NO-SHOWS"
            subLabel="THIS WEEK"
          />
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
              {isCustomer &&
                !loadingCustomerTable &&
                (customerDashboard?.todayAppointments?.length ?? 0) > 0 &&
                customerDashboard?.todayAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{formatTime(appointment.startTime)}</td>
                    <td>{appointment.clientName}</td>
                    <td>Service #{appointment.serviceId}</td>
                  </tr>
                ))}

              {isCustomer &&
                !loadingCustomerTable &&
                (customerDashboard?.todayAppointments?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={3}>No appointments for today</td>
                  </tr>
                )}

              {isCustomer && loadingCustomerTable && (
                <tr>
                  <td colSpan={3}>Loading...</td>
                </tr>
              )}

              {!isCustomer && (
                <tr>
                  <td colSpan={3}>No appointments for today</td>
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