import type { BlockedDate } from "../Availability.types";
import {
  formatBlockedTableDate,
  getMonthName,
  toDateString,
} from "../Availability.utils";

type MonthOption = {
  value: string;
  label: string;
};

type Props = {
  calendarYear: number;
  calendarMonth: number;
  selectedCalendarDate: string | null;
  blockedDateMap: Set<number>;
  daysInMonth: number;
  firstDayOffset: number;
  blockedRowsToShow: BlockedDate[];
  isAddBlockedModalOpen: boolean;
  isDeleteBlockedModalOpen: boolean;
  blockedDateToDelete: BlockedDate | null;
  modalBlockedDay: string;
  modalBlockedMonth: string;
  modalBlockedReason: string;
  monthOptions: MonthOption[];
  dayOptions: number[];
  loading?: boolean;
  saving?: boolean;
  error?: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectCalendarDate: (date: string) => void;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
  onAddBlockedDate: () => void;
  onAskDeleteBlockedDate: (item: BlockedDate) => void;
  onCloseDeleteModal: () => void;
  onConfirmDeleteBlockedDate: () => void;
  onChangeModalBlockedDay: (value: string) => void;
  onChangeModalBlockedMonth: (value: string) => void;
  onChangeModalBlockedReason: (value: string) => void;
};

export default function BlockedDaysTab({
  calendarYear,
  calendarMonth,
  selectedCalendarDate,
  blockedDateMap,
  daysInMonth,
  firstDayOffset,
  blockedRowsToShow,
  isAddBlockedModalOpen,
  isDeleteBlockedModalOpen,
  blockedDateToDelete,
  modalBlockedDay,
  modalBlockedMonth,
  modalBlockedReason,
  monthOptions,
  dayOptions,
  loading = false,
  saving = false,
  error = "",
  onPreviousMonth,
  onNextMonth,
  onSelectCalendarDate,
  onOpenAddModal,
  onCloseAddModal,
  onAddBlockedDate,
  onAskDeleteBlockedDate,
  onCloseDeleteModal,
  onConfirmDeleteBlockedDate,
  onChangeModalBlockedDay,
  onChangeModalBlockedMonth,
  onChangeModalBlockedReason,
}: Props) {
  return (
    <>
      {error && <div className="calendar-error">{error}</div>}

      <div className="blocked-top">
        <div className="blocked-month-switch">
          <button
            type="button"
            className="month-nav-btn"
            onClick={onPreviousMonth}
            disabled={saving}
          >
            ‹
          </button>

          <div className="blocked-month-title">
            {getMonthName(calendarYear, calendarMonth)}
          </div>

          <button
            type="button"
            className="month-nav-btn"
            onClick={onNextMonth}
            disabled={saving}
          >
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
                  onClick={() => onSelectCalendarDate(dateStr)}
                  disabled={saving}
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
              onClick={onOpenAddModal}
              disabled={saving}
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
              {loading ? (
                <tr>
                  <td colSpan={3} className="blocked-empty-cell">
                    Loading...
                  </td>
                </tr>
              ) : blockedRowsToShow.length === 0 ? (
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
                        onClick={() => onAskDeleteBlockedDate(item)}
                        title="Delete"
                        disabled={saving}
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
                onClick={onCloseAddModal}
                disabled={saving}
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
                    onChange={(e) => onChangeModalBlockedDay(e.target.value)}
                    disabled={saving}
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
                    onChange={(e) => onChangeModalBlockedMonth(e.target.value)}
                    disabled={saving}
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
                    onChange={(e) => onChangeModalBlockedReason(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="blocked-modal-actions">
              <button
                type="button"
                className="blocked-modal-primary-btn"
                onClick={onAddBlockedDate}
                disabled={saving || !modalBlockedDay || modalBlockedMonth === ""}
              >
                Save
              </button>

              <button
                type="button"
                className="blocked-modal-secondary-btn"
                onClick={onCloseAddModal}
                disabled={saving}
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
                onClick={onCloseDeleteModal}
                disabled={saving}
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
                onClick={onConfirmDeleteBlockedDate}
                disabled={saving}
              >
                Delete
              </button>

              <button
                type="button"
                className="blocked-modal-secondary-btn"
                onClick={onCloseDeleteModal}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}