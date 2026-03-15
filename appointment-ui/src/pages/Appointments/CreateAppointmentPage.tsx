import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "./CreateAppointmentPage.css";

type UserRole = "owner" | "staff" | "customer";
const CURRENT_ROLE: UserRole = "customer"; // TODO: replace with auth/context

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

const INDUSTRY_OPTIONS = [
  "All industries",
  "Hair Salon",
  "Barber Shop",
  "Nails",
  "Spa",
  "Massage",
  "Physiotherapy",
];

const LOCATION_OPTIONS = [
  "All locations",
  "Thessaloniki - Center",
  "Thessaloniki - East",
  "Thessaloniki - West",
  "Kalamaria",
  "Toumba",
];

const DEMO_BUSINESSES: BusinessCard[] = [
  {
    id: 1,
    name: "Business Name",
    category: "Hair Salon",
    location: "Thessaloniki - Center",
    openHours: "9:00 - 19:00",
    services: "Haircut, colouring",
  },
  {
    id: 2,
    name: "Business Name",
    category: "Hair Salon",
    location: "Thessaloniki - Center",
    openHours: "9:00 - 19:00",
    services: "Haircut, colouring",
  },
  {
    id: 3,
    name: "Glow Studio",
    category: "Spa",
    location: "Kalamaria",
    openHours: "10:00 - 20:00",
    services: "Massage, facial",
  },
  {
    id: 4,
    name: "Urban Barber",
    category: "Barber Shop",
    location: "Thessaloniki - East",
    openHours: "10:00 - 21:00",
    services: "Fade, beard trim",
  },
];

const DEMO_SERVICES: ServiceItem[] = [
  { id: 1, businessId: 1, name: "Service 1", durationMinutes: 30, price: 50 },
  { id: 2, businessId: 1, name: "Service 1", durationMinutes: 30, price: 50 },
  { id: 3, businessId: 1, name: "Service 1", durationMinutes: 30, price: 50 },
  { id: 4, businessId: 1, name: "Service 1", durationMinutes: 30, price: 50 },
  { id: 5, businessId: 1, name: "Service 1", durationMinutes: 30, price: 50 },
  { id: 6, businessId: 1, name: "Service 1", durationMinutes: 30, price: 50 },

  { id: 7, businessId: 2, name: "Cut", durationMinutes: 30, price: 25 },
  { id: 8, businessId: 2, name: "Colour", durationMinutes: 60, price: 55 },

  { id: 9, businessId: 3, name: "Massage", durationMinutes: 60, price: 70 },
  { id: 10, businessId: 3, name: "Facial", durationMinutes: 45, price: 55 },

  { id: 11, businessId: 4, name: "Fade", durationMinutes: 30, price: 20 },
  { id: 12, businessId: 4, name: "Beard Trim", durationMinutes: 20, price: 15 },
];

const DEMO_STAFF: StaffMember[] = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Anna Brown" },
  { id: 3, name: "Maria Green" },
];

const DEMO_TIME_SLOTS = ["9:00", "9:30", "10:00", "11:00", "12:00", "12:30", "14:00"];

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

export default function CreateAppointmentPage() {
  const location = useLocation();
  const navigationState = location.state as
    | {
        step?: StepKey;
        selectedBusiness?: BusinessCard;
      }
    | undefined;

  const isCustomer = CURRENT_ROLE === "customer";

  const [currentStep, setCurrentStep] = useState<StepKey>(
    navigationState?.step ?? 1
  );

  // Step 1
  const [industry, setIndustry] = useState("All industries");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [searchName, setSearchName] = useState("");
  const [submittedFilters, setSubmittedFilters] = useState({
    industry: "All industries",
    location: "All locations",
    searchName: "",
  });
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessCard | null>(
    navigationState?.selectedBusiness ?? null
  );

  // Step 2
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Step 3
  const [selectedStaffId, setSelectedStaffId] = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");

  // Step 4
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const calendarMonthIndex = 2; // March
  const calendarYear = 2026;
  const monthGrid = useMemo(
    () => buildMonthGrid(calendarYear, calendarMonthIndex),
    [calendarYear, calendarMonthIndex]
  );

  const filteredBusinesses = useMemo(() => {
    return DEMO_BUSINESSES.filter((business) => {
      const matchesIndustry =
        submittedFilters.industry === "All industries" ||
        business.category.toLowerCase() === submittedFilters.industry.toLowerCase();

      const matchesLocation =
        submittedFilters.location === "All locations" ||
        business.location.toLowerCase() === submittedFilters.location.toLowerCase();

      const matchesName =
        submittedFilters.searchName.trim() === "" ||
        business.name.toLowerCase().includes(submittedFilters.searchName.toLowerCase());

      return matchesIndustry && matchesLocation && matchesName;
    });
  }, [submittedFilters]);

  const servicesForSelectedBusiness = useMemo(() => {
    if (!selectedBusiness) return [];
    return DEMO_SERVICES.filter((service) => service.businessId === selectedBusiness.id);
  }, [selectedBusiness]);

  const selectedStaff = useMemo(() => {
    return DEMO_STAFF.find((staff) => staff.id === selectedStaffId) || null;
  }, [selectedStaffId]);

  function onSearch() {
    setSubmittedFilters({
      industry,
      location: locationFilter,
      searchName,
    });
  }

  function onViewServices(business: BusinessCard) {
    setSelectedBusiness(business);
    setSelectedService(null);
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

  if (!isCustomer) {
    return (
      <div className="create-appointment-page">
        <h1 className="create-appointment-title">Create Appointment</h1>
        <p>Only customers can access this page.</p>
      </div>
    );
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
                    <option key={option} value={option}>
                      {option}
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
              >
                Search
              </button>
            </div>

            <div className="create-appointment-results">
              {filteredBusinesses.length === 0 ? (
                <div className="create-appointment-empty">
                  No businesses found for the selected filters.
                </div>
              ) : (
                filteredBusinesses.map((business) => (
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
                disabled={!selectedService}
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
                    <span>March</span>
                    <span>2026</span>
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
                      const isSelected =
                        cell !== null &&
                        selectedDate?.getFullYear() === 2026 &&
                        selectedDate?.getMonth() === 2 &&
                        selectedDate?.getDate() === cell;

                      return (
                        <button
                          key={`${cell}-${index}`}
                          type="button"
                          className={
                            cell === null
                              ? "simple-calendar-day simple-calendar-day--empty"
                              : isSelected
                              ? "simple-calendar-day simple-calendar-day--selected"
                              : "simple-calendar-day"
                          }
                          disabled={cell === null}
                          onClick={() => {
                            if (cell === null) return;
                            setSelectedDate(new Date(2026, 2, cell));
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

                  <div className="time-slot-grid">
                    {DEMO_TIME_SLOTS.map((slot) => (
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
                  <div className="summary-card-title">{selectedService?.name || "-"}</div>
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