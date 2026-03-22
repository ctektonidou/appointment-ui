import { useMemo, useState } from "react";
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from "date-fns";
import "./AppointmentsPage.css";

type UserRole = "owner" | "staff" | "customer";

type Status = "ACTIVE" | "CANCELLED" | "NO_SHOW";

type Appointment = {
  id: number;
  start: string;
  durationMinutes: number;
  customerName: string;
  businessName: string;
  staffName: string;
  serviceName: string;
  status: Status;
};

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    start: "2026-10-10T08:00:00",
    durationMinutes: 60,
    customerName: "John Smith",
    businessName: "Anna's Saloon",
    staffName: "Peter",
    serviceName: "Haircut",
    status: "ACTIVE",
  },
  {
    id: 2,
    start: "2026-10-10T09:00:00",
    durationMinutes: 60,
    customerName: "John Smith",
    businessName: "Anna's Saloon",
    staffName: "Peter",
    serviceName: "Haircut",
    status: "ACTIVE",
  },
  {
    id: 3,
    start: "2026-10-10T10:00:00",
    durationMinutes: 60,
    customerName: "John Smith",
    businessName: "Anna's Saloon",
    staffName: "Peter",
    serviceName: "Haircut",
    status: "ACTIVE",
  },
];

type Filters = {
  from: string;
  to: string;
  status: string;
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

export default function AppointmentsPage() {
  const role: UserRole = getStoredUserRole();

  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const isCustomer = role === "customer";

  const [filters, setFilters] = useState<Filters>({
    from: "",
    to: "",
    status: "ALL",
    staff: "ALL",
    service: "ALL",
    business: "ALL",
    search: "",
  });

  const [page, setPage] = useState(1);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  }

  const filtered = useMemo(() => {
    return DEMO_APPOINTMENTS.filter((appt) => {
      const startDate = parseISO(appt.start);

      if (filters.from) {
        const fromDate = startOfDay(parseISO(filters.from));
        if (isBefore(startDate, fromDate)) return false;
      }

      if (filters.to) {
        const toDate = endOfDay(parseISO(filters.to));
        if (isAfter(startDate, toDate)) return false;
      }

      if (filters.status !== "ALL" && appt.status !== filters.status) {
        return false;
      }

      if (isOwner && filters.staff !== "ALL" && appt.staffName !== filters.staff) {
        return false;
      }

      if (isStaff && appt.staffName !== "Peter") {
        return false;
      }

      if (filters.service !== "ALL" && appt.serviceName !== filters.service) {
        return false;
      }

      if (isCustomer && filters.business !== "ALL" && appt.businessName !== filters.business) {
        return false;
      }

      const term = filters.search.trim().toLowerCase();
      if (term) {
        const haystack = [
          appt.customerName,
          appt.businessName,
          appt.staffName,
          appt.serviceName,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [filters, isOwner, isStaff, isCustomer]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              value={filters.from}
              onChange={(e) => updateFilter("from", e.target.value)}
            />
          </div>

          <div className="appointments-field">
            <label className="appointments-label">Date To</label>
            <input
              type="date"
              className="appointments-input"
              value={filters.to}
              onChange={(e) => updateFilter("to", e.target.value)}
            />
          </div>

          <div className="appointments-field">
            <label className="appointments-label">Status</label>
            <select
              className="appointments-input"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO SHOW</option>
            </select>
          </div>

          {isOwner && (
            <div className="appointments-field">
              <label className="appointments-label">Staff</label>
              <select
                className="appointments-input"
                value={filters.staff}
                onChange={(e) => updateFilter("staff", e.target.value)}
              >
                <option value="ALL">All Staff</option>
                <option value="Peter">Peter</option>
              </select>
            </div>
          )}

          {isStaff && (
            <div className="appointments-field">
              <label className="appointments-label">Service</label>
              <select
                className="appointments-input"
                value={filters.service}
                onChange={(e) => updateFilter("service", e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="Haircut">Haircut</option>
              </select>
            </div>
          )}

          {isCustomer && (
            <div className="appointments-field">
              <label className="appointments-label">Service</label>
              <select
                className="appointments-input"
                value={filters.service}
                onChange={(e) => updateFilter("service", e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="Haircut">Haircut</option>
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
                value={filters.service}
                onChange={(e) => updateFilter("service", e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="Haircut">Haircut</option>
              </select>
            </div>
          )}

          {isStaff && <div className="appointments-field" />}

          {isCustomer && (
            <div className="appointments-field">
              <label className="appointments-label">Business</label>
              <select
                className="appointments-input"
                value={filters.business}
                onChange={(e) => updateFilter("business", e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="Anna's Saloon">Anna&apos;s Saloon</option>
              </select>
            </div>
          )}

          <div className="appointments-field appointments-field--grow">
            <label className="appointments-label">Search</label>
            <input
              type="text"
              className="appointments-input"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>

          <div className="appointments-field appointments-field--button">
            <button
              type="button"
              className="appointments-btn-primary"
              onClick={() => setPage(1)}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="appointments-table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              {isCustomer && <th>Business</th>}
              {!isCustomer && <th>Customer</th>}
              <th>Service</th>
              {(isOwner || isCustomer) && <th>Staff</th>}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={isCustomer ? 6 : isOwner ? 6 : 5} className="appointments-empty">
                  No appointments found.
                </td>
              </tr>
            ) : (
              pageItems.map((appt) => {
                const start = parseISO(appt.start);
                const dateStr = format(start, "dd/MM/yyyy");
                const timeStr = format(start, "H:mm");

                return (
                  <tr key={appt.id}>
                    <td>{dateStr}</td>
                    <td>{timeStr}</td>
                    {isCustomer && <td>{appt.businessName}</td>}
                    {!isCustomer && <td>{appt.customerName}</td>}
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