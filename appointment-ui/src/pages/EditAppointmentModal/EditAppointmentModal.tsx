import { useEffect, useMemo, useState } from "react";
import "./EditAppointmentModal.css";

type UserRole = "owner" | "staff" | "customer";

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type Appointment = {
  id: number;
  client: string;
  staff: string;
  service: string;
  date: string;
  time: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
};

type StaffOption = {
  id: number;
  name: string;
};

type ServiceOption = {
  id: number;
  name: string;
  durationMinutes: number;
};

type AvailableSlot = {
  start: string; // HH:mm
  end: string;   // HH:mm
};

type Props = {
  appointment: Appointment;
  role: UserRole;
  onClose: () => void;
  onSave: (updated: Appointment) => void;
};

const STATUS_OPTIONS: AppointmentStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

/* =========================================================
   MOCK SERVICES
   Replace these with real API calls in the next step
   ========================================================= */

async function fetchStaffOptions(): Promise<StaffOption[]> {
  return Promise.resolve([
    { id: 1, name: "John Smith" },
    { id: 2, name: "Anna Peter" },
    { id: 3, name: "Lena Nock" },
  ]);
}

async function fetchServiceOptions(): Promise<ServiceOption[]> {
  return Promise.resolve([
    { id: 1, name: "Haircut", durationMinutes: 60 },
    { id: 2, name: "Beard Trim", durationMinutes: 30 },
    { id: 3, name: "Color", durationMinutes: 120 },
    { id: 4, name: "Styling", durationMinutes: 45 },
  ]);
}

async function fetchAvailableSlots(params: {
  staffName: string;
  date: string;
  serviceName: string;
  appointmentId: number;
}): Promise<AvailableSlot[]> {
  const { staffName, date, serviceName } = params;

  if (!staffName || !date || !serviceName) {
    return Promise.resolve([]);
  }

  // Mock behavior for demo:
  // - some days have no availability
  // - different staff give different hours
  const day = new Date(date).getDay(); // 0=Sun

  if (day === 0) {
    return Promise.resolve([]); // Sunday closed in mock
  }

  if (staffName === "John Smith") {
    if (date.endsWith("-19")) return Promise.resolve([]);
    if (serviceName === "Color") {
      return Promise.resolve([
        { start: "09:00", end: "11:00" },
        { start: "12:00", end: "14:00" },
        { start: "15:00", end: "17:00" },
      ]);
    }
    return Promise.resolve([
      { start: "09:00", end: "10:00" },
      { start: "09:30", end: "10:30" },
      { start: "10:00", end: "11:00" },
      { start: "11:00", end: "12:00" },
      { start: "13:00", end: "14:00" },
      { start: "16:00", end: "17:00" },
    ]);
  }

  if (staffName === "Anna Peter") {
    if (serviceName === "Color") {
      return Promise.resolve([
        { start: "10:00", end: "12:00" },
        { start: "13:00", end: "15:00" },
      ]);
    }
    return Promise.resolve([
      { start: "10:00", end: "11:00" },
      { start: "10:30", end: "11:30" },
      { start: "12:00", end: "13:00" },
      { start: "14:00", end: "15:00" },
    ]);
  }

  return Promise.resolve([
    { start: "12:00", end: "13:00" },
    { start: "13:00", end: "14:00" },
    { start: "15:30", end: "16:30" },
  ]);
}

/* ========================================================= */

