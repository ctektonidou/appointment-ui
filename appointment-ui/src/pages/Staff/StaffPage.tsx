import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { createStaff, listStaff, type CreateStaffRequest, type Staff } from "../../api/staff";
import "./StaffPage.css";

export default function StaffPage() {
  const params = useParams();
  const businessId = useMemo(() => Number(params.businessId), [params.businessId]);

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateStaffRequest>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    colorHex: "#3b82f6",
    isActive: true,
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listStaff(businessId);
      setStaff(data);
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

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    try {
      const created = await createStaff(businessId, {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName?.trim() || null,
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        colorHex: form.colorHex?.trim() || null,
      });

      setStaff((prev) => [...prev, created]);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        colorHex: "#3b82f6",
        isActive: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="staff-page">
      <h1>Staff</h1>
      <p>
        Business ID: <b>{params.businessId}</b>
      </p>

      {error && <div className="error-box">{error}</div>}

      <section className="section">
        <h2>Add staff member</h2>

        <form onSubmit={onCreate} className="form-grid">
          <label>
            First name *
            <input
              className="input"
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            />
          </label>

          <label>
            Last name
            <input
              className="input"
              value={form.lastName ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            />
          </label>

          <label>
            Email
            <input
              className="input"
              value={form.email ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </label>

          <label>
            Phone
            <input
              className="input"
              value={form.phone ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </label>

          <label>
            Color
            <input
              className="input"
              value={form.colorHex ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, colorHex: e.target.value }))}
              placeholder="#RRGGBB"
            />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 22 }}>
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            />
            Active
          </label>

          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit">Create</button>
          </div>
        </form>
      </section>

      <section className="section">
        <h2>Staff list</h2>

        {loading ? (
          <div>Loading...</div>
        ) : staff.length === 0 ? (
          <div>No staff found.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span
                      className="color-dot"
                      style={{ background: s.colorHex ?? "#999" }}
                    />
                    {s.firstName} {s.lastName ?? ""}
                  </td>
                  <td>{s.email ?? "-"}</td>
                  <td>{s.phone ?? "-"}</td>
                  <td>{s.isActive ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}