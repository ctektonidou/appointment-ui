import { useMemo, useState } from "react";
import "./BlockedDatesPage.css";

type UserRole = "owner" | "staff" | "customer";

type BlockedDate = {
  id: number;
  date: string; // yyyy-mm-dd
  reason: string;
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

function newId() {
  return Date.now() + Math.floor(Math.random() * 100000);
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

export default function BlockedDatesPage() {
  const role = getStoredUserRole();
  const isStaff = role === "staff";
  const loggedInStaffId = getStoredUserId();

  const today = new Date();

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([
    { id: 1, date: "2026-04-10", reason: "Vacation" },
    { id: 2, date: "2026-04-11", reason: "Vacation" },
    { id: 3, date: "2026-05-02", reason: "Personal leave" },
  ]);

  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const [isAddBlockedModalOpen, setIsAddBlockedModalOpen] = useState(false);
  const [isDeleteBlockedModalOpen, setIsDeleteBlockedModalOpen] = useState(false);
  const [blockedDateToDelete, setBlockedDateToDelete] = useState<BlockedDate | null>(null);

  const [modalBlockedDay, setModalBlockedDay] = useState("");
  const [modalBlockedMonth, setModalBlockedMonth] = useState(String(today.getMonth()));
  const [modalBlockedReason, setModalBlockedReason] = useState("");

  function openAddBlockedModal() {
    if (!isStaff) return;

    setModalBlockedDay("");
    setModalBlockedMonth(String(calendarMonth));
    setModalBlockedReason("");
    setIsAddBlockedModalOpen(true);
  }

  function closeAddBlockedModal() {
    setIsAddBlockedModalOpen(false);
  }

  function addBlockedDate() {
    if (!isStaff) return;
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

    setBlockedDates((prev) => {
      const alreadyExists = prev.some((item) => item.date === dateStr);
      if (alreadyExists) return prev;
      return [...prev, newItem].sort((a, b) => a.date.localeCompare(b.date));
    });

    setCalendarMonth(monthIndex);
    setSelectedCalendarDate(dateStr);
    closeAddBlockedModal();
  }

  function askDeleteBlockedDate(item: BlockedDate) {
    if (!isStaff) return;

    setBlockedDateToDelete(item);
    setIsDeleteBlockedModalOpen(true);
  }

  function closeDeleteBlockedModal() {
    setBlockedDateToDelete(null);
    setIsDeleteBlockedModalOpen(false);
  }

  function confirmDeleteBlockedDate() {
    if (!isStaff || !blockedDateToDelete) return;

    setBlockedDates((prev) => prev.filter((item) => item.id !== blockedDateToDelete.id));

    if (selectedCalendarDate === blockedDateToDelete.date) {
      setSelectedCalendarDate(null);
    }

    closeDeleteBlockedModal();
  }

  function goToPreviousMonth() {
    if (!isStaff) return;

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
    if (!isStaff) return;

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
    console.log("SAVE STAFF BLOCKED DATES", {
      staffId: loggedInStaffId,
      blockedDates,
    });
    alert("Vacation days saved (demo) ✅");
  }

  const headerTitle = useMemo(() => "My Vacation Days", []);

  if (!isStaff) {
    return (
      <div className="blocked-dates-page">
        <h1>My Vacation Days</h1>
        <p>Not allowed.</p>
      </div>
    );
  }

  const blockedRowsToShow = selectedCalendarDate
    ? blockedDatesForSelectedDay
    : blockedDatesForSelectedMonth;

  return (
    <div className="blocked-dates-page">
      <h1 className="availability-title">{headerTitle}</h1>

      <section className="availability-card">
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
              <div className="blocked-section-title">My Blocked Dates</div>

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
                <div className="blocked-modal-title">Add Vacation Day</div>
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
                      placeholder="Optional reason"
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
                <div className="blocked-modal-title">Delete Vacation Day</div>
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
      </section>

      <div className="availability-footer">
        <button type="button" className="availability-save" onClick={onSaveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}