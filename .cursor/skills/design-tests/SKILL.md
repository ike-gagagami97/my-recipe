---
name: design-tests
description: Run the JSTQB-aligned test design pipeline (draft after feature approval, delta after implementation, agent review, then verification). Use whenever L2/L3 acceptance is required for a behavior change.
---

# Designing tests (plan → analyze → design → review → execute)

Do not jump from implementation to `acceptance-verifier` on §5 alone. Produce a test design, get it agent-reviewed, then execute.

Feature doc §5/§6 stay the **acceptance contract**. The test design **contains and extends** them; do not fatten §5 with every edge case.

## When to use

- Feature doc is **承認済み** or later and the change needs L2 (or L3) per `docs/development/test-level-policy.md`
- After ② approval: **draft** mode (may run before or at the start of ④)
- After UI/behavior implementation and self-verify: **delta** mode, then review → verify

Skip for docs/skills-only or 振る舞い不変 → L0-only changes.

## Artifacts

| Artifact | Path |
| --- | --- |
| Template | `docs/qa/test-design/_template.md` |
| Design doc | `docs/qa/test-design/<feature-name>.md` |
| Feature contract | `docs/product/features/<feature-name>.md` |

Optional: add one line under feature doc §6 確認メモ linking the design path.

## Pipeline

```text
② 承認済み
  → test-designer (mode=draft)
  → test-case-reviewer
  → （blocker あれば design 修正 → 再レビュー）

④ 実装 + verify-frontend-change / L0
  → test-designer (mode=delta)
  → test-case-reviewer
  → acceptance-verifier（feature doc + test design）
  → PR に Test level と設計パスを記載
```

### 1. Draft（②承認後）

Invoke subagent `test-designer` with:

```text
feature doc: docs/product/features/<name>.md
test design: docs/qa/test-design/<name>.md
mode: draft
```

Commit the new design file on the feature branch (same PR as implementation is fine; draft-only PR is also fine).

### 2. Review（エージェントのみ）

Invoke `test-case-reviewer` with the design path. Human review of the design is **not** required.

- Verdict `要修正` → fix via `test-designer` or a careful edit, then re-review
- Verdict `実行可` → set header レビュー結果 to `合格（blocker 0）` and 状態 to `レビュー済み` (or keep `実装後更新済` after delta + pass)

### 3. Delta（実装後）

After the implementer finished self-verify (`verify-frontend-change` when UI changed):

```text
feature doc: docs/product/features/<name>.md
test design: docs/qa/test-design/<name>.md
mode: delta
notes: （何が変わったか・URL・主要な画面ラベル）
```

Re-run `test-case-reviewer`. Do not execute L2 on a stale draft that still has “実装後に書く” stubs.

### 4. Execute

Invoke `acceptance-verifier` with:

- feature doc path
- **test design path** (required for L2/L3 when a design exists)
- base URL, level (L2/L3), credentials / seed notes

The verifier runs **reviewed test cases** (priority H / L2 rows), and still checks §6 and §4. §5 remains the minimum contract — every §5 Scenario must map to a passing case.

### 5. PR notes

In `.github/PULL_REQUEST_TEMPLATE.md` Test level section, add:

```text
Test design: docs/qa/test-design/<name>.md
Review: test-case-reviewer 合格
```

## Role split（実装者バイアス回避）

| 役割 | 誰 |
| --- | --- |
| 実装・自己スモーク | 親エージェント + `verify-frontend-change` |
| テスト設計 | `test-designer`（別コンテキスト） |
| 設計レビュー | `test-case-reviewer`（別コンテキスト・readonly） |
| 実行・合否 | `acceptance-verifier`（別コンテキスト） |
| 最終受け入れ | 人間 L4（ルール表で必須のとき） |

The implementer must **not** be the only author of the executed cases. If `test-designer` is unavailable, stop and report a blocker rather than silently falling back to “I eyeballed §5”.

## Relationship to E2E (L1)

L1 remains Playwright regression for **already automated** specs. Promoting design cases into `tests/e2e/` is optional follow-up (prefer after L4 or in ⑤), and should keep POM conventions in `docs/development/testing.md`. Do not block L2 on writing new E2E.

## Stop conditions

- Feature doc unapproved → do not draft
- `test-case-reviewer` blockers → do not call `acceptance-verifier`
- Browser automation unavailable → follow `test-level-policy.md` (escalate / document); still keep the design artifact
