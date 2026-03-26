import { useEffect, useState } from "react";
import {
  createStaff,
  listStaff,
  updateStaff,
  deleteStaff,
  type Staff,
  type CreateStaffRequest,
} from "../../api/staff";
import { getPrimaryBusinessByOwnerUserId } from "../../api/businessApi";
import StaffForm, {
  type StaffFormValues,
  type StaffFormMode,
} from "./components/StaffForm/StaffForm";
import StaffTable from "./components/StaffTable/StaffTable";
import "./StaffPage.css";

function getUserId(): number | null {
  const storedUserId = localStorage.getItem("userId");
  if (!storedUserId) return null;

  const parsed = Number(storedUserId);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function StaffPage() {
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [businessName, setBusinessName] = useState<string>("");

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<StaffFormMode>("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const userId = getUserId();

    if (!userId) {
      setError("User id not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const business = await getPrimaryBusinessByOwnerUserId(userId);
      setBusinessId(business.id);
      setBusinessName(business.name);

      const data = await listStaff(business.id, false);
      setStaff(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreateModal() {
    setModalMode("create");
    setSelectedStaff(null);
    setModalOpen(true);
  }

  function openEditModal(staffMember: Staff) {
    setModalMode("edit");
    setSelectedStaff(staffMember);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedStaff(null);
  }

  async function handleSave(values: StaffFormValues) {
    if (!businessId) {
      setError("Business id not found.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (modalMode === "create") {
        const created = await createStaff(
          businessId,
          values as CreateStaffRequest
        );
        setStaff((prev) => [...prev, created]);
      } else if (modalMode === "edit" && selectedStaff) {
        const updated = await updateStaff(
          businessId,
          selectedStaff.id,
          values
        );
        setStaff((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      }

      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(staffMember: Staff) {
  if (!businessId) {
    setError("Business id not found.");
    return;
  }

  if (
    !window.confirm(
      `Delete staff member "${staffMember.firstName} ${staffMember.lastName ?? ""}"?`
    )
  ) {
    return;
  }

  setError(null);

  try {
    await deleteStaff(businessId, staffMember.id);
    setStaff((prev) => prev.filter((s) => s.id !== staffMember.id));
  } catch (e) {
    setError(
      e instanceof Error ? e.message : "Failed to delete staff member."
    );
  }
}

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <h1 className="staff-page-title">Staff</h1>
          {businessName && (
            <p className="staff-page-subtitle">
              Business: <b>{businessName}</b>
            </p>
          )}
        </div>

        <button
          type="button"
          className="staff-add-button"
          onClick={openCreateModal}
          disabled={!businessId}
        >
          Add Staff
        </button>
      </div>

      {error && <div className="staff-error-box">{error}</div>}

      {loading ? (
        <div>Loading staff...</div>
      ) : (
        <StaffTable
          staff={staff}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      {modalOpen && (
        <StaffForm
          mode={modalMode}
          initialStaff={selectedStaff}
          loading={saving}
          onSave={handleSave}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}