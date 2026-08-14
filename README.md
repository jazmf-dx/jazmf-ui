# DX UI — デザイントークン + Django 連携コンポーネント

Django テンプレートと React Island で**見た目と操作を揃えるための最小限の共有物**。
汎用 UI ライブラリではない。

> **共通ルール**: 本リポジトリは開発Standard（`ai-dev-standards`）に準拠する。
> UI の判断基準は [Application UI Standard](../ai-dev-standards/standards/application-ui/README.md) が正。

---

## ここに置くもの / 置かないもの

<important>
**基本 UI のラッパーを増やさない。** shadcn/ui で足りるものは各プロジェクトで
shadcn/ui を直接使う。ここに置くのは次のどちらかを満たすものだけ。
</important>

| 置く基準 | 例 |
|---|---|
| **1. CSS クラスとのパリティ**<br>Django テンプレート側の `btn-*` / `input-field` / `badge` / `card` / `data-table` と React の見た目を一致させる必要があるもの | `DxButton` `DxInput` `DxBadge` `DxCard` `DxTable` |
| **2. 繰り返し踏むロジック・ポリシーの内包** | `DxTable`（空状態が必須の API）<br>`DxConfirmDialog`（loading / error を内部で完結）<br>`DxFormField`（必須表示とエラー配置）<br>`DxDatePicker`（ja locale）<br>Island 4 種（htmx / `HX-Trigger` との接続） |

**置かないもの:**

| 置かない | 代わりに |
|---|---|
| shadcn/ui の素通しラッパー（select / checkbox / radio / textarea / spinner / progress 等） | 各プロジェクトで shadcn/ui を直接使う。または素の要素 + `input-field` クラス |
| グローバルナビ・サイドバー | Django 側の `includes/organisms/` |
| 業務ドメイン固有の UI（`UserPicker` / `DepartmentPicker` / `OrganizationTree` / `EmployeeCard` 等） | **そのドメインを所有するプロジェクト**。人・組織・拠点は `jazmf-directory` が所有し、他アプリは API 経由で参照する（Application UI Standard §5） |

---

## Storybook — まずここを見る

<important>
**実装を始める前に Storybook を確認する。** UI を新しく作る前に、
すでに同じものがあるかどうかを Storybook で調べる。
これは人間にも AI にも同じく適用されるルール。
</important>

```bash
npm install
npm run storybook        # → http://localhost:6006
```

Storybook は見た目の確認ツールではなく **仕様書**である。各 Story には
**目的 / 使う場面 / 使わない場面 / Props / 使用例 / 注意事項** が書かれている。

| セクション | 内容 |
|---|---|
| **Introduction** | 読む順番・React と Django の使い分け。**最初に読む** |
| **Foundations** | Colors / Typography / Spacing / Radius & Shadow / Icons / CSS Classes |
| **Components** | Dx コンポーネント 16 個 |
| **Patterns** | FormLayout / DataTable / ButtonGroupExample（画面の組み立て方） |

**Foundations/CSS Classes** は Django テンプレート向け（`btn-primary` / `badge` / `card` /
`input-field` / `avatar-*`）の見本。**アプリの画面の大半は React ではなく Django + htmx**
なので、`.html` を書くときはこのページを見る。

ツールバーの **Theme** で light / dark を切り替えられるが、ダークモードは構造のみ用意した
段階で、既存の CSS クラスは `bg-white` 直書きのため破綻する（既知の未対応項目）。

---

## 構成

```
jazmf-ui/
├── tokens/                    # ★ デザイントークンの SSOT
│   ├── theme.css              #   @theme（色・角丸）+ @layer components（btn-* 等）+ .dark
│   ├── colors.ts / spacing.ts / typography.ts / radius.ts
│   ├── motion.css
│   └── icons.generated.ts     #   自動生成（手で編集しない）
├── components/
│   ├── dx/                    # 上記の「置く基準」を満たすコンポーネントのみ
│   ├── ui/                    # shadcn/ui 内部実装（Dx ラッパーの下請け。外から import しない）
│   ├── ConfirmDialogIsland.tsx    # Django 連携 Island: 確認ダイアログ
│   ├── DxFormDialogIsland.tsx     # Django 連携 Island: htmx フォームダイアログ
│   ├── ToastListenerIsland.tsx    # Django 連携 Island: 全ページトースト
│   └── DxDatePickerIsland.tsx     # Django 連携 Island: 日付選択
├── stories/                   # ★ Storybook（= 仕様書）
├── lib/                       # cn() / CSRF トークン取得
├── registry.ts                # data-react 属性 → コンポーネントのマッピング
└── main.tsx                   # 自動マウントエントリ
```

`components/ui/` に置くのは Dx ラッパーが実際に使う shadcn/ui だけ。
使われなくなった shadcn/ui は残さず消す。

---

## トークンの SSOT

