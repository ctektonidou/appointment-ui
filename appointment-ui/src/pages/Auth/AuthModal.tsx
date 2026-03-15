import { useState } from "react";
import type { FormEvent } from "react";
import "./AuthModal.css";

export type AuthModalRole = "customer" | "staff" | "business";

type AuthModalProps = {
  role: AuthModalRole;
  onClose: () => void;
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AuthModal({ role, onClose }: AuthModalProps) {
  const isCustomer = role === "customer";
  const isStaff = role === "staff";
  const isBusiness = role === "business";

  const [customerLoginEmail, setCustomerLoginEmail] = useState("");
  const [customerLoginPassword, setCustomerLoginPassword] = useState("");

  const [customerSignupName, setCustomerSignupName] = useState("");
  const [customerSignupEmail, setCustomerSignupEmail] = useState("");
  const [customerSignupPassword, setCustomerSignupPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  function onCustomerLoginSubmit(e: FormEvent) {
    e.preventDefault();
    console.log("Customer login", {
      email: customerLoginEmail,
      password: customerLoginPassword,
    });
    alert("Customer login demo");
  }

  function onCustomerSignupSubmit(e: FormEvent) {
    e.preventDefault();
    console.log("Customer signup", {
      name: customerSignupName,
      email: customerSignupEmail,
      password: customerSignupPassword,
    });
    alert("Customer signup demo");
  }

  function onSingleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    console.log(`${role} login`, {
      email: loginEmail,
      password: loginPassword,
    });
    alert(`${capitalize(role)} login demo`);
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-shell" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-topbar">
          <div className="auth-modal-logo">Schedio</div>

          <button type="button" className="auth-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {isCustomer && (
          <div className="auth-modal-customer-layout">
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

              <button type="submit" className="auth-modal-primary-btn">
                Login
              </button>
            </form>

            <form className="auth-modal-panel" onSubmit={onCustomerSignupSubmit}>
              <h2 className="auth-modal-heading">Sign up</h2>

              <div className="auth-modal-field">
                <label className="auth-modal-label">name</label>
                <input
                  className="auth-modal-input"
                  type="text"
                  value={customerSignupName}
                  onChange={(e) => setCustomerSignupName(e.target.value)}
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

              <button type="submit" className="auth-modal-primary-btn">
                Sign up
              </button>
            </form>
          </div>
        )}

        {(isStaff || isBusiness) && (
          <div className="auth-modal-single-layout">
            <form className="auth-modal-panel auth-modal-panel--single" onSubmit={onSingleLoginSubmit}>
              <h2 className="auth-modal-heading">
                {capitalize(role)} Login
              </h2>

              <div className="auth-modal-field">
                <label className="auth-modal-label">email</label>
                <input
                  className="auth-modal-input"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label">password</label>
                <input
                  className="auth-modal-input"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-modal-primary-btn">
                Login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}