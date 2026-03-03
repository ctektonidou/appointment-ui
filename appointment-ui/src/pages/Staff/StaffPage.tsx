import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createStaff,
  listStaff,
  updateStaff,
  type Staff,
  type CreateStaffRequest,
} from "../../api/staff";
import StaffForm, {
  type StaffFormValues,
  type StaffFormMode,
} from "./components/StaffForm/StaffForm";
import StaffTable from "./components/StaffTable/StaffTable";
import "./StaffPage.css";

export default function StaffPage() {
  const params = useParams();
  const businessId = useMemo(
    () => Number(params.businessId),
    [params.businessId]
  );

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [modalMode, setModalMode] = useState<StaffFormMode>("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);

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
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

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
    setSaving(true);
    setError(null);
    try {
      if (modalMode === "create") {
        const created = await createStaff(businessId, values as CreateStaffRequest);
        setStaff((prev) => [...prev, created]);
      } else if (modalMode === "edit" && selectedStaff) {
        const updated = await updateStaff(businessId, selectedStaff.id, values);
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

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <h1 className="staff-page-title">Staff</h1>
          {params.businessId && (
            <p className="staff-page-subtitle">
              Business ID: <b>{params.businessId}</b>
            </p>
          )}
        </div>

        <button
          type="button"
          className="staff-add-button"
          onClick={openCreateModal}
        >
          Add Staff
        </button>
      </div>

      {error && <div className="staff-error-box">{error}</div>}

      {loading ? (
        <div>Loading staff...</div>
      ) : (
        <StaffTable staff={staff} onEdit={openEditModal} />
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