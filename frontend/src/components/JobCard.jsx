import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchCircle from './MatchCircle.jsx';
import { api } from '../api.js';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

function RemoteBadge({ remote, indiaEligible }) {
  const labels = {
    remote_india: { text: '🏠 Remote India', cls: 'badge-remote' },
    remote_worldwide: { text: '🌍 Remote Worldwide', cls: 'badge-remote' },
    remote_us_only: { text: '🇺🇸 US Only', cls: 'badge-poor' },
    remote_eu_only: { text: '🇪🇺 EU Only', cls: 'badge-poor' },
    remote_region: { text: '🌐 Remote Region', cls: 'badge-stretch' },
    hybrid: { text: '🔀 Hybrid', cls: 'badge-hybrid' },
    onsite: { text: '🏢 Onsite', cls: 'badge-onsite' },
  };

  const info = labels[remote] || { text: remote || 'Unknown', cls: '' };

  return (
    <>
      <span className={`badge ${info.cls}`}>{info.text}</span>
      {indiaEligible === false && (
        <span className="india-badge ineligible">🔴 Not India eligible</span>
      )}
      {indiaEligible === true && remote && remote.includes('remote') && remote !== 'remote_india' && (
        <span className="india-badge eligible">🟢 India eligible</span>
      )}
    </>
  );
}

export default function JobCard({ job, profileType, onSaved, style }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const match = job.match || {};
  const category = match.category || 'poor';
  const skills = match.breakdown?.skills || {};

  const handleSave = async (status) => {
    setSaving(true);
    try {
      await api.saveApplication({
        jobId: job.jobId,
        jobTitle: job.title,
        company: job.company,
        profileType,
        status,
        matchScore: match.score || 0,
        applicationUrl: job.applicationUrl,
      });
      setSaveStatus(status);
      if (onSaved) onSaved(job.jobId, status);
    } catch (err) {
      if (err.message.includes('Already tracked')) {
        setSaveStatus('already');
      } else {
        console.error('Save error:', err);
      }
    }
    setSaving(false);
  };

  // Show top 4 skills as bars
  const topSkills = (job.skills || []).slice(0, 4);

  return (
    <div className={`card job-card ${category} fade-in-up`} style={style}>
      <div className="job-card__header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className={`badge badge-${category}`}>
              {match.emoji} {match.score}% {match.label}
            </span>
          </div>
          <h3 className="job-card__title">{job.title}</h3>
          <div className="job-card__company">{job.company}</div>
        </div>
        <MatchCircle score={match.score || 0} category={category} />
      </div>

      <div className="job-card__meta">
        <span className="job-card__meta-item">📍 {job.classifiedLocation || job.location || 'Unknown'}</span>
        {job.companyType && job.companyType !== 'unknown' && (
          <span className="job-card__meta-item">🏢 {job.companyType.charAt(0).toUpperCase() + job.companyType.slice(1)}</span>
        )}
        {(job.experienceMin !== null || job.experienceMax !== null) && (
          <span className="job-card__meta-item">
            💼 {job.experienceMin || 0}–{job.experienceMax || job.experienceMin || '?'} years
          </span>
        )}
        {job.salary && job.salary.display && job.salary.display !== 'Not disclosed' && (
          <span className="job-card__meta-item">💰 {job.salary.display}</span>
        )}
        <RemoteBadge remote={job.remote} indiaEligible={job.indiaEligible} />
      </div>

      {topSkills.length > 0 && (
        <div className="job-card__skills">
          {topSkills.map(skill => {
            const isMatched = skills.matched?.includes(skill);
            const isPartial = skills.partial?.includes(skill);
            const fillClass = isMatched ? 'match' : isPartial ? 'partial' : 'missing';
            const width = isMatched ? '90%' : isPartial ? '60%' : '25%';
            return (
              <div className="skill-bar" key={skill}>
                <span className="skill-bar__label">{skill}</span>
                <div className="skill-bar__track">
                  <div className={`skill-bar__fill ${fillClass}`} style={{ width }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {job.allSources && job.allSources.length > 1 && (
        <div className="job-card__sources">
          📡 Found on {job.allSources.length} sources: {job.allSources.map(s => s.source).join(', ')}
        </div>
      )}

      <div className="job-card__posted">
        Posted: {timeAgo(job.postedDate)}
      </div>

      <div className="job-card__actions" style={{ marginTop: '12px' }}>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => navigate(`/job/${job.jobId}?profileType=${profileType}`)}
        >
          👁️ View Job
        </button>
        {job.applicationUrl && (
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary"
          >
            🔗 Apply
          </a>
        )}
        {saveStatus === 'already' ? (
          <span className="badge badge-stretch">⚠️ Already tracked</span>
        ) : saveStatus ? (
          <span className="badge badge-good">✅ {saveStatus === 'saved' ? 'Saved' : 'Marked Applied'}</span>
        ) : (
          <>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => handleSave('saved')}
              disabled={saving}
            >
              💾 Save
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => handleSave('applied')}
              disabled={saving}
            >
              ✅ Applied
            </button>
          </>
        )}
      </div>
    </div>
  );
}
