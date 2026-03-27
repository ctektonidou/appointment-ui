import type { DayKey, StaffAvailability } from "../Availability.types";
import { TIME_OPTIONS } from "../Availability.utils";

type Props = {
  days: DayKey[];
  dayTab: DayKey;
  onChangeDayTab: (day: DayKey) => void;
  staffAvailability: StaffAvailability[];
  isStaff: boolean;
  loggedInStaffId: number | null;
  canEditStaffRow: (staffId: number) => boolean;
  onToggleStaffEnabled: (staffId: number) => void;
  onAddRange: (staffId: number) => void;
  onRemoveRange: (staffId: number, rangeId: number) => void;
  onUpdateRange: (
    staffId: number,
    rangeId: number,
    field: "from" | "to",
    value: string
  ) => void;
};

export default function WeeklyAvailabilityTab({
  days,
  dayTab,
  onChangeDayTab,
  staffAvailability,
  isStaff,
  loggedInStaffId,
  canEditStaffRow,
  onToggleStaffEnabled,
  onAddRange,
  onRemoveRange,
  onUpdateRange,
}: Props) {
  return (
    <>
      <div className="availability-day-tabs">
        {days.map((d) => (
          <button
            key={d}
            type="button"
            className={
              dayTab === d
                ? "availability-day-tab availability-day-tab--active"
                : "availability-day-tab"
            }
            onClick={() => onChangeDayTab(d)}
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
                    onChange={() => onToggleStaffEnabled(s.staffId)}
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
                      onChange={(e) =>
                        onUpdateRange(s.staffId, r.id, "from", e.target.value)
                      }
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
                      onChange={(e) =>
                        onUpdateRange(s.staffId, r.id, "to", e.target.value)
                      }
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
                        onClick={() => onRemoveRange(s.staffId, r.id)}
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
                        onClick={() => onAddRange(s.staffId)}
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
  );
}