import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "./CreateAppointmentPage.css";

import {
  searchPublicBusinesses,
  type BusinessResponse,
} from "../../api/businessApi";
import { listServices, type Service } from "../../api/services";
import { listStaff, type Staff } from "../../api/staff";
import { getAvailableTimeSlots, createAppointment } from "../../api/appointments";

import BusinessSelectionStep from "./components/BusinessSelectionStep";
import ServiceSelectionStep from "./components/ServiceSelectionStep";
import DateTimeSelectionStep from "./components/DateTimeSelectionStep";
import CustomerInfoStep from "./components/CustomerInfoStep";
import CreateAppointmentStepper from "./components/CreateAppointmentStepper";
import { getStaff } from "../../api/staff";

import {
  createDateOnly,
  formatSummaryDate,
  getStoredUserRole,
} from "./utils/createAppointment.utils";

import type {
  AppointmentFilters,
  BusinessCard,
  SelectOption,
  ServiceItem,
  StaffMember,
  StepKey,
  UserRole,
} from "./types/createAppointment.types";

const INDUSTRY_OPTIONS: SelectOption[] = [
  { value: "", label: "All industries" },
  { value: "1", label: "Hair Salon" },
  { value: "2", label: "Barber Shop" },
  { value: "4", label: "Nails" },
  { value: "3", label: "Spa" },
  { value: "5", label: "Massage" },
  { value: "6", label: "Physiotherapy" },
];

const LOCATION_OPTIONS: SelectOption[] = [
  { value: "All locations", label: "All locations" },
  { value: "Thessaloniki - Center", label: "Thessaloniki - Center" },
  { value: "Thessaloniki - East", label: "Thessaloniki - East" },
  { value: "Thessaloniki - West", label: "Thessaloniki - West" },
  { value: "Kalamaria", label: "Kalamaria" },
  { value: "Toumba", label: "Toumba" },
];

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

function toStaffMember(staff: Staff): StaffMember {
  const fullName = `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim();

  return {
    id: staff.id,
    name: fullName || staff.email || `Staff #${staff.id}`,
  };
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildAppointmentDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  );
}

