// src/pages/Calendar/CalendarPage.tsx
import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View, Event as RBCEvent } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

import "./CalendarPage.css";

// --------- role handling (same style as Dashboard) ----------
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

// --------- react-big-calendar localizer ----------
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// --------- event type ----------
export type CalendarEvent = Omit<RBCEvent, "title" | "start" | "end"> & {
  id: number;
  title: string;
  start: Date;
  end: Date;
  staffName: string;
  customerName: string;
  serviceName: string;
  status: "ACTIVE" | "CANCELLED" | "NO_SHOW";
  notes?: string;
};

// Little helper to create dates on a given day/time (same week)
function makeDate(dayIndex: number, hour: number, minute = 0): Date {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIndex);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// Demo data (later we’ll fetch from API)
const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: "John Smith – Haircut",
    start: makeDate(0, 11),
    end: makeDate(0, 12),
    staffName: "John Smith",
    customerName: "Customer A",
    serviceName: "Haircut",
    status: "ACTIVE",
    notes: "No notes",
  },
  {
    id: 2,
    title: "John Smith – Haircut",
    start: makeDate(2, 13),
    end: makeDate(2, 14),
    staffName: "John Smith",
    customerName: "Customer B",
    serviceName: "Haircut",
    status: "ACTIVE",
  },
  {
    id: 3,
    title: "John Smith – Haircut",
    start: makeDate(3, 16),
    end: makeDate(3, 17),
    staffName: "John Smith",
    customerName: "Customer C",
    serviceName: "Haircut",
    status: "ACTIVE",
  },
];

export default function CalendarPage() {
  const navigate = useNavigate();
  const role: UserRole = getUserRole();
  const isOwner = role === "owner";
  const isCustomer = role === "customer";

  const [view, setView] = useState<"week" | "day">("week");
  const [staffFilter, setStaffFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (!isOwner || staffFilter === "ALL") {
      return DEMO_EVENTS;
    }
    return DEMO_EVENTS.filter((e) => e.staffName === staffFilter);
  }, [staffFilter, isOwner]);

  const title =
    role === "owner"
      ? "Appointments Business Calendar"
      : role === "staff"
        ? "Appointments Calendar"
        : "My Appointments Calendar";

  function onCreateAppointment() {
    navigate("/create-appointment");
  }

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          {isOwner && (
            <select
              className="calendar-select"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="ALL">All Staff</option>
              <option value="John Smith">John Smith</option>
            </select>
          )}

          <div className="calendar-title">{title}</div>
        </div>

        <div className="calendar-toolbar-right">
          <div className="calendar-view-switch">
            <button
              type="button"
              className={
                view === "day"
                  ? "calendar-view-btn calendar-view-btn--active"
                  : "calendar-view-btn"
              }
              onClick={() => setView("day")}
            >
              Day
            </button>

            <span className="calendar-view-divider">|</span>

            <button
              type="button"
              className={
                view === "week"
                  ? "calendar-view-btn calendar-view-btn--active"
                  : "calendar-view-btn"
              }
              onClick={() => setView("week")}
            >
              Week
            </button>
          </div>

          <button
            type="button"
            className="calendar-btn-primary"
            onClick={onCreateAppointment}
          >
            New Appointment
          </button>
        </div>
      </div>

      <div className="calendar-main">
        <section className="calendar-card calendar-card--calendar">
          <Calendar<CalendarEvent>
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            defaultView="week"
            views={{ week: true, day: true }}
            onView={(nextView: View) => {
              if (nextView === "week" || nextView === "day") {
                setView(nextView);
              }
            }}
            onDrillDown={() => {
              // keep current view
            }}
            toolbar={false}
            step={30}
            timeslots={2}
            style={{ height: 600 }}
            min={makeDate(0, 8)}
            max={makeDate(0, 21)}
            onSelectEvent={(event) => setSelected(event)}
          />
        </section>

        <section className="calendar-card calendar-card--details">
          <div className="calendar-details-header">Appointment</div>

          {selected ? (
            <div className="calendar-details-body">
              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Client</span>
                <span className="calendar-detail-value">
                  {selected.customerName}
                </span>
              </div>

              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Staff</span>
                <span className="calendar-detail-value">
                  {selected.staffName}
                </span>
              </div>

              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Service</span>
                <span className="calendar-detail-value">
                  {selected.serviceName}
                </span>
              </div>

              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Time</span>
                <span className="calendar-detail-value">
                  {format(selected.start, "EEE d MMM, HH:mm")} -{" "}
                  {format(selected.end, "HH:mm")}
                </span>
              </div>

              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Status</span>
                <span className="calendar-detail-value">
                  {selected.status}
                </span>
              </div>

              <div className="calendar-detail-notes">
                <div className="calendar-detail-label">Notes</div>
                <div className="calendar-detail-notes-box">
                  {selected.notes || "No Notes"}
                </div>
              </div>

              <div className="calendar-detail-actions">
                <button type="button" className="calendar-btn-secondary">
                  Edit
                </button>

                <button type="button" className="calendar-btn-ghost">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="calendar-details-empty">
              Select an appointment on the calendar
            </div>
          )}
        </section>
      </div>
    </div>
  );
}