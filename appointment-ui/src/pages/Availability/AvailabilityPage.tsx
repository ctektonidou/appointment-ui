import { useEffect, useMemo, useState } from "react";
import "./AvailabilityPage.css";

type UserRole = "owner" | "staff" | "customer";
type AvailabilityTopTab = "businessHours" | "availability" | "blockedDays";
type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type TimeRange = {
  id: number;
  from: string;
  to: string;
};

type StaffAvailability = {
  staffId: number;
  staffName: string;
  enabled: boolean;
  ranges: TimeRange[];
};

type BusinessHoursDay = {
  day: DayKey;
  label: string;
  enabled: boolean;
  from: string;
  to: string;
};

type BlockedDate = {
  id: number;
  date: string; // yyyy-mm-dd
  reason: string;
};

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_LABELS: Record<DayKey, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

function getStoredUserId(): number | null {
  const storedUserId = localStorage.getItem("userId");
  if (!storedUserId) return null;

  const parsed = Number(storedUserId);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildTimeOptions(startHour = 8, endHour = 21, stepMinutes = 30): string[] {
  const out: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === endHour && m > 0) continue;
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
}

const TIME_OPTIONS = buildTimeOptions(8, 21, 30);

function newId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBlockedTableDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}

function getMonthName(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, monthIndex: number) {
  const jsDay = new Date(year, monthIndex, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDateString(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

// Demo staff list
const BASE_STAFF: StaffAvailability[] = [
  { staffId: 1, staffName: "Josh Smith", enabled: true, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 2, staffName: "Anna Peter", enabled: true, ranges: [{ id: 1, from: "10:00", to: "18:00" }] },
  { staffId: 3, staffName: "Smith Green", enabled: true, ranges: [{ id: 1, from: "09:00", to: "15:00" }] },
  { staffId: 4, staffName: "Lena Nock", enabled: true, ranges: [{ id: 1, from: "12:00", to: "20:00" }] },
  { staffId: 5, staffName: "Finn Miam", enabled: false, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 6, staffName: "Liam Payne", enabled: true, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 7, staffName: "Louis Tim", enabled: false, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
];

function cloneStaffList(source: StaffAvailability[]) {
  return source.map((s) => ({
    ...s,
    ranges: s.ranges.map((r) => ({ ...r, id: newId() })),
  }));
}

export default function AvailabilityPage() {
  const role = getStoredUserRole();
  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const loggedInStaffId = getStoredUserId();

  const [topTab, setTopTab] = useState<AvailabilityTopTab>(
    isStaff ? "availability" : "businessHours"
  );
  const [dayTab, setDayTab] = useState<DayKey>("Mon");

  function canEditStaffRow(staffId: number) {
    if (isOwner) return true;
    if (isStaff) return staffId === loggedInStaffId;
    return false;
  }

  useEffect(() => {
    if (isStaff && topTab !== "availability") {
      setTopTab("availability");
    }
  }, [isStaff, topTab]);

  const [businessHours, setBusinessHours] = useState<BusinessHoursDay[]>([
    { day: "Mon", label: "Monday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Tue", label: "Tuesday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Wed", label: "Wednesday", enabled: false, from: "09:00", to: "17:00" },
    { day: "Thu", label: "Thursday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Fri", label: "Friday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Sat", label: "Saturday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Sun", label: "Sunday", enabled: false, from: "09:00", to: "17:00" },
  ]);

  function toggleBusinessDay(day: DayKey) {
    if (!isOwner) return;

    setBusinessHours((prev) =>
      prev.map((d) => (d.day === day ? { ...d, enabled: !d.enabled } : d))
    );
  }

  function updateBusinessHours(day: DayKey, field: "from" | "to", value: string) {
    if (!isOwner) return;

    setBusinessHours((prev) =>
      prev.map((d) => (d.day === day ? { ...d, [field]: value } : d))
    );
  }

  const [staffAvailabilityByDay, setStaffAvailabilityByDay] = useState<Record<DayKey, StaffAvailability[]>>({
    Mon: cloneStaffList(BASE_STAFF),
    Tue: cloneStaffList(BASE_STAFF),
    Wed: cloneStaffList(BASE_STAFF),
    Thu: cloneStaffList(BASE_STAFF),
    Fri: cloneStaffList(BASE_STAFF),
    Sat: cloneStaffList(BASE_STAFF),
    Sun: cloneStaffList(BASE_STAFF),
  });

  const staffAvailability = staffAvailabilityByDay[dayTab];

  function toggleStaffEnabled(staffId: number) {
    if (!canEditStaffRow(staffId)) return;

    setStaffAvailabilityByDay((prev) => ({
      ...prev,
      [dayTab]: prev[dayTab].map((s) =>
        s.staffId === staffId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  }

  function addRange(staffId: number) {
    if (!canEditStaffRow(staffId)) return;

    setStaffAvailabilityByDay((prev) => ({
      ...prev,
      [dayTab]: prev[dayTab].map((s) =>
        s.staffId === staffId
          ? {
              ...s,
              ranges: [...s.ranges, { id: newId(), from: "09:00", to: "17:00" }],
            }
          : s
      ),
    }));
  }

  function removeRange(staffId: number, rangeId: number) {
    if (!canEditStaffRow(staffId)) return;

    setStaffAvailabilityByDay((prev) => ({
      ...prev,
      [dayTab]: prev[dayTab].map((s) =>
        s.staffId === staffId
          ? { ...s, ranges: s.ranges.filter((r) => r.id !== rangeId) }
          : s
      ),
    }));
  }

  function updateRange(
    staffId: number,
    rangeId: number,
    field: "from" | "to",
    value: string
  ) {
    if (!canEditStaffRow(staffId)) return;

    setStaffAvailabilityByDay((prev) => ({
      ...prev,
      [dayTab]: prev[dayTab].map((s) =>
        s.staffId === staffId
          ? {
              ...s,
              ranges: s.ranges.map((r) =>
                r.id === rangeId ? { ...r, [field]: value } : r
              ),
            }
          : s
      ),
    }));
  }

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([
    { id: 1, date: "2025-12-26", reason: "Christmas 2nd day" },
    { id: 2, date: "2025-12-25", reason: "Christmas 1st day" },
    { id: 3, date: "2026-01-01", reason: "New Year" },
    { id: 4, date: "2025-09-10", reason: "" },
    { id: 5, date: "2025-09-21", reason: "" },
  ]);

  const [calendarYear, setCalendarYear] = useState(2025);
  const [calendarMonth, setCalendarMonth] = useState(8); // September
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const [isAddBlockedModalOpen, setIsAddBlockedModalOpen] = useState(false);
  const [isDeleteBlockedModalOpen, setIsDeleteBlockedModalOpen] = useState(false);
  const [blockedDateToDelete, setBlockedDateToDelete] = useState<BlockedDate | null>(null);

  const [modalBlockedDay, setModalBlockedDay] = useState("");
  const [modalBlockedMonth, setModalBlockedMonth] = useState("");
  const [modalBlockedReason, setModalBlockedReason] = useState("");

  function openAddBlockedModal() {
    if (!isOwner) return;

    setModalBlockedDay("");
    setModalBlockedMonth(String(calendarMonth));
    setModalBlockedReason("");
    setIsAddBlockedModalOpen(true);
  }

  function closeAddBlockedModal() {
    setIsAddBlockedModalOpen(false);
  }

  function addBlockedDate() {
    if (!isOwner) return;
    if (!modalBlockedDay || modalBlockedMonth === "") return;

    const monthIndex = Number(modalBlockedMonth);
    const day = Number(modalBlockedDay);

    if (Number.isNaN(monthIndex) || Number.isNaN(day)) return;

    const dateStr = toDateString(calendarYear, monthIndex, day);

    const newItem: BlockedDate = {
      id: newId(),
      date: dateStr,
      reason: modalBlockedReason.trim(),
    };

    setBlockedDates((prev) => [...prev, newItem].sort((a, b) => a.date.localeCompare(b.date)));
    setCalendarMonth(monthIndex);
    setSelectedCalendarDate(dateStr);
    closeAddBlockedModal();
  }

  function askDeleteBlockedDate(item: BlockedDate) {
    if (!isOwner) return;

    setBlockedDateToDelete(item);
    setIsDeleteBlockedModalOpen(true);
  }

  function closeDeleteBlockedModal() {
    setBlockedDateToDelete(null);
    setIsDeleteBlockedModalOpen(false);
  }

  function confirmDeleteBlockedDate() {
    if (!isOwner || !blockedDateToDelete) return;

    setBlockedDates((prev) => prev.filter((item) => item.id !== blockedDateToDelete.id));

    if (selectedCalendarDate === blockedDateToDelete.date) {
      setSelectedCalendarDate(null);
    }

    closeDeleteBlockedModal();
  }

  function goToPreviousMonth() {
    if (!isOwner) return;

    setSelectedCalendarDate(null);
    setCalendarMonth((prev) => {
      if (prev === 0) {
        setCalendarYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }

  function goToNextMonth() {
    if (!isOwner) return;

    setSelectedCalendarDate(null);
    setCalendarMonth((prev) => {
      if (prev === 11) {
        setCalendarYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }

  const blockedDatesForSelectedMonth = blockedDates.filter((item) => {
    const d = new Date(item.date);
    return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth;
  });

  const blockedDatesForSelectedDay = selectedCalendarDate
    ? blockedDates.filter((item) => item.date === selectedCalendarDate)
    : [];

  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDayOffset = getFirstDayOfMonth(calendarYear, calendarMonth);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: new Date(2025, i, 1).toLocaleDateString("en-GB", { month: "long" }),
  }));

  const dayOptions =
    modalBlockedMonth !== ""
      ? Array.from(
          { length: getDaysInMonth(calendarYear, Number(modalBlockedMonth)) },
          (_, i) => i + 1
        )
      : [];

  const blockedDateMap = new Set(
    blockedDatesForSelectedMonth.map((item) => Number(item.date.slice(8, 10)))
  );

  function onSaveChanges() {
    console.log("SAVE", {
      topTab,
      businessHours,
      dayTab,
      staffAvailabilityByDay,
      blockedDates,
    });
    alert("Saved (demo) ✅");
  }

  const headerTitle = useMemo(() => "Availability", []);

  if (!isOwner && !isStaff) {
    return (
      <div className="availability-page">
        <h1>Availability</h1>
        <p>Not allowed.</p>
      </div>
    );
  }

  const blockedRowsToShow = selectedCalendarDate
    ? blockedDatesForSelectedDay
    : blockedDatesForSelectedMonth;

  return (
    <div className="availability-page">
      <h1 className="availability-title">{headerTitle}</h1>

      <div className="availability-top-tabs">
        {isOwner && (
          <button
            type="button"
            className={
              topTab === "businessHours"
                ? "availability-top-tab availability-top-tab--active"
                : "availability-top-tab"
            }
            onClick={() => setTopTab("businessHours")}
          >
            Business Hours
          </button>
        )}

        <button
          type="button"
          className={
            topTab === "availability"
              ? "availability-top-tab availability-top-tab--active"
              : "availability-top-tab"
          }
          onClick={() => setTopTab("availability")}
        >
          Availability
        </button>

        {isOwner && (
          <button
            type="button"
            className={
              topTab === "blockedDays"
                ? "availability-top-tab availability-top-tab--active"
                : "availability-top-tab"
            }
            onClick={() => setTopTab("blockedDays")}
          >
            Blocked Days
          </button>
        )}
      </div>

      <section className="availability-card">
        {isOwner && topTab === "businessHours" && (
          <>
            <div className="availability-grid-header availability-grid-header--business-hours">
              <div className="availability-col availability-col--staff" />
              <div className="availability-col availability-col--toggle" />
              <div className="availability-col availability-col--from">FROM</div>
              <div className="availability-col availability-col--to">TO</div>
            </div>

            <div className="availability-rows">
              {businessHours.map((day) => (
                <div key={day.day} className="availability-row availability-row--business-hours">
                  <div className="availability-staff-name">{day.label}</div>

                  <div className="availability-toggle">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={() => toggleBusinessDay(day.day)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div className="availability-range availability-range--business-hours">
                    <select
                      className="availability-select"
                      value={day.from}
                      disabled={!day.enabled}
                      onChange={(e) => updateBusinessHours(day.day, "from", e.target.value)}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <select
                      className="availability-select"
                      value={day.to}
                      disabled={!day.enabled}
                      onChange={(e) => updateBusinessHours(day.day, "to", e.target.value)}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {topTab === "availability" && (
          <>
            <div className="availability-day-tabs">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={
                    dayTab === d
                      ? "availability-day-tab availability-day-tab--active"
                      : "availability-day-tab"
                  }
                  onClick={() => setDayTab(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="availability-grid-header">
              <div className="availability-col availability-col--staff">STAFF</div>
              <div className="availability-col availability-col--toggle" />
              <div className="availability-col availability-col--from">FROM</div>
              <div className="availability-col availability-col--to">TO</div>
              <div className="availability-col availability-col--actions" />
            </div>

            <div className="availability-rows">
              {staffAvailability.map((s) => {
                const rowEditable = canEditStaffRow(s.staffId);

                return (
                  <div
                    key={s.staffId}
                    className={
                      rowEditable
                        ? "availability-row"
                        : "availability-row availability-row--disabled"
                    }
                  >
                    <div className="availability-staff-name">
                      {s.staffName}
                      {isStaff && s.staffId === loggedInStaffId && (
                        <span className="availability-me-badge">You</span>
                      )}
                    </div>

                    <div className="availability-toggle">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={s.enabled}
                          disabled={!rowEditable}
                          onChange={() => toggleStaffEnabled(s.staffId)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>

                    <div className="availability-ranges">
                      {s.ranges.map((r, idx) => (
                        <div key={r.id} className="availability-range">
                          <select
                            className="availability-select"
                            value={r.from}
                            disabled={!s.enabled || !rowEditable}
                            onChange={(e) => updateRange(s.staffId, r.id, "from", e.target.value)}
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>

                          <select
                            className="availability-select"
                            value={r.to}
                            disabled={!s.enabled || !rowEditable}
                            onChange={(e) => updateRange(s.staffId, r.id, "to", e.target.value)}
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>

                          {s.ranges.length > 1 && (
                            <button
                              type="button"
                              className="availability-icon-btn availability-icon-btn--danger"
                              title="Remove"
                              onClick={() => removeRange(s.staffId, r.id)}
                              disabled={!rowEditable}
                            >
                              🗑
                            </button>
                          )}

                          {idx === s.ranges.length - 1 && (
                            <button
                              type="button"
                              className="availability-icon-btn"
                              title="Add"
                              onClick={() => addRange(s.staffId)}
                              disabled={!s.enabled || !rowEditable}
                            >
                              +
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {isOwner && topTab === "blockedDays" && (
          <>
            <div className="blocked-top">
              <div className="blocked-month-switch">
                <button type="button" className="month-nav-btn" onClick={goToPreviousMonth}>
                  ‹
                </button>

                <div className="blocked-month-title">
                  {getMonthName(calendarYear, calendarMonth)}
                </div>

                <button type="button" className="month-nav-btn" onClick={goToNextMonth}>
                  ›
                </button>
              </div>
            </div>

            <div className="blocked-layout">
              <div className="blocked-calendar">
                <div className="blocked-weekdays">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                    <div key={`${day}-${idx}`} className="blocked-weekday">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="blocked-days-grid">
                  {Array.from({ length: firstDayOffset }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="blocked-day-cell blocked-day-cell--empty"
                    />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, idx) => {
                    const day = idx + 1;
                    const dateStr = toDateString(calendarYear, calendarMonth, day);
                    const isSelected = selectedCalendarDate === dateStr;
                    const hasBlockedDate = blockedDateMap.has(day);

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        className={[
                          "blocked-day-cell",
                          isSelected ? "blocked-day-cell--selected" : "",
                          hasBlockedDate ? "blocked-day-cell--has" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="blocked-table-wrapper">
                <div className="blocked-section-head">
                  <div className="blocked-section-title">Blocked Days</div>

                  <button
                    type="button"
                    className="availability-btn-link"
                    onClick={openAddBlockedModal}
                  >
                    Add Date
                  </button>
                </div>

                <table className="blocked-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reason</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {blockedRowsToShow.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="blocked-empty-cell">
                          No blocked dates found.
                        </td>
                      </tr>
                    ) : (
                      blockedRowsToShow.map((item) => (
                        <tr key={item.id}>
                          <td>{formatBlockedTableDate(item.date)}</td>
                          <td>{item.reason || "-"}</td>
                          <td className="blocked-actions-cell">
                            <button
                              type="button"
                              className="blocked-delete-icon-btn"
                              onClick={() => askDeleteBlockedDate(item)}
                              title="Delete"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {isAddBlockedModalOpen && (
              <div className="blocked-modal-overlay">
                <div className="blocked-modal">
                  <div className="blocked-modal-header">
                    <div className="blocked-modal-title">Add Blocked Date</div>
                    <button
                      type="button"
                      className="blocked-modal-close"
                      onClick={closeAddBlockedModal}
                    >
                      ×
                    </button>
                  </div>

                  <div className="blocked-modal-body">
                    <div className="blocked-modal-row">
                      <div className="blocked-modal-field">
                        <label className="blocked-modal-label">Day</label>
                        <select
                          className="blocked-modal-input"
                          value={modalBlockedDay}
                          onChange={(e) => setModalBlockedDay(e.target.value)}
                        >
                          <option value="">Select day</option>
                          {dayOptions.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="blocked-modal-field">
                        <label className="blocked-modal-label">Month</label>
                        <select
                          className="blocked-modal-input"
                          value={modalBlockedMonth}
                          onChange={(e) => {
                            setModalBlockedMonth(e.target.value);
                            setModalBlockedDay("");
                          }}
                        >
                          <option value="">Select month</option>
                          {monthOptions.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="blocked-modal-row">
                      <div className="blocked-modal-field blocked-modal-field--full">
                        <label className="blocked-modal-label">Reason</label>
                        <input
                          className="blocked-modal-input"
                          type="text"
                          value={modalBlockedReason}
                          onChange={(e) => setModalBlockedReason(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="blocked-modal-actions">
                    <button
                      type="button"
                      className="blocked-modal-primary-btn"
                      onClick={addBlockedDate}
                      disabled={!modalBlockedDay || modalBlockedMonth === ""}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      className="blocked-modal-secondary-btn"
                      onClick={closeAddBlockedModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isDeleteBlockedModalOpen && blockedDateToDelete && (
              <div className="blocked-modal-overlay">
                <div className="blocked-modal blocked-modal--delete">
                  <div className="blocked-modal-header">
                    <div className="blocked-modal-title">Delete Blocked Date</div>
                    <button
                      type="button"
                      className="blocked-modal-close"
                      onClick={closeDeleteBlockedModal}
                    >
                      ×
                    </button>
                  </div>

                  <div className="blocked-delete-content">
                    <div className="blocked-delete-icon">🗑</div>
                    <div className="blocked-delete-text">
                      Are you sure you would like to delete blocked date "
                      {formatBlockedTableDate(blockedDateToDelete.date)}"?
                    </div>
                  </div>

                  <div className="blocked-modal-actions blocked-modal-actions--center">
                    <button
                      type="button"
                      className="blocked-modal-primary-btn"
                      onClick={confirmDeleteBlockedDate}
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      className="blocked-modal-secondary-btn"
                      onClick={closeDeleteBlockedModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <div className="availability-footer">
        <button type="button" className="availability-save" onClick={onSaveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}