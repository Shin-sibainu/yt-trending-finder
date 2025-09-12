# Repository Guidelines

## Project Structure & Module Organization

- App code at repo root under `app/` (Next.js App Router). API routes under `app/api/*`.
- Config: `package.json`, `tsconfig.json`, `next.config.mjs`, `wrangler.toml`.
- Database schema: `db/schema.sql` (Cloudflare D1).
- Docs and env: `README.md`, `.env.example`.

## Build, Test, and Development Commands

Run commands from repo root:

- `npm run dev` — Start Next.js dev server (localhost:3000).
- `npm run build` — Build for production.
- `npm run start` — Serve production build locally.
- `npm run lint` / `npm run typecheck` — Lint and TS type checks.
- Cloudflare Pages: `npm run cf:build` (Next on Pages), `npm run cf:preview`, `npm run cf:deploy`.
- D1 init: `wrangler d1 create <name>` then `wrangler d1 execute <name> --file=./db/schema.sql`.

## Coding Style & Naming Conventions

- TypeScript strict mode, 2-space indentation.
- Follow ESLint (`eslint-config-next`) and fix warnings before commit.
- React components: PascalCase; hooks/utilities: camelCase.
- Route files follow Next.js conventions (e.g., `app/api/health/route.ts`).
- Prefer functional, small components; keep server code edge-compatible when feasible.

## Testing Guidelines

- No test framework is configured yet. If adding tests:
  - Use Jest + React Testing Library.
  - Place tests as co-located `*.test.ts(x)` or under `__tests__/` mirroring paths.
  - Aim for critical-path coverage (API scoring logic, caching).

## Commit & Pull Request Guidelines

- Write clear, imperative commit messages (e.g., "Add D1 cache read").
- Group related changes; avoid unrelated refactors.
- PRs should include: purpose, scope, screenshots (UI), and manual test steps.
- Link related issue(s) and note any schema or env changes.

## Security & Configuration Tips

- Never commit secrets. Use Wrangler secrets for server-side keys (`YOUTUBE_API_KEY`, `TURNSTILE_SECRET_KEY`).
- Client envs use `NEXT_PUBLIC_*` and may be exposed.
- Update `wrangler.toml` with your D1 `database_id` before deploy.
- Keep cache TTLs aligned with `db/schema.sql` defaults unless justified.

## 要件メモ（MVP）

- プロジェクト概要: 少ない登録者数にも関わらず再生数が急伸する YouTube 動画を発見。キーワード・期間で検索し、VSR と独自スコアでランキング。
- 対象ユーザー: クリエイター/マーケター、ニッチ探索の一般ユーザー、広告・インフルエンサーマーケ担当。
- 提供価値: 登録者比で異常に伸びる動画の検知、注目テーマの早期把握、直近の急上昇可視化でリサーチ効率化。
- 機能（MVP）
  - 検索フォーム: キーワード必須、期間 7/30/90（デフォ 30）、最小再生 1k/10k/50k（デフォ 10k）、タイプ すべて/Shorts/長尺、任意の登録者上限。
  - 取得ロジック: YouTube Data API v3。`search.list`→`videos.list`→`channels.list`→ スコア計算 → 並び替え → 出力。
  - スコア: VSR=views/max(subscribers,100)。Recency=exp(-days/14)。Score=VSR\*(1+Recency)。補助: Views/Day、Shorts 判定、公開日。
  - 表示: モバイル=カード（サムネ/タイトル/チャンネル/Score/VSR/Views/Subs/公開日、Shorts/新着バッジ）。PC=表（タイトル/チャンネル/Views/Subs/VSR/公開日/Score）。動画・チャンネル外部リンク。
  - キャッシュ/制御: D1 に検索結果 TTL6–12h、チャネル統計 TTL24–72h。API はバッチ化。Turnstile 導入。IP 単位の簡易レート制限。
- 非機能: レスポンス 2–3 秒、API キーはサーバのみ、無料枠運用（Workers+YouTube API）、将来拡張性。
- 技術: Next.js App Router（Edge）、Cloudflare Workers/Pages Functions、D1、認証は未導入（Turnstile のみ）、将来 Lucia+D1/CF Access、外部 API=YouTube Data API v3。
- DB 設計: `query_cache` / `channel_cache` / `usage_log`。
- 開発スコープ: 検索フォーム+一覧、`/api/search`、スコア・ランキング、キャッシュ、デプロイ。
- 将来拡張: 条件保存/お気に入り/通知（メール・Discord）/正規化スコア・カテゴリ別/マルチリージョン・多言語。
