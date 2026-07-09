# Directory conventions

## Top-level

| Path | Role |
| --- | --- |
| `src/` | アプリケーションコード |
| `supabase/` | DB 設定・マイグレーション |
| `docs/` | プロダクト・設計・開発フローの正本 |
| `agent-skills/` | このリポジトリ専用のエージェントスキル |
| `.cursor/rules/` | Cursor 向け常時ルール（短い強制事項） |
| `public/` | 静的アセット |
| `AGENTS.md` | エージェント向けエントリ（Cloud / ローカル共通） |
| `README.md` | 人間向けセットアップ |

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

## `agent-skills/` の置き方

- 1 スキル = 1 ディレクトリ + `SKILL.md`
- Cursor のスキル形式（YAML frontmatter + Markdown）に合わせる
- 汎用すぎる内容は書かず、**このレシピアプリ固有**の手順・制約に絞る

## 命名

- ファイル・ディレクトリ: `kebab-case`
- React コンポーネントファイル: `PascalCase.tsx` でも `kebab-case.tsx` でもよいが、**既存に合わせる**（現状は `page.tsx` / `layout.tsx`）
- SQL マイグレーション: `YYYYMMDDHHMMSS_description.sql`
