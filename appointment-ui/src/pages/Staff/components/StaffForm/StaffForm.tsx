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
    colorHex: "#1ba7a1",
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);

  // when switching to edit, pre-fill fields
  useEffect(() => {
    if (initialStaff) {
      setValues({
        firstName: initialStaff.firstName ?? "",
        lastName: initialStaff.lastName ?? "",
        email: initialStaff.email ?? "",
        phone: initialStaff.phone ?? "",
        colorHex: initialStaff.colorHex ?? "#1ba7a1",
        isActive: !!initialStaff.isActive,
      });
    } else {
      setValues({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        colorHex: "#1ba7a1",
        isActive: true,
      });
    }
    setError(null);
  }, [initialStaff]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value, type, checked } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.firstName.trim()) {
      setError("Staff name is required.");
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
            <span>Staff Name *</span>
            <input
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              className="staff-modal-input"
              placeholder="Anna Peter"
            />
          </label>

          <label className="staff-modal-field">
            <span>Email</span>
            <input
              name="email"
              value={values.email ?? ""}
              onChange={handleChange}
              className="staff-modal-input"
              placeholder="Email"
            />
          </label>

          <label className="staff-modal-field">
            <span>Phone</span>
            <input
              name="phone"
              value={values.phone ?? ""}
              onChange={handleChange}
              className="staff-modal-input"
              placeholder="Phone"
            />
          </label>

          <label className="staff-modal-field">
            <span>Color</span>
            <input
              name="colorHex"
              value={values.colorHex ?? ""}
              onChange={handleChange}
              className="staff-modal-input"
              placeholder="#RRGGBB"
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