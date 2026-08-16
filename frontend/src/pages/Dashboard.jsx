import { useState, useEffect } from 'react';
import ProfileSelector from '../components/ProfileSelector.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import SearchSummary from '../components/SearchSummary.jsx';
import JobCard from '../components/JobCard.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import { api } from '../api.js';

export default function Dashboard() {
  const [profileType, setProfileType] = useState('ai_ml');
  const [filters, setFilters] = useState({
    location: '',
    employmentType: 'all',
    companyType: 'all',
    remote: 'any',
    experienceLevel: '',
    minSalary: '',
  });
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [pagination, setPagination] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = { profileType };
      if (filters.location) params.location = filters.location;
      if (filters.employmentType && filters.employmentType !== 'all') params.employmentType = filters.employmentType;
      if (filters.companyType && filters.companyType !== 'all') params.companyType = filters.companyType;
      if (filters.remote && filters.remote !== 'any') params.remote = filters.remote;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.minSalary) {
        params.minSalary = filters.minSalary;
        params.salaryCurrency = 'INR';
      }

      const data = await api.searchJobs(params);
      setJobs(data.jobs || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      setJobs([]);
      setSummary(null);
    }

    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="hero">
          <h1 className="hero__title">PERSONAL AI JOB FINDER</h1>
          <p className="hero__subtitle">
            Upload your resume, search jobs across India and worldwide, and get AI-powered match scores.
          </p>
        </div>

        {/* Profile Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
          <ProfileSelector selected={profileType} onSelect={setProfileType} />
        </div>

        {/* Main Layout */}
        <div className="dashboard-layout">
          {/* Sidebar Filters */}
          <div>
            <FilterPanel filters={filters} onChange={setFilters} />
            <div style={{ marginTop: 'var(--space-md)' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? '⏳ Searching...' : '🔍 SEARCH JOBS'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="dashboard-main">
            {error && (
              <div className="card" style={{ padding: 'var(--space-lg)', borderLeft: '3px solid var(--match-poor)' }}>
                <strong style={{ color: 'var(--match-poor)' }}>⚠️ Error:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{error}</span>
              </div>
            )}

            {summary && <SearchSummary summary={summary} />}

            {loading && <LoadingSkeleton count={4} />}

            {!loading && searched && jobs.length === 0 && !error && (
              <div className="card empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3 className="empty-state__title">No Jobs Found</h3>
                <p className="empty-state__text">
                  Try adjusting your filters or selecting a different profile. Make sure the backend server is running.
                </p>
              </div>
            )}

            {!loading && !searched && (
              <div className="card empty-state">
                <div className="empty-state__icon">🚀</div>
                <h3 className="empty-state__title">Ready to Find Jobs</h3>
                <p className="empty-state__text">
                  Select a profile, set your filters, and click Search Jobs to discover matched opportunities.
                </p>
              </div>
            )}

            {!loading && jobs.map((job, i) => (
              <JobCard
                key={job.jobId}
                job={job}
                profileType={profileType}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}

            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: 'var(--space-lg)' }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
