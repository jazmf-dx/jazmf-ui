# DX UI — 社内標準 UI コンポーネントライブラリ + デザインシステム

shadcn/ui（@base-ui/react ベース）をラップした React コンポーネント集、
デザイントークン、および **Storybook による仕様書**。

**画面側では DX UI コンポーネントのみを使用し、shadcn/ui（`components/ui/*`）を直接使用しない。**

設計判断の背景:
- [ADR-0003 DX UI ラッパー方式](../../decisions/adr-0003-dx-ui-wrapper.md)
- [ADR-0004 submodule による配布](../../decisions/adr-0004-distribution-submodule.md)
- [ADR-0005 Storybook を仕様の一次情報にする](../../decisions/adr-0005-storybook-as-spec.md)

---

## Storybook — まずここを見る

<important>
**実装を始める前に Storybook を確認する。** UI を新しく作る前に、
すでに同じものがあるかどうかを Storybook で調べる。
これは人間にも AI にも同じく適用されるルール。
</important>

```bash
cd packages/dx-ui
npm install
npm run storybook        # → http://localhost:6006
```

Storybook は見た目の確認ツールではなく **仕様書**である。各 Story には以下が書かれている。

- **目的** — 何のための部品か
- **使う場面 / 使わない場面** — 「Django テンプレートでは `DxButton` ではなく `btn-primary`」のような判断基準
- **Props** — 型と説明（実装の JSDoc から自動生成 + 補足）
- **使用例** — コピーして使える組み合わせ
- **注意事項** — 踏みやすい罠

### 収録内容

| セクション | 内容 |
|---|---|
| **Introduction** | 読む順番・禁止事項・React と Django の使い分け。**最初に読む** |
| **Foundations** | Colors / Typography / Spacing / Radius & Shadow / Icons / CSS Classes / **Motion** |
| **Components** | Dx コンポーネント 23 個 |
| **Patterns** | FormLayout / DataTable（画面の組み立て方） |

<important>
**グローバルナビ・サイドバーは dx-ui では作らない。** Django 側の `includes/organisms/` に
置く方針にした（[ADR-0008](../../decisions/adr-0008-layout-in-django-and-react-tier-scheme.md)）。
React の分類は `Foundations / Components / Patterns` の3層を維持し、
atoms/molecules/organisms のようなティアは追加しない。
</important>

**Foundations/CSS Classes** は Django テンプレート向け（`btn-primary` / `badge` / `card` /
`input-field` / `avatar-*`）の見本。**アプリの画面の大半は React ではなく Django + htmx**
なので、`.html` を書くときはこのページを見る。

### ツールバー

- **Theme** — light / dark 切替。ダークモードは構造のみ用意した段階なので、
  既存コンポーネントと CSS クラスは破綻する（[ADR-0005](../../decisions/adr-0005-storybook-as-spec.md) 参照）
- **Viewport** — Mobile (375px) / Tablet (768px) / Desktop (1280px)
- **Accessibility パネル** — axe による自動検査

---

## 構成

