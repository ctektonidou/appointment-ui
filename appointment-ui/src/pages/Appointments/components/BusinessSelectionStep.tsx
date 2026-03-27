import type { BusinessCard } from "../types/createAppointment.types";


type BusinessSelectionStepProps = {
  industry: string;
  locationFilter: string;
  searchName: string;
  industryOptions: string[];
  locationOptions: string[];
  filteredBusinesses: BusinessCard[];
  onIndustryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearchNameChange: (value: string) => void;
  onSearch: () => void;
  onViewServices: (business: BusinessCard) => void;
};

export default function BusinessSelectionStep({
  industry,
  locationFilter,
  searchName,
  industryOptions,
  locationOptions,
  filteredBusinesses,
  onIndustryChange,
  onLocationChange,
  onSearchNameChange,
  onSearch,
  onViewServices,
}: BusinessSelectionStepProps) {
  return (
    <>
      <h2 className="create-appointment-section-title">Find a Business</h2>

      <div className="create-appointment-filters">
        <div className="create-appointment-field">
          <label className="create-appointment-label">Industry</label>
          <select
            className="create-appointment-select"
            value={industry}
            onChange={(e) => onIndustryChange(e.target.value)}
          >
            {industryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="create-appointment-field">
          <label className="create-appointment-label">Location - Town</label>
          <select
            className="create-appointment-select"
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            {locationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="create-appointment-field create-appointment-field--name">
          <label className="create-appointment-label">Name</label>
          <input
            className="create-appointment-input"
            type="text"
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
          />
        </div>
      </div>

      <div className="create-appointment-search-row">
        <button
          type="button"
          className="create-appointment-search-btn"
          onClick={onSearch}
        >
          Search
        </button>
      </div>

      <div className="create-appointment-results">
        {filteredBusinesses.length === 0 ? (
          <div className="create-appointment-empty">
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
    </>
  );
}