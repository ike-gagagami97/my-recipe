# Development workflow（4段階）

Cursor エージェントと人間が同じ流れで進めるための開発フローです。

合意済みの方針:

| 項目 | 決定 |
| --- | --- |
| ①の成果物 | **A2** — GitHub Issue + `docs/product/vision.md` の状態更新 |
| ②の厚み | **B2** — feature doc 1枚必須（QA向け・振る舞い中心） |
| ③の依頼の切り方 | **未決定**（実装開始時に決める。依頼文は短く保つ） |
| ④のデプロイ | **D1** — Preview までエージェント可、Production マージは人間 |
| ④のテストレベル | **L0–L4 + ルール表（試行）**。認証・権限・削除は H3 サブタイプ |

```mermaid
flowchart TD
  S1[① 作るものを決める] --> S2[② feature doc にする]
  S2 --> S3[③ エージェントに短く依頼]
  S3 --> S4[④ 実装・レビュー・検証・Preview]
  S4 --> S5[人間が Production マージ]
```

---

## 役割分担

| 段階 | 主担当 | エージェント |
| --- | --- | --- |
| ① 決める | 人間 | 壁打ちのみ（実装しない） |
| ② ドキュメント化 | 人間が承認 / 下書きはエージェント可 | feature doc 下書き・抜け漏れ指摘 |
| ③ 依頼 | 人間 | （まだ実装しない） |
| ④ 実装〜Preview | エージェント中心 | 実装・自己検証・draft PR |
| Production | **人間のみ** | 依頼されてもマージしない（原則） |

---

## ① 作るものを決める（成果物: A2）

### 目的

今やることを1スライスに絞る。

### やること

1. ユーザー価値を一文で書く
2. In / Out を切る（やらないことを先に書く）
3. `docs/product/vision.md` の該当行を「着手中」などに更新する
4. GitHub Issue を作る（タイトル + 上記の要約。詳細仕様は②へ）

### やらないこと

- この段階で実装依頼を出さない
- 長い設計書を書かない（②へ）

### 出口（これがあれば①完了）

- [ ] Issue がある
- [ ] `vision.md` の状態が更新されている
- [ ] 「作るもの / やらないこと / 成功イメージ」を復唱できる

---

## ② 作るものをドキュメント化する（厚み: B2）

### 目的

実装者（エージェント）が推測しなくてよい **振る舞いの契約** を残す。

### 必須成果物

`docs/product/features/<feature-name>.md` を1枚用意する。

テンプレート: [`../product/features/_template.md`](../product/features/_template.md)

### 書き方の方針（QA向け）

feature doc の主読者は **QA / プロダクト** です。

**必須（§1〜6）**

| § | 内容 |
| --- | --- |
| 1 | ひとことで言うと |
| 2 | だれの・どんな場面か（**ユーザー課題と提供価値を含む**） |
| 3 | できること |
| 4 | やらないこと |
| 5 | 操作の流れ（**Gherkin**: Given / When / Then） |
| 6 | 受け入れ条件（確認メモもここに一本化） |

**任意（§7以降・付録）** — 空でも②は完了可。書いてあればレビュー対象。

次は **書かなくてよい**（エージェントまたは付録に任せる）。

- テーブル定義の SQL、RLS の詳細
- ファイルパスやコンポーネント構成
- Server Components / ライブラリ選定の長文

### 進め方

1. `_template.md` をコピーして feature 名のファイルを作る
2. 人間が書くか、エージェントに下書きさせて人間が **§1〜6** を承認する
3. Issue から feature doc へリンクする

### 出口（これがあれば②完了）

- [ ] feature doc がある
- [ ] §1〜6 が埋まっている
- [ ] §2 にユーザー課題と提供価値がある
- [ ] §5 が Gherkin である
- [ ] §6 が検証可能な文である（「いい感じ」禁止）
- [ ] Issue から辿れる

---

## ③ エージェントに依頼する

### 目的

②を読ませて、短く実行依頼する。

### 方針

