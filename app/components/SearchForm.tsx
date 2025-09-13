"use client";

import { useState, useRef, useEffect } from "react";

type SearchFormProps = {
  onSearch: (params: {
    q: string;
    period: number;
    minViews: number;
    videoType: "all" | "shorts" | "long";
    subscriberUpper: string;
    order: "date" | "relevance" | "viewCount";
    pages: number;
    tsToken: string | null;
  }) => void;
  loading: boolean;
};

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState(30);
  const [minViews, setMinViews] = useState(10000);
  const [videoType, setVideoType] = useState<"all" | "shorts" | "long">("all");
  const [subscriberUpper, setSubscriberUpper] = useState<string>("");
  const [order, setOrder] = useState<"date" | "relevance" | "viewCount">("viewCount");
  const [pages, setPages] = useState<number>(1);
  const [tsToken, setTsToken] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const tsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;
    
    const existing = document.querySelector("script[data-turnstile]") as HTMLScriptElement | null;
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-turnstile", "1");
      document.body.appendChild(s);
      s.onload = () => {
        if (tsContainerRef.current && (window as any).turnstile) {
          (window as any).turnstile.render(tsContainerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => setTsToken(token),
            "error-callback": () => setTsToken(null),
            "expired-callback": () => setTsToken(null),
          });
        }
      };
    } else {
      if (tsContainerRef.current && (window as any).turnstile) {
        (window as any).turnstile.render(tsContainerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => setTsToken(token),
        });
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      q,
      period,
      minViews,
      videoType,
      subscriberUpper,
      order,
      pages,
      tsToken,
    });
  };

  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-main">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              className="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="キーワードを入力（例: AI, 料理, ゲーム実況, ASMR）"
              required
            />
            <button 
              type="button" 
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              詳細設定
            </button>
          </div>
          <button className="search-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                検索中...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                トレンド検索
              </>
            )}
          </button>
        </div>

        <div className="quick-filters">
          <button
            type="button"
            className={`filter-chip ${period === 7 ? 'active' : ''}`}
            onClick={() => setPeriod(7)}
          >
            過去7日
          </button>
          <button
            type="button"
            className={`filter-chip ${period === 30 ? 'active' : ''}`}
            onClick={() => setPeriod(30)}
          >
            過去30日
          </button>
          <button
            type="button"
            className={`filter-chip ${videoType === 'shorts' ? 'active' : ''}`}
            onClick={() => setVideoType(videoType === 'shorts' ? 'all' : 'shorts')}
          >
            Shorts
          </button>
          <button
            type="button"
            className={`filter-chip ${minViews >= 100000 ? 'active' : ''}`}
            onClick={() => setMinViews(minViews >= 100000 ? 10000 : 100000)}
          >
            10万回以上
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-options">
            <div className="option-grid">
              <div className="option-group">
                <label className="option-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  検索期間
                </label>
                <select
                  className="option-select"
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                >
                  <option value={7}>過去7日間</option>
                  <option value={30}>過去30日間</option>
                  <option value={90}>過去90日間</option>
                </select>
              </div>

              <div className="option-group">
                <label className="option-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  最小再生数
                </label>
                <select
                  className="option-select"
                  value={minViews}
                  onChange={(e) => setMinViews(Number(e.target.value))}
                >
                  <option value={1000}>1,000回以上</option>
                  <option value={10000}>10,000回以上</option>
                  <option value={50000}>50,000回以上</option>
                  <option value={100000}>100,000回以上</option>
                </select>
              </div>

              <div className="option-group">
                <label className="option-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  動画タイプ
                </label>
                <select
                  className="option-select"
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value as any)}
                >
                  <option value="all">すべての動画</option>
                  <option value="shorts">Shorts のみ</option>
                  <option value="long">通常動画のみ</option>
                </select>
              </div>

              <div className="option-group">
                <label className="option-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  登録者数上限
                </label>
                <input
                  className="option-input"
                  value={subscriberUpper}
                  onChange={(e) => setSubscriberUpper(e.target.value)}
                  placeholder="例: 50000"
                />
              </div>

              <div className="option-group">
                <label className="option-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  並び替え
                </label>
                <select
                  className="option-select"
                  value={order}
                  onChange={(e) => setOrder(e.target.value as any)}
                >
                  <option value="viewCount">再生数順</option>
                  <option value="date">投稿日順</option>
                  <option value="relevance">関連度順</option>
                </select>
              </div>

              <div className="option-group">
                <label className="option-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  検索件数
                </label>
                <select
                  className="option-select"
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value))}
                >
                  <option value={1}>50件</option>
                  <option value={2}>100件</option>
                  <option value={3}>150件</option>
                  <option value={4}>200件</option>
                  <option value={5}>250件</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="turnstile-wrapper">
            <div ref={tsContainerRef} className="cf-turnstile" data-theme="light" />
          </div>
        )}
      </form>
    </div>
  );
}
