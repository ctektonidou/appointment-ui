import React from "react";
import type { Staff } from "../../../../api/staff";
import "./StaffTable.css";

interface StaffTableProps {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

export default function StaffTable({
  staff,
  onEdit,
  onDelete,
}: StaffTableProps) {
  if (staff.length === 0) {
    return <div className="staff-table-empty">No staff found.</div>;
  }

  return (
    <div className="staff-table-wrapper">
      <table className="staff-table">
        <thead>
          <tr>
            <th className="staff-col-name">Staff</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th className="staff-col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className={!s.isActive ? "staff-row-inactive" : ""}>
              <td className="staff-col-name">
                <span
                  className="staff-color-dot"
                  style={{ backgroundColor: s.colorHex || "#20b2aa" }}
                />
                {s.firstName} {s.lastName ?? ""}
              </td>
              <td>{s.email ?? "-"}</td>
              <td>{s.phone ?? "-"}</td>
              <td>{s.isActive ? "Active" : "Inactive"}</td>
              <td className="staff-col-actions">
                <button
                  type="button"
                  className="staff-icon-button"
                  title="Edit"
                  onClick={() => onEdit(s)}
                >
                  ✏️
                </button>

                <button
                  type="button"
                  className="staff-icon-button staff-icon-danger"
                  title="Delete"
                  onClick={() => onDelete(s)}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}