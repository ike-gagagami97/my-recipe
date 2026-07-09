## Summary

<!-- 何のための変更か。1〜3文。詳細仕様は feature doc に書く。 -->

## Links

- Issue:
- Feature doc: <!-- 例: docs/product/features/recipe-list.md （docs/文言のみなら N/A） -->
- Vision: docs/product/vision.md

## Scope

- **In:**
- **Out:** <!-- feature doc §4 と揃える。なければ「なし」 -->

## Test level

正本: [`docs/development/test-level-policy.md`](../docs/development/test-level-policy.md)

```text
Test level:
Type:
振る舞い不変: yes / no
L3: yes / no （理由: ）
```

| Level | 実施 | メモ |
| --- | --- | --- |
| L0 lint + build | [ ] | |
| L1 既存 E2E（該当時） | [ ] / N/A | |
| L2 local エージェント検証 | [ ] / N/A | |
| L3 Preview エージェント | [ ] / N/A | env/デプロイ絡みのとき必須 |
| L4 人間 Preview | [ ] / N/A | 新規画面・新規フローは必須 |

## How to verify（人間向け）

<!-- L4 が必要なとき、または L2 不可時。§5 Gherkin / §6 へのポインタで可。 -->

1.
2.

## Deploy notes（D1）

- [ ] Draft のままレビュー開始（エージェントは Production マージしない）
- [ ] Preview URL:
- [ ] Production マージは人間が実施
- [ ] 本番 migration / env 変更: なし / あり（内容: ）

## Checklist

- [ ] feature doc がある変更なら §1〜6（とくに §4 やらないこと・§5・§6）に沿っている
- [ ] ルール表の必須レベルを上表で実施した（または N/A 理由あり）
- [ ] 秘密情報・`.env.local` を含めていない
- [ ] 振る舞い不変で L4 省略する場合、その判断を Test level に書いた
- [ ] docs / vision の状態更新が必要なら同じ PR に含めている
