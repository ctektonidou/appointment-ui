import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  searchOwnerAppointments,
  searchStaffAppointments,
  searchCustomerAppointments,
  type AppointmentListItem,
} from "../../api/appointments";
import "./AppointmentsPage.css";

type UserRole = "owner" | "staff" | "customer";
type StatusFilter = "ALL" | "SCHEDULED" | "CANCELLED" | "NO_SHOW";

type Filters = {
  from: string;
  to: string;
  status: StatusFilter;
  staff: string;
  service: string;
  business: string;
  search: string;
};

const PAGE_SIZE = 10;

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

function getUserId(): number | null {
  const storedUserId = localStorage.getItem("userId");
  if (!storedUserId) return null;

  const parsed = Number(storedUserId);
  return Number.isNaN(parsed) ? null : parsed;
}

function toApiDateFrom(dateValue: string): string | undefined {
  if (!dateValue) return undefined;
  return `${dateValue}T00:00:00`;
}

function toApiDateTo(dateValue: string): string | undefined {
  if (!dateValue) return undefined;
  return `${dateValue}T23:59:59`;
}

export default function AppointmentsPage() {
  const role: UserRole = getStoredUserRole();

  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const isCustomer = role === "customer";

  const [draftFilters, setDraftFilters] = useState<Filters>({
    from: "",
    to: "",
    status: "ALL",
    staff: "ALL",
    service: "ALL",
    business: "ALL",
    search: "",
  });

  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    from: "",
    to: "",
    status: "ALL",
    staff: "ALL",
    service: "ALL",
    business: "ALL",
    search: "",
  });

  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);

  function updateDraftFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function loadAppointments(filters: Filters) {
    const userId = getUserId();

    if (!userId) {
      setErrorMessage("User id not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      let data: AppointmentListItem[] = [];

      if (isOwner) {
        data = await searchOwnerAppointments({
          userId,
          from: toApiDateFrom(filters.from),
          to: toApiDateTo(filters.to),
          status: filters.status,
          search: filters.search,
        });
      } else if (isStaff) {
        data = await searchStaffAppointments({
          userId,
          from: toApiDateFrom(filters.from),
          to: toApiDateTo(filters.to),
          status: filters.status,
          search: filters.search,
        });
      } else {
        data = await searchCustomerAppointments({
          userId,
          from: toApiDateFrom(filters.from),
          to: toApiDateTo(filters.to),
          status: filters.status,
          search: filters.search,
        });
      }

      setAppointments(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load appointments"
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAppointments(appliedFilters);
  }, [appliedFilters]);

  function onSearch() {
    setAppliedFilters(draftFilters);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(appointments.length / PAGE_SIZE));
  const pageItems = appointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="appointments-page">
      <h1 className="appointments-title">Appointments</h1>

      <div className="appointments-filters">
        <div className="appointments-filters-row">
          <div className="appointments-field">
            <label className="appointments-label">Date From</label>
            <input
              type="date"
              className="appointments-input"
              value={draftFilters.from}
              onChange={(e) => updateDraftFilter("from", e.target.value)}
            />
          </div>

          <div className="appointments-field">
            <label className="appointments-label">Date To</label>
            <input
              type="date"
              className="appointments-input"
              value={draftFilters.to}
              onChange={(e) => updateDraftFilter("to", e.target.value)}
            />
          </div>

          <div className="appointments-field">
            <label className="appointments-label">Status</label>
            <select
              className="appointments-input"
              value={draftFilters.status}
              onChange={(e) =>
                updateDraftFilter("status", e.target.value as StatusFilter)
              }
            >
              <option value="ALL">All</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO SHOW</option>
            </select>
          </div>

          {isOwner && (
            <div className="appointments-field">
              <label className="appointments-label">Staff</label>
              <select
                className="appointments-input"
                value={draftFilters.staff}
                onChange={(e) => updateDraftFilter("staff", e.target.value)}
              >
                <option value="ALL">All Staff</option>
              </select>
            </div>
          )}

          {(isStaff || isCustomer) && (
            <div className="appointments-field">
              <label className="appointments-label">Service</label>
              <select
                className="appointments-input"
                value={draftFilters.service}
                onChange={(e) => updateDraftFilter("service", e.target.value)}
              >
                <option value="ALL">All</option>
              </select>
            </div>
          )}
        </div>

        <div className="appointments-filters-row">
          {isOwner && (
            <div className="appointments-field">
              <label className="appointments-label">Service</label>
              <select
                className="appointments-input"
                value={draftFilters.service}
                onChange={(e) => updateDraftFilter("service", e.target.value)}
              >
                <option value="ALL">All</option>
              </select>
            </div>
          )}

          {isStaff && <div className="appointments-field" />}

          {isCustomer && (
            <div className="appointments-field">
              <label className="appointments-label">Business</label>
              <select
                className="appointments-input"
                value={draftFilters.business}
                onChange={(e) => updateDraftFilter("business", e.target.value)}
              >
                <option value="ALL">All</option>
              </select>
            </div>
          )}

          <div className="appointments-field appointments-field--grow">
            <label className="appointments-label">Search</label>
            <input
              type="text"
              className="appointments-input"
              placeholder="Search..."
              value={draftFilters.search}
              onChange={(e) => updateDraftFilter("search", e.target.value)}
            />
          </div>

          <div className="appointments-field appointments-field--button">
            <button
              type="button"
              className="appointments-btn-primary"
              onClick={onSearch}
              disabled={loading}
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {errorMessage && <div className="appointments-error">{errorMessage}</div>}

      <div className="appointments-table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              {isCustomer ? <th>Business</th> : <th>Customer</th>}
              <th>Service</th>
              {(isOwner || isCustomer) && <th>Staff</th>}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isCustomer ? 6 : isOwner ? 6 : 5} className="appointments-empty">
                  Loading appointments...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={isCustomer ? 6 : isOwner ? 6 : 5} className="appointments-empty">
                  No appointments found.
                </td>
              </tr>
            ) : (
              pageItems.map((appt) => {
                const start = parseISO(appt.startTime);
                const dateStr = format(start, "dd/MM/yyyy");
                const timeStr = format(start, "H:mm");

                return (
                  <tr key={appt.id}>
                    <td>{dateStr}</td>
                    <td>{timeStr}</td>
                    {isCustomer ? <td>{appt.businessName}</td> : <td>{appt.customerName}</td>}
                    <td>{appt.serviceName}</td>
                    {(isOwner || isCustomer) && <td>{appt.staffName}</td>}
                    <td>{appt.status}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="appointments-pagination">
        <button
          type="button"
          className="appointments-page-btn"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          &lt;
        </button>
        <span className="appointments-page-number">{page}</span>
        <button
          type="button"
          className="appointments-page-btn"
          disabled={page >= pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}