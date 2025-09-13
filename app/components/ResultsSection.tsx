"use client";

import { useMemo, useState } from "react";
import VideoCard from "./VideoCard";
import VideoTable from "./VideoTable";

type VideoItem = {
  id: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  thumbnailUrl: string;
  views: number;
  subscribers: number | null;
  publishedAt: string;
  isShort: boolean;
  vsr: number;
  score: number;
};

type SearchResponse = {
  items: VideoItem[];
  cached: boolean;
  meta: {
    q: string;
    period: number;
    minViews: number;
    videoType: "all" | "shorts" | "long";
    subscriberUpper?: number;
    order: "date" | "relevance" | "viewCount";
    pages: number;
  };
};

type ResultsSectionProps = {
  data: SearchResponse;
};

export default function ResultsSection({ data }: ResultsSectionProps) {
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 30;

  const totalPages = useMemo(() => Math.ceil(data.items.length / pageSize), [data.items.length]);
  const pagedItems = useMemo(() => {
    if (totalPages <= 1) return data.items;
    const start = (page - 1) * pageSize;
    return data.items.slice(start, start + pageSize);
  }, [data.items, page, totalPages]);

  function openLightbox(videoId: string, title: string) {
    const src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    setLightbox({ src, alt: title });
  }

  if (data.items.length === 0) {
    return (
      <div className="empty-results">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="empty-title">動画が見つかりませんでした</h3>
        <p className="empty-description">
          検索条件を調整して、もう一度お試しください
        </p>
        <div className="empty-suggestions">
          <p>以下をお試しください：</p>
          <ul>
            <li>キーワードを変更する</li>
            <li>検索期間を広げる</li>
            <li>最小再生数を下げる</li>
            <li>チャンネル登録者数の上限を緩和する</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-info">
          <h2 className="results-title">
            <span className="results-count">{data.items.length}件</span>
            のトレンド動画
          </h2>
          <div className="results-meta">
            {data.cached && (
              <span className="cache-indicator">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
                </svg>
                キャッシュ済み
              </span>
            )}
            <span className="meta-item">
              <strong>キーワード:</strong> {data.meta.q}
            </span>
            <span className="meta-item">
              <strong>期間:</strong> 過去{data.meta.period}日
            </span>
            <span className="meta-item">
              <strong>最小再生数:</strong> {data.meta.minViews.toLocaleString()}回
            </span>
            {data.meta.videoType !== "all" && (
              <span className="meta-item">
                <strong>タイプ:</strong> {data.meta.videoType === "shorts" ? "Shorts" : "通常動画"}
              </span>
            )}
          </div>
        </div>
        
        <div className="view-switcher">
          <button
            className={`view-button ${viewMode === "card" ? "active" : ""}`}
            onClick={() => setViewMode("card")}
            aria-label="カード表示"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5h5v5H4V5zm0 7h5v5H4v-5zm0 7h5v5H4v-5zm7-14h5v5h-5V5zm0 7h5v5h-5v-5zm0 7h5v5h-5v-5zm7-14h5v5h-5V5zm0 7h5v5h-5v-5zm0 7h5v5h-5v-5z" fill="currentColor"/>
            </svg>
            カード
          </button>
          <button
            className={`view-button ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            aria-label="テーブル表示"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0-12h18v2H3V6z" fill="currentColor"/>
            </svg>
            テーブル
          </button>
        </div>
      </div>

      <div className="results-content">
        {viewMode === "card" ? (
          <div className="video-grid">
            {pagedItems.map((video) => (
              <VideoCard key={video.id} video={video} onZoom={openLightbox} />
            ))}
          </div>
        ) : (
          <VideoTable videos={pagedItems} onZoom={openLightbox} />
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>前へ</button>
          {Array.from({ length: totalPages }).slice(0, 10).map((_, i) => {
            const pnum = i + 1;
            return (
              <button key={pnum} className={`page-btn ${page === pnum ? 'active' : ''}`} onClick={() => setPage(pnum)}>{pnum}</button>
            );
          })}
          <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>次へ</button>
        </div>
      )}

      {lightbox && (
        <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="閉じる">×</button>
            <img src={lightbox.src} alt={lightbox.alt} className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