function toLocalDateTimeString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export default function CreateAppointmentPage() {
  const location = useLocation();
  const role: UserRole = getStoredUserRole();

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

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState("");

  const [selectedStaffId, setSelectedStaffId] = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [selectedTime, setSelectedTime] = useState("");

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);

  const selectedStaff = useMemo(() => {
    return staffMembers.find((staff) => staff.id === selectedStaffId) || null;
  }, [staffMembers, selectedStaffId]);

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
    async function prefillLoggedInUser() {
      const storedUserId = localStorage.getItem("userId");
      const storedAuthUser = localStorage.getItem("authUser");
      const storedUserEmail = localStorage.getItem("userEmail");

      setIsLoggedIn(!!storedUserId);

      if (!storedAuthUser) {
        if (storedUserEmail) {
          setCustomerEmail((prev) => prev || storedUserEmail);
        }
        return;
      }

      try {
        const authUser = JSON.parse(storedAuthUser);

        const fullName = [authUser.firstName, authUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        setCustomerName((prev) => prev || fullName || "");
        setCustomerEmail((prev) => prev || authUser.email || storedUserEmail || "");

        if (authUser.role === "staff" && authUser.businessId && authUser.staffId) {
          const staff = await getStaff(authUser.businessId, authUser.staffId);
          setCustomerPhone((prev) => prev || staff.phone || "");
        }
      } catch (error) {
        console.error("Failed to prefill logged-in user", error);

        if (storedUserEmail) {
          setCustomerEmail((prev) => prev || storedUserEmail);
        }
      }
    }

    prefillLoggedInUser();
  }, []);

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
    async function loadStaff() {
      if (!selectedBusiness) {
        setStaffMembers([]);
        setStaffError("");
        setSelectedStaffId("");
        return;
      }

      if (currentStep !== 3) {
        return;
      }

      setIsLoadingStaff(true);
      setStaffError("");

      try {
        const results = await listStaff(selectedBusiness.id, true);
        setStaffMembers(results.map(toStaffMember));
      } catch (error) {
        setStaffMembers([]);
        setStaffError(
          error instanceof Error ? error.message : "Failed to load staff"
        );
      } finally {
        setIsLoadingStaff(false);
      }
    }

    loadStaff();
  }, [selectedBusiness, currentStep]);

  useEffect(() => {
    if (currentStep !== 3) return;

    if (!selectedDate) {
      setSelectedDate(today);
    }
  }, [currentStep, selectedDate, today]);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      if (!selectedBusiness || !selectedService || !selectedDate || !selectedStaffId) {
        setAvailableTimeSlots([]);
        setSelectedTime("");
        setSlotsError("");
        return;
      }

      if (currentStep !== 3) {
        return;
      }

      setIsLoadingSlots(true);
      setSelectedTime("");
      setSlotsError("");

      try {
        const slots = await getAvailableTimeSlots({
          businessId: selectedBusiness.id,
          serviceId: selectedService.id,
          staffId: selectedStaffId,
          date: formatDateForApi(selectedDate),
        });

        if (!cancelled) {
          setAvailableTimeSlots(slots);
        }
      } catch (error) {
        if (!cancelled) {
          setAvailableTimeSlots([]);
          setSlotsError(
            error instanceof Error
              ? error.message
              : "Failed to load available time slots"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
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
    setStaffMembers([]);
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

    setSelectedStaffId("");
    setSelectedTime("");
    setAvailableTimeSlots([]);
    setCurrentStep(3);
  }

  function onContinueFromDateTime() {
    if (!selectedDate || !selectedTime || !selectedStaffId) return;
    setCurrentStep(4);
  }

  async function onFinishAppointment() {
    if (
      !acceptedPolicy ||
      !selectedBusiness ||
      !selectedService ||
      !selectedDate ||
      !selectedTime ||
      !selectedStaffId
    ) {
      return;
    }

    setIsSubmittingAppointment(true);

    try {
      const startDateTime = buildAppointmentDateTime(selectedDate, selectedTime);
      const endDateTime = new Date(
        startDateTime.getTime() + selectedService.durationMinutes * 60 * 1000
      );

      const storedUserId = localStorage.getItem("userId");
      const customerUserId = storedUserId ? Number(storedUserId) : null;

      const payload = {
        serviceId: selectedService.id,
        staffId: selectedStaffId,
        customerUserId,
        clientName: customerName.trim(),
        clientEmail: customerEmail.trim() || null,
        clientPhone: customerPhone.trim() || null,
        clientNotes: customerNotes.trim() || null,
        startTime: toLocalDateTimeString(startDateTime),
        endTime: toLocalDateTimeString(endDateTime),
      };

      const created = await createAppointment(selectedBusiness.id, payload);

      console.log("Appointment created successfully", created);
      alert("Appointment created successfully");

      setCurrentStep(1);
      setSelectedBusiness(null);
      setSelectedService(null);
      setSelectedStaffId("");
      setSelectedDate(today);
      setSelectedTime("");
      setAvailableTimeSlots([]);
      setCustomerNotes("");
      setAcceptedPolicy(false);

      if (!isLoggedIn) {
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
      }

      runBusinessSearch({
        industry: "",
        location: "All locations",
        searchName: "",
      });
    } catch (error) {
      console.error("Failed to create appointment", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create appointment"
      );
    } finally {
      setIsSubmittingAppointment(false);
    }
  }

  return (
    <div className="create-appointment-page">
      <h1 className="create-appointment-title">Create Appointment</h1>

      <CreateAppointmentStepper
        currentStep={currentStep}
        onStepClick={goToStep}
      />

      <section className="create-appointment-card">
        {currentStep === 1 && (
          <BusinessSelectionStep
            industry={industry}
            locationFilter={locationFilter}
            searchName={searchName}
            industryOptions={INDUSTRY_OPTIONS}
            locationOptions={LOCATION_OPTIONS}
            businesses={businesses}
            isSearching={isSearchingBusinesses}
            error={businessesError}
            onIndustryChange={setIndustry}
            onLocationChange={setLocationFilter}
            onSearchNameChange={setSearchName}
            onSearch={onSearch}
            onViewServices={onViewServices}
          />
        )}

        {currentStep === 2 && (
          <>
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
              <ServiceSelectionStep
                services={servicesForSelectedBusiness}
                selectedService={selectedService}
                onSelectService={setSelectedService}
                onBack={() => setCurrentStep(1)}
                onContinue={onContinueFromService}
              />
            )}
          </>
        )}

        {currentStep === 3 && (
          <>
            <DateTimeSelectionStep
              today={today}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedStaffId={selectedStaffId}
              availableTimeSlots={availableTimeSlots}
              isLoadingSlots={isLoadingSlots}
              staffMembers={staffMembers}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onStaffChange={setSelectedStaffId}
              onBack={() => setCurrentStep(2)}
              onContinue={onContinueFromDateTime}
            />
          </>
        )}

        {currentStep === 4 && (
          <CustomerInfoStep
            isLoggedIn={isLoggedIn}
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            customerNotes={customerNotes}
            acceptedPolicy={acceptedPolicy}
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedStaff={selectedStaff}
            onCustomerNameChange={setCustomerName}
            onCustomerEmailChange={setCustomerEmail}
            onCustomerPhoneChange={setCustomerPhone}
            onCustomerNotesChange={setCustomerNotes}
            onAcceptedPolicyChange={setAcceptedPolicy}
            onLoginClick={() => {
              console.log("Open login modal here");
            }}
            onBack={() => setCurrentStep(3)}
            onFinish={onFinishAppointment}
          />
        )}
      </section>
    </div>
  );
}