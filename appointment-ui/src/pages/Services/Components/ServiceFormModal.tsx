import { useState } from "react";
import type { Service } from "../../../api/services";
import "./ServiceFormModal.css";

export type ServiceFormValues = {
  name: string;
  description?: string;
  durationMinutes: number;
  priceEuros: number;
  colorHex?: string | null;
  active: boolean;
};

type Props = {
  mode: "create" | "edit";
  initial?: Service;
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => void | Promise<void>;
};

export function ServiceFormModal({ mode, initial, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ServiceFormValues>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    durationMinutes: initial?.durationMinutes ?? 30,
    priceEuros: initial?.priceEuros ?? 0,
    colorHex: initial?.colorHex ?? "#008f7a",
    active: initial?.active ?? true,
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    if (!form.name.trim()) {
      setLocalError("Service name is required.");
      return false;
    }
    if (!form.durationMinutes || form.durationMinutes <= 0) {
      setLocalError("Duration must be greater than 0.");
      return false;
    }
    if (form.priceEuros < 0) {
      setLocalError("Price cannot be negative.");
      return false;
    }
    setLocalError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === "create" ? "Add Service" : "Edit Service";

  return (
    <div className="service-modal-backdrop">
      <div className="service-modal">
        {/* Header */}
        <div className="service-modal-header">
          <h2 className="service-modal-title">{title}</h2>
          <button
            type="button"
            className="service-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form className="service-modal-body" onSubmit={handleSubmit}>
          {/* Service Name */}
          <label className="service-field">
            <span className="service-field-label">Service Name</span>
            <input
              className="service-input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>

          {/* Description */}
          <label className="service-field">
            <span className="service-field-label">Description</span>
            <textarea
              className="service-textarea"
              rows={3}
              placeholder="Description of the Service"
              value={form.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
            />
          </label>

          {/* Duration */}
          <label className="service-field">
            <span className="service-field-label">Duration</span>
            <select
              className="service-input"
              value={form.durationMinutes}
              onChange={(e) =>
                update("durationMinutes", Number(e.target.value) || 0)
              }
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </label>

          {/* Price + Color row */}
          <div className="service-row">
            <label className="service-field service-field-half">
              <span className="service-field-label">Price</span>
              <div className="service-price-wrapper">
                <input
                  type="number"
                  min={0}
                  className="service-input service-price-input"
                  value={form.priceEuros}
                  onChange={(e) =>
                    update("priceEuros", Number(e.target.value) || 0)
                  }
                />
                <span className="service-price-suffix">euro</span>
              </div>
            </label>

            <label className="service-field service-field-half">
              <span className="service-field-label">Color</span>
              <div className="service-color-box-wrapper">
                <input
                  type="color"
                  className="service-color-input"
                  value={form.colorHex ?? "#008f7a"}
                  onChange={(e) => update("colorHex", e.target.value)}
                />
              </div>
            </label>
          </div>

          {/* Active */}
          <label className="service-active-row">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
            />
            <span>Active</span>
          </label>

          {localError && <div className="service-modal-error">{localError}</div>}

          {/* Footer buttons */}
          <div className="service-modal-footer">
            <button
              type="submit"
              className="service-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="service-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}