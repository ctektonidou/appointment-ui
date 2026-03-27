import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "./CreateAppointmentPage.css";

import {
  searchPublicBusinesses,
  type BusinessResponse,
} from "../../api/businessApi";
import { listServices, type Service } from "../../api/services";

type UserRole = "owner" | "staff" | "customer";

type StepKey = 1 | 2 | 3 | 4;

type BusinessCard = {
  id: number;
  name: string;
  category: string;
  location: string;
  openHours: string;
  services: string;
};

type ServiceItem = {
  id: number;
  businessId: number;
  name: string;
  durationMinutes: number;
  price: number;
};

type StaffMember = {
  id: number;
  name: string;
};

type AppointmentFilters = {
  industry: string;
  location: string;
  searchName: string;
};

const INDUSTRY_OPTIONS = [
  { value: "", label: "All industries" },
  { value: "1", label: "Hair Salon" },
  { value: "2", label: "Barber Shop" },
  { value: "4", label: "Nails" },
  { value: "3", label: "Spa" },
  { value: "5", label: "Massage" },
  { value: "6", label: "Physiotherapy" },
];

const LOCATION_OPTIONS = [
  "All locations",
  "Thessaloniki - Center",
  "Thessaloniki - East",
  "Thessaloniki - West",
  "Kalamaria",
  "Toumba",
];

const DEMO_STAFF: StaffMember[] = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Anna Brown" },
  { id: 3, name: "Maria Green" },
];

const BASE_TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

function getIndustryLabel(industryId: number | null): string {
  const found = INDUSTRY_OPTIONS.find(
    (option) => option.value !== "" && Number(option.value) === industryId
  );
  return found?.label ?? "Unknown industry";
}

function toBusinessCard(business: BusinessResponse): BusinessCard {
  return {
    id: business.id,
    name: business.name,
    category: getIndustryLabel(business.industryId),
    location: business.location || "Location not available",
    openHours: "Not available yet",
    services: "Available on next step",
  };
}

function toServiceItem(service: Service): ServiceItem {
  return {
    id: service.id,
    businessId: service.businessId,
    name: service.name,
    durationMinutes: service.durationMinutes,
    price: service.priceEuros,
  };
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getFirstDayOffsetSundayFirst(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).getDay();
}

function formatSummaryDate(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString("en-GB");
}

function buildMonthGrid(year: number, monthIndex: number) {
  const totalDays = getDaysInMonth(year, monthIndex);
  const startOffset = getFirstDayOffsetSundayFirst(year, monthIndex);

  const cells: Array<number | null> = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    cells.push(d);
  }

  return cells;
}

function getMonthName(date: Date) {
  return date.toLocaleString("en-US", { month: "long" });
}

function createDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// demo async fetch for slots
async function getAvailableTimeSlots(params: {
  businessId: number;
  serviceId: number;
  staffId: number;
  date: Date;
}): Promise<string[]> {
  const { staffId, date } = params;

  await new Promise((resolve) => setTimeout(resolve, 350));

  const dayOfMonth = date.getDate();

  if (staffId === 1) {
    return BASE_TIME_SLOTS.filter((_, index) => (index + dayOfMonth) % 4 !== 0);
  }

  if (staffId === 2) {
    return BASE_TIME_SLOTS.filter((_, index) => (index + dayOfMonth) % 3 !== 0);
  }

  return BASE_TIME_SLOTS.filter((_, index) => (index + dayOfMonth) % 5 !== 0);
}

