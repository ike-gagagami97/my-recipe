# QA / テスト設計ドキュメント

feature doc（振る舞い契約）とは別に、**テスト計画・分析・設計**の成果物を置く場所。

| パス | 用途 |
| --- | --- |
| [`_template.md`](./_template.md) | 新規テスト設計のテンプレート |
| `<feature-name>.md` | 各 feature のテスト設計（状態付き） |

手順: [`.cursor/skills/design-tests/SKILL.md`](../../../.cursor/skills/design-tests/SKILL.md)  
エージェント: `test-designer`（作成・差分更新）→ `test-case-reviewer`（レビュー）→ `acceptance-verifier`（実行）
