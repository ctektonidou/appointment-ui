import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  listServices,
  updateService,
  deleteService,
  type Service,
} from "../../api/services";
import "./ServicesPage.css";

export default function ServicesPage() {
  const params = useParams();
  const businessId = useMemo(
    () => (params.businessId ? Number(params.businessId) : 1),
    [params.businessId]
  );

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Load services for this business
  // ---------------------------------------------------------------------------
  async function load() {
    setLoading(true);
    setError(null);

    try {
      const data = await listServices(businessId);
      setServices(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(businessId) || businessId <= 0) {
      setError("Invalid businessId in URL.");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  async function handleToggleActive(service: Service) {
    const newActive = !service.active;

    // optimistic update
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, active: newActive } : s
      )
    );

    try {
      await updateService(businessId, service.id, { active: newActive });
    } catch (e) {
      // revert on error
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, active: service.active } : s
        )
      );
      setError(e instanceof Error ? e.message : "Failed to update service");
    }
  }

  async function handleDelete(service: Service) {
    const ok = window.confirm(
      `Delete service "${service.name}"? This cannot be undone.`
    );
    if (!ok) return;

    // optimistic remove
    const before = services;
    setServices((prev) => prev.filter((s) => s.id !== service.id));

    try {
      await deleteService(businessId, service.id);
    } catch (e) {
      setServices(before);
      setError(e instanceof Error ? e.message : "Failed to delete service");
    }
  }

  function handleNewService() {
    // For now just a placeholder – later we can open a modal with a form.
    alert("New Service form will go here (popup like in mockup).");
  }

  function handleEdit(service: Service) {
    // Placeholder – later you can reuse the “New Service” popup in edit mode.
    alert(`Edit Service "${service.name}" (open edit dialog here).`);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="services-page">
      <div className="services-header-row">
        <h1 className="services-title">Services</h1>
        <button
          type="button"
          className="services-new-btn"
          onClick={handleNewService}
        >
          New Service
        </button>
      </div>

      {error && <div className="services-error">{error}</div>}

      <div className="services-table-card">
        {loading ? (
          <div className="services-loading">Loading…</div>
        ) : services.length === 0 ? (
          <div className="services-empty">No services found.</div>
        ) : (
          <table className="services-table">
            <thead>
              <tr>
                <th>Services</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Active</th>
                <th className="services-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.durationMinutes} minutes</td>
                  <td>{s.priceEuros} euros</td>
                  <td>
                    <label className="services-toggle">
                      <input
                        type="checkbox"
                        checked={s.active}
                        onChange={() => handleToggleActive(s)}
                      />
                      <span className="services-toggle-slider" />
                    </label>
                  </td>
                  <td className="services-actions">
                    <button
                      type="button"
                      className="services-icon-btn"
                      onClick={() => handleEdit(s)}
                      aria-label="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="services-icon-btn"
                      onClick={() => handleDelete(s)}
                      aria-label="Delete"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination placeholder – we’ll wire real data later */}
      <div className="services-pagination">
        <button className="services-page-btn" disabled>
          &lt;
        </button>
        <span className="services-page-number">1</span>
        <button className="services-page-btn" disabled>
          &gt;
        </button>
      </div>
    </div>
  );
}