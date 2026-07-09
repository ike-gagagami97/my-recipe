# Agent collaboration guide (Cursor)

人間と Cursor エージェントが同じリポジトリで安全に進めるための合意事項です。

## 役割分担

| 誰 | やること |
| --- | --- |
| 人間 | プロダクト判断、スコープ決定、最終レビュー、秘密情報の管理 |
| Cursor エージェント | 実装、リファクタ、テスト実行、docs 更新、PR 準備 |

## エージェントへの依頼の書き方（推奨）

良い依頼は次を含む:

1. **目的**（ユーザーにとって何が良くなるか）
2. **スコープ**（やる / やらない）
3. **受け入れ条件**（どうなれば完了か — 検証可能な形）
4. **参照**（関連 Issue、docs / skill パス）
5. **停止条件**（例: 3 回直してダメなら報告）

例:

> `docs/product/vision.md` の P0 に沿い、レシピ一覧を Server Component で表示する。
> テーブルは未作成なので `supabase-migration` スキルに従ってマイグレーションも追加。認証はまだ不要。
> 受け入れ: シード 1 件が一覧に出る。`npm run lint` 通過。UI は `verify-frontend-change` まで完了。

詳細なループ設計は [`loops.md`](./loops.md)、置き場所は [`steering.md`](./steering.md)。

## エージェントが守ること

- `docs/product/vision.md` の非スコープを勝手に実装しない
- 秘密鍵・`.env.local` をコミットしない
- 無関係なファイルをリフォーマットしない
- 大きな設計変更は先に ADR 草案か質問を残す
- 完了前に verification スキル / workflow チェックリストを実行する

## スキルの使い分け

| 状況 | スキル |
| --- | --- |
| レシピ画面・CRUD | `.cursor/skills/recipe-feature` |
| SQL / RLS / migrations | `.cursor/skills/supabase-migration` |
| ランディングや見た目 | `.cursor/skills/ui-design` |
| UI 完了判定 | `.cursor/skills/verify-frontend-change` |

新しい繰り返しパターンが出たら、汎用 docs ではなく **`.cursor/skills/` にスキルを追加**する。

## フィードバックループ

1. PR レビューで指摘されたパターンは、再発防止のため docs / skill / path-scoped rule に 1 行足す
2. 「毎回説明する」内容は短い always-on rule か `AGENTS.md` の索引に昇格（長くしない）
3. 一度きりの文脈は Issue / PR に留め、docs を肥大化させない
4. 「必ず実行したい」処理は将来 `.cursor/hooks.json` や CI に移す
