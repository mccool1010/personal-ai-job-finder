import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import MatchCircle from '../components/MatchCircle.jsx';
import { api } from '../api.js';

export default function JobDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const profileType = searchParams.get('profileType') || 'ai_ml';

  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(null);
  const [profileComparison, setProfileComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJob();
  }, [id, profileType]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const data = await api.getJob(id, profileType);
      setJob(data.job);
      setMatch(data.match);
      setProfileComparison(data.profileComparison);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>❌</div>
            <h3>Job Not Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{error || 'This job may have been removed.'}</p>
            <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const skills = match?.breakdown?.skills || {};
  const category = match?.category || 'poor';

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ marginBottom: '16px' }}>
          ← Back to Dashboard
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            {/* Job Header */}
            <div className="card" style={{ padding: '32px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '4px' }}>
                    {job.title}
                  </h1>
                  <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>{job.company}</p>
                </div>
                {match && <MatchCircle score={match.score} category={category} />}
              </div>

              <div className="job-card__meta" style={{ marginTop: '16px' }}>
                <span className="job-card__meta-item">📍 {job.classifiedLocation || job.location}</span>
                {job.companyType !== 'unknown' && (
                  <span className="job-card__meta-item">🏢 {job.companyType}</span>
                )}
                {job.experienceMin !== null && (
                  <span className="job-card__meta-item">💼 {job.experienceMin}–{job.experienceMax || '?'} yrs</span>
                )}
                {job.salary?.display !== 'Not disclosed' && (
                  <span className="job-card__meta-item">💰 {job.salary?.display}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                {job.applicationUrl && (
                  <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    🔗 Apply Now
                  </a>
                )}
                <button className="btn btn-secondary" onClick={() => {
                  api.saveApplication({
                    jobId: job.jobId, jobTitle: job.title, company: job.company,
                    profileType, status: 'saved', matchScore: match?.score || 0, applicationUrl: job.applicationUrl,
                  }).catch(() => {});
                }}>
                  💾 Save Job
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '16px' }}>
                Job Description
              </h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {job.description?.slice(0, 3000) || 'No description available.'}
              </div>
            </div>
          </div>

          {/* Sidebar — Match Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {match && (
              <div className="card match-breakdown">
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                  {match.emoji} {match.score}% Match — {match.label}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {match.recommendation}
                </p>

                {/* Strong Matches */}
                {skills.matched?.length > 0 && (
                  <div className="match-breakdown__section">
                    <div className="match-breakdown__title">✅ Strong Matches</div>
                    {skills.matched.map(s => (
                      <div key={s} className="match-breakdown__item">
                        <span style={{ color: 'var(--match-good)' }}>✅</span> {s}
                      </div>
                    ))}
                  </div>
                )}

                {/* Partial Matches */}
                {skills.partial?.length > 0 && (
                  <div className="match-breakdown__section">
                    <div className="match-breakdown__title">🟡 Partial Matches</div>
                    {skills.partial.map(s => (
                      <div key={s} className="match-breakdown__item">
                        <span style={{ color: 'var(--match-stretch)' }}>🟡</span> {s}
                      </div>
                    ))}
                  </div>
                )}

                {/* Missing */}
                {skills.missing?.length > 0 && (
                  <div className="match-breakdown__section">
                    <div className="match-breakdown__title">❌ Missing</div>
                    {skills.missing.map(s => (
                      <div key={s} className="match-breakdown__item">
                        <span style={{ color: 'var(--match-poor)' }}>❌</span> {s}
                      </div>
                    ))}
                  </div>
                )}

                {/* Factor Scores */}
                <div className="match-breakdown__section" style={{ marginTop: '8px' }}>
                  <div className="match-breakdown__title">📊 Score Breakdown</div>
                  {Object.entries(match.breakdown).map(([factor, data]) => (
                    <div key={factor} className="skill-bar">
                      <span className="skill-bar__label" style={{ minWidth: '100px', textTransform: 'capitalize' }}>
                        {factor.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="skill-bar__track">
                        <div
                          className="skill-bar__fill"
                          style={{
                            width: `${(data.score || 0) * 100}%`,
                            background: data.score >= 0.7 ? 'var(--match-good)' : data.score >= 0.4 ? 'var(--match-stretch)' : 'var(--match-poor)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Comparison */}
            {profileComparison?.all?.length > 1 && (
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '12px' }}>
                  📋 Resume Recommendation
                </h3>
                {profileComparison.all.map(p => (
                  <div key={p.profileType} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', textTransform: 'capitalize' }}>
                      {p.profileType.replace('_', '/')} Resume
                    </span>
                    <span className={`badge badge-${p.category}`}>
                      {p.emoji} {p.score}%
                    </span>
                  </div>
                ))}
                <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginTop: '12px' }}>
                  Recommended: {profileComparison.recommended?.profileType?.replace('_', '/')} resume
                </p>
              </div>
            )}

            {/* Sources */}
            {job.allSources?.length > 0 && (
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '12px' }}>
                  📡 Sources ({job.allSources.length})
                </h3>
                {job.allSources.map((s, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-size-sm)' }}>
                      {s.source} →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
