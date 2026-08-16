export default function FilterPanel({ filters, onChange }) {
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="card filter-panel">
      <div className="filter-panel__section">
        <label className="form-label">Location</label>
        <select
          className="form-select"
          value={filters.location || ''}
          onChange={e => updateFilter('location', e.target.value)}
        >
          <option value="">All</option>
          <option value="india">India</option>
          <option value="remote">Remote</option>
          <option value="international">International</option>
        </select>
      </div>

      <div className="filter-panel__section">
        <label className="form-label">Job Type</label>
        <select
          className="form-select"
          value={filters.employmentType || 'all'}
          onChange={e => updateFilter('employmentType', e.target.value)}
        >
          <option value="all">All</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      <div className="filter-panel__section">
        <label className="form-label">Company</label>
        <select
          className="form-select"
          value={filters.companyType || 'all'}
          onChange={e => updateFilter('companyType', e.target.value)}
        >
          <option value="all">All</option>
          <option value="startup">Startup</option>
          <option value="mnc">MNC</option>
          <option value="mid-size">Mid-size</option>
        </select>
      </div>

      <div className="filter-panel__section">
        <label className="form-label">Remote</label>
        <select
          className="form-select"
          value={filters.remote || 'any'}
          onChange={e => updateFilter('remote', e.target.value)}
        >
          <option value="any">Any</option>
          <option value="remote">Remote Only</option>
          <option value="onsite">Onsite Only</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div className="filter-panel__section">
        <label className="form-label">Experience</label>
        <select
          className="form-select"
          value={filters.experienceLevel || ''}
          onChange={e => updateFilter('experienceLevel', e.target.value)}
        >
          <option value="">All</option>
          <option value="fresher">Fresher</option>
          <option value="0-2">0–2 years</option>
          <option value="1-3">1–3 years</option>
          <option value="3-5">3–5 years</option>
          <option value="5+">5+ years</option>
        </select>
      </div>

      <div className="filter-panel__section">
        <label className="form-label">Min Salary</label>
        <select
          className="form-select"
          value={filters.minSalary || ''}
          onChange={e => updateFilter('minSalary', e.target.value)}
        >
          <option value="">Any</option>
          <option value="300000">₹3 LPA+</option>
          <option value="400000">₹4 LPA+</option>
          <option value="500000">₹5 LPA+</option>
          <option value="800000">₹8 LPA+</option>
          <option value="1000000">₹10 LPA+</option>
          <option value="1500000">₹15 LPA+</option>
        </select>
      </div>
    </div>
  );
}
