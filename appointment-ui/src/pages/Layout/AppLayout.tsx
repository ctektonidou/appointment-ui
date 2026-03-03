import { NavLink, Outlet } from "react-router-dom";
import { mockCurrentUser } from "../../lib/currentUser";
import type { UserRole } from "../../types/auth";
import "./AppLayout.css";
import TopBar from "./TopBar";

type MenuItem = {
  to: string;
  label: string;
};

const menuByRole: Record<UserRole, MenuItem[]> = {
  owner: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/appointments", label: "Appointments" },
    { to: "/services", label: "Services" },
    { to: "/availability", label: "Availability" },
    { to: "/staff", label: "Staff" },
  ],
  staff: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/calendar", label: "Calendar" },
    { to: "/appointments", label: "Appointments" },
    { to: "/services", label: "Services" },
    { to: "/availability", label: "Availability" },
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

export default function AppLayout() {
  const user = mockCurrentUser;
  const menu = menuByRole[user.role];

  function handleLogout() {
    // TODO: replace with real logout later
    console.log("logout clicked");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          {user.businessName}
        </div>

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