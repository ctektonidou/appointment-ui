import { useEffect, useMemo, useState } from "react";
import "./EditAppointmentModal.css";

import { listStaff, type Staff } from "../../api/staff";
import { listServices, type Service } from "../../api/services";
import { getAvailableTimeSlots } from "../../api/appointments";

type UserRole = "owner" | "staff" | "customer";

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type Appointment = {
  id: number;
  businessId: number;
  serviceId: number;
  staffId: number;
  customerUserId: number | null;
  client: string;
  staff: string;
  service: string;
  date: string;
  time: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
  clientEmail?: string;
  clientPhone?: string;
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
  start: string;
  end: string;
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

function toStaffOption(staff: Staff): StaffOption {
  const fullName = `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim();

  return {
    id: staff.id,
    name: fullName || staff.email || `Staff #${staff.id}`,
  };
}

function toServiceOption(service: Service): ServiceOption {
  return {
    id: service.id,
    name: service.name,
    durationMinutes: service.durationMinutes,
  };
}

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const nextHours = Math.floor(totalMinutes / 60);
  const nextMinutes = totalMinutes % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

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
    () => serviceOptions.find((service) => service.id === form.serviceId) || null,
    [serviceOptions, form.serviceId]
  );

  const selectedStartSlot = useMemo(
    () => availableSlots.find((slot) => slot.start === form.time) || null,
    [availableSlots, form.time]
  );

  useEffect(() => {
    setForm({ ...appointment });
    setErrorMessage("");
  }, [appointment]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialOptions() {
      try {
        setIsLoadingOptions(true);
        setErrorMessage("");

        const [staff, services] = await Promise.all([
          listStaff(form.businessId, true),
          listServices(form.businessId, true),
        ]);

        if (cancelled) return;

        const mappedStaff = staff.map(toStaffOption);
        const mappedServices = services.map(toServiceOption);

        setStaffOptions(mappedStaff);
        setServiceOptions(mappedServices);

        const staffStillExists = mappedStaff.some((item) => item.id === form.staffId);
        if (!staffStillExists && mappedStaff.length > 0) {
          const firstStaff = mappedStaff[0];
          setForm((prev) => ({
            ...prev,
            staffId: firstStaff.id,
            staff: firstStaff.name,
          }));
        }

        const serviceStillExists = mappedServices.some(
          (item) => item.id === form.serviceId
        );
        if (!serviceStillExists && mappedServices.length > 0) {
          const firstService = mappedServices[0];
          setForm((prev) => ({
            ...prev,
            serviceId: firstService.id,
            service: firstService.name,
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
  }, [form.businessId]);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailableSlots() {
      if (!form.staffId || !form.date || !form.serviceId) {
        setAvailableSlots([]);
        return;
      }

      try {
        setIsLoadingSlots(true);
        setErrorMessage("");

        const slots = await getAvailableTimeSlots({
          businessId: form.businessId,
          serviceId: form.serviceId,
          staffId: form.staffId,
          date: form.date,
          appointmentId: form.id,
        });

        if (cancelled) return;

        const durationMinutes = selectedService?.durationMinutes ?? 0;

        const mappedSlots: AvailableSlot[] = slots.map((start) => ({
          start,
          end: addMinutesToTime(start, durationMinutes),
        }));

        setAvailableSlots(mappedSlots);

        const currentStartStillValid = mappedSlots.some(
          (slot) => slot.start === form.time
        );

        if (currentStartStillValid) {
          const matchingSlot = mappedSlots.find((slot) => slot.start === form.time);
          setForm((prev) => ({
            ...prev,
            endTime: matchingSlot ? matchingSlot.end : prev.endTime,
          }));
        } else if (mappedSlots.length > 0) {
          setForm((prev) => ({
            ...prev,
            time: mappedSlots[0].start,
            endTime: mappedSlots[0].end,
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
  }, [form.businessId, form.staffId, form.date, form.serviceId, selectedService?.durationMinutes]);

  function handleChange<K extends keyof Appointment>(field: K, value: Appointment[K]) {
    setErrorMessage("");
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleStaffChange(staffId: number) {
    const selected = staffOptions.find((staff) => staff.id === staffId);

    setErrorMessage("");
    setForm((prev) => ({
      ...prev,
      staffId,
      staff: selected?.name || prev.staff,
    }));
  }

  function handleServiceChange(serviceId: number) {
    const selected = serviceOptions.find((service) => service.id === serviceId);

    setErrorMessage("");
    setForm((prev) => ({
      ...prev,
      serviceId,
      service: selected?.name || prev.service,
    }));
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
                  value={form.staffId}
                  onChange={(e) => handleStaffChange(Number(e.target.value))}
                  disabled={!permissions.canEditStaff}
                >
                  {staffOptions.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="calendar-field">
                <label className="calendar-field-label">Service</label>
                <select
                  className="calendar-field-input"
                  value={form.serviceId}
                  onChange={(e) => handleServiceChange(Number(e.target.value))}
                  disabled={!permissions.canEditService}
                >
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.id}>
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
                    disabled={
                      !permissions.canEditTime ||
                      isLoadingSlots ||
                      availableSlots.length === 0
                    }
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