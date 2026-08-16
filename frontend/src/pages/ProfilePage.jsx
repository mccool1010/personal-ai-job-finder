import { useState, useEffect, useRef } from 'react';
import ProfileSelector from '../components/ProfileSelector.jsx';
import { api } from '../api.js';

export default function ProfilePage() {
  const [profileType, setProfileType] = useState('ai_ml');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, [profileType]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile(profileType);
      setProfile(data.profile);
    } catch (err) {
      setProfile(null);
    }
    setLoading(false);
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setMessage({ type: 'error', text: 'Only PDF and DOCX files are supported.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum 5MB.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('profileType', profileType);

    try {
      const data = await api.uploadResume(formData);
      setProfile(data.profile);
      setMessage({ type: 'success', text: data.message || 'Resume uploaded and parsed successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }

    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const PROFILE_LABELS = {
    ai_ml: 'AI / ML / GenAI',
    software_qa: 'Software / QA',
    general: 'General / Entry',
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page__title">Resume Profiles</h1>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
          <ProfileSelector selected={profileType} onSelect={setProfileType} />
        </div>

        {/* Upload Area */}
        <div
          className={`card upload-area ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-area__icon">{uploading ? '⏳' : '📄'}</div>
          <div className="upload-area__text">
            {uploading
              ? 'Parsing resume...'
              : `Drop your ${PROFILE_LABELS[profileType]} resume here or click to browse`
            }
          </div>
          <div className="upload-area__hint">Supports PDF and DOCX (max 5MB)</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>

        {message && (
          <div className={`toast ${message.type}`} style={{ position: 'relative', marginTop: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            {message.type === 'success' ? '✅ ' : '⚠️ '}{message.text}
          </div>
        )}

        {/* Profile Display */}
        {loading ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
          </div>
        ) : profile ? (
          <div style={{ marginTop: 'var(--space-xl)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            {/* Profile Info */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                📋 Profile: {PROFILE_LABELS[profileType]}
              </h3>
              {profile.name && (
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <span className="form-label">Name</span>
                  <p style={{ color: 'var(--text-secondary)' }}>{profile.name}</p>
                </div>
              )}
              {profile.fileName && (
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <span className="form-label">Resume File</span>
                  <p style={{ color: 'var(--text-secondary)' }}>{profile.fileName}</p>
                </div>
              )}
              <div style={{ marginBottom: 'var(--space-sm)' }}>
                <span className="form-label">Experience Level</span>
                <p style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {profile.experienceLevel || 'Not set'}
                </p>
              </div>
              {profile.parsedAt && (
                <div>
                  <span className="form-label">Last Parsed</span>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                    {new Date(profile.parsedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                🛠️ Skills ({(profile.skills || []).length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(profile.skills || []).map(skill => (
                  <span key={skill} className="badge" style={{
                    background: 'var(--accent-gradient-subtle)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}>
                    {skill}
                  </span>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <span style={{ color: 'var(--text-muted)' }}>No skills detected yet</span>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                🎓 Education
              </h3>
              {(profile.education || []).length > 0 ? (
                profile.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{edu.degree}</div>
                    {edu.institution && <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>{edu.institution}</div>}
                    {edu.year && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{edu.year}</div>}
                  </div>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No education data detected</span>
              )}
            </div>

            {/* Projects */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                🚀 Projects ({(profile.projects || []).length})
              </h3>
              {(profile.projects || []).length > 0 ? (
                profile.projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{proj.name}</div>
                    {proj.technologies?.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {proj.technologies.map(t => (
                          <span key={t} className="badge" style={{ background: 'var(--bg-input)', fontSize: '10px' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No projects detected</span>
              )}
            </div>

            {/* Target Roles */}
            <div className="card" style={{ padding: 'var(--space-lg)', gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                🎯 Target Roles
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(profile.preferredRoles || []).map(role => (
                  <span key={role} className="badge" style={{
                    background: 'var(--bg-card-hover)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    textTransform: 'capitalize',
                  }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card empty-state" style={{ marginTop: 'var(--space-xl)' }}>
            <div className="empty-state__icon">📄</div>
            <h3 className="empty-state__title">No Profile Yet</h3>
            <p className="empty-state__text">
              Upload a resume above to create your {PROFILE_LABELS[profileType]} profile. The system will extract your skills, education, projects, and experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
