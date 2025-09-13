"use client";

import { useCallback, useRef, useState } from "react";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import ResultsSection from "./components/ResultsSection";
import EmptyState from "./components/EmptyState";
import SkeletonLoader from "./components/SkeletonLoader";

type VideoItem = {
  id: string;
  title: string;
  channelTitle: string;
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

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);
  const prefillRef = useRef<null | ((vals: Partial<{ q: string; period: number; minViews: number; videoType: "all"|"shorts"|"long"; subscriberUpper: string; order: "date"|"relevance"|"viewCount"; pages: number; }>) => void)>(null);
  const submitRef = useRef<null | (() => void)>(null);
  const [currentQ, setCurrentQ] = useState<string>("");

  const handleSearch = useCallback(
    async (params: {
      q: string;
      period: number;
      minViews: number;
      videoType: "all" | "shorts" | "long";
      subscriberUpper: string;
      order: "date" | "relevance" | "viewCount";
      pages: number;
      tsToken: string | null;
      customApiKey?: string | null;
    }) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const searchParams = new URLSearchParams();
        searchParams.set("q", params.q);
        searchParams.set("period", String(params.period));
        searchParams.set("minViews", String(params.minViews));
        searchParams.set("videoType", params.videoType);
        searchParams.set("order", params.order);
        searchParams.set("pages", String(params.pages));
        if (params.subscriberUpper) {
          searchParams.set("subscriberUpper", params.subscriberUpper);
        }

        const headers: Record<string, string> = {};
        if (params.tsToken) {
          headers["x-turnstile-token"] = params.tsToken;
        }
        if (params.customApiKey) {
          headers["x-youtube-api-key"] = params.customApiKey;
        }

        const res = await fetch(`/api/search?${searchParams.toString()}`, { headers });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = (await res.json()) as SearchResponse;
        setData(json);
      } catch (err: any) {
        setError(err?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <>
      <Header />
      
      <SearchForm onSearch={handleSearch} loading={loading} registerPrefill={(fn) => { prefillRef.current = fn; }} registerSubmit={(fn) => { submitRef.current = fn; }} onKeywordChange={(q) => setCurrentQ(q)} />
      
      {error && (
        <div className="error-container">
          <div className="error-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            エラーが発生しました: {error}
          </div>
        </div>
      )}
      
      {loading && <SkeletonLoader />}
      
      {!data && !loading && !error && (
        <div className="layout-container">
          <EmptyState onPrefill={(vals) => prefillRef.current?.(vals)} onSubmitNow={() => submitRef.current?.()} canSubmit={!!currentQ.trim()} />
        </div>
      )}

      {data && !loading && <ResultsSection data={data} />}
      
      <footer className="footer-modern">
        <div className="footer-content">
          <p>YouTube Trending Finder © 2024</p>
          <p>AIスコアリングでトレンド動画を効率的に発見</p>
        </div>
      </footer>
    </>
  );
}