色・角丸・共通 CSS クラスの定義は **`tokens/theme.css` の 1 箇所だけ**にある。
消費側は自前で色値を再宣言せず、`@import "@jazmf-dx/dx-ui/styles.css";` で読み込む。

> **既知の逸脱**: `jazmf-directory` の `islands/src/globals.css` はトークンを
> 移植して再宣言している（`@import` に切り替える TODO がコード内に残っている）。
> この状態では SSOT が二重化しているため、色を変えるときは両方を確認する。

### アプリ別のブランドカラー

各アプリは自分の CSS 側で `@theme` を上書きするだけでよい（コンポーネントは変更不要）。

```css
@import "@jazmf-dx/dx-ui/styles.css";

@theme {
  --color-primary: oklch(0.606 0.25 292.717);
  --color-primary-hover: oklch(0.541 0.281 293.009);
}
```

### アイコン

`tokens/icons.generated.ts` は Django 側の icons templatetag の `ICONS` 辞書からの
**自動生成物**。アイコンを追加するときは Python 側に足してから:

```bash
npm run gen:icons
```

TS 側を手で編集すると次回生成で消える。

---

## 取り込み方

GitHub Packages 経由の npm パッケージとして配布する（`@jazmf-dx/dx-ui`）。

```bash
npm install @jazmf-dx/dx-ui
```

`.npmrc` に GitHub Packages のレジストリ設定が必要。パッケージは `.tsx` のまま配布し
消費側の Vite でビルドされるため、Tailwind の `@source` にパッケージを含める。

```css
@source "../node_modules/@jazmf-dx/dx-ui";
```

その後、`lib/csrf.ts` の Cookie 名がプロジェクトと一致しているか確認する。

---

## 使い方

### React と Django の使い分け

| 書いているファイル | 使うもの |
|---|---|
| `.tsx`（React Island の中） | `Dx*` コンポーネント。無いものは shadcn/ui を各プロジェクトで直接使う |
| `.html`（Django テンプレート） | CSS クラス（`btn-primary` / `card` / `input-field` / `badge`） |

インタラクティブ UI の標準手段は React Island、htmx はサーバー起点の部分 HTML 更新に
限定する（[ADR-0002](../ai-dev-standards/decisions/adr-0002-frontend-technology-boundary.md)）。
Alpine.js 等の軽量 JS フレームワークは使わない。

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
import { DxButton, DxFormField, DxInput, DxToast } from "@jazmf-dx/dx-ui"

DxToast.success("保存しました")
DxToast.error("保存に失敗しました", "ネットワークエラーが発生しました。")
```

### 素の JS / htmx から

```js
window.DxToast.success("保存しました")
```

### Django View から

```python
messages.success(request, "保存しました")  # ページ読込時に自動でトースト表示
```

---

## コンポーネントを追加するとき

<important>
まず「ここに置くもの / 置かないもの」の基準を満たすか確認する。
満たさないなら各プロジェクトで shadcn/ui を直接使う。**迷ったら追加しない。**
</important>

1. **複数プロジェクトで実際に繰り返されているか確認する。** 1 つのアプリでしか
   使わないものはそのアプリに置く
2. `components/dx/Dx*.tsx` を実装する。トークン（`bg-card` / `text-foreground` /
   `border-border`）のみを使い、色を直書きしない
3. `components/dx/index.ts` に export を追加する
4. `stories/components/Dx*.stories.tsx` を作成する。
   **目的 / 使う場面 / 使わない場面 / Props / 使用例 / 注意事項** を必ず書く
5. `npm run typecheck && npm run build-storybook` を通す

<important>
**Story のない共通部品は「存在しないもの」として扱われる。**
Storybook に載っていない部品は、他の開発者も AI も見つけられないため使われない。
</important>

### 削除するとき

消費側で使われていないコンポーネントは残さず消す。
Story・`index.ts` の export・`components/ui/` の下請けも同時に消す。

---

## 禁止事項

| 禁止 | 理由 / 代わりに |
|---|---|
| 独自の Button / Input を作る | `DxButton` / `DxInput`（または `btn-primary` / `input-field`）を使う |
| 消費側から `@jazmf-dx/dx-ui` の `components/ui/` を import する | Dx ラッパーの下請け。基本 UI が要るなら自プロジェクトに shadcn/ui を入れる |
| `confirm()` / `alert()` | `DxConfirmDialog` / `DxToast` |
| 色を直書きする（`bg-blue-500` 等） | セマンティックトークン（`bg-primary` / `text-foreground`） |
| クラス名の動的組み立て（`` `bg-${color}-50` ``） | Tailwind が静的解析できず色が出ない。リテラル文字列で書く |
| Story を書かずに共通部品を追加する | 見つけられないため使われない |
| 業務ドメイン固有の UI を入れる | そのドメインを所有するプロジェクトに置く |