export default function EditAppointmentModal({
  appointment,
  role,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<Appointment>({ ...appointment });

  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const isCustomer = role === "customer";

  const permissions = useMemo(
    () => ({
      canEditClient: isOwner,
      canEditStaff: isOwner || isStaff || isCustomer,
      canEditService: isOwner || isStaff || isCustomer,
      canEditDate: isOwner || isStaff || isCustomer,
      canEditTime: isOwner || isStaff || isCustomer,
      canEditStatus: isOwner || isStaff,
      canEditNotes: isOwner || isStaff || isCustomer,
    }),
    [isOwner, isStaff, isCustomer]
  );

  const selectedService = useMemo(
    () => serviceOptions.find((service) => service.name === form.service) || null,
    [serviceOptions, form.service]
  );

  const selectedStartSlot = useMemo(
    () => availableSlots.find((slot) => slot.start === form.time) || null,
    [availableSlots, form.time]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialOptions() {
      try {
        setIsLoadingOptions(true);
        setErrorMessage("");

        const [staff, services] = await Promise.all([
          fetchStaffOptions(),
          fetchServiceOptions(),
        ]);

        if (cancelled) return;

        setStaffOptions(staff);
        setServiceOptions(services);

        const serviceStillExists = services.some((s) => s.name === form.service);
        if (!serviceStillExists && services.length > 0) {
          const firstService = services[0];
          setForm((prev) => ({
            ...prev,
            service: firstService.name,
          }));
        }

        const staffStillExists = staff.some((s) => s.name === form.staff);
        if (!staffStillExists && staff.length > 0) {
          const firstStaff = staff[0];
          setForm((prev) => ({
            ...prev,
            staff: firstStaff.name,
          }));
        }
      } catch (error) {
        console.error("Failed to load edit modal options", error);
        if (!cancelled) {
          setErrorMessage("Failed to load form options.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    }

    loadInitialOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailableSlots() {
      if (!form.staff || !form.date || !form.service) {
        setAvailableSlots([]);
        return;
      }

      try {
        setIsLoadingSlots(true);
        setErrorMessage("");

        const slots = await fetchAvailableSlots({
          staffName: form.staff,
          date: form.date,
          serviceName: form.service,
          appointmentId: form.id,
        });

        if (cancelled) return;

        setAvailableSlots(slots);

        const currentStartStillValid = slots.some((slot) => slot.start === form.time);

        if (currentStartStillValid) {
          const matchingSlot = slots.find((slot) => slot.start === form.time);
          setForm((prev) => ({
            ...prev,
            endTime: matchingSlot ? matchingSlot.end : prev.endTime,
          }));
        } else if (slots.length > 0) {
          setForm((prev) => ({
            ...prev,
            time: slots[0].start,
            endTime: slots[0].end,
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            time: "",
            endTime: "",
          }));
        }
      } catch (error) {
        console.error("Failed to load available slots", error);
        if (!cancelled) {
          setAvailableSlots([]);
          setErrorMessage("Failed to load available time slots.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadAvailableSlots();

    return () => {
      cancelled = true;
    };
  }, [form.staff, form.date, form.service, form.id]);

  function handleChange<K extends keyof Appointment>(field: K, value: Appointment[K]) {
    setErrorMessage("");
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTimeChange(startTime: string) {
    const matchingSlot = availableSlots.find((slot) => slot.start === startTime);

    setErrorMessage("");
    setForm((prev) => ({
      ...prev,
      time: startTime,
      endTime: matchingSlot ? matchingSlot.end : "",
    }));
  }

  function handleSubmit() {
    if (!form.date) {
      setErrorMessage("Please select a date.");
      return;
    }

    if (!form.time) {
      setErrorMessage("Please select an available time slot.");
      return;
    }

    const isValidSlot = availableSlots.some((slot) => slot.start === form.time);
    if (!isValidSlot) {
      setErrorMessage("Please select a valid available time slot.");
      return;
    }

    onSave({
      ...form,
      endTime: selectedStartSlot ? selectedStartSlot.end : form.endTime,
    });
    onClose();
  }

  const noAvailabilityMessage =
    !isLoadingSlots && form.date && availableSlots.length === 0
      ? "No available time slots for the selected staff/date/service."
      : "";

  return (
    <div className="calendar-modal-overlay">
      <div className="calendar-modal">
        <div className="calendar-modal-header">
          <h2 className="calendar-modal-title">Edit Appointment</h2>
          <button
            type="button"
            className="calendar-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="calendar-modal-body">
          {isLoadingOptions ? (
            <div className="calendar-form-message">Loading form options...</div>
          ) : (
            <div className="calendar-modal-grid">
              <div className="calendar-field">
                <label className="calendar-field-label">Client</label>
                <input
                  className="calendar-field-input"
                  value={form.client}
                  onChange={(e) => handleChange("client", e.target.value)}
                  disabled={!permissions.canEditClient}
                />
              </div>

              <div className="calendar-field">
                <label className="calendar-field-label">Staff</label>
                <select
                  className="calendar-field-input"
                  value={form.staff}
                  onChange={(e) => handleChange("staff", e.target.value)}
                  disabled={!permissions.canEditStaff}
                >
                  {staffOptions.map((staff) => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="calendar-field">
                <label className="calendar-field-label">Service</label>
                <select
                  className="calendar-field-input"
                  value={form.service}
                  onChange={(e) => handleChange("service", e.target.value)}
                  disabled={!permissions.canEditService}
                >
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {selectedService && (
                  <div className="calendar-field-hint">
                    Duration: {selectedService.durationMinutes} min
                  </div>
                )}
              </div>

              <div className="calendar-field">
                <label className="calendar-field-label">Status</label>
                <select
                  className="calendar-field-input"
                  value={form.status}
                  onChange={(e) =>
                    handleChange("status", e.target.value as AppointmentStatus)
                  }
                  disabled={!permissions.canEditStatus}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="calendar-field">
                <label className="calendar-field-label">Date</label>
                <input
                  className="calendar-field-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  disabled={!permissions.canEditDate}
                />
              </div>

              <div className="calendar-field calendar-field--time-row">
                <div>
                  <label className="calendar-field-label">Start</label>
                  <select
                    className="calendar-field-input"
                    value={form.time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    disabled={!permissions.canEditTime || isLoadingSlots || availableSlots.length === 0}
                  >
                    {isLoadingSlots ? (
                      <option value="">Loading slots...</option>
                    ) : availableSlots.length === 0 ? (
                      <option value="">No available slots</option>
                    ) : (
                      availableSlots.map((slot) => (
                        <option key={slot.start} value={slot.start}>
                          {slot.start}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="calendar-field-label">End</label>
                  <input
                    className="calendar-field-input"
                    type="time"
                    value={form.endTime}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="calendar-field calendar-field--full">
                <label className="calendar-field-label">Notes</label>
                <textarea
                  className="calendar-field-input calendar-field-textarea"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  disabled={!permissions.canEditNotes}
                  placeholder="Write appointment notes"
                />
              </div>
            </div>
          )}

          {noAvailabilityMessage && (
            <div className="calendar-form-message calendar-form-message--warning">
              {noAvailabilityMessage}
            </div>
          )}

          {errorMessage && (
            <div className="calendar-form-message calendar-form-message--error">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="calendar-modal-actions">
          <button
            type="button"
            className="calendar-btn-ghost"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="calendar-btn-primary"
            onClick={handleSubmit}
            disabled={isLoadingOptions || isLoadingSlots || !form.time || availableSlots.length === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}