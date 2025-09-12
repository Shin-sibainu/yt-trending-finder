# YT Trending Finder (MVP)

登録者数に対して再生数が大きく伸びている YouTube 動画を発見するための Web サービス（MVP セットアップ）。

現状はプロジェクトの雛形のみで、YouTube API 連携や Turnstile、レート制限の実装は未着手です。

## 技術スタック

- Next.js App Router（Edge 対応）
- Cloudflare Pages + Functions（`@cloudflare/next-on-pages`）
- Cloudflare D1（キャッシュ/ログ）

## セットアップ

### 必要要件

- Node.js 18+
- npm / pnpm / yarn のいずれか
- Cloudflare アカウント（デプロイや D1 利用時）

### インストール

```bash
npm install
# or: pnpm install / yarn install
```

### ローカル開発（Next.js）

```bash
npm run dev
```

- ブラウザ: `http://localhost:3000`
- トップページの検索フォームから `/api/search` を叩きます。
- Turnstile を設定した場合、フォーム下部にウィジェットが表示されます。

## Cloudflare Workers へのデプロイ（OpenNext / Next.js on Workers）

Cloudflare 公式ガイドのとおり、OpenNext のアダプタ（`@opennextjs/cloudflare`）でデプロイします。

1) インストールと設定

```bash
npm i
# すでに追加済み: @opennextjs/cloudflare, wrangler
```

- `wrangler.jsonc`（生成済み）: `main: .open-next/worker.js`, `compatibility_flags: ["nodejs_compat"]`, D1 バインド `DB`
- `open-next.config.ts`（生成済み）: `defineCloudflareConfig()`
- スクリプト（package.json）:
  - `npm run preview` → `opennextjs-cloudflare build && ... preview`
  - `npm run deploy` → `opennextjs-cloudflare build && ... deploy`

2) ローカル検証（Workers 環境）

```bash
echo "YOUTUBE_API_KEY=..." >> .dev.vars
echo "TURNSTILE_SECRET_KEY=..." >> .dev.vars # 任意
wrangler d1 execute yt_trending_finder --local --file=./db/schema.sql
npm run preview
```

3) 本番デプロイ

```bash
wrangler d1 create yt_trending_finder         # 未作成なら
# wrangler.jsonc の d1_databases.database_id を更新
wrangler d1 execute yt_trending_finder --remote --file=./db/schema.sql
wrangler secret put YOUTUBE_API_KEY
wrangler secret put TURNSTILE_SECRET_KEY      # 任意
npm run deploy
```

補足: `.env.local` は Next の dev 用（クライアント公開変数向け）。サーバ側シークレットは `.dev.vars`/Wrangler Secrets を使用。

## Cloudflare Pages へのデプロイ（任意）

> D1 を使うため、Cloudflare Pages + Functions を利用します。

1. D1 データベースの作成

```bash
wrangler d1 create yt_trending_finder
# 出力される database_id を控えておく
```

2. `wrangler.toml` の D1 設定を更新

```toml
[[d1_databases]]
binding = "DB"
database_name = "yt_trending_finder"
database_id = "<上で控えたID>"
```

3. スキーマ反映

```bash
wrangler d1 execute yt_trending_finder --file=./db/schema.sql
```

4. シークレット設定（サーバ側）

```bash
wrangler secret put YOUTUBE_API_KEY
wrangler secret put TURNSTILE_SECRET_KEY
```

5. 公開サイトキー（ビルド時）

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` を Pages のビルド環境変数に設定

6. ビルドとプレビュー / デプロイ（`wrangler.pages.toml` を参照）

```bash
npm run cf:build
npm run cf:preview  # ローカル Pages dev
npm run cf:deploy   # 本番デプロイ
```

## 環境変数

- サーバ（Wrangler Secrets）
  - `YOUTUBE_API_KEY`
  - `TURNSTILE_SECRET_KEY`
- クライアント（Build-time env）
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

ローカル開発用の例は `.env.example` を参照してください（Next.js の dev サーバでは `process.env` が使用されます）。

## データベース（D1）

- `db/schema.sql` に以下のテーブルを用意
  - `query_cache`（検索結果キャッシュ、TTL 6 時間）
  - `channel_cache`（チャンネル登録者数キャッシュ、TTL 48 時間）
  - `usage_log`（簡易な利用ログ）

## 実装済み（MVP）

- YouTube Data API 連携（`search.list`→`videos.list`→`channels.list`）
- スコア計算（VSR・Recency Boost・Score）とソート
- D1 キャッシュ（検索結果・チャンネル登録者数）
- Cloudflare Turnstile 検証（ヘッダー `x-turnstile-token`）
- 簡易レート制限（IP ごと、1 時間あたり 60 回）
- 表示（カード/テーブル切替、Shorts バッジ）

## メモ

- ルートハンドラ `app/api/search/route.ts` は Edge Runtime で動作し、Cloudflare Pages では `@cloudflare/next-on-pages` の `getRequestContext().env` 経由で D1 にアクセスします。
- Next.js の `next dev` では Cloudflare 環境が無いので、D1 へのアクセスは無視され安全に空レスポンスを返します。
# yt-trending-finder
