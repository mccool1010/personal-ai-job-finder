export default function MatchCircle({ score, category }) {
  const circumference = 2 * Math.PI * 22; // radius = 22
  const offset = circumference - (score / 100) * circumference;

  const colorMap = {
    excellent: 'var(--match-excellent)',
    good: 'var(--match-good)',
    stretch: 'var(--match-stretch)',
    poor: 'var(--match-poor)',
  };

  const color = colorMap[category] || 'var(--accent-primary)';

  return (
    <div className="match-circle">
      <svg viewBox="0 0 50 50">
        <circle className="match-circle__bg" cx="25" cy="25" r="22" />
        <circle
          className="match-circle__fill"
          cx="25" cy="25" r="22"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="match-circle__text" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}
