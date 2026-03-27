import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { UserRole } from "../../types/auth";
import "./AppLayout.css";
import TopBar from "./TopBar";

type MenuItem = {
  to: string;
  label: string;
};

type StoredUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  businessName?: string;
};

const menuByRole: Record<UserRole, MenuItem[]> = {
  owner: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/appointments", label: "Appointments" },
    { to: "/services", label: "Services" },
    { to: "/availability", label: "Availability" },
    { to: "/create-appointment", label: "Create Appointment" },
    { to: "/staff", label: "Staff" },
  ],
  staff: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/appointments", label: "Appointments" },
    // { to: "/services", label: "Services" },
    { to: "/availability", label: "Availability" },
    { to: "/blocked-dates", label: "MyBlocked Days" },
    { to: "/create-appointment", label: "Create Appointment" },
    { to: "/staff", label: "Staff" },
  ],
  customer: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/my-appointments", label: "My Appointments" },
    { to: "/create-appointment", label: "Create Appointment" },
    { to: "/businesses", label: "Businesses" },
  ],
};

function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = getStoredUserRole();
  const menu = menuByRole[role];

  const sidebarTitle =
    role === "customer"
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Customer"
      : user?.businessName ||
        `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
        "Business";

  function handleLogout() {
    localStorage.removeItem("authUser");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("businessId");
    navigate("/");
    window.location.reload();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">{sidebarTitle}</div>

        <nav className="sidebar-menu">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link--active" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="app-content">
        <TopBar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}