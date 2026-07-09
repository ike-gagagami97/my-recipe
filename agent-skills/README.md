# Agent skills

このリポジトリ専用のエージェントスキルです。Cursor のスキル形式（`SKILL.md` + YAML frontmatter）に合わせています。

汎用の Vercel / Next.js スキルとは別に、**My Recipe 固有の手順と制約**だけをここに置きます。

## 一覧

| Skill | いつ使うか |
| --- | --- |
| [`recipe-feature`](./recipe-feature/SKILL.md) | レシピの一覧・詳細・追加など機能実装 |
| [`supabase-migration`](./supabase-migration/SKILL.md) | テーブル・RLS・grant・シードの追加 |
| [`ui-design`](./ui-design/SKILL.md) | ランディングや画面の見た目・構成 |

## 追加ルール

1. 1 スキル = 1 ディレクトリ
2. `description` は「いつ発動すべきか」が分かる一文にする
3. 手順は短く、チェックリスト形式を優先
4. プロダクト方針の正本は `docs/`。スキルは手順に特化
5. 使われなくなったスキルは削除するか `deprecated` と明記

## エージェント向け

タスク開始時にこの README を見て該当スキルの `SKILL.md` を読む。複数該当するなら **マイグレーション → 機能 → UI** の順で読む。
