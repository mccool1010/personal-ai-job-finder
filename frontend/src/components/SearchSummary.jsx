export default function SearchSummary({ summary }) {
  if (!summary) return null;

  return (
    <div className="card search-summary">
      <div className="search-summary__total">
        {summary.total} Jobs Found
      </div>
      <div className="search-summary__category" style={{ background: 'var(--match-excellent-bg)', color: 'var(--match-excellent)' }}>
        🔥 {summary.excellent} Excellent
      </div>
      <div className="search-summary__category" style={{ background: 'var(--match-good-bg)', color: 'var(--match-good)' }}>
        🟢 {summary.good} Good
      </div>
      <div className="search-summary__category" style={{ background: 'var(--match-stretch-bg)', color: 'var(--match-stretch)' }}>
        🟡 {summary.stretch} Stretch
      </div>
      <div className="search-summary__category" style={{ background: 'var(--match-poor-bg)', color: 'var(--match-poor)' }}>
        🔴 {summary.poor} Poor
      </div>
    </div>
  );
}
