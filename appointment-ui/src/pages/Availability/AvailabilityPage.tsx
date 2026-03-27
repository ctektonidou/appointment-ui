import { useEffect, useMemo, useState } from "react";
import "./AvailabilityPage.css";

import BusinessHoursTab from "./components/BusinessHoursTab";
import WeeklyAvailabilityTab from "./components/WeeklyAvailabilityTab";
import BlockedDaysTab from "./components/BlockedDaysTab";
import AvailabilityOverridesTab from "./components/AvailabilityOverridesTab";

import type {
  AvailabilityTopTab,
  BlockedDate,
  BusinessHoursDay,
  DayKey,
  StaffAvailability,
} from "./Availability.types";

import {
  BASE_STAFF,
  DAYS,
  cloneStaffList,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  getStoredUserId,
  getStoredUserRole,
  newId,
  toDateString,
} from "./Availability.utils";

import {
  createBusinessBlockedDate,
  deleteBusinessBlockedDate,
  getBusinessBlockedDates,
  type BlockedDateResponse,
} from "../../api/blockedDates";

import {
  getBusinessHours,
  saveBusinessHours,
  type BusinessHoursDto,
} from "../../api/businessHours";

function getStoredBusinessId(): number | null {
  const raw = localStorage.getItem("businessId");
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapBlockedDateResponse(item: BlockedDateResponse): BlockedDate {
  return {
    id: item.id,
    date: item.date,
    reason: item.reason ?? "",
  };
}

const DAY_TO_NUMBER: Record<DayKey, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

const NUMBER_TO_DAY: Record<number, DayKey> = {
  0: "Mon",
  1: "Tue",
  2: "Wed",
  3: "Thu",
  4: "Fri",
  5: "Sat",
  6: "Sun",
};

const DAY_LABELS: Record<DayKey, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function normalizeTime(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  return value.slice(0, 5);
}

function mapBusinessHoursDtoToUi(dto: BusinessHoursDto): BusinessHoursDay {
  const dayKey = NUMBER_TO_DAY[dto.dayOfWeek];

  return {
    day: dayKey,
    label: DAY_LABELS[dayKey],
    enabled: dto.isOpen,
    from: normalizeTime(dto.openTime, "09:00"),
    to: normalizeTime(dto.closeTime, "17:00"),
  };
}

function buildDefaultBusinessHours(): BusinessHoursDay[] {
  return [
    { day: "Mon", label: "Monday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Tue", label: "Tuesday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Wed", label: "Wednesday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Thu", label: "Thursday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Fri", label: "Friday", enabled: true, from: "09:00", to: "17:00" },
    { day: "Sat", label: "Saturday", enabled: false, from: "09:00", to: "17:00" },
    { day: "Sun", label: "Sunday", enabled: false, from: "09:00", to: "17:00" },
  ];
}

function mapUiBusinessHoursToDto(item: BusinessHoursDay): BusinessHoursDto {
  return {
    dayOfWeek: DAY_TO_NUMBER[item.day],
    isOpen: item.enabled,
    openTime: item.enabled ? `${item.from}:00` : null,
    closeTime: item.enabled ? `${item.to}:00` : null,
  };
}

export default function AvailabilityPage() {
  const role = getStoredUserRole();
  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const loggedInStaffId = getStoredUserId();
  const businessId = getStoredBusinessId();

  const [topTab, setTopTab] = useState<AvailabilityTopTab>(
    isStaff ? "availability" : "businessHours"
  );
  const [dayTab, setDayTab] = useState<DayKey>("Mon");

  useEffect(() => {
    if (isStaff && (topTab === "businessHours" || topTab === "blockedDays")) {
      setTopTab("availability");
    }
  }, [isStaff, topTab]);

  function canEditStaffRow(staffId: number) {
    if (isOwner) return true;
    if (isStaff) return staffId === loggedInStaffId;
    return false;
  }

  const [businessHours, setBusinessHours] = useState<BusinessHoursDay[]>(
    buildDefaultBusinessHours()
  );
  const [businessHoursLoading, setBusinessHoursLoading] = useState(false);
  const [businessHoursSaving, setBusinessHoursSaving] = useState(false);
  const [businessHoursError, setBusinessHoursError] = useState("");

  async function loadBusinessHours() {
    if (!isOwner) return;

    if (!businessId) {
      setBusinessHoursError(
        "Business id was not found. Store businessId at login or provide an owner-business lookup endpoint."
      );
      setBusinessHours(buildDefaultBusinessHours());
      return;
    }

    setBusinessHoursLoading(true);
    setBusinessHoursError("");

    try {
      const data = await getBusinessHours(businessId);

      if (!data.length) {
        setBusinessHours(buildDefaultBusinessHours());
      } else {
        const mapped = data
          .map(mapBusinessHoursDtoToUi)
          .sort((a, b) => DAY_TO_NUMBER[a.day] - DAY_TO_NUMBER[b.day]);

        setBusinessHours(mapped);
      }
    } catch (err) {
      setBusinessHours(buildDefaultBusinessHours());
      setBusinessHoursError(
        err instanceof Error ? err.message : "Failed to load business hours."
      );
    } finally {
      setBusinessHoursLoading(false);
    }
  }

  useEffect(() => {
    if (isOwner && topTab === "businessHours") {
      loadBusinessHours();
    }
  }, [isOwner, topTab, businessId]);

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

  const [staffAvailabilityByDay, setStaffAvailabilityByDay] = useState<
    Record<DayKey, StaffAvailability[]>
  >({
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

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [blockedSaving, setBlockedSaving] = useState(false);
  const [blockedError, setBlockedError] = useState("");

  const [calendarYear, setCalendarYear] = useState(2025);
  const [calendarMonth, setCalendarMonth] = useState(8);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const [isAddBlockedModalOpen, setIsAddBlockedModalOpen] = useState(false);
  const [isDeleteBlockedModalOpen, setIsDeleteBlockedModalOpen] = useState(false);
  const [blockedDateToDelete, setBlockedDateToDelete] = useState<BlockedDate | null>(null);

  const [modalBlockedDay, setModalBlockedDay] = useState("");
  const [modalBlockedMonth, setModalBlockedMonth] = useState("");
  const [modalBlockedReason, setModalBlockedReason] = useState("");

  async function loadBlockedDates() {
    if (!isOwner) return;

    if (!businessId) {
      setBlockedError(
        "Business id was not found. Store businessId at login or provide an owner-business lookup endpoint."
      );
      setBlockedDates([]);
      return;
    }

    setBlockedLoading(true);
    setBlockedError("");

    try {
      const data = await getBusinessBlockedDates(businessId);
      const businessWideOnly = data.filter((item) => item.staffId == null);

      setBlockedDates(
        businessWideOnly
          .map(mapBlockedDateResponse)
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    } catch (err) {
      setBlockedDates([]);
      setBlockedError(
        err instanceof Error ? err.message : "Failed to load blocked dates."
      );
    } finally {
      setBlockedLoading(false);
    }
  }

  useEffect(() => {
    if (isOwner && topTab === "blockedDays") {
      loadBlockedDates();
    }
  }, [isOwner, topTab, businessId]);

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

  async function addBlockedDate() {
    if (!isOwner || !businessId) {
      setBlockedError(
        "Business id was not found. Store businessId at login or provide an owner-business lookup endpoint."
      );
      return;
    }

    if (!modalBlockedDay || modalBlockedMonth === "") return;

    const monthIndex = Number(modalBlockedMonth);
    const day = Number(modalBlockedDay);

    if (Number.isNaN(monthIndex) || Number.isNaN(day)) return;

    const dateStr = toDateString(calendarYear, monthIndex, day);

    setBlockedSaving(true);
    setBlockedError("");

    try {
      await createBusinessBlockedDate(businessId, {
        staffId: null,
        date: dateStr,
        reason: modalBlockedReason.trim() || null,
      });

      setCalendarMonth(monthIndex);
      setSelectedCalendarDate(dateStr);
      closeAddBlockedModal();
      await loadBlockedDates();
    } catch (err) {
      setBlockedError(
        err instanceof Error ? err.message : "Failed to add blocked date."
      );
    } finally {
      setBlockedSaving(false);
    }
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

  async function confirmDeleteBlockedDate() {
    if (!isOwner || !blockedDateToDelete) return;

    if (!businessId) {
      setBlockedError(
        "Business id was not found. Store businessId at login or provide an owner-business lookup endpoint."
      );
      return;
    }

    setBlockedSaving(true);
    setBlockedError("");

    try {
      await deleteBusinessBlockedDate(businessId, blockedDateToDelete.id);

      if (selectedCalendarDate === blockedDateToDelete.date) {
        setSelectedCalendarDate(null);
      }

      closeDeleteBlockedModal();
      await loadBlockedDates();
    } catch (err) {
      setBlockedError(
        err instanceof Error ? err.message : "Failed to delete blocked date."
      );
    } finally {
      setBlockedSaving(false);
    }
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
    label: getMonthName(2025, i).split(" ")[0],
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

  async function onSaveChanges() {
    if (topTab === "businessHours") {
      if (!isOwner || !businessId) {
        setBusinessHoursError(
          "Business id was not found. Store businessId at login or provide an owner-business lookup endpoint."
        );
        return;
      }

      setBusinessHoursSaving(true);
      setBusinessHoursError("");

      try {
        const saved = await saveBusinessHours(
          businessId,
          businessHours.map(mapUiBusinessHoursToDto)
        );

        const mapped = saved
          .map(mapBusinessHoursDtoToUi)
          .sort((a, b) => DAY_TO_NUMBER[a.day] - DAY_TO_NUMBER[b.day]);

        setBusinessHours(mapped);
        alert("Business hours saved ✅");
      } catch (err) {
        setBusinessHoursError(
          err instanceof Error ? err.message : "Failed to save business hours."
        );
      } finally {
        setBusinessHoursSaving(false);
      }

      return;
    }

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

        <button
          type="button"
          className={
            topTab === "availabilityOverrides"
              ? "availability-top-tab availability-top-tab--active"
              : "availability-top-tab"
          }
          onClick={() => setTopTab("availabilityOverrides")}
        >
          Availability Overrides
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
          <BusinessHoursTab
            businessHours={businessHours}
            loading={businessHoursLoading}
            saving={businessHoursSaving}
            error={businessHoursError}
            onToggleBusinessDay={toggleBusinessDay}
            onUpdateBusinessHours={updateBusinessHours}
          />
        )}

        {topTab === "availability" && (
          <WeeklyAvailabilityTab
            days={DAYS}
            dayTab={dayTab}
            onChangeDayTab={setDayTab}
            staffAvailability={staffAvailability}
            isStaff={isStaff}
            loggedInStaffId={loggedInStaffId}
            canEditStaffRow={canEditStaffRow}
            onToggleStaffEnabled={toggleStaffEnabled}
            onAddRange={addRange}
            onRemoveRange={removeRange}
            onUpdateRange={updateRange}
          />
        )}

        {topTab === "availabilityOverrides" && <AvailabilityOverridesTab />}

        {isOwner && topTab === "blockedDays" && (
          <BlockedDaysTab
            calendarYear={calendarYear}
            calendarMonth={calendarMonth}
            selectedCalendarDate={selectedCalendarDate}
            blockedDateMap={blockedDateMap}
            daysInMonth={daysInMonth}
            firstDayOffset={firstDayOffset}
            blockedRowsToShow={blockedRowsToShow}
            isAddBlockedModalOpen={isAddBlockedModalOpen}
            isDeleteBlockedModalOpen={isDeleteBlockedModalOpen}
            blockedDateToDelete={blockedDateToDelete}
            modalBlockedDay={modalBlockedDay}
            modalBlockedMonth={modalBlockedMonth}
            modalBlockedReason={modalBlockedReason}
            monthOptions={monthOptions}
            dayOptions={dayOptions}
            loading={blockedLoading}
            saving={blockedSaving}
            error={blockedError}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onSelectCalendarDate={setSelectedCalendarDate}
            onOpenAddModal={openAddBlockedModal}
            onCloseAddModal={closeAddBlockedModal}
            onAddBlockedDate={addBlockedDate}
            onAskDeleteBlockedDate={askDeleteBlockedDate}
            onCloseDeleteModal={closeDeleteBlockedModal}
            onConfirmDeleteBlockedDate={confirmDeleteBlockedDate}
            onChangeModalBlockedDay={setModalBlockedDay}
            onChangeModalBlockedMonth={setModalBlockedMonth}
            onChangeModalBlockedReason={setModalBlockedReason}
          />
        )}
      </section>

      <div className="availability-footer">
        <button
          type="button"
          className="availability-save"
          onClick={onSaveChanges}
          disabled={businessHoursSaving || blockedSaving}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}