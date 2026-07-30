# DX UI — 社内標準 UI コンポーネントライブラリ

shadcn/ui（@base-ui/react ベース）をラップした React コンポーネント集 + React Islands 自動マウント機構。
**画面側では DX UI コンポーネントのみを使用し、shadcn/ui（`components/ui/*`）を直接使用しない。**

設計判断の背景: [../../decisions/adr-0003-dx-ui-wrapper.md](../../decisions/adr-0003-dx-ui-wrapper.md)

---

## 構成

```
dx-ui/
├── components/
│   ├── dx/                    # ★ 画面から使う唯一の UI 部品群
│   │   ├── DxButton.tsx       # ボタン（variant: primary/secondary/danger/success）
│   │   ├── DxDialog.tsx       # 汎用ダイアログ
│   │   ├── DxConfirmDialog.tsx# 確認ダイアログ
│   │   ├── DxFormDialog.tsx   # フォームダイアログ（React フォーム用）
│   │   ├── DxToast.tsx        # トースト通知（success/error/warning/info）
│   │   ├── DxDropdown.tsx     # ドロップダウンメニュー
│   │   ├── DxDatePicker.tsx   # 日付選択（単一・範囲）
│   │   └── index.ts           # エクスポート集約
│   ├── ui/                    # shadcn/ui 内部実装（直接使用禁止・DX UI の下請け）
│   ├── ConfirmDialogIsland.tsx    # Django 連携 Island: 確認ダイアログ
│   ├── DxFormDialogIsland.tsx     # Django 連携 Island: htmx フォームダイアログ
│   ├── ToastListenerIsland.tsx    # Django 連携 Island: 全ページトースト
│   └── DxDatePickerIsland.tsx     # Django 連携 Island: 日付選択
├── lib/
│   ├── utils.ts               # cn() ユーティリティ
│   └── csrf.ts                # CSRF トークン取得（Cookie 名を要変更）
├── registry.ts                # data-react 属性 → コンポーネントのマッピング
└── main.tsx                   # 自動マウントエントリ（修正不要）
```

## 取り込み方（コピー方式）

npm パッケージとしては配布しない。プロジェクトの `frontend/src/` にコピーして使う。

```bash
cp -R jazmf-platform/packages/dx-ui/components your-project/frontend/src/
cp -R jazmf-platform/packages/dx-ui/lib        your-project/frontend/src/
cp jazmf-platform/packages/dx-ui/registry.ts jazmf-platform/packages/dx-ui/main.tsx your-project/frontend/src/
```

その後:

1. `lib/csrf.ts` の `CSRF_COOKIE_NAME` をプロジェクトの Cookie 名に変更
2. `vite.config.ts` に `@` alias（`frontend/src`）を設定
3. 必要な依存を確認（`templates/django-app/package.json` にベースラインあり）

> `templates/django-app` から新規生成した場合は組み込み済み。

## 使い方

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
import { DxButton, DxDialog, DxToast } from "@/components/dx"

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

## 改変ルール

- プロジェクト側でコンポーネントを改善したら、汎用化できる変更は jazmf-platform に還元する
- `components/ui/`（shadcn 内部）の改変は避ける。カスタマイズは `components/dx/` のラッパー層で行う
- 新しい DX コンポーネントを追加したら `index.ts` と このREADME、`design-system/components.md` を更新する
