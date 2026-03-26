import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../../pages/Auth/AuthModal";
import type { AuthModalRole } from "../../pages/Auth/AuthModal";
import {
  searchPublicBusinesses,
  type BusinessResponse,
} from "../../api/businessApi";
import "./LandingPage.css";

const INDUSTRY_OPTIONS = [
  { value: "", label: "All industries" },
  { value: "1", label: "Hair Salon" },
  { value: "2", label: "Barber Shop" },
  { value: "4", label: "Nails" },
  { value: "3", label: "Spa" },
  { value: "5", label: "Massage" },
  { value: "6", label: "Physiotherapy" },
];

const LOCATION_OPTIONS = [
  "All locations",
  "Thessaloniki - Center",
  "Thessaloniki - East",
  "Thessaloniki - West",
  "Kalamaria",
  "Toumba",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const loginMenuRef = useRef<HTMLDivElement | null>(null);

  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("All locations");
  const [searchName, setSearchName] = useState("");

  const [submittedFilters, setSubmittedFilters] = useState({
    industry: "",
    location: "All locations",
    searchName: "",
  });

  const [businessResults, setBusinessResults] = useState<BusinessResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<AuthModalRole | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        loginMenuRef.current &&
        !loginMenuRef.current.contains(event.target as Node)
      ) {
        setLoginMenuOpen(false);
      }
    }

    if (loginMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [loginMenuOpen]);

  async function onSearch() {
    setSubmittedFilters({
      industry,
      location,
      searchName,
    });

    setIsSearching(true);
    setSearchError("");
    setHasSearched(true);

    try {
      const results = await searchPublicBusinesses({
        name: searchName,
        location: location,
        industryId: industry ? Number(industry) : undefined,
      });

      setBusinessResults(results);
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : "Failed to search businesses"
      );
      setBusinessResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function onCreateAppointment() {
    navigate("/create-appointment");
  }

  function onSearchBusinessesPage() {
    navigate("/businesses");
  }

  function onBusinessSignup() {
    navigate("/signup/business");
  }

  function openAuthModal(role: AuthModalRole) {
    setLoginMenuOpen(false);
    setAuthModalRole(role);
  }

  function closeAuthModal() {
    setAuthModalRole(null);
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">Schedio</div>

        <div className="landing-header-actions">
          <div className="landing-login-wrap" ref={loginMenuRef}>
            <button
              type="button"
              className="landing-header-link"
              onClick={() => setLoginMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={loginMenuOpen}
            >
              Login <span className="landing-caret">⌄</span>
            </button>

            {loginMenuOpen && (
              <div className="landing-login-dropdown">
                <button
                  type="button"
                  className="landing-login-option"
                  onClick={() => openAuthModal("customer")}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className="landing-login-option"
                  onClick={() => openAuthModal("staff")}
                >
                  Staff
                </button>
                <button
                  type="button"
                  className="landing-login-option"
                  onClick={() => openAuthModal("business")}
                >
                  Business
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-left">
            <h1 className="landing-hero-title">
              Book an Appointment
              <br />
              in seconds!
            </h1>

            <p className="landing-hero-text">
              Find businesses, choose service, and
              <br />
              confirm instantly - no account required.
            </p>

            <button
              type="button"
              className="landing-primary-btn"
              onClick={onCreateAppointment}
            >
              Create Appointment
            </button>
          </div>

          <div className="landing-hero-right">
            <div className="landing-hero-illustration">
              <div className="landing-blob" />
              <div className="landing-calendar-icon">📅</div>
              <div className="landing-clock-icon">🕘</div>
            </div>
          </div>
        </section>

        <section className="landing-search-card">
          <h2 className="landing-section-title">Search Businesses</h2>

          <div className="landing-search-grid">
            <div className="landing-field">
              <label className="landing-label">Industry</label>
              <select
                className="landing-input"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="landing-field">
              <label className="landing-label">Location - Town</label>
              <select
                className="landing-input"
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

            <div className="landing-field landing-field--name">
              <label className="landing-label">Name</label>
              <input
                className="landing-input"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="landing-search-btn-wrap">
              <button
                type="button"
                className="landing-search-btn"
                onClick={onSearch}
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {hasSearched ? (
            <div className="landing-search-results-preview">
              {isSearching ? (
                <div className="landing-search-empty">Searching...</div>
              ) : searchError ? (
                <div className="landing-search-empty">{searchError}</div>
              ) : businessResults.length === 0 ? (
                <div className="landing-search-empty">No businesses found.</div>
              ) : (
                <>
                  <div className="landing-search-count">
                    Found {businessResults.length} business
                    {businessResults.length === 1 ? "" : "es"}
                  </div>

                  <div className="landing-search-active-filters">
                    {(submittedFilters.industry !== "" ||
                      submittedFilters.location !== "All locations" ||
                      submittedFilters.searchName.trim() !== "") && (
                      <span>
                        Filters applied
                        {submittedFilters.searchName.trim() !== ""
                          ? ` • Name: ${submittedFilters.searchName}`
                          : ""}
                        {submittedFilters.industry !== ""
                          ? ` • Industry ID: ${submittedFilters.industry}`
                          : ""}
                        {submittedFilters.location !== "All locations"
                          ? ` • Location: ${submittedFilters.location}`
                          : ""}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="landing-link-btn"
                    onClick={onSearchBusinessesPage}
                  >
                    View matching businesses
                  </button>
                </>
              )}
            </div>
          ) : null}
        </section>

        <section className="landing-how-it-works">
          <h2 className="landing-section-title">How it works</h2>

          <div className="landing-steps-grid">
            <div className="landing-step-card">
              <div className="landing-step-icon">🏪</div>
              <div className="landing-step-footer">
                <div className="landing-step-number">1</div>
                <div className="landing-step-text">Choose a Business</div>
              </div>
            </div>

            <div className="landing-step-card">
              <div className="landing-step-icon">🖐️</div>
              <div className="landing-step-footer">
                <div className="landing-step-number">2</div>
                <div className="landing-step-text">Select a Service</div>
              </div>
            </div>

            <div className="landing-step-card">
              <div className="landing-step-icon">🗓️</div>
              <div className="landing-step-footer">
                <div className="landing-step-number">3</div>
                <div className="landing-step-text">Find Date &amp; Time</div>
              </div>
            </div>

            <div className="landing-step-card">
              <div className="landing-step-icon">📋</div>
              <div className="landing-step-footer">
                <div className="landing-step-number">4</div>
                <div className="landing-step-text">Fill your Info</div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-business-cta">
          <div className="landing-business-cta-left">
            <h2 className="landing-section-title">Own a Business?</h2>

            <div className="landing-business-benefits">
              <div className="landing-business-benefit">
                <span className="landing-business-benefit-icon">👍</span>
                <span>Manage Staff Availability</span>
              </div>

              <div className="landing-business-benefit">
                <span className="landing-business-benefit-icon">🏷️</span>
                <span>Set your Services &amp; Pricing</span>
              </div>
            </div>
          </div>

          <div className="landing-business-cta-right">
            <button
              type="button"
              className="landing-primary-btn landing-primary-btn--wide"
              onClick={onBusinessSignup}
            >
              Sign up your businesses
            </button>
          </div>
        </section>
      </main>

      {authModalRole && (
        <AuthModal role={authModalRole} onClose={closeAuthModal} />
      )}
    </div>
  );
}