- **依頼文は短く**（詳細は feature doc に置く）
- 実装の切り方（1依頼か分割か）は **実装開始時に決める**（論点Cは保留）
- テンプレを長くしない。足りない情報は doc 側を直す

### 短い依頼テンプレ

```text
feature doc: docs/product/features/<name>.md
vision: docs/product/vision.md

上記 feature doc の §1〜6（とくに §5 Gherkin と §6）を満たす実装と draft PR までお願いします。
やらないことは §4 に従うこと。マージはしないでください。
```

必要なら1行足すだけにする例:

```text
DBが未作成なら migration も同じPRで。UI変更後は verify-frontend-change まで。
```

### 出口

- [ ] 依頼文が短い
- [ ] feature doc のパスが明示されている
- [ ] 「マージしない」が明示されている（D1）

---

## ④ 実装・レビュー・検証・デプロイ（デプロイ: D1）

### ④-1 実装（エージェント）

1. ブランチ作成
2. [`test-level-policy.md`](./test-level-policy.md) のルール表で **変更タイプ・必須レベル・L3条件** を確認する
3. feature doc の受け入れ条件を満たすよう実装
4. 関連 skills を使う（`.cursor/skills/`）
5. 自己検証のうえ **draft PR**（マージしない）

### ④-2 レビュー

| 観点 | 主担当 |
| --- | --- |
| 受け入れ条件を満たすか（画面・操作） | **人間（QA）** |
| やらないことをやっていないか | 人間 |
| 危険な変更（秘密情報、破壊的DBなど） | 人間 + 任意で `code-reviewer` |
| コード詳細 | 必須ではない（QAが全部見なくてよい） |

### ④-3 検証（テストレベル）

正本: [`test-level-policy.md`](./test-level-policy.md)（レベル定義 + **ルール表**）

| Level | 要約 |
| --- | --- |
| L0 | 静的（lint / build / 将来 unit） |
| L1 | local の既存 E2E 等（回帰・該当時のみ） |
| L2 | エージェント + Playwright MCP（local） |
| L3 | Preview エージェント（**env/デプロイ絡みのとき必須**） |
| L4 | 人間 Preview（常時必須ではない。**新規画面・新規フローは必須**） |

ルール表の要点:

- docs / 文言のみ（振る舞い不変）→ **L0 のみ**
- 新規画面・新規フロー → **L0 + L2 + L4**
- 認証・権限・削除 → **サブタイプ表**（ログイン/権限拡大/物理削除は L4 など）
- L3 → env / デプロイ絡みのとき
- 複数タイプに当たる → より重い方
- 必須レベルは PR 本文に短く書く
- 実運用で合わなければ `test-level-policy.md` を更新してよい

### ④-4 デプロイ（D1）

| 環境 | 誰がやるか |
| --- | --- |
| Vercel Preview（PR） | エージェント / CI で作成してよい |
| Production（main マージ後） | **人間がレビュー後にマージ** |
| 本番DB migration・env | 人間（または人間が明示依頼したときだけ） |

### 出口（④完了 → 次機能へ）

- [ ] ルール表どおりのテストレベルを実施した（PR 本文に記載）
- [ ] 新規画面・新規フローなら L4（人間 Preview）済み
- [ ] draft → レビュー → **人間がマージ**
- [ ] 必要なら Preview 確認のうえ Production
- [ ] `vision.md` の状態を更新（完了 / 一部残など）

### PR 本文

PR 作成時は [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md) に従う。

最低限埋める欄:

- Summary / Links（feature doc）
- Test level（タイプ・必須レベル・実施チェック）
- Deploy notes（D1: 人間がマージ）

エージェントは draft PR まで。マージしない。

---

## 関連ドキュメント

- ステアリング（rules / skills / agents）: [`steering.md`](./steering.md)
- 検証ループの考え方: [`loops.md`](./loops.md)
- 依頼・役割の補足: [`agent-collaboration.md`](./agent-collaboration.md)
- テストレベル方針（TBD）: [`test-level-policy.md`](./test-level-policy.md)
- feature テンプレ: [`../product/features/_template.md`](../product/features/_template.md)
