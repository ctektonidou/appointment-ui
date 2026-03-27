import type { ServiceItem } from "../types/createAppointment.types";


type ServiceSelectionStepProps = {
  services: ServiceItem[];
  selectedService: ServiceItem | null;
  onSelectService: (service: ServiceItem) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function ServiceSelectionStep({
  services,
  selectedService,
  onSelectService,
  onBack,
  onContinue,
}: ServiceSelectionStepProps) {
  return (
    <>
      <h2 className="create-appointment-section-title">Choose Service</h2>

      <div className="service-grid">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            className={
              selectedService?.id === service.id
                ? "service-card service-card--selected"
                : "service-card"
            }
            onClick={() => onSelectService(service)}
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
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="create-appointment-primary-btn"
          onClick={onContinue}
          disabled={!selectedService}
        >
          Continue
        </button>
      </div>
    </>
  );
}