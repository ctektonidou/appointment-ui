import type { BusinessHoursDay, DayKey } from "../Availability.types";
import { TIME_OPTIONS } from "../Availability.utils";

type Props = {
  businessHours: BusinessHoursDay[];
  loading?: boolean;
  saving?: boolean;
  error?: string;
  onToggleBusinessDay: (day: DayKey) => void;
  onUpdateBusinessHours: (day: DayKey, field: "from" | "to", value: string) => void;
};

export default function BusinessHoursTab({
  businessHours,
  loading = false,
  saving = false,
  error = "",
  onToggleBusinessDay,
  onUpdateBusinessHours,
}: Props) {
  return (
    <>
      <div className="availability-grid-header availability-grid-header--business-hours">
        <div className="availability-col availability-col--staff" />
        <div className="availability-col availability-col--toggle" />
        <div className="availability-col availability-col--from">FROM</div>
        <div className="availability-col availability-col--to">TO</div>
      </div>

      <div className="availability-rows">
        {loading ? (
          <div className="blocked-empty-cell">Loading...</div>
        ) : (
          businessHours.map((day) => (
            <div
              key={day.day}
              className="availability-row availability-row--business-hours"
            >
              <div className="availability-staff-name">{day.label}</div>

              <div className="availability-toggle">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    disabled={saving}
                    onChange={() => onToggleBusinessDay(day.day)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="availability-range availability-range--business-hours">
                <select
                  className="availability-select"
                  value={day.from}
                  disabled={!day.enabled || saving}
                  onChange={(e) =>
                    onUpdateBusinessHours(day.day, "from", e.target.value)
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
                  value={day.to}
                  disabled={!day.enabled || saving}
                  onChange={(e) =>
                    onUpdateBusinessHours(day.day, "to", e.target.value)
                  }
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}