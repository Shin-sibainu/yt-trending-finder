-- D1 schema for MVP caching and logs
-- Run locally after creating the DB binding.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS query_cache (
  key TEXT PRIMARY KEY,
  params TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at INTEGER NOT NULL, -- unix epoch seconds
  ttl_seconds INTEGER NOT NULL DEFAULT 21600 -- 6 hours
);

CREATE INDEX IF NOT EXISTS idx_query_cache_created_at ON query_cache(created_at);

CREATE TABLE IF NOT EXISTS channel_cache (
  channel_id TEXT PRIMARY KEY,
  subscriber_count INTEGER NOT NULL,
  fetched_at INTEGER NOT NULL,
  ttl_seconds INTEGER NOT NULL DEFAULT 172800 -- 48 hours
);

CREATE INDEX IF NOT EXISTS idx_channel_cache_fetched_at ON channel_cache(fetched_at);

CREATE TABLE IF NOT EXISTS usage_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  query_key TEXT,
  ok INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