```
dx-ui/
├── .storybook/                # Storybook 設定
│   ├── main.ts                #   @ alias → packages/dx-ui（後述）+ Tailwind プラグイン
│   ├── preview.tsx            #   theme.css の読み込み・dark 切替・a11y・viewport
│   └── storybook.css          #   theme.css の import + Storybook 用の @source
├── tokens/                    # ★ デザイントークンの SSOT
│   ├── theme.css              #   @theme（色・角丸）+ @layer components（btn-* 等）+ .dark
│   ├── colors.ts              #   TS からトークンを参照するための定数
│   ├── spacing.ts
│   ├── typography.ts
│   ├── radius.ts
│   └── icons.generated.ts     #   自動生成（手で編集しない。後述）
├── components/
│   ├── dx/                    # ★ 画面から使う唯一の UI 部品群
│   │   ├── DxButton.tsx       # ボタン（primary/secondary/danger/success/ghost/link）
│   │   ├── DxInput.tsx        # テキスト入力（input-field と同じ見た目）
│   │   ├── DxSelect.tsx       # セレクト（十数個までの選択肢）
│   │   ├── DxCheckbox.tsx     # チェックボックス（indeterminate 対応）
│   │   ├── DxCard.tsx         # カード（.card / .card-sm / .card-lg と同じ見た目）
│   │   ├── DxTable.tsx        # テーブル（空状態が必須の API）
│   │   ├── DxFormField.tsx    # ラベル + 入力 + エラー + ヘルプ
│   │   ├── DxDialog.tsx       # 汎用ダイアログ
│   │   ├── DxConfirmDialog.tsx# 確認ダイアログ（loading / error を内部で完結）
│   │   ├── DxFormDialog.tsx   # フォームダイアログ
│   │   ├── DxToast.tsx        # トースト通知（success/error/warning/info）
│   │   ├── DxDropdown.tsx     # ドロップダウンメニュー
│   │   ├── DxDatePicker.tsx   # 日付選択（single / range / multiple）
│   │   └── index.ts           # エクスポート集約
│   ├── ui/                    # shadcn/ui 内部実装（直接使用禁止・DX UI の下請け）
│   ├── ConfirmDialogIsland.tsx    # Django 連携 Island: 確認ダイアログ
│   ├── DxFormDialogIsland.tsx     # Django 連携 Island: htmx フォームダイアログ
│   ├── ToastListenerIsland.tsx    # Django 連携 Island: 全ページトースト
│   └── DxDatePickerIsland.tsx     # Django 連携 Island: 日付選択
├── stories/                   # ★ Storybook（= 仕様書）
│   ├── Introduction.mdx
│   ├── foundations/*.mdx
│   ├── components/*.stories.tsx
│   └── patterns/*.stories.tsx
├── scripts/gen-icons.py       # icons.generated.ts の生成スクリプト
├── lib/
│   ├── utils.ts               # cn() ユーティリティ
│   └── csrf.ts                # CSRF トークン取得（Cookie 名を要変更）
├── registry.ts                # data-react 属性 → コンポーネントのマッピング
└── main.tsx                   # 自動マウントエントリ（修正不要）
```

---

## トークンの SSOT

色・角丸・共通 CSS クラスの定義は **`tokens/theme.css` の 1 箇所だけ**にある。

```
packages/dx-ui/tokens/theme.css              ← SSOT
        ↑ @import                     ↑ Storybook が直接読む
templates/django-app/.../input.css    .storybook/storybook.css
（@source とプロジェクト固有 CSS のみ）
```

これにより **Storybook の見た目 = 実アプリの見た目** が構造的に保証される。
色を変えるときは `theme.css` を編集する。`output.css` は生成物なので**絶対に直接編集しない**。

### アプリ別のブランドカラー

各アプリは `input.css` 側で `@theme` を上書きするだけでよい（コンポーネントは変更不要）。

```css
@import "../../../frontend/src/tokens/theme.css";

/* 動画システムは紫 */
@theme {
  --color-primary: oklch(0.606 0.25 292.717);
  --color-primary-hover: oklch(0.541 0.281 293.009);
}
```

API・操作性・アクセシビリティ・命名は共通のまま、見た目だけがアプリごとに変わる。

### アイコン

`tokens/icons.generated.ts` は `packages/django-shared/icons_templatetag.py` からの
**自動生成物**。アイコンを追加するときは Python 側の `ICONS` 辞書に足してから:

```bash
npm run gen:icons
```

TS 側を手で編集すると次回生成で消える。

---

## 取り込み方（コピー方式）

npm パッケージとしては配布しない（[ADR-0004](../../decisions/adr-0004-distribution-submodule.md)）。
プロジェクトの `frontend/src/` にコピーして使う。

```bash
cp -R jazmf-platform/packages/dx-ui/components your-project/frontend/src/
cp -R jazmf-platform/packages/dx-ui/lib        your-project/frontend/src/
cp -R jazmf-platform/packages/dx-ui/tokens     your-project/frontend/src/
cp jazmf-platform/packages/dx-ui/registry.ts jazmf-platform/packages/dx-ui/main.tsx your-project/frontend/src/
```

その後:

1. `lib/csrf.ts` の `CSRF_COOKIE_NAME` をプロジェクトの Cookie 名に変更
2. `vite.config.ts` に `@` alias（`frontend/src`）を設定
3. `input.css` の先頭で `@import "../../../frontend/src/tokens/theme.css";`
4. 必要な依存を確認（`templates/django-app/package.json` にベースラインあり）

> `templates/django-app` から新規生成した場合は組み込み済み。

