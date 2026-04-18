import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  searchPublicBusinesses,
  type BusinessResponse,
} from "../../api/businessApi";
import "./BusinessesPage.css";

import {
  listPublicIndustries,
  listPublicLocations,
  type IndustryResponse,
} from "../../api/publicMetadata";

type UserRole = "owner" | "staff" | "customer";

type BusinessCard = {
  id: number;
  name: string;
  category: string;
  location: string;
  openHours: string;
  services: string;
};

type SelectOption = {
  value: string;
  label: string;
};

function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

export function toBusinessCard(business: BusinessResponse): BusinessCard {
  return {
    id: business.id,
    name: business.name,
    category: business.industryName ?? "Unknown industry",
    location: business.location || "Location not available",
    openHours: "Not available yet",
    services: "Available on next step",
  };
}

export default function BusinessesPage() {
  const role = getStoredUserRole();
  const isCustomer = role === "customer";
  const navigate = useNavigate();

  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("All locations");
  const [searchName, setSearchName] = useState("");

  const [submittedFilters, setSubmittedFilters] = useState({
    industry: "",
    location: "All locations",
    searchName: "",
  });

  const [businesses, setBusinesses] = useState<BusinessCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [industryOptions, setIndustryOptions] = useState<SelectOption[]>([
    { value: "", label: "All industries" },
  ]);

  const [locationOptions, setLocationOptions] = useState<string[]>([
    "All locations",
  ]);

  async function runSearch(filters?: {
    industry: string;
    location: string;
    searchName: string;
  }) {
    const activeFilters = filters ?? {
      industry,
      location,
      searchName,
    };

    setIsSearching(true);
    setErrorMessage("");

    try {
      const results = await searchPublicBusinesses({
        name: activeFilters.searchName,
        location:
          activeFilters.location !== "All locations"
            ? activeFilters.location
            : undefined,
        industryId: activeFilters.industry
          ? Number(activeFilters.industry)
          : undefined,
      });

      setBusinesses(results.map(toBusinessCard));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load businesses"
      );
      setBusinesses([]);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    if (!isCustomer) return;

    const initialFilters = {
      industry: "",
      location: "All locations",
      searchName: "",
    };

    setSubmittedFilters(initialFilters);
    runSearch(initialFilters);
  }, [isCustomer]);

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [industries, locations] = await Promise.all([
          listPublicIndustries(),
          listPublicLocations(),
        ]);

        setIndustryOptions([
          { value: "", label: "All industries" },
          ...industries.map((item: IndustryResponse) => ({
            value: String(item.id),
            label: item.industryName,
          })),
        ]);

        setLocationOptions(["All locations", ...locations]);
      } catch (error) {
        console.error("Failed to load metadata", error);
      }
    }

    loadMetadata();
  }, []);

  function onSearch() {
    const nextFilters = {
      industry,
      location,
      searchName,
    };

    setSubmittedFilters(nextFilters);
    runSearch(nextFilters);
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
              {industryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              {locationOptions.map((option) => (
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
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="businesses-results">
          {errorMessage ? (
            <div className="businesses-empty">{errorMessage}</div>
          ) : isSearching ? (
            <div className="businesses-empty">Searching businesses...</div>
          ) : businesses.length === 0 ? (
            <div className="businesses-empty">
              No businesses found for the selected filters.
            </div>
          ) : (
            businesses.map((business) => (
              <div key={business.id} className="business-card">
                <div className="business-card-header">
                  <div className="business-card-logo">✂</div>

                  <div className="business-card-title-wrap">
                    <div className="business-card-title">{business.name}</div>
                    <div className="business-card-category">
                      {business.category}
                    </div>
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