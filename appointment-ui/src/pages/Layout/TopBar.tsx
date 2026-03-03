import "./TopBar.css";
import { mockCurrentUser } from "../../lib/currentUser";
import { useLocation } from "react-router-dom";

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
  const user = mockCurrentUser;

  const title = getPageTitle(location.pathname);

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>

      <div className="topbar-user">
        <span className="topbar-username">{user.name}</span>
        <div className="topbar-avatar">
          👤
        </div>
      </div>
    </div>
  );
}