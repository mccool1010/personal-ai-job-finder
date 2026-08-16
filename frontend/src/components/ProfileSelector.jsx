import { useState } from 'react';

const PROFILES = [
  { key: 'ai_ml', label: 'AI / ML', emoji: '🤖' },
  { key: 'software_qa', label: 'Software / QA', emoji: '💻' },
  { key: 'general', label: 'General', emoji: '📋' },
];

export default function ProfileSelector({ selected, onSelect }) {
  return (
    <div className="profile-toggle">
      {PROFILES.map(p => (
        <button
          key={p.key}
          className={`profile-toggle__btn ${selected === p.key ? 'active' : ''}`}
          onClick={() => onSelect(p.key)}
        >
          {p.emoji} {p.label}
        </button>
      ))}
    </div>
  );
}
