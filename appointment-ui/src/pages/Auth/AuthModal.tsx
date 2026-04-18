import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  login,
  signupBusiness,
  signupCustomer,
  signupStaff,
} from "../../api/authApi";
import "./AuthModal.css";
import { useNavigate } from "react-router-dom";
import {
  listPublicIndustries,
  type IndustryResponse,
} from "../../api/publicMetadata";

export type AuthModalRole = "customer" | "staff" | "business";

type AuthModalProps = {
  role: AuthModalRole;
  onClose: () => void;
};

type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  businessId?: number | null;
  staffId?: number | null;
};

function saveAuthUser(user: AuthUser) {
  localStorage.setItem("authUser", JSON.stringify(user));
  localStorage.setItem("userId", String(user.id));
  localStorage.setItem("userRole", user.role);
  localStorage.setItem("userEmail", user.email);
  if (user.businessId != null) {
    localStorage.setItem("businessId", String(user.businessId));
  } else {
    localStorage.removeItem("businessId");
  }

  if (user.staffId != null) {
    localStorage.setItem("staffId", String(user.staffId));
  } else {
    localStorage.removeItem("staffId");
  }
}

export default function AuthModal({ role, onClose }: AuthModalProps) {
  const navigate = useNavigate();

  const isCustomer = role === "customer";
  const isStaff = role === "staff";
  const isBusiness = role === "business";

  const [customerLoginEmail, setCustomerLoginEmail] = useState("");
  const [customerLoginPassword, setCustomerLoginPassword] = useState("");

  const [customerSignupFirstName, setCustomerSignupFirstName] = useState("");
  const [customerSignupLastName, setCustomerSignupLastName] = useState("");
  const [customerSignupEmail, setCustomerSignupEmail] = useState("");
  const [customerSignupPassword, setCustomerSignupPassword] = useState("");

  const [staffLoginEmail, setStaffLoginEmail] = useState("");
  const [staffLoginPassword, setStaffLoginPassword] = useState("");

  const [staffSignupFirstName, setStaffSignupFirstName] = useState("");
  const [staffSignupLastName, setStaffSignupLastName] = useState("");
  const [staffSignupEmail, setStaffSignupEmail] = useState("");
  const [staffSignupBusinessCode, setStaffSignupBusinessCode] = useState("");
  const [staffSignupPhone, setStaffSignupPhone] = useState("");
  const [staffSignupColorHex, setStaffSignupColorHex] = useState("#12b3a8");
  const [staffSignupPassword, setStaffSignupPassword] = useState("");

  const [businessLoginEmail, setBusinessLoginEmail] = useState("");
  const [businessLoginPassword, setBusinessLoginPassword] = useState("");

  const [businessOwnerFirstName, setBusinessOwnerFirstName] = useState("");
  const [businessOwnerLastName, setBusinessOwnerLastName] = useState("");
  const [businessSignupName, setBusinessSignupName] = useState("");
  const [businessSignupCategory, setBusinessSignupCategory] = useState("");
  const [businessSignupEmail, setBusinessSignupEmail] = useState("");
  const [businessSignupPhone, setBusinessSignupPhone] = useState("");
  const [businessSignupPassword, setBusinessSignupPassword] = useState("");
  const [businessSignupAddress, setBusinessSignupAddress] = useState("");
  const [businessSignupTimezone, setBusinessSignupTimezone] = useState("");
  const [businessSignupLogoUrl, setBusinessSignupLogoUrl] = useState("");

  const [showCustomerLoginPassword, setShowCustomerLoginPassword] = useState(false);
  const [showCustomerSignupPassword, setShowCustomerSignupPassword] = useState(false);
  const [showStaffLoginPassword, setShowStaffLoginPassword] = useState(false);
  const [showStaffSignupPassword, setShowStaffSignupPassword] = useState(false);
  const [showBusinessLoginPassword, setShowBusinessLoginPassword] = useState(false);
  const [showBusinessSignupPassword, setShowBusinessSignupPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

 const [industryOptions, setIndustryOptions] = useState<IndustryResponse[]>([]);

  useEffect(() => {
    async function loadIndustries() {
      try {
        const industries = await listPublicIndustries();
        setIndustryOptions(industries);
      } catch (error) {
        console.error("Failed to load industries", error);
      }
    }

    loadIndustries();
  }, []);

  async function onCustomerLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({
        email: customerLoginEmail,
        password: customerLoginPassword,
      });

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        businessId: response.businessId,
        staffId: response.staffId
      });

      setSuccessMessage("Login successful");
      onClose();
      navigate("/dashboard");
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onCustomerSignupSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await signupCustomer({
        email: customerSignupEmail,
        password: customerSignupPassword,
        firstName: customerSignupFirstName,
        lastName: customerSignupLastName,
      });

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        businessId: response.businessId,
        staffId: response.staffId
      });

      setSuccessMessage("Signup successful");
      onClose();
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onStaffLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({
        email: staffLoginEmail,
        password: staffLoginPassword,
      });

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        businessId: response.businessId,
        staffId: response.staffId
      });

      setSuccessMessage("Login successful");
      onClose();
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onStaffSignupSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await signupStaff({
        email: staffSignupEmail,
        password: staffSignupPassword,
        firstName: staffSignupFirstName,
        lastName: staffSignupLastName,
        businessCode: staffSignupBusinessCode,
        phone: staffSignupPhone,
        colorHex: staffSignupColorHex,
      });

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        businessId: response.businessId,
        staffId: response.staffId
      });

      setSuccessMessage("Signup successful");
      onClose();
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onBusinessLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({
        email: businessLoginEmail,
        password: businessLoginPassword,
      });

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        businessId: response.businessId,
        staffId: response.staffId
      });

      setSuccessMessage("Login successful");
      onClose();
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onBusinessSignupSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await signupBusiness({
        ownerFirstName: businessOwnerFirstName,
        ownerLastName: businessOwnerLastName,
        ownerEmail: businessSignupEmail,
        password: businessSignupPassword,
        businessName: businessSignupName,
        industryId: Number(businessSignupCategory),
        phone: businessSignupPhone,
        businessEmail: businessSignupEmail,
        timezone: businessSignupTimezone,
        address: businessSignupAddress,
        logoUrl: businessSignupLogoUrl,
      });

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        businessId: response.businessId,
        staffId: response.staffId
      });

      setSuccessMessage("Signup successful");
      onClose();
      window.location.reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className={`auth-modal-shell ${isStaff || isBusiness ? "auth-modal-shell--wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-topbar">
          <div className="auth-modal-logo">Schedio</div>

          <button
            type="button"
            className="auth-modal-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {errorMessage && (
          <div className="auth-modal-message auth-modal-message--error">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="auth-modal-message auth-modal-message--success">
            {successMessage}
          </div>
        )}

        {isCustomer && (
          <div className="auth-modal-two-column-layout">
            <form className="auth-modal-panel" onSubmit={onCustomerLoginSubmit}>
              <h2 className="auth-modal-heading">Login</h2>

              <div className="auth-modal-field">
                <label className="auth-modal-label">email</label>
                <input
                  className="auth-modal-input"
                  type="email"
                  value={customerLoginEmail}
                  onChange={(e) => setCustomerLoginEmail(e.target.value)}
                />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label">password</label>
                <div className="auth-modal-password-wrap">
                  <input
                    className="auth-modal-input auth-modal-input--password"
                    type={showCustomerLoginPassword ? "text" : "password"}
                    value={customerLoginPassword}
                    onChange={(e) => setCustomerLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-modal-password-toggle"
                    onClick={() => setShowCustomerLoginPassword((prev) => !prev)}
                    aria-label={showCustomerLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showCustomerLoginPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-modal-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Login"}
              </button>
            </form>

            <form className="auth-modal-panel" onSubmit={onCustomerSignupSubmit}>
              <h2 className="auth-modal-heading">Sign up</h2>

              <div className="auth-modal-field">
                <label className="auth-modal-label">firstname</label>
                <input
                  className="auth-modal-input"
                  type="text"
                  value={customerSignupFirstName}
                  onChange={(e) => setCustomerSignupFirstName(e.target.value)}
                />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label">lastname</label>
                <input
                  className="auth-modal-input"
                  type="text"
                  value={customerSignupLastName}
                  onChange={(e) => setCustomerSignupLastName(e.target.value)}
                />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label">email</label>
                <input
                  className="auth-modal-input"
                  type="email"
                  value={customerSignupEmail}
                  onChange={(e) => setCustomerSignupEmail(e.target.value)}
                />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label">password</label>
                <div className="auth-modal-password-wrap">
                  <input
                    className="auth-modal-input auth-modal-input--password"
                    type={showCustomerSignupPassword ? "text" : "password"}
                    value={customerSignupPassword}
                    onChange={(e) => setCustomerSignupPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-modal-password-toggle"
                    onClick={() => setShowCustomerSignupPassword((prev) => !prev)}
                    aria-label={showCustomerSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showCustomerSignupPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-modal-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Sign up"}
              </button>
            </form>
          </div>
        )}

        {isStaff && (
          <div className="auth-modal-two-column-layout auth-modal-two-column-layout--wide">
            <form className="auth-modal-panel auth-modal-panel--login" onSubmit={onStaffLoginSubmit}>
              <h2 className="auth-modal-heading">Staff Login</h2>

              <div className="auth-modal-field">
                <label className="auth-modal-label">email</label>
                <input
                  className="auth-modal-input"
                  type="email"
                  value={staffLoginEmail}
                  onChange={(e) => setStaffLoginEmail(e.target.value)}
                />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label">password</label>
                <div className="auth-modal-password-wrap">
                  <input
                    className="auth-modal-input auth-modal-input--password"
                    type={showStaffLoginPassword ? "text" : "password"}
                    value={staffLoginPassword}
                    onChange={(e) => setStaffLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-modal-password-toggle"
                    onClick={() => setShowStaffLoginPassword((prev) => !prev)}
                    aria-label={showStaffLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showStaffLoginPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-modal-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Login"}
              </button>
            </form>

            <form className="auth-modal-panel auth-modal-panel--signup" onSubmit={onStaffSignupSubmit}>
              <h2 className="auth-modal-heading auth-modal-heading--left">
                Staff Sign up
              </h2>

              <p className="auth-modal-helper-text">
                Use your business code and the same email your business has on file.
                If your manager already added you, your account will be linked automatically.
              </p>

              <div className="auth-modal-form-grid auth-modal-form-grid--two">
                <div className="auth-modal-field">
                  <label className="auth-modal-label">first name</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={staffSignupFirstName}
                    onChange={(e) => setStaffSignupFirstName(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">last name</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={staffSignupLastName}
                    onChange={(e) => setStaffSignupLastName(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">email</label>
                  <input
                    className="auth-modal-input"
                    type="email"
                    value={staffSignupEmail}
                    onChange={(e) => setStaffSignupEmail(e.target.value)}
                  />
                  <div className="auth-modal-field-hint">
                    This should match the email registered by your business.
                  </div>
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">business code</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={staffSignupBusinessCode}
                    onChange={(e) => setStaffSignupBusinessCode(e.target.value)}
                  />
                  <div className="auth-modal-field-hint">
                    Provided by your business owner or manager.
                  </div>
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">phone</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={staffSignupPhone}
                    onChange={(e) => setStaffSignupPhone(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">calendar color</label>
                  <input
                    className="auth-modal-input"
                    type="color"
                    value={staffSignupColorHex}
                    onChange={(e) => setStaffSignupColorHex(e.target.value)}
                  />
                  <div className="auth-modal-field-hint">
                    This color can be used to display your appointments in the calendar.
                  </div>
                </div>

                <div className="auth-modal-field auth-modal-field--span-2">
                  <label className="auth-modal-label">password</label>
                  <div className="auth-modal-password-wrap">
                    <input
                      className="auth-modal-input auth-modal-input--password"
                      type={showStaffSignupPassword ? "text" : "password"}
                      value={staffSignupPassword}
                      onChange={(e) => setStaffSignupPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="auth-modal-password-toggle"
                      onClick={() => setShowStaffSignupPassword((prev) => !prev)}
                      aria-label={showStaffSignupPassword ? "Hide password" : "Show password"}
                    >
                      {showStaffSignupPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="auth-modal-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Sign up"}
              </button>
            </form>
          </div>
        )}

        {isBusiness && (
          <div className="auth-modal-two-column-layout auth-modal-two-column-layout--wide">
            <form className="auth-modal-panel auth-modal-panel--login" onSubmit={onBusinessLoginSubmit}>
              <h2 className="auth-modal-heading">Business Login</h2>

              <div className="auth-modal-field">
                <label className="auth-modal-label">email</label>
                <input
                  className="auth-modal-input"
                  type="email"
                  value={businessLoginEmail}
                  onChange={(e) => setBusinessLoginEmail(e.target.value)}
                />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label">password</label>
                <div className="auth-modal-password-wrap">
                  <input
                    className="auth-modal-input auth-modal-input--password"
                    type={showBusinessLoginPassword ? "text" : "password"}
                    value={businessLoginPassword}
                    onChange={(e) => setBusinessLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-modal-password-toggle"
                    onClick={() => setShowBusinessLoginPassword((prev) => !prev)}
                    aria-label={showBusinessLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showBusinessLoginPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-modal-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Login"}
              </button>
            </form>

            <form className="auth-modal-panel auth-modal-panel--signup" onSubmit={onBusinessSignupSubmit}>
              <h2 className="auth-modal-heading auth-modal-heading--left">
                Business Sign up
              </h2>

              <p className="auth-modal-helper-text">
                Create your owner account and your business profile together.
                You can add and manage staff after registration.
              </p>

              <div className="auth-modal-form-grid auth-modal-form-grid--two">
                <div className="auth-modal-field">
                  <label className="auth-modal-label">owner first name</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={businessOwnerFirstName}
                    onChange={(e) => setBusinessOwnerFirstName(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">owner last name</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={businessOwnerLastName}
                    onChange={(e) => setBusinessOwnerLastName(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">business name</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={businessSignupName}
                    onChange={(e) => setBusinessSignupName(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">industry</label>
                  <select
                    className="auth-modal-input"
                    value={businessSignupCategory}
                    onChange={(e) => setBusinessSignupCategory(e.target.value)}
                  >
                    <option value="">select industry</option>
                    {industryOptions.map((industry) => (
                      <option key={industry.id} value={String(industry.id)}>
                        {industry.industryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">owner/business email</label>
                  <input
                    className="auth-modal-input"
                    type="email"
                    value={businessSignupEmail}
                    onChange={(e) => setBusinessSignupEmail(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">phone</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={businessSignupPhone}
                    onChange={(e) => setBusinessSignupPhone(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">password</label>
                  <div className="auth-modal-password-wrap">
                    <input
                      className="auth-modal-input auth-modal-input--password"
                      type={showBusinessSignupPassword ? "text" : "password"}
                      value={businessSignupPassword}
                      onChange={(e) => setBusinessSignupPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="auth-modal-password-toggle"
                      onClick={() => setShowBusinessSignupPassword((prev) => !prev)}
                      aria-label={showBusinessSignupPassword ? "Hide password" : "Show password"}
                    >
                      {showBusinessSignupPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">address</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={businessSignupAddress}
                    onChange={(e) => setBusinessSignupAddress(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">timezone</label>
                  <select
                    className="auth-modal-input"
                    value={businessSignupTimezone}
                    onChange={(e) => setBusinessSignupTimezone(e.target.value)}
                  >
                    <option value="">select timezone</option>
                    <option value="Europe/Athens">Europe/Athens</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Berlin">Europe/Berlin</option>
                  </select>
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">logo url</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={businessSignupLogoUrl}
                    onChange={(e) => setBusinessSignupLogoUrl(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-modal-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Sign up"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}