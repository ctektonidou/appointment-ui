import React, { useEffect, useState } from "react";
import type { Staff } from "../../../../api/staff";
import "./StaffForm.css";

export type StaffFormMode = "create" | "edit";

export interface StaffFormValues {
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  colorHex?: string | null;
  isActive: boolean;
}

interface StaffFormProps {
  mode: StaffFormMode;
  initialStaff: Staff | null;
  loading?: boolean;
  onSave: (values: StaffFormValues) => void;
  onCancel: () => void;
}

export default function StaffForm({
  mode,
  initialStaff,
  loading = false,
  onSave,
  onCancel,
}: StaffFormProps) {
  const [values, setValues] = useState<StaffFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    colorHex: "#20b2aa",
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStaff) {
      setValues({
        firstName: initialStaff.firstName ?? "",
        lastName: initialStaff.lastName ?? "",
        email: initialStaff.email ?? "",
        phone: initialStaff.phone ?? "",
        colorHex: initialStaff.colorHex ?? "#20b2aa",
        isActive: !!initialStaff.isActive,
      });
    } else {
      setValues({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        colorHex: "#20b2aa",
        isActive: true,
      });
    }

    setError(null);
  }, [initialStaff]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    onSave({
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName?.trim() || null,
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      colorHex: values.colorHex?.trim() || null,
    });
  }

  const title = mode === "create" ? "Add Staff Member" : "Edit Staff Member";

  return (
    <div className="staff-modal-backdrop">
      <div className="staff-modal">
        <div className="staff-modal-header">
          <h2 className="staff-modal-title">{title}</h2>
          <button
            type="button"
            className="staff-modal-close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="staff-modal-form">
          {error && <div className="staff-modal-error">{error}</div>}

          <label className="staff-modal-field">
            <span>First name *</span>
            <input
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              className="staff-modal-input"
              placeholder="Anna"
            />
          </label>

          <label className="staff-modal-field">
            <span>Last name</span>
            <input
              name="lastName"
              value={values.lastName ?? ""}
              onChange={handleChange}
              className="staff-modal-input"
              placeholder="Peter"
            />
          </label>

          <label className="staff-modal-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={values.email ?? ""}
              onChange={handleChange}
              className="staff-modal-input"
              placeholder="anna@test.com"
            />
          </label>

          <label className="staff-modal-field">
            <span>Phone</span>
            <input
              name="phone"
              value={values.phone ?? ""}
              onChange={handleChange}
              className="staff-modal-input"
              placeholder="6912345678"
            />
          </label>

          <label className="staff-modal-field">
            <span>Calendar color</span>
            <input
              name="colorHex"
              type="color"
              value={values.colorHex ?? "#20b2aa"}
              onChange={handleChange}
              className="staff-modal-color-input"
            />
          </label>

          <div className="staff-modal-status-row">
            <span>Status</span>
            <label className="staff-toggle">
              <input
                type="checkbox"
                name="isActive"
                checked={values.isActive}
                onChange={handleChange}
              />
              <span className="staff-toggle-slider" />
            </label>
            <span className="staff-status-text">
              {values.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="staff-modal-actions">
            <button
              type="submit"
              className="staff-modal-save"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="staff-modal-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}