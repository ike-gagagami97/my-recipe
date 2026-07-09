# Documentation

AI 駆動開発向けのプロジェクトドキュメントです。エージェントと人間の両方が、実装前にここを読んで前提を揃えます。

## 構成

| パス | 内容 |
| --- | --- |
| [`product/`](./product/) | プロダクトの目的・スコープ・ユーザー価値 |
| [`architecture/`](./architecture/) | 技術構成・ディレクトリ・データ境界 |
| [`development/`](./development/) | 開発フロー・ブランチ・レビュー・エージェント運用 |
| [`decisions/`](./decisions/) | Architecture Decision Records (ADR) |

## 読む順番（エージェント向け）

1. [`product/vision.md`](./product/vision.md) — 何を作るか
2. [`architecture/overview.md`](./architecture/overview.md) — どう構成するか
3. [`development/workflow.md`](./development/workflow.md) — どう進めるか
4. 必要に応じて [`../agent-skills/`](../agent-skills/) の該当スキル

## 更新ルール

- 実装とドキュメントが食い違ったら、**同じ PR でドキュメントも直す**
- 大きな方針変更は `decisions/` に ADR を追加する
- 推測で仕様を増やさない。未決定は「未決定」と明記する
