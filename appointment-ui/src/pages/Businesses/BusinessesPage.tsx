import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessesPage.css";

type UserRole = "owner" | "staff" | "customer";

export type BusinessCard = {
  id: number;
  name: string;
  category: string;
  location: string;
  openHours: string;
  services: string;
};

const INDUSTRY_OPTIONS = [
  "All industries",
  "Hair Salon",
  "Barber Shop",
  "Nails",
  "Spa",
  "Massage",
  "Physiotherapy",
];

const LOCATION_OPTIONS = [
  "All locations",
  "Thessaloniki - Center",
  "Thessaloniki - East",
  "Thessaloniki - West",
  "Kalamaria",
  "Toumba",
];

const DEMO_BUSINESSES: BusinessCard[] = [
  {
    id: 1,
    name: "Business Name",
    category: "Hair Salon",
    location: "Thessaloniki - Center",
    openHours: "9:00 - 19:00",
    services: "Haircut, colouring",
  },
  {
    id: 2,
    name: "Business Name",
    category: "Hair Salon",
    location: "Thessaloniki - Center",
    openHours: "9:00 - 19:00",
    services: "Haircut, colouring",
  },
  {
    id: 3,
    name: "Glow Studio",
    category: "Spa",
    location: "Kalamaria",
    openHours: "10:00 - 20:00",
    services: "Massage, facial",
  },
  {
    id: 4,
    name: "Urban Barber",
    category: "Barber Shop",
    location: "Thessaloniki - East",
    openHours: "10:00 - 21:00",
    services: "Fade, beard trim",
  },
];

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

export default function BusinessesPage() {
  const role = getStoredUserRole();
  const isCustomer = role === "customer";
  const navigate = useNavigate();

  const [industry, setIndustry] = useState("All industries");
  const [location, setLocation] = useState("All locations");
  const [searchName, setSearchName] = useState("");
  const [submittedFilters, setSubmittedFilters] = useState({
    industry: "All industries",
    location: "All locations",
    searchName: "",
  });

  const filteredBusinesses = useMemo(() => {
    return DEMO_BUSINESSES.filter((business) => {
      const matchesIndustry =
        submittedFilters.industry === "All industries" ||
        business.category.toLowerCase() === submittedFilters.industry.toLowerCase();

      const matchesLocation =
        submittedFilters.location === "All locations" ||
        business.location.toLowerCase() === submittedFilters.location.toLowerCase();

      const matchesName =
        submittedFilters.searchName.trim() === "" ||
        business.name.toLowerCase().includes(submittedFilters.searchName.toLowerCase());

      return matchesIndustry && matchesLocation && matchesName;
    });
  }, [submittedFilters]);

  function onSearch() {
    setSubmittedFilters({
      industry,
      location,
      searchName,
    });
  }

  function onViewServices(business: BusinessCard) {
    navigate("/create-appointment", {
      state: {
        step: 2,
        selectedBusiness: business,
      },
    });
  }

  if (!isCustomer) {
    return (
      <div className="businesses-page">
        <h1 className="businesses-title">Businesses</h1>
        <p>Only customers can access this page.</p>
      </div>
    );
  }

  return (
    <div className="businesses-page">
      <h1 className="businesses-title">Business</h1>

      <section className="businesses-card">
        <div className="businesses-filters">
          <div className="businesses-field">
            <label className="businesses-label">Industry</label>
            <select
              className="businesses-select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="businesses-field">
            <label className="businesses-label">Location - Town</label>
            <select
              className="businesses-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {LOCATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="businesses-field businesses-field--name">
            <label className="businesses-label">Name</label>
            <input
              className="businesses-input"
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
        </div>

        <div className="businesses-search-row">
          <button
            type="button"
            className="businesses-search-btn"
            onClick={onSearch}
          >
            Search
          </button>
        </div>

        <div className="businesses-results">
          {filteredBusinesses.length === 0 ? (
            <div className="businesses-empty">
              No businesses found for the selected filters.
            </div>
          ) : (
            filteredBusinesses.map((business) => (
              <div key={business.id} className="business-card">
                <div className="business-card-header">
                  <div className="business-card-logo">✂</div>

                  <div className="business-card-title-wrap">
                    <div className="business-card-title">{business.name}</div>
                    <div className="business-card-category">{business.category}</div>
                  </div>
                </div>

                <div className="business-card-divider" />

                <div className="business-card-details">
                  <div className="business-card-detail-row">
                    <span className="business-card-detail-icon">📍</span>
                    <span>{business.location}</span>
                  </div>

                  <div className="business-card-detail-row">
                    <span className="business-card-detail-icon">🕒</span>
                    <span>Open today: {business.openHours}</span>
                  </div>

                  <div className="business-card-services">
                    Services: {business.services}
                  </div>
                </div>

                <button
                  type="button"
                  className="business-card-btn"
                  onClick={() => onViewServices(business)}
                >
                  View Services
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}