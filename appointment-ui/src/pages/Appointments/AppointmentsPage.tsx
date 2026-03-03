import { useMemo, useState } from "react";
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from "date-fns";
import "./AppointmentsPage.css";

// ----------------------------------------------------
// Role handling (same idea as Dashboard / Calendar)
// Later this will come from real auth/context.
// ----------------------------------------------------
type UserRole = "owner" | "staff" | "customer";

// TEMP: change this to see the 3 layouts
const CURRENT_ROLE: UserRole = "owner";

// ----------------------------------------------------
// Types & demo data
// ----------------------------------------------------
type Status = "ACTIVE" | "CANCELLED" | "NO_SHOW";

type Appointment = {
  id: number;
  start: string;        // ISO string for simplicity
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
  from: string;    // "yyyy-MM-dd"
  to: string;
  status: string;  // "ALL" | Status
  staff: string;   // "ALL" | name
  service: string; // "ALL" | name
  business: string; // "ALL" | name
  search: string;
};

const PAGE_SIZE = 10;

export default function AppointmentsPage() {
  const role: UserRole = CURRENT_ROLE;

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
    setPage(1); // reset page on filter change
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

      // staff sees only his own appointments
      if (isStaff && appt.staffName !== "Peter") {
        // later: replace with logged in staff name/id
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

  const title = "Appointments";

  return (
    <div className="appointments-page">
      <h1 className="appointments-title">{title}</h1>

      {/* ---------------- Filter form ---------------- */}
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

          {/* Owner + staff: Status dropdown */}
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

          {/* Right-most filter depends on role */}
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
          {/* Second row: owner sees Service, customer sees Business */}
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

          {isStaff && (
            <div className="appointments-field" />
          )}

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
              onClick={() => setPage(1)} // in real app you’d call API
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Table ---------------- */}
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

      {/* ---------------- Pagination ---------------- */}
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