# Agent collaboration guide (Cursor)

人間と Cursor エージェントが同じリポジトリで安全に進めるための合意事項です。  
開発の段階定義の正本は [`workflow.md`](./workflow.md) です。

## 役割分担

| 誰 | やること |
| --- | --- |
| 人間（QA / プロダクト） | ①決める、② feature doc §1〜6 の承認、③短い依頼、④受け入れ確認と Production マージ |
| Cursor エージェント | ②の下書き、④の実装・自己検証・draft PR、**⑤振り返り（L4 OK / マージ後に自分から開始）**。**マージはしない** |

## 依頼は短く（詳細は feature doc）

長いプロンプトに仕様を書かない。仕様は `docs/product/features/` に置き、依頼は参照だけにする。

```text
feature doc: docs/product/features/<name>.md
vision: docs/product/vision.md

上記 feature doc の §1〜6（とくに §5 Gherkin と §6）を満たす実装と draft PR まで。
やらないことは §4 に従う。マージしない。
PR 本文は .github/PULL_REQUEST_TEMPLATE.md に従い、Test level を記入する。
```

## エージェントが守ること

- feature doc / `vision.md` の「やらないこと」を実装しない
- **②未承認のまま④に入らない** — ヘッダの「承認者」が人間で埋まっていること。下書き完成・reviewer 通過・「ワークフローに沿って」は承認ではない（#26 で一度スキップした）
- 秘密鍵・`.env.local` をコミットしない
- 無関係なリフォーマットをしない
- Production マージを勝手にしない（D1）
- テストレベルを独自に拡大解釈しない（[`test-level-policy.md`](./test-level-policy.md)）。スコア表が無い間は暫定ゲートに従う
- 「振る舞い不変」で L4 を省略する場合は、PR にその判断を一言書く（一次判定は PR 作成者）
- feature が L4 OK またはマージされたら、[`workflow.md`](./workflow.md) の **⑤を自分から実施**する（人間に「振り返りして」と言われるのを待たない）。繰り返しリスクは skill / rule / workflow に書く

## スキルの使い分け

| 状況 | スキル |
| --- | --- |
| レシピ画面・CRUD | `.cursor/skills/recipe-feature` |
| SQL / RLS / migrations | `.cursor/skills/supabase-migration` |
| ランディングや見た目 | `.cursor/skills/ui-design` |
| UI 自己検証 | `.cursor/skills/verify-frontend-change` |

## サブエージェントの使い分け

自分が書いたものを自分で合格判定しない。判定は別コンテキストの[サブエージェント](../../.cursor/agents/README.md)に渡す。

| 状況 | エージェント |
| --- | --- |
| feature doc を承認に出す前（②） | `feature-doc-reviewer` |
| diff の第二レビュー（④） | `code-reviewer` |
| migration / RLS / grant を触った（④） | `db-security-auditor` |
| §5 Gherkin / §6 をブラウザで確認（L2・L3） | `acceptance-verifier` |

サブエージェントは会話履歴を引き継がない。**doc のパス・base URL・ログイン情報など必要な入力は依頼文に書く。**

## フィードバックループ

1. 受け入れで落ちた観点は、可能なら feature doc か skill に1行足す
2. 「毎回説明する」内容だけ短い rule / `AGENTS.md` に昇格（長くしない）
3. 一度きりの文脈は Issue / PR に留める