export default function CreateAppointmentPage() {
  const location = useLocation();
  const role = getStoredUserRole();

  const navigationState = location.state as
    | {
        step?: StepKey;
        selectedBusiness?: BusinessCard;
      }
    | undefined;

  const isCustomer = role === "customer";
  const today = useMemo(() => createDateOnly(new Date()), []);

  const [currentStep, setCurrentStep] = useState<StepKey>(
    navigationState?.step ?? 1
  );

  const [industry, setIndustry] = useState("");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [searchName, setSearchName] = useState("");

  const [submittedFilters, setSubmittedFilters] = useState<AppointmentFilters>({
    industry: "",
    location: "All locations",
    searchName: "",
  });

  const [businesses, setBusinesses] = useState<BusinessCard[]>([]);
  const [isSearchingBusinesses, setIsSearchingBusinesses] = useState(false);
  const [businessesError, setBusinessesError] = useState("");

  const [selectedBusiness, setSelectedBusiness] = useState<BusinessCard | null>(
    navigationState?.selectedBusiness ?? null
  );

  const [servicesForSelectedBusiness, setServicesForSelectedBusiness] = useState<
    ServiceItem[]
  >([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState("");

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const [selectedStaffId, setSelectedStaffId] = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [selectedTime, setSelectedTime] = useState("");

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const visibleMonthDate = selectedDate ?? today;
  const calendarMonthIndex = visibleMonthDate.getMonth();
  const calendarYear = visibleMonthDate.getFullYear();

  const monthGrid = useMemo(
    () => buildMonthGrid(calendarYear, calendarMonthIndex),
    [calendarYear, calendarMonthIndex]
  );

  const selectedStaff = useMemo(() => {
    return DEMO_STAFF.find((staff) => staff.id === selectedStaffId) || null;
  }, [selectedStaffId]);

  async function runBusinessSearch(filters?: AppointmentFilters) {
    const activeFilters = filters ?? {
      industry,
      location: locationFilter,
      searchName,
    };

    setIsSearchingBusinesses(true);
    setBusinessesError("");

    try {
      const results = await searchPublicBusinesses({
        name: activeFilters.searchName.trim() || undefined,
        location:
          activeFilters.location !== "All locations"
            ? activeFilters.location
            : undefined,
        industryId: activeFilters.industry
          ? Number(activeFilters.industry)
          : undefined,
      });

      setBusinesses(results.map(toBusinessCard));
    } catch (error) {
      setBusinesses([]);
      setBusinessesError(
        error instanceof Error ? error.message : "Failed to load businesses"
      );
    } finally {
      setIsSearchingBusinesses(false);
    }
  }

  useEffect(() => {
    if (!isCustomer) return;

    const initialFilters: AppointmentFilters = {
      industry: "",
      location: "All locations",
      searchName: "",
    };

    setSubmittedFilters(initialFilters);
    setIndustry(initialFilters.industry);
    setLocationFilter(initialFilters.location);
    setSearchName(initialFilters.searchName);
    runBusinessSearch(initialFilters);
  }, [isCustomer]);

  useEffect(() => {
    async function loadServices() {
      if (!selectedBusiness || currentStep !== 2) {
        setServicesForSelectedBusiness([]);
        setServicesError("");
        return;
      }

      setIsLoadingServices(true);
      setServicesError("");

      try {
        const results = await listServices(selectedBusiness.id, true);
        setServicesForSelectedBusiness(results.map(toServiceItem));
      } catch (error) {
        setServicesForSelectedBusiness([]);
        setServicesError(
          error instanceof Error ? error.message : "Failed to load services"
        );
      } finally {
        setIsLoadingServices(false);
      }
    }

    loadServices();
  }, [selectedBusiness, currentStep]);

  useEffect(() => {
    if (currentStep !== 3) return;

    if (!selectedDate) {
      setSelectedDate(today);
    }
  }, [currentStep, selectedDate, today]);

  useEffect(() => {
    async function loadSlots() {
      if (
        currentStep !== 3 ||
        !selectedBusiness ||
        !selectedService ||
        !selectedDate ||
        !selectedStaffId
      ) {
        setAvailableTimeSlots([]);
        setSelectedTime("");
        return;
      }

      setIsLoadingSlots(true);
      setSelectedTime("");

      try {
        const slots = await getAvailableTimeSlots({
          businessId: selectedBusiness.id,
          serviceId: selectedService.id,
          staffId: selectedStaffId,
          date: selectedDate,
        });

        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error("Failed to load time slots", error);
        setAvailableTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }

    loadSlots();
  }, [
    currentStep,
    selectedBusiness,
    selectedService,
    selectedDate,
    selectedStaffId,
  ]);

  function onSearch() {
    const nextFilters: AppointmentFilters = {
      industry,
      location: locationFilter,
      searchName,
    };

    setSubmittedFilters(nextFilters);
    runBusinessSearch(nextFilters);
  }

  function onViewServices(business: BusinessCard) {
    setSelectedBusiness(business);
    setSelectedService(null);
    setSelectedStaffId("");
    setSelectedTime("");
    setAvailableTimeSlots([]);
    setServicesForSelectedBusiness([]);
    setCurrentStep(2);
  }

  function goToStep(step: StepKey) {
    if (step === 1) {
      setCurrentStep(1);
      return;
    }

    if (step === 2 && selectedBusiness) {
      setCurrentStep(2);
      return;
    }

    if (step === 3 && selectedBusiness && selectedService) {
      setCurrentStep(3);
      return;
    }

    if (
      step === 4 &&
      selectedBusiness &&
      selectedService &&
      selectedDate &&
      selectedTime &&
      selectedStaffId
    ) {
      setCurrentStep(4);
    }
  }

  function onContinueFromService() {
    if (!selectedService) return;

    if (!selectedDate) {
      setSelectedDate(today);
    }

    setSelectedTime("");
    setAvailableTimeSlots([]);
    setCurrentStep(3);
  }

  function onContinueFromDateTime() {
    if (!selectedDate || !selectedTime || !selectedStaffId) return;
    setCurrentStep(4);
  }

  function onFinishAppointment() {
    if (!acceptedPolicy) return;

    console.log("Appointment created", {
      selectedBusiness,
      selectedService,
      selectedDate,
      selectedTime,
      selectedStaff,
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
    });

    alert("Appointment created successfully (demo)");
  }

  return (
    <div className="create-appointment-page">
      <h1 className="create-appointment-title">Create Appointment</h1>

      <div className="create-appointment-steps">
        <div className="create-appointment-step">
          <button
            type="button"
            className={`create-appointment-step-circle ${
              currentStep === 1 ? "" : "create-appointment-step-circle--inactive"
            }`}
            onClick={() => goToStep(1)}
          >
            1
          </button>
          <div className="create-appointment-step-label">Business</div>
        </div>

        <div className="create-appointment-step-line" />

        <div className="create-appointment-step">
          <button
            type="button"
            className={`create-appointment-step-circle ${
              currentStep === 2 ? "" : "create-appointment-step-circle--inactive"
            }`}
            onClick={() => goToStep(2)}
          >
            2
          </button>
          <div className="create-appointment-step-label">Service</div>
        </div>

        <div className="create-appointment-step-line" />

        <div className="create-appointment-step">
          <button
            type="button"
            className={`create-appointment-step-circle ${
              currentStep === 3 ? "" : "create-appointment-step-circle--inactive"
            }`}
            onClick={() => goToStep(3)}
          >
            3
          </button>
          <div className="create-appointment-step-label">Date &amp; Time</div>
        </div>

        <div className="create-appointment-step-line" />

        <div className="create-appointment-step">
          <button
            type="button"
            className={`create-appointment-step-circle ${
              currentStep === 4 ? "" : "create-appointment-step-circle--inactive"
            }`}
            onClick={() => goToStep(4)}
          >
            4
          </button>
          <div className="create-appointment-step-label">Your Info</div>
        </div>
      </div>

      <section className="create-appointment-card">
        {currentStep === 1 && (
          <>
            <h2 className="create-appointment-section-title">Find a Business</h2>

            <div className="create-appointment-filters">
              <div className="create-appointment-field">
                <label className="create-appointment-label">Industry</label>
                <select
                  className="create-appointment-select"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-appointment-field">
                <label className="create-appointment-label">Location - Town</label>
                <select
                  className="create-appointment-select"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  {LOCATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-appointment-field create-appointment-field--name">
                <label className="create-appointment-label">Name</label>
                <input
                  className="create-appointment-input"
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>

            <div className="create-appointment-search-row">
              <button
                type="button"
                className="create-appointment-search-btn"
                onClick={onSearch}
                disabled={isSearchingBusinesses}
              >
                {isSearchingBusinesses ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="create-appointment-results">
              {businessesError ? (
                <div className="create-appointment-empty">{businessesError}</div>
              ) : isSearchingBusinesses ? (
                <div className="create-appointment-empty">
                  Searching businesses...
                </div>
              ) : businesses.length === 0 ? (
                <div className="create-appointment-empty">
                  No businesses found for the selected filters.
                </div>
              ) : (
                businesses.map((business) => (
                  <div key={business.id} className="business-card">
                    <div className="business-card-header">
                      <div className="business-card-logo">✂</div>

                      <div className="business-card-title-wrap">
                        <div className="business-card-title">{business.name}</div>
                        <div className="business-card-category">{business.category}</div>
                      </div>
                    </div>

                    <div className="business-card-divider" />

                    <div className="business-card-details">
                      <div className="business-card-detail-row">
                        <span className="business-card-detail-icon">📍</span>
                        <span>{business.location}</span>
                      </div>

                      <div className="business-card-detail-row">
                        <span className="business-card-detail-icon">🕒</span>
                        <span>Open today: {business.openHours}</span>
                      </div>

                      <div className="business-card-services">
                        Services: {business.services}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="business-card-btn"
                      onClick={() => onViewServices(business)}
                    >
                      View Services
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="create-appointment-section-title">Choose Service</h2>

            {selectedBusiness && (
              <div className="create-appointment-selected-business">
                Business: <strong>{selectedBusiness.name}</strong>
              </div>
            )}

            {servicesError ? (
              <div className="create-appointment-empty">{servicesError}</div>
            ) : isLoadingServices ? (
              <div className="create-appointment-empty">Loading services...</div>
            ) : servicesForSelectedBusiness.length === 0 ? (
              <div className="create-appointment-empty">
                No active services found for this business.
              </div>
            ) : (
              <div className="service-grid">
                {servicesForSelectedBusiness.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    className={
                      selectedService?.id === service.id
                        ? "service-card service-card--selected"
                        : "service-card"
                    }
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="service-card-title">{service.name}</div>
                    <div className="service-card-text">
                      Duration: {service.durationMinutes} minutes
                    </div>
                    <div className="service-card-price">{service.price} euros</div>
                  </button>
                ))}
              </div>
            )}

            <div className="create-appointment-actions">
              <button
                type="button"
                className="create-appointment-secondary-btn"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>

              <button
                type="button"
                className="create-appointment-primary-btn"
                onClick={onContinueFromService}
                disabled={!selectedService || isLoadingServices}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {currentStep === 3 && (
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
                        cell === null
                          ? null
                          : new Date(calendarYear, calendarMonthIndex, cell);

                      const isSelected =
                        cellDate !== null && isSameDay(selectedDate, cellDate);
                      const isToday =
                        cellDate !== null && isSameDay(today, cellDate);

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
                            if (cellDate === null) return;
                            setSelectedDate(cellDate);
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
                    <div className="create-appointment-empty">
                      Loading available times...
                    </div>
                  )}

                  {selectedStaffId &&
                    !isLoadingSlots &&
                    availableTimeSlots.length === 0 && (
                      <div className="create-appointment-empty">
                        No available time slots for the selected date.
                      </div>
                    )}

                  {selectedStaffId &&
                    !isLoadingSlots &&
                    availableTimeSlots.length > 0 && (
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
                            onClick={() => setSelectedTime(slot)}
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
                      setSelectedStaffId(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  >
                    <option value="">Select staff</option>
                    {DEMO_STAFF.map((staff) => (
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
                onClick={() => setCurrentStep(2)}
              >
                Back
              </button>

              <button
                type="button"
                className="create-appointment-primary-btn"
                onClick={onContinueFromDateTime}
                disabled={!selectedDate || !selectedTime || !selectedStaffId}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            <div className="info-summary-layout">
              <div className="info-section">
                <div className="info-section-header">
                  <h2 className="create-appointment-section-title">Your Info</h2>
                  <button type="button" className="login-link-btn">
                    Log in
                  </button>
                </div>

                <div className="info-form">
                  <div className="create-appointment-field">
                    <label className="create-appointment-info-label">name</label>
                    <input
                      className="create-appointment-input create-appointment-input--wide"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="create-appointment-field">
                    <label className="create-appointment-info-label">email</label>
                    <input
                      className="create-appointment-input create-appointment-input--wide"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>

                  <div className="create-appointment-field">
                    <label className="create-appointment-info-label">phone</label>
                    <input
                      className="create-appointment-input create-appointment-input--wide"
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="create-appointment-field">
                    <label className="create-appointment-info-label">notes</label>
                    <textarea
                      className="create-appointment-textarea"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                    />
                  </div>

                  <label className="agreement-check">
                    <input
                      type="checkbox"
                      checked={acceptedPolicy}
                      onChange={(e) => setAcceptedPolicy(e.target.checked)}
                    />
                    <span>I agree to the processing of my personal data.</span>
                  </label>
                </div>
              </div>

              <div className="summary-section">
                <h2 className="create-appointment-section-title">Summary</h2>

                <div className="summary-card">
                  <div className="summary-card-title">
                    {selectedService?.name || "-"}
                  </div>
                  <div className="summary-card-text">
                    Duration: {selectedService?.durationMinutes ?? "-"} minutes
                  </div>
                  <div className="summary-card-price">
                    {selectedService?.price ?? "-"} euros
                  </div>

                  <div className="summary-card-datetime">
                    {formatSummaryDate(selectedDate)} {selectedTime}
                  </div>

                  <div className="summary-card-staff-row">
                    <span className="summary-card-staff-label">Staff</span>
                    <span>{selectedStaff?.name || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="create-appointment-actions">
              <button
                type="button"
                className="create-appointment-secondary-btn"
                onClick={() => setCurrentStep(3)}
              >
                Back
              </button>

              <button
                type="button"
                className="create-appointment-primary-btn"
                onClick={onFinishAppointment}
                disabled={
                  !customerName.trim() ||
                  !customerEmail.trim() ||
                  !customerPhone.trim() ||
                  !acceptedPolicy
                }
              >
                Finish
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}