<important>
`components/dx/index.ts` だけを更新しない。export している `.tsx` と
その下請け（`components/ui/*`）を必ず同時にコピーする。
</important>

---

## 使い方

### React と Django の使い分け

| 書いているファイル | 使うもの |
|---|---|
| `.tsx`（React Island の中） | `Dx*` コンポーネント |
| `.html`（Django テンプレート） | CSS クラス（`btn-primary` / `card` / `input-field` / `badge`） |

**React Island を新設しない。** 既存の Island（`registry.ts` にあるもの）以外は、
Django + htmx + Alpine.js で組む。判断に迷ったら Storybook の Introduction を読む。

### Django テンプレートから（Island）

```html
<!-- base.html に一度だけ（全ページトースト） -->
<div data-react="toast-listener"></div>

<!-- 確認ダイアログ -->
<div data-react="confirm-dialog" data-props='{"title": "削除しますか？", ...}'></div>

<!-- フォームダイアログ: htmx が data-form-url から Django Form HTML を取得 -->
<div data-react="form-dialog" data-form-url="/items/create/form/"></div>

<!-- 日付選択: hidden input の値を書き換える -->
{{ form.start_date }}
<div data-react="date-picker" data-mode="single"
     data-target="{{ form.start_date.id_for_label }}"></div>
```

### React コンポーネント内から

```tsx
import { DxButton, DxFormField, DxInput, DxToast } from "@/components/dx"

DxToast.success("保存しました")
DxToast.error("保存に失敗しました", "ネットワークエラーが発生しました。")
```

### 素の JS / Alpine / htmx から

```js
window.DxToast.success("保存しました")
```

### Django View から

```python
messages.success(request, "保存しました")  # ページ読込時に自動でトースト表示
```

---

## 共通部品を追加するとき

<important>
**Story のない共通部品は「存在しないもの」として扱われる。**
Storybook に載っていない部品は、他の開発者も AI も見つけられないため使われない。
</important>

1. **複数アプリで反復利用されているか確認する。** 1 つのアプリでしか使わないものは
   そのアプリに置く（下記「共通化しないもの」参照）
2. `components/dx/Dx*.tsx` を実装する。トークン（`bg-card` / `text-foreground` /
   `border-border`）のみを使い、色を直書きしない
3. `components/dx/index.ts` に export を追加する
4. `stories/components/Dx*.stories.tsx` を作成する。
   **目的 / 使う場面 / 使わない場面 / Props / 使用例 / 注意事項** を必ず書く
5. `npm run typecheck && npm run build-storybook` を通す
6. `design-system/components.md` の棚卸し表を更新する

### 共通化しないもの

業務固有のコンポーネントは各アプリで管理する。中身の意味が業務ごとに違うため。

```
✗ dx-ui に入れない: EmployeeCard / VideoCard / RecipeCard / InvoiceTable / OrganizationTree
✓ 各アプリの components/ に置く（外枠に DxCard を使うのは良い）
```

## 改変ルール

- プロジェクト側でコンポーネントを改善したら、汎用化できる変更は jazmf-platform に還元する
- `components/ui/`（shadcn 内部）の改変は避ける。カスタマイズは `components/dx/` のラッパー層で行う
- 既存コンポーネントは各プロジェクトのコピーと**バイト一致**を維持している。
  変更するときは全プロジェクトへ反映する（`md5 -q` で確認）
- 新しい DX コンポーネントを追加したら `index.ts`・Story・この README・
  `design-system/components.md` を更新する

## 禁止事項

| 禁止 | 理由 / 代わりに |
|---|---|
| 独自の Button / Input を作る | `DxButton` / `DxInput`（または `btn-primary` / `input-field`）を使う |
| 画面から `components/ui/` を import する | `components/dx/` を経由する |
| `confirm()` / `alert()` | `DxConfirmDialog` / `DxToast` |
| `output.css` を直接編集する | Tailwind の生成物。`theme.css` か `input.css` を編集する |
| 色を直書きする（`bg-blue-500` 等） | セマンティックトークン（`bg-primary` / `text-foreground`） |
| クラス名の動的組み立て（`` `bg-${color}-50` ``） | Tailwind が静的解析できず色が出ない。リテラル文字列で書く |
| Story を書かずに共通部品を追加する | 見つけられないため使われない |
