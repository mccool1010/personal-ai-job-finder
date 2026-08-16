export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div className="skeleton" style={{ width: '80px', height: '24px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '240px', height: '20px', marginBottom: '6px' }} />
              <div className="skeleton" style={{ width: '160px', height: '16px' }} />
            </div>
            <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div className="skeleton" style={{ width: '100px', height: '20px', borderRadius: '999px' }} />
            <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '999px' }} />
            <div className="skeleton" style={{ width: '90px', height: '20px', borderRadius: '999px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="skeleton" style={{ width: '100%', height: '6px' }} />
            <div className="skeleton" style={{ width: '80%', height: '6px' }} />
            <div className="skeleton" style={{ width: '60%', height: '6px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
