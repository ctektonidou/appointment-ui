import { useState } from "react";
import type { FormEvent } from "react";
import { login, signup } from "../../api/authApi";
import "./AuthModal.css";
import { useNavigate } from "react-router-dom";

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
};

function saveAuthUser(user: AuthUser) {
  localStorage.setItem("authUser", JSON.stringify(user));
  localStorage.setItem("userId", String(user.id));
  localStorage.setItem("userRole", user.role);
  localStorage.setItem("userEmail", user.email);
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
  const [staffSignupPassword, setStaffSignupPassword] = useState("");

  const [businessLoginEmail, setBusinessLoginEmail] = useState("");
  const [businessLoginPassword, setBusinessLoginPassword] = useState("");

  const [businessSignupName, setBusinessSignupName] = useState("");
  const [businessSignupCategory, setBusinessSignupCategory] = useState("");
  const [businessSignupEmail, setBusinessSignupEmail] = useState("");
  const [businessSignupPhone, setBusinessSignupPhone] = useState("");
  const [businessSignupPassword, setBusinessSignupPassword] = useState("");
  const [businessSignupAddress, setBusinessSignupAddress] = useState("");
  const [businessSignupTimezone, setBusinessSignupTimezone] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await signup({
        email: customerSignupEmail,
        password: customerSignupPassword,
        firstName: customerSignupFirstName,
        lastName: customerSignupLastName,
        role: "customer",
      });

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
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
      const response = await signup({
        email: staffSignupEmail,
        password: staffSignupPassword,
        firstName: staffSignupFirstName,
        lastName: staffSignupLastName,
        role: "staff",
      });

      console.log("Business code for later backend use:", staffSignupBusinessCode);

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
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
      const response = await signup({
        email: businessSignupEmail,
        password: businessSignupPassword,
        firstName: businessSignupName,
        lastName: "",
        role: "business",
      });

      console.log("Business extra fields for later backend use:", {
        category: businessSignupCategory,
        phone: businessSignupPhone,
        address: businessSignupAddress,
        timezone: businessSignupTimezone,
      });

      saveAuthUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
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
        className={`auth-modal-shell ${isStaff || isBusiness ? "auth-modal-shell--wide" : ""
          }`}
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

        {errorMessage && <div className="auth-modal-message auth-modal-message--error">{errorMessage}</div>}
        {successMessage && <div className="auth-modal-message auth-modal-message--success">{successMessage}</div>}

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
                <input
                  className="auth-modal-input"
                  type="password"
                  value={customerLoginPassword}
                  onChange={(e) => setCustomerLoginPassword(e.target.value)}
                />
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
                <input
                  className="auth-modal-input"
                  type="password"
                  value={customerSignupPassword}
                  onChange={(e) => setCustomerSignupPassword(e.target.value)}
                />
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
                <input
                  className="auth-modal-input"
                  type="password"
                  value={staffLoginPassword}
                  onChange={(e) => setStaffLoginPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-modal-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Login"}
              </button>
            </form>

            <form className="auth-modal-panel auth-modal-panel--signup" onSubmit={onStaffSignupSubmit}>
              <h2 className="auth-modal-heading auth-modal-heading--left">
                Staff Sign up
              </h2>

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
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">business code</label>
                  <input
                    className="auth-modal-input"
                    type="text"
                    value={staffSignupBusinessCode}
                    onChange={(e) => setStaffSignupBusinessCode(e.target.value)}
                  />
                </div>

                <div className="auth-modal-field auth-modal-field--span-2">
                  <label className="auth-modal-label">password</label>
                  <input
                    className="auth-modal-input"
                    type="password"
                    value={staffSignupPassword}
                    onChange={(e) => setStaffSignupPassword(e.target.value)}
                  />
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
                <input
                  className="auth-modal-input"
                  type="password"
                  value={businessLoginPassword}
                  onChange={(e) => setBusinessLoginPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-modal-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : "Login"}
              </button>
            </form>

            <form className="auth-modal-panel auth-modal-panel--signup" onSubmit={onBusinessSignupSubmit}>
              <h2 className="auth-modal-heading auth-modal-heading--left">
                Business Sign up
              </h2>

              <div className="auth-modal-form-grid auth-modal-form-grid--two">
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
                  <label className="auth-modal-label">business category</label>
                  <select
                    className="auth-modal-input"
                    value={businessSignupCategory}
                    onChange={(e) => setBusinessSignupCategory(e.target.value)}
                  >
                    <option value="">select business categories</option>
                    <option value="hair_salon">Hair Salon</option>
                    <option value="barber_shop">Barber Shop</option>
                    <option value="spa">Spa</option>
                    <option value="nails">Nails</option>
                    <option value="massage">Massage</option>
                    <option value="physiotherapy">Physiotherapy</option>
                  </select>
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">email</label>
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
                  <input
                    className="auth-modal-input"
                    type="password"
                    value={businessSignupPassword}
                    onChange={(e) => setBusinessSignupPassword(e.target.value)}
                  />
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
                    <option value="europe_athens">Europe/Athens</option>
                    <option value="europe_london">Europe/London</option>
                    <option value="europe_berlin">Europe/Berlin</option>
                  </select>
                </div>

                <div className="auth-modal-field">
                  <label className="auth-modal-label">logo</label>
                  <div className="auth-modal-logo-upload-placeholder">🖼️</div>
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