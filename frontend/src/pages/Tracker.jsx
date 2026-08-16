import { useState, useEffect } from 'react';
import { api } from '../api.js';

const STATUS_OPTIONS = ['saved', 'applied', 'assessment', 'interview', 'rejected', 'offer', 'withdrawn'];

const STATUS_COLORS = {
  saved: 'var(--status-saved)',
  applied: 'var(--status-applied)',
  assessment: 'var(--status-assessment)',
  interview: 'var(--status-interview)',
  rejected: 'var(--status-rejected)',
  offer: 'var(--status-offer)',
  withdrawn: 'var(--status-withdrawn)',
};

const STATUS_EMOJIS = {
  saved: '💾',
  applied: '📤',
  assessment: '📝',
  interview: '🎙️',
  rejected: '❌',
  offer: '🎉',
  withdrawn: '↩️',
};

export default function Tracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [filterStatus]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const data = await api.getApplications(params);
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.updateApplication(appId, { status: newStatus });
      setApplications(prev => prev.map(a =>
        a._id === appId ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleDelete = async (appId) => {
    try {
      await api.deleteApplication(appId);
      setApplications(prev => prev.filter(a => a._id !== appId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Summary counts
  const counts = {};
  STATUS_OPTIONS.forEach(s => { counts[s] = applications.filter(a => a.status === s).length; });

  return (
    <div className="page">
      <div className="container">
        <h1 className="page__title">Application Tracker</h1>

        {/* Status Summary */}
        <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            className={`btn btn-sm ${!filterStatus ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('')}
          >
            All ({applications.length})
          </button>
          {STATUS_OPTIONS.map(status => (
            <button
              key={status}
              className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus(status)}
              style={{ textTransform: 'capitalize' }}
            >
              {STATUS_EMOJIS[status]} {status} ({counts[status] || 0})
            </button>
          ))}
        </div>

        {error && (
          <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', borderLeft: '3px solid var(--match-poor)' }}>
            <span style={{ color: 'var(--match-poor)' }}>Error: {error}</span>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state__icon">📋</div>
            <h3 className="empty-state__title">No Applications Yet</h3>
            <p className="empty-state__text">
              Save or mark jobs as applied from the Dashboard to start tracking them here.
            </p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Resume</th>
                  <th>Match</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="fade-in-up">
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {app.jobTitle || 'Unknown Job'}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        {app.company || ''}
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: 'var(--font-size-xs)' }}>
                        {app.profileType?.replace('_', '/')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${app.matchScore >= 85 ? 'excellent' : app.matchScore >= 70 ? 'good' : app.matchScore >= 50 ? 'stretch' : 'poor'}`}>
                        {app.matchScore}%
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={app.status}
                        onChange={e => handleStatusChange(app._id, e.target.value)}
                        style={{ borderColor: STATUS_COLORS[app.status], color: STATUS_COLORS[app.status] }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>
                            {STATUS_EMOJIS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)' }}>
                      {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {app.applicationUrl && (
                          <a href={app.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
                            🔗
                          </a>
                        )}
                        <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(app._id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
