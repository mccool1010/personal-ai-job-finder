import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function SourcesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    api.getSources()
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading sources...</p>
          </div>
        </div>
      </div>
    );
  }

  const categories = data?.categories || [];
  const totalSources = data?.totalSources || 0;
  const integratedCount = data?.integratedCount || 0;

  // Filter
  const filteredCategories = categories
    .map(cat => ({
      ...cat,
      sites: cat.sites.filter(s => {
        if (!filter) return true;
        return s.name.toLowerCase().includes(filter.toLowerCase()) ||
               s.description.toLowerCase().includes(filter.toLowerCase());
      }),
    }))
    .filter(cat => cat.sites.length > 0);

  return (
    <div className="page">
      <div className="container">
        <h1 className="page__title">Job Sources Directory</h1>

        {/* Summary */}
        <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {totalSources}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Total Sources</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--match-good)' }}>
              {integratedCount}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Live Adapters</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--match-stretch)' }}>
              {totalSources - integratedCount}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Direct Links</div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              className="form-input"
              placeholder="🔍 Filter sources..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Category Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-lg)' }}>
          <button
            className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.category}
              className={`btn btn-sm ${selectedCategory === cat.category ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedCategory(cat.category === selectedCategory ? null : cat.category)}
            >
              {cat.category} ({cat.sites.length})
            </button>
          ))}
        </div>

        {/* Source Cards */}
        {filteredCategories
          .filter(cat => !selectedCategory || cat.category === selectedCategory)
          .map((cat, ci) => (
            <div key={cat.category} className="fade-in-up" style={{ animationDelay: `${ci * 0.05}s`, marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
                {cat.category}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                {cat.sites.map(site => (
                  <a
                    key={site.url}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card"
                    style={{
                      padding: 'var(--space-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      textDecoration: 'none',
                      borderLeft: site.hasAdapter ? '3px solid var(--match-good)' : '3px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-md)' }}>
                        {site.name}
                      </span>
                      {site.hasAdapter && (
                        <span className="badge badge-good" style={{ fontSize: '10px' }}>🔌 LIVE</span>
                      )}
                    </div>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                      {site.description}
                    </span>
                    <span style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                      {site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
