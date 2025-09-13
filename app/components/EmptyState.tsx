"use client";

type PrefillVals = Partial<{
  q: string;
  period: number;
  minViews: number;
  videoType: "all" | "shorts" | "long";
  subscriberUpper: string;
  order: "date" | "relevance" | "viewCount";
  pages: number;
}>;

export default function EmptyState({ onPrefill, onSubmitNow, canSubmit }: { onPrefill: (vals: PrefillVals) => void; onSubmitNow?: () => void; canSubmit?: boolean }) {
  const samples = ["AI", "料理", "LoFi", "ASMR", "Minecraft", "Vibe Coding"];
  return (
    <div className="empty-results" style={{ marginTop: 32, padding: '4rem 2rem' }}>
      <div className="empty-icon" style={{ marginBottom: '1.5rem' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        </svg>
      </div>
      
      <h3 className="empty-title" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
        まずはキーワードから検索してみましょう
      </h3>
      
      <p className="empty-description" style={{ 
        fontSize: '1.0625rem',
        lineHeight: 1.7,
        maxWidth: '520px',
        margin: '0 auto 2.5rem',
        padding: '0 1rem'
      }}>
        ヒットが少ない場合は期間を広げ、<br />
        最小再生数を下げると見つかりやすくなります
      </p>

      <div className="quick-filters" style={{ 
        borderBottom: 'none', 
        paddingTop: 0,
        marginBottom: '1.5rem',
        gap: '0.75rem',
        justifyContent: 'center'
      }}>
        {samples.map((s) => (
          <button 
            key={s} 
            type="button" 
            className="filter-chip" 
            onClick={() => onPrefill({ q: s })}
            style={{ 
              padding: '0.625rem 1.25rem',
              fontSize: '0.9375rem',
              fontWeight: 500
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          className="filter-chip recommend-btn"
          onClick={() => { onPrefill({ period: 90, minViews: 1000, videoType: 'all', order: 'viewCount', pages: 1 }); if (canSubmit) onSubmitNow?.(); }}
          disabled={!canSubmit}
          title="おすすめ条件を適用（期間90日・最小1,000・再生数順・50件）"
          style={{
            padding: '0.75rem 1.75rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            border: 'none'
          }}
        >
          🎯 おすすめ条件を適用
        </button>
      </div>
    </div>
  );
}
