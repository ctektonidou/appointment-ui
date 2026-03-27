import type { StepKey } from "../types/createAppointment.types";

type CreateAppointmentStepperProps = {
  currentStep: StepKey;
  onStepClick: (step: StepKey) => void;
};

export default function CreateAppointmentStepper({
  currentStep,
  onStepClick,
}: CreateAppointmentStepperProps) {
  const steps: Array<{ key: StepKey; label: string }> = [
    { key: 1, label: "Business" },
    { key: 2, label: "Service" },
    { key: 3, label: "Date & Time" },
    { key: 4, label: "Your Info" },
  ];

  return (
    <div className="create-appointment-steps">
      {steps.map((step, index) => (
        <div key={step.key} className="create-appointment-step-wrapper">
          <div className="create-appointment-step">
            <button
              type="button"
              className={`create-appointment-step-circle ${
                currentStep === step.key
                  ? ""
                  : "create-appointment-step-circle--inactive"
              }`}
              onClick={() => onStepClick(step.key)}
            >
              {step.key}
            </button>
            <div className="create-appointment-step-label">{step.label}</div>
          </div>

          {index < steps.length - 1 && <div className="create-appointment-step-line" />}
        </div>
      ))}
    </div>
  );
}