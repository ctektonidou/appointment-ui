import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { Event as RBCEvent, View } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  setHours,
  setMinutes,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

import EditAppointmentModal, {
  type Appointment,
} from "../../pages/EditAppointmentModal/EditAppointmentModal";

import {
  searchCustomerAppointments,
  searchOwnerAppointments,
  searchStaffAppointments,
  updateAppointmentStatus,
  updateBusinessAppointment,
  type AppointmentListItemResponse,
  type AppointmentStatus,
} from "../../api/appointments";

import "./CalendarPage.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

type UserRole = "owner" | "staff" | "customer";

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

function getStoredUserId(): number | null {
  const raw = localStorage.getItem("userId");
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
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

export type CalendarEvent = Omit<RBCEvent, "title" | "start" | "end"> & {
  id: number;
  businessId: number;
  serviceId: number;
  staffId: number;
  customerUserId: number | null;
  title: string;
  start: Date;
  end: Date;
  staffName: string;
  customerName: string;
  serviceName: string;
  businessName: string;
  status: AppointmentStatus;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
};

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

function toLocalDateTimeParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function mapApiAppointmentToCalendarEvent(
  item: AppointmentListItemResponse
): CalendarEvent {
  return {
    id: item.id,
    businessId: item.businessId,
    serviceId: item.serviceId,
    staffId: item.staffId,
    customerUserId: item.customerUserId,
    title: `${item.customerName} – ${item.serviceName}`,
    start: new Date(item.startTime),
    end: new Date(item.endTime),
    staffName: item.staffName,
    customerName: item.customerName,
    serviceName: item.serviceName,
    businessName: item.businessName,
    status: item.status,
    clientEmail: item.clientEmail ?? "",
    clientPhone: item.clientPhone ?? "",
    notes: item.clientNotes ?? "",
  };
}

function mapCalendarEventToAppointment(event: CalendarEvent): Appointment {
  return {
    id: event.id,
    businessId: event.businessId,
    serviceId: event.serviceId,
    staffId: event.staffId,
    customerUserId: event.customerUserId,
    client: event.customerName,
    staff: event.staffName,
    service: event.serviceName,
    date: toDateInputValue(event.start),
    time: toTimeInputValue(event.start),
    endTime: toTimeInputValue(event.end),
    status: event.status,
    notes: event.notes || "",
    clientEmail: event.clientEmail || "",
    clientPhone: event.clientPhone || "",
  };
}

function getRangeForView(currentDate: Date, currentView: "week" | "day") {
  if (currentView === "day") {
    const from = new Date(currentDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(currentDate);
    to.setHours(23, 59, 59, 999);

    return { from, to };
  }

  const monday = startOfWeek(currentDate, { weekStartsOn: 1 });

  const from = new Date(monday);
  from.setHours(0, 0, 0, 0);

  const to = new Date(monday);
  to.setDate(monday.getDate() + 6);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const role: UserRole = getStoredUserRole();
  const userId = getStoredUserId();
  const isOwner = role === "owner";

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<"week" | "day">("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [staffFilter, setStaffFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<CalendarEvent | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title =
    role === "owner"
      ? "Appointments Business Calendar"
      : role === "staff"
        ? "Appointments Calendar"
        : "My Appointments Calendar";

  async function loadAppointments() {
    if (!userId) {
      setError("User id was not found in localStorage.");
      setEvents([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { from, to } = getRangeForView(currentDate, view);

      const commonParams = {
        userId,
        from: toLocalDateTimeParam(from),
        to: toLocalDateTimeParam(to),
      };

      let data: AppointmentListItemResponse[] = [];

      if (role === "owner") {
        data = await searchOwnerAppointments(commonParams);
      } else if (role === "staff") {
        data = await searchStaffAppointments(commonParams);
      } else {
        data = await searchCustomerAppointments(commonParams);
      }

      const mapped = data.map(mapApiAppointmentToCalendarEvent);
      setEvents(mapped);

      setSelected((prev) => {
        if (!prev) return null;
        return mapped.find((item) => item.id === prev.id) ?? null;
      });
    } catch (err) {
      setEvents([]);
      setSelected(null);
      setError(err instanceof Error ? err.message : "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [currentDate, view, role, userId]);

  const staffOptions = useMemo(() => {
    const uniqueNames = Array.from(
      new Set(events.map((event) => event.staffName).filter(Boolean))
    );
    return uniqueNames.sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!isOwner || staffFilter === "ALL") {
      return events;
    }

    return events.filter((e) => e.staffName === staffFilter);
  }, [events, isOwner, staffFilter]);

  function openEditModal() {
    if (!selected) return;
    setEditingAppointment(mapCalendarEventToAppointment(selected));
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    setEditingAppointment(null);
  }

  async function handleSaveAppointment(updated: Appointment) {
    if (!selected) return;

    const newStart = combineDateAndTime(updated.date, updated.time);
    const newEnd = combineDateAndTime(updated.date, updated.endTime);

    if (newEnd <= newStart) {
      alert("End time must be after start time.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateBusinessAppointment(updated.businessId, updated.id, {
        serviceId: updated.serviceId,
        staffId: updated.staffId,
        customerUserId: updated.customerUserId,
        clientName: updated.client,
        clientEmail: updated.clientEmail || null,
        clientPhone: updated.clientPhone || null,
        clientNotes: updated.notes.trim(),
        startTime: toLocalDateTimeParam(newStart),
        endTime: toLocalDateTimeParam(newEnd),
        status: updated.status,
      });

      closeEditModal();
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save appointment.");
    } finally {
      setSaving(false);
    }
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

  async function confirmCancelAppointment() {
    if (!appointmentToCancel) return;

    setSaving(true);
    setError("");

    try {
      await updateAppointmentStatus(
        appointmentToCancel.businessId,
        appointmentToCancel.id,
        "CANCELLED"
      );

      closeCancelModal();
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel appointment.");
    } finally {
      setSaving(false);
    }
  }

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
              {staffOptions.map((staff) => (
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

          <button
            type="button"
            className="calendar-btn-primary"
            onClick={onCreateAppointment}
          >
            New Appointment
          </button>
        </div>
      </div>

      {loading && <div className="calendar-info">Loading appointments...</div>}
      {!loading && error && <div className="calendar-error">{error}</div>}

      <div className="calendar-main">
        <section className="calendar-card calendar-card--calendar">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            date={currentDate}
            defaultView="week"
            views={{ week: true, day: true }}
            onView={(nextView: View) => {
              if (nextView === "week" || nextView === "day") {
                setView(nextView);
              }
            }}
            onNavigate={(date) => setCurrentDate(date)}
            toolbar={true}
            step={30}
            timeslots={2}
            style={{ height: 600 }}
            min={new Date(1970, 0, 1, 8, 0, 0)}
            max={new Date(1970, 0, 1, 21, 0, 0)}
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
                <span className="calendar-detail-label">Business</span>
                <span className="calendar-detail-value">{selected.businessName}</span>
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
                  {format(selected.start, "EEE d MMM, HH:mm")} -{" "}
                  {format(selected.end, "HH:mm")}
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
                  disabled={saving}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="calendar-btn-ghost"
                  onClick={openCancelModal}
                  disabled={saving || selected.status === "CANCELLED"}
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
          key={editingAppointment.id}
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
                  {format(appointmentToCancel.start, "EEE d MMM, HH:mm")}
                </strong>
                ?
              </div>
            </div>

            <div className="calendar-modal-actions calendar-modal-actions--center">
              <button
                type="button"
                className="calendar-btn-danger"
                onClick={confirmCancelAppointment}
                disabled={saving}
              >
                Confirm Cancel
              </button>

              <button
                type="button"
                className="calendar-btn-ghost"
                onClick={closeCancelModal}
                disabled={saving}
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