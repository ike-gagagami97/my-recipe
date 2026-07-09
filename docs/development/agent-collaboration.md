# Agent collaboration guide (Cursor)

人間と Cursor エージェントが同じリポジトリで安全に進めるための合意事項です。  
開発の段階定義の正本は [`workflow.md`](./workflow.md) です。

## 役割分担

| 誰 | やること |
| --- | --- |
| 人間（QA / プロダクト） | ①決める、② feature doc §1〜6 の承認、③短い依頼、④受け入れ確認と Production マージ |
| Cursor エージェント | ②の下書き、④の実装・自己検証・draft PR。**マージはしない** |

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
- 秘密鍵・`.env.local` をコミットしない
- 無関係なリフォーマットをしない
- Production マージを勝手にしない（D1）
- テストレベルを独自に拡大解釈しない（[`test-level-policy.md`](./test-level-policy.md)）。スコア表が無い間は暫定ゲートに従う
- 「振る舞い不変」で L4 を省略する場合は、PR にその判断を一言書く（一次判定は PR 作成者）

## スキルの使い分け

| 状況 | スキル |
| --- | --- |
| レシピ画面・CRUD | `.cursor/skills/recipe-feature` |
| SQL / RLS / migrations | `.cursor/skills/supabase-migration` |
| ランディングや見た目 | `.cursor/skills/ui-design` |
| UI 自己検証 | `.cursor/skills/verify-frontend-change` |

## フィードバックループ

1. 受け入れで落ちた観点は、可能なら feature doc か skill に1行足す
2. 「毎回説明する」内容だけ短い rule / `AGENTS.md` に昇格（長くしない）
3. 一度きりの文脈は Issue / PR に留める
