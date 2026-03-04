import { useMemo, useState } from "react";
import "./AvailabilityPage.css";

type UserRole = "owner" | "staff" | "customer";
const CURRENT_ROLE: UserRole = "staff"; // TODO: replace with auth/context

type AvailabilityTopTab = "businessHours" | "availability" | "blockedDays";
type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type TimeRange = {
  id: number;
  from: string; // "09:00"
  to: string;   // "17:00"
};

type StaffAvailability = {
  staffId: number;
  staffName: string;
  enabled: boolean;
  ranges: TimeRange[];
};

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

// Demo staff list (later: fetch from API)
const BASE_STAFF: StaffAvailability[] = [
  { staffId: 1, staffName: "Josh Smith", enabled: true, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 2, staffName: "Anna Peter", enabled: true, ranges: [{ id: 1, from: "10:00", to: "18:00" }] },
  { staffId: 3, staffName: "Smith Green", enabled: true, ranges: [{ id: 1, from: "09:00", to: "15:00" }] },
  { staffId: 4, staffName: "Lena Nock", enabled: true, ranges: [{ id: 1, from: "12:00", to: "20:00" }] },
  { staffId: 5, staffName: "Finn Miam", enabled: false, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 6, staffName: "Liam Payne", enabled: true, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 7, staffName: "Louis Tim", enabled: false, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
];

// Clone helpers so each day is independent
function cloneStaffList(source: StaffAvailability[]) {
  return source.map((s) => ({
    ...s,
    ranges: s.ranges.map((r) => ({ ...r, id: newId() })),
  }));
}

export default function AvailabilityPage() {
  const role = CURRENT_ROLE;
  const isOwner = role === "owner";
  const isStaff = role === "staff";

  // Top tabs (same for owner/staff; customer likely won't access)
  const [topTab, setTopTab] = useState<AvailabilityTopTab>("availability");

  // Day tabs inside Availability
  const [dayTab, setDayTab] = useState<DayKey>("Mon");

  // ✅ FIX: availability state is stored per-day
  const [staffAvailabilityByDay, setStaffAvailabilityByDay] = useState<Record<DayKey, StaffAvailability[]>>({
    Mon: cloneStaffList(BASE_STAFF),
    Tue: cloneStaffList(BASE_STAFF),
    Wed: cloneStaffList(BASE_STAFF),
    Thu: cloneStaffList(BASE_STAFF),
    Fri: cloneStaffList(BASE_STAFF),
    Sat: cloneStaffList(BASE_STAFF),
    Sun: cloneStaffList(BASE_STAFF),
  });

  // Convenience: current day list
  const staffAvailability = staffAvailabilityByDay[dayTab];

  // ---------- handlers (always update the active day) ----------
  function toggleStaffEnabled(staffId: number) {
    setStaffAvailabilityByDay((prev) => ({
      ...prev,
      [dayTab]: prev[dayTab].map((s) =>
        s.staffId === staffId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  }

  function addRange(staffId: number) {
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

  function onSaveChanges() {
    // TODO: call API with staffAvailabilityByDay (or only current day)
    console.log("SAVE", { topTab, dayTab, staffAvailabilityByDay });
    alert("Saved (demo) ✅");
  }

  // Label in header (optional)
  const headerTitle = useMemo(() => {
    if (topTab === "businessHours") return "Availability";
    if (topTab === "availability") return "Availability";
    return "Availability";
  }, [topTab]);

  // Guard: customer should not see this page (optional)
  if (!isOwner && !isStaff) {
    return (
      <div className="availability-page">
        <h1>Availability</h1>
        <p>Not allowed.</p>
      </div>
    );
  }

  return (
    <div className="availability-page">
      <h1 className="availability-title">{headerTitle}</h1>

      {/* Top tabs */}
      <div className="availability-top-tabs">
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
      </div>

      {/* Content Card */}
      <section className="availability-card">
        {/* BUSINESS HOURS TAB (simple placeholder) */}
        {topTab === "businessHours" && (
          <div className="availability-placeholder">
            <div className="availability-placeholder-title">Business Hours</div>
            <div className="availability-placeholder-text">
              (We’ll implement this next — same layout style as your mock.)
            </div>
          </div>
        )}

        {/* AVAILABILITY TAB */}
        {topTab === "availability" && (
          <>
            {/* Day tabs */}
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

            {/* Grid header */}
            <div className="availability-grid-header">
              <div className="availability-col availability-col--staff">STAFF</div>
              <div className="availability-col availability-col--toggle" />
              <div className="availability-col availability-col--from">FROM</div>
              <div className="availability-col availability-col--to">TO</div>
              <div className="availability-col availability-col--actions" />
            </div>

            {/* Rows */}
            <div className="availability-rows">
              {staffAvailability.map((s) => (
                <div key={s.staffId} className="availability-row">
                  <div className="availability-staff-name">{s.staffName}</div>

                  <div className="availability-toggle">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={s.enabled}
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
                          disabled={!s.enabled}
                          onChange={(e) =>
                            updateRange(s.staffId, r.id, "from", e.target.value)
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
                          disabled={!s.enabled}
                          onChange={(e) =>
                            updateRange(s.staffId, r.id, "to", e.target.value)
                          }
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>

                        {/* remove range (only if more than 1) */}
                        {s.ranges.length > 1 && (
                          <button
                            type="button"
                            className="availability-icon-btn availability-icon-btn--danger"
                            title="Remove"
                            onClick={() => removeRange(s.staffId, r.id)}
                          >
                            🗑
                          </button>
                        )}

                        {/* add range only on last line */}
                        {idx === s.ranges.length - 1 && (
                          <button
                            type="button"
                            className="availability-icon-btn"
                            title="Add"
                            onClick={() => addRange(s.staffId)}
                            disabled={!s.enabled}
                          >
                            +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BLOCKED DAYS TAB (simple placeholder) */}
        {topTab === "blockedDays" && (
          <div className="availability-placeholder">
            <div className="availability-placeholder-title">Blocked Days</div>
            <div className="availability-placeholder-text">
              (We’ll implement calendar + table next.)
            </div>
          </div>
        )}
      </section>

      {/* Save button */}
      <div className="availability-footer">
        <button type="button" className="availability-save" onClick={onSaveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}