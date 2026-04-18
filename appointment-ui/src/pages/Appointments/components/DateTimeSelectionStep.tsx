import type { StaffMember } from "../types/createAppointment.types";
import {
  buildMonthGrid,
  getMonthName,
  isSameDay,
} from "../utils/createAppointment.utils";

type DateTimeSelectionStepProps = {
  today: Date;
  selectedDate: Date | null;
  selectedTime: string;
  selectedStaffId: number | "";
  availableTimeSlots: string[];
  isLoadingSlots: boolean;
  staffMembers: StaffMember[];
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onStaffChange: (staffId: number | "") => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function DateTimeSelectionStep({
  today,
  selectedDate,
  selectedTime,
  selectedStaffId,
  availableTimeSlots,
  isLoadingSlots,
  staffMembers,
  onDateChange,
  onTimeChange,
  onStaffChange,
  onBack,
  onContinue,
}: DateTimeSelectionStepProps) {
  const visibleMonthDate = selectedDate ?? today;
  const calendarMonthIndex = visibleMonthDate.getMonth();
  const calendarYear = visibleMonthDate.getFullYear();
  const monthGrid = buildMonthGrid(calendarYear, calendarMonthIndex);

  return (
    <>
      <h2 className="create-appointment-section-title">Choose Date &amp; Time</h2>

      <div className="date-time-layout">
        <div className="date-time-left">
          <div className="simple-calendar">
            <div className="simple-calendar-header">
              <span>{getMonthName(visibleMonthDate)}</span>
              <span>{calendarYear}</span>
            </div>

            <div className="simple-calendar-weekdays">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="simple-calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="simple-calendar-grid">
              {monthGrid.map((cell, index) => {
                const cellDate =
                  cell === null ? null : new Date(calendarYear, calendarMonthIndex, cell);

                const isSelected = cellDate !== null && isSameDay(selectedDate, cellDate);
                const isToday = cellDate !== null && isSameDay(today, cellDate);

                return (
                  <button
                    key={`${cell}-${index}`}
                    type="button"
                    className={
                      cell === null
                        ? "simple-calendar-day simple-calendar-day--empty"
                        : isSelected
                        ? "simple-calendar-day simple-calendar-day--selected"
                        : isToday
                        ? "simple-calendar-day simple-calendar-day--today"
                        : "simple-calendar-day"
                    }
                    disabled={cell === null}
                    onClick={() => {
                      if (!cellDate) return;
                      onDateChange(cellDate);
                    }}
                  >
                    {cell ?? ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="select-time-section">
            <div className="select-time-title">Select Time</div>

            {!selectedStaffId && (
              <div className="create-appointment-empty">
                Select staff first to load available times.
              </div>
            )}

            {selectedStaffId && isLoadingSlots && (
              <div className="create-appointment-empty">Loading available times...</div>
            )}

            {selectedStaffId && !isLoadingSlots && availableTimeSlots.length === 0 && (
              <div className="create-appointment-empty">
                No available time slots for the selected date.
              </div>
            )}

            {selectedStaffId && !isLoadingSlots && availableTimeSlots.length > 0 && (
              <div className="time-slot-grid">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={
                      selectedTime === slot
                        ? "time-slot-btn time-slot-btn--selected"
                        : "time-slot-btn"
                    }
                    onClick={() => onTimeChange(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="date-time-right">
          <div className="create-appointment-field">
            <label className="create-appointment-label">Select Staff</label>
            <select
              className="create-appointment-select"
              value={selectedStaffId}
              onChange={(e) =>
                onStaffChange(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">Select staff</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="create-appointment-actions">
        <button
          type="button"
          className="create-appointment-secondary-btn"
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="create-appointment-primary-btn"
          onClick={onContinue}
          disabled={!selectedDate || !selectedTime || !selectedStaffId}
        >
          Continue
        </button>
      </div>
    </>
  );
}