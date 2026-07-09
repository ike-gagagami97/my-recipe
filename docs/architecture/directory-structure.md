# Directory conventions

## Top-level

| Path | Role |
| --- | --- |
| `src/` | アプリケーションコード |
| `supabase/` | DB 設定・マイグレーション |
| `docs/` | プロダクト・設計・開発フローの正本 |
| `.cursor/skills/` | Cursor 向け手順スキル（オンデマンド） |
| `.cursor/rules/` | Cursor 向けルール（always-on / path-scoped） |
| `.cursor/agents/` | Cursor サブエージェント定義 |
| `.cursor/hooks.json` | ライフサイクルフック（必要時） |
| `public/` | 静的アセット |
| `AGENTS.md` | Cursor エージェント向けエントリ（正本） |
| `CLAUDE.md` | 互換用ポインタ（`@AGENTS.md`） |
| `README.md` | 人間向けセットアップ |

このリポジトリは **Cursor 前提**。Claude Code の `.claude/` を主構成にしない。

## `src/` の置き方

| Path | Put here |
| --- | --- |
| `src/app/**` | ルート・レイアウト・ページ・Route Handlers |
| `src/lib/supabase/**` | Supabase client 生成のみ |
| `src/lib/**` | 共有ユーティリティ・ドメインヘルパ（追加時） |
| `src/components/**` | 再利用 UI（追加時。ページ専用は `app/` 近くに置いてよい） |

まだ存在しないディレクトリは、**実際にファイルを追加する PR で作る**。空ディレクトリを先に量産しない。

## `docs/` の置き方

- 仕様・設計の議論結果はコードコメントではなく `docs/` に残す
- 1 トピック 1 ファイル。巨大な単一 Markdown にしない
- 決定事項は `docs/decisions/` に ADR として残す

## `.cursor/` の置き方

| Path | Put here |
| --- | --- |
| `skills/<name>/SKILL.md` | 手順・チェックリスト（YAML frontmatter の `name` / `description`） |
| `rules/*.mdc` | 制約。`alwaysApply` または `globs` で適用範囲を制御 |
| `agents/<name>.md` | 隔離実行用サブエージェント |
| `hooks.json` | 決定的な自動化（lint 強制など） |

- 汎用すぎる内容は書かず、**このレシピアプリ固有**に絞る
- 詳細な使い分けは [`../development/steering.md`](../development/steering.md)

## 命名

- ファイル・ディレクトリ: `kebab-case`
- React コンポーネントファイル: 既存に合わせる（現状は `page.tsx` / `layout.tsx`）
- SQL マイグレーション: `YYYYMMDDHHMMSS_description.sql`
- Cursor rules: `*.mdc`（`.md` は rules では無視される）
