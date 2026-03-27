// src/components/Layout/TopBar.tsx

import "./TopBar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  businessId?: number | null;
};

function getPageTitle(pathname: string): string {
  if (pathname.includes("availability")) return "Availability - Staff";
  if (pathname.includes("staff")) return "Staff - Owner";
  if (pathname.includes("services")) return "Services - Owner";
  if (pathname.includes("appointments")) return "Appointments";
  if (pathname.includes("calendar")) return "Calendar";
  if (pathname.includes("dashboard")) return "Dashboard";
  return "";
}

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const userRaw = localStorage.getItem("authUser");
  const user: AuthUser | null = userRaw ? JSON.parse(userRaw) : null;

  const title = getPageTitle(location.pathname);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  function handleLogout() {
    localStorage.removeItem("authUser");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("businessId");
    setMenuOpen(false);
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>

      <div className="topbar-user-menu" ref={menuRef}>
        <button
          type="button"
          className="topbar-user"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="topbar-username">
            {user ? `${user.firstName} ${user.lastName}` : "Guest"}
          </span>

          <div className="topbar-avatar">👤</div>
        </button>

        {menuOpen && (
          <div className="topbar-dropdown">
            <button
              type="button"
              className="topbar-dropdown-item"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}