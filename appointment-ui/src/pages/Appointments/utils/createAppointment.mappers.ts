import type { BusinessResponse } from "../../../api/businessApi";
import type { Service } from "../../../api/services";
import type { BusinessCard, ServiceItem } from "../types/createAppointment.types";

const INDUSTRY_OPTIONS = [
  { value: "", label: "All industries" },
  { value: "1", label: "Hair Salon" },
  { value: "2", label: "Barber Shop" },
  { value: "4", label: "Nails" },
  { value: "3", label: "Spa" },
  { value: "5", label: "Massage" },
  { value: "6", label: "Physiotherapy" },
];

export function getIndustryLabel(industryId: number | null): string {
  const found = INDUSTRY_OPTIONS.find(
    (option) => option.value !== "" && Number(option.value) === industryId
  );

  return found?.label ?? "Unknown industry";
}

export function toBusinessCard(business: BusinessResponse): BusinessCard {
  return {
    id: business.id,
    name: business.name,
    category: getIndustryLabel(business.industryId),
    location: business.location || "Location not available",
    openHours: "Not available yet",
    services: "Available on next step",
  };
}

export function toServiceItem(service: Service): ServiceItem {
  return {
    id: service.id,
    businessId: service.businessId,
    name: service.name,
    durationMinutes: service.durationMinutes,
    price: service.priceEuros,
  };
}