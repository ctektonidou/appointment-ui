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
  onUpdateTime: (
    staffId: number,
    field: "from" | "to",
    value: string
  ) => void;
  loading?: boolean;
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
  onUpdateTime,
  loading = false,
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
        {loading ? (
          <div className="blocked-empty-cell">Loading...</div>
        ) : staffAvailability.length === 0 ? (
          <div className="blocked-empty-cell">No staff found.</div>
        ) : (
          staffAvailability.map((s) => {
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

                <div>
                  <select
                    className="availability-select"
                    value={s.from}
                    disabled={!s.enabled || !rowEditable}
                    onChange={(e) =>
                      onUpdateTime(s.staffId, "from", e.target.value)
                    }
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    className="availability-select"
                    value={s.to}
                    disabled={!s.enabled || !rowEditable}
                    onChange={(e) =>
                      onUpdateTime(s.staffId, "to", e.target.value)
                    }
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div />
              </div>
            );
          })
        )}
      </div>
    </>
  );
}