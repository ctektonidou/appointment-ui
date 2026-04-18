import { formatSummaryDate } from "../utils/createAppointment.utils";
import type { ServiceItem, StaffMember } from "../types/createAppointment.types";

type CustomerInfoStepProps = {
  isLoggedIn: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes: string;
  acceptedPolicy: boolean;
  selectedService: ServiceItem | null;
  selectedDate: Date | null;
  selectedTime: string;
  selectedStaff: StaffMember | null;
  onCustomerNameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerNotesChange: (value: string) => void;
  onAcceptedPolicyChange: (value: boolean) => void;
  onLoginClick: () => void;
  onBack: () => void;
  onFinish: () => void;
};

export default function CustomerInfoStep({
  isLoggedIn,
  customerName,
  customerEmail,
  customerPhone,
  customerNotes,
  acceptedPolicy,
  selectedService,
  selectedDate,
  selectedTime,
  selectedStaff,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onCustomerNotesChange,
  onAcceptedPolicyChange,
  onLoginClick,
  onBack,
  onFinish,
}: CustomerInfoStepProps) {
  const isFinishDisabled =
    !customerName.trim() ||
    !customerEmail.trim() ||
    !customerPhone.trim() ||
    !acceptedPolicy;

  return (
    <>
      <div className="info-summary-layout">
        <div className="info-section">
          <div className="info-section-header">
            <h2 className="create-appointment-section-title">Your Info</h2>

            {!isLoggedIn && (
              <button
                type="button"
                className="login-link-btn"
                onClick={onLoginClick}
              >
                Log in
              </button>
            )}
          </div>

          <div className="info-form">
            <div className="create-appointment-field">
              <label className="create-appointment-info-label">name</label>
              <input
                className="create-appointment-input create-appointment-input--wide"
                type="text"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
              />
            </div>

            <div className="create-appointment-field">
              <label className="create-appointment-info-label">email</label>
              <input
                className="create-appointment-input create-appointment-input--wide"
                type="email"
                value={customerEmail}
                onChange={(e) => onCustomerEmailChange(e.target.value)}
              />
            </div>

            <div className="create-appointment-field">
              <label className="create-appointment-info-label">phone</label>
              <input
                className="create-appointment-input create-appointment-input--wide"
                type="text"
                value={customerPhone}
                onChange={(e) => onCustomerPhoneChange(e.target.value)}
              />
            </div>

            <div className="create-appointment-field">
              <label className="create-appointment-info-label">notes</label>
              <textarea
                className="create-appointment-textarea"
                value={customerNotes}
                onChange={(e) => onCustomerNotesChange(e.target.value)}
              />
            </div>

            <label className="agreement-check">
              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(e) => onAcceptedPolicyChange(e.target.checked)}
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
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="create-appointment-primary-btn"
          onClick={onFinish}
          disabled={isFinishDisabled}
        >
          Finish
        </button>
      </div>
    </>
  );
}