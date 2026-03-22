import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { Event as RBCEvent } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, setHours, setMinutes } from "date-fns";
import { enUS } from "date-fns/locale";

import EditAppointmentModal, {
  type Appointment,
} from "../../pages/EditAppointmentModal/EditAppointmentModal";

import "./CalendarPage.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

type UserRole = "owner" | "staff" | "customer";

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

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

export type CalendarEvent = RBCEvent & {
  id: number;
  staffName: string;
  customerName: string;
  serviceName: string;
  status: "ACTIVE" | "CANCELLED" | "NO_SHOW" | "COMPLETED";
  notes?: string;
};

function makeDate(dayIndex: number, hour: number, minute = 0): Date {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIndex);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function combineDateAndTime(dateValue: string, timeValue: string): Date {
  const base = new Date(dateValue);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return setMinutes(setHours(base, hours), minutes);
}

function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toTimeInputValue(date: Date): string {
  return format(date, "HH:mm");
}

function mapCalendarEventToAppointment(event: CalendarEvent): Appointment {
  return {
    id: event.id,
    client: event.customerName,
    staff: event.staffName,
    service: event.serviceName,
    date: toDateInputValue(event.start as Date),
    time: toTimeInputValue(event.start as Date),
    endTime: toTimeInputValue(event.end as Date),
    status: event.status,
    notes: event.notes || "",
  };
}

const INITIAL_EVENTS: CalendarEvent[] = [
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
    notes: "",
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
    notes: "No notes",
  },
];

const STAFF_OPTIONS = ["John Smith", "Anna Peter", "Lena Nock"];

export default function CalendarPage() {
  const role: UserRole = getStoredUserRole();
  const isOwner = role === "owner";
  const isCustomer = role === "customer";

  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [view, setView] = useState<"week" | "day">("week");
  const [staffFilter, setStaffFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<CalendarEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (!isOwner || staffFilter === "ALL") {
      return events;
    }
    return events.filter((e) => e.staffName === staffFilter);
  }, [events, staffFilter, isOwner]);

  const title =
    role === "owner"
      ? "Appointments Business Calendar"
      : role === "staff"
        ? "Appointments Calendar"
        : "My Appointments Calendar";

  function openEditModal() {
    if (!selected) return;

    setEditingAppointment(mapCalendarEventToAppointment(selected));
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    setEditingAppointment(null);
  }

  function handleSaveAppointment(updated: Appointment) {
    const newStart = combineDateAndTime(updated.date, updated.time);
    const newEnd = combineDateAndTime(updated.date, updated.endTime);

    if (newEnd <= newStart) {
      alert("End time must be after start time.");
      return;
    }

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== updated.id) return event;

        const updatedEvent: CalendarEvent = {
          ...event,
          customerName: updated.client,
          staffName: updated.staff,
          serviceName: updated.service,
          status: updated.status,
          notes: updated.notes.trim(),
          start: newStart,
          end: newEnd,
          title: `${updated.staff} – ${updated.service}`,
        };

        setSelected(updatedEvent);
        return updatedEvent;
      })
    );

    closeEditModal();
  }

  function openCancelModal() {
    if (!selected) return;
    setAppointmentToCancel(selected);
    setIsCancelModalOpen(true);
  }

  function closeCancelModal() {
    setAppointmentToCancel(null);
    setIsCancelModalOpen(false);
  }

  function confirmCancelAppointment() {
    if (!appointmentToCancel) return;

    const updatedEvent: CalendarEvent = {
      ...appointmentToCancel,
      status: "CANCELLED",
    };

    setEvents((prev) =>
      prev.map((event) =>
        event.id === appointmentToCancel.id ? updatedEvent : event
      )
    );

    if (selected?.id === appointmentToCancel.id) {
      setSelected(updatedEvent);
    }

    closeCancelModal();
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
              {STAFF_OPTIONS.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
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

          <button type="button" className="calendar-btn-primary">
            New Appointment
          </button>
        </div>
      </div>

      <div className="calendar-main">
        <section className="calendar-card calendar-card--calendar">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            defaultView="week"
            views={{ week: true, day: true }}
            onView={(nextView) => {
              if (nextView === "week" || nextView === "day") {
                setView(nextView);
              }
            }}
            onDrillDown={() => { }}
            toolbar={false}
            step={30}
            timeslots={2}
            style={{ height: 600 }}
            min={makeDate(0, 8)}
            max={makeDate(0, 21)}
            onSelectEvent={(event) => setSelected(event as CalendarEvent)}
          />
        </section>

        <section className="calendar-card calendar-card--details">
          <div className="calendar-details-header">Appointment</div>

          {selected ? (
            <div className="calendar-details-body">
              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Client</span>
                <span className="calendar-detail-value">{selected.customerName}</span>
              </div>

              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Staff</span>
                <span className="calendar-detail-value">{selected.staffName}</span>
              </div>

              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Service</span>
                <span className="calendar-detail-value">{selected.serviceName}</span>
              </div>

              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Time</span>
                <span className="calendar-detail-value">
                  {format(selected.start as Date, "EEE d MMM, HH:mm")} -{" "}
                  {format(selected.end as Date, "HH:mm")}
                </span>
              </div>

              <div className="calendar-detail-row">
                <span className="calendar-detail-label">Status</span>
                <span className="calendar-detail-value">{selected.status}</span>
              </div>

              <div className="calendar-detail-notes">
                <div className="calendar-detail-label">Notes</div>
                <div className="calendar-detail-notes-box">
                  {selected.notes || "No Notes"}
                </div>
              </div>

              <div className="calendar-detail-actions">
                <button
                  type="button"
                  className="calendar-btn-edit"
                  onClick={openEditModal}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="calendar-btn-ghost"
                  onClick={openCancelModal}
                >
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

      {isEditModalOpen && editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          role={role}
          onClose={closeEditModal}
          onSave={handleSaveAppointment}
        />
      )}

      {isCancelModalOpen && appointmentToCancel && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal calendar-modal--delete">
            <div className="calendar-modal-header">
              <h2 className="calendar-modal-title">Cancel Appointment</h2>
              <button
                type="button"
                className="calendar-modal-close"
                onClick={closeCancelModal}
              >
                ×
              </button>
            </div>

            <div className="calendar-delete-content">
              <div className="calendar-delete-icon">🗑</div>
              <div className="calendar-delete-text">
                Are you sure you want to cancel the appointment for{" "}
                <strong>{appointmentToCancel.customerName}</strong> on{" "}
                <strong>
                  {format(appointmentToCancel.start as Date, "EEE d MMM, HH:mm")}
                </strong>
                ?
              </div>
            </div>

            <div className="calendar-modal-actions calendar-modal-actions--center">
              <button
                type="button"
                className="calendar-btn-danger"
                onClick={confirmCancelAppointment}
              >
                Confirm Cancel
              </button>

              <button
                type="button"
                className="calendar-btn-ghost"
                onClick={closeCancelModal}
              >
                Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}