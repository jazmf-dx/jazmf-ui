import type { Meta, StoryObj } from '@storybook/react-vite'
import { DxFormField, DxInput, DxButton } from '../../components/dx'

/**
 * DxFormField はラベル・入力欄・エラー・ヘルプをまとめる部品。
 *
 * <important>
 * React でフォームを組むときは **必ずこれを使う**。
 * ラベルと入力を自分で並べると、余白・必須マーク・aria の紐づけが画面ごとにばらつく。
 * </important>
 */
const meta = {
  title: 'Components/DxFormField',
  component: DxFormField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## 目的

Django の \`includes/molecules/form_field.html\` の React 版。
以下を 1 箇所に集約する。

- **余白の固定** — ラベル下 \`mb-1.5\` / エラー上 \`mt-1.5\` / ヘルプ上 \`mt-1\`
- **必須マーク** — \`*\`（視覚）+ \`（必須）\`（読み上げ専用）
- **id の自動生成と紐づけ** — \`label[for]\` ↔ \`input[id]\`
- **エラーの伝達** — 子に \`aria-invalid\` / \`aria-describedby\` / \`error\` を注入し、
  エラーメッセージに \`role="alert"\` を付ける

## 使う場面

- React Island 内のすべてのフォーム項目

## 使わない場面

| 場面 | 代わりに使うもの |
|---|---|
| Django テンプレート（.html） | \`{% include 'includes/molecules/form_field.html' %}\` |
| ラベルが不要な入力（検索ボックス、テーブル内のインライン編集） | \`DxInput\` 単体 + \`aria-label\` |
| チェックボックス | \`label\` で囲んだ \`input[type=checkbox]\`（ラベルが二重になる） |

## Props

| Prop | 説明 |
|---|---|
| \`label\` | ラベル文字列 |
| \`required\` | 必須マークを表示する |
| \`error\` | エラーメッセージ。渡すと赤字表示 + 子が赤枠になる |
| \`helpText\` | 補足説明 |
| \`children\` | 入力欄（**単一の React 要素**） |
| \`htmlFor\` | 入力欄の id。省略時は自動生成 |

## 注意事項

- **\`children\` は単一要素。** 複数渡すと \`cloneElement\` が失敗する。
  横並びにしたい場合は \`children\` を \`<div>\` で包み、
  \`htmlFor\` を明示して内側の入力に \`id\` を自分で付ける
- **\`error\` を渡すと子に \`error: true\` が注入される。**
  子が \`error\` prop を受け取れない要素（素の \`<textarea>\` 等）でも
  \`aria-invalid\` は付くが、赤枠にはならない
- \`required\` は見た目の \`*\` だけでなく \`（必須）\` を \`sr-only\` で出す。
  \`*\` は読み上げでは「アスタリスク」または無視されるため
- **HTML の \`required\` 属性とは別物。** バリデーションが必要なら
  子の入力欄にも \`required\` を渡す
- Django フォームと連携する場合は \`htmlFor={field.id_for_label}\` を渡して id を揃える
        `,
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
    error: { control: 'text' },
    helpText: { control: 'text' },
    children: { table: { disable: true } },
  },
  args: {
    label: '件名',
    children: <DxInput placeholder="例: 備品購入の申請" />,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DxFormField>

export default meta
type Story = StoryObj<typeof meta>

/** 基本形。ラベルをクリックすると入力欄にフォーカスが移る。 */
export const Default: Story = {}

/** 必須項目。`*` は視覚用、`（必須）` は読み上げ用に出力される。 */
export const Required: Story = {
  args: { required: true },
}

/** 補足説明付き。入力前に伝えたい制約はここに書く。 */
export const WithHelpText: Story = {
  args: {
    required: true,
    helpText: '50 文字以内で入力してください',
  },
}

/**
 * エラー状態。
 *
 * `error` を渡すだけで、子の `DxInput` が赤枠になり `aria-invalid` が付き、
 * メッセージが `role="alert"` で読み上げられる。
 */
export const WithError: Story = {
  args: {
    label: 'メールアドレス',
    required: true,
    error: 'メールアドレスの形式が正しくありません',
    children: <DxInput defaultValue="foo@" />,
  },
}

/**
 * エラーとヘルプの両方。
 *
 * エラーが上、ヘルプが下に並ぶ。**ヘルプは消さない**
 * （入力ルールは、間違えた直後こそ必要な情報）。
 */
export const WithErrorAndHelpText: Story = {
  args: {
    label: 'パスワード',
    required: true,
    error: 'パスワードが短すぎます',
    helpText: '8 文字以上、英字と数字を含めてください',
    children: <DxInput type="password" defaultValue="abc" />,
  },
}

/**
 * `select` と組み合わせる例。
 *
 * React 版の select コンポーネントは提供しない。素の `select` に
 * `input-field` クラスを当てて Django テンプレート側と見た目を揃える。
 */
export const WithSelect: Story = {
  args: {
    label: '優先度',
    required: true,
    helpText: '後から変更できます',
    children: (
      <select className="input-field" defaultValue="">
        <option value="">優先度を選択</option>
        <option value="high">高</option>
        <option value="mid">中</option>
        <option value="low">低</option>
      </select>
    ),
  },
}

/**
 * `textarea` と組み合わせる例。
 *
 * React 版の textarea コンポーネントは未提供なので素の要素を使う。
 * `id` / `aria-describedby` は `DxFormField` が注入するが、
 * **赤枠は付かない**ため、エラー時のスタイルは自分で当てる。
 */
export const WithTextarea: Story = {
  args: {
    label: '詳細',
    helpText: 'Markdown が使えます',
    children: (
      <textarea
        rows={4}
        placeholder="申請の理由を記入してください"
        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
      />
    ),
  },
}

/**
 * フォーム全体の組み立て。
 *
 * **縦の間隔は各項目に `mb-*` を付けず、親の `space-y-4` で制御する。**
 * ボタンは区切り線の下、キャンセルが左・主アクションが右。
 */
export const FullForm: Story = {
  render: () => (
    <form className="space-y-4">
      <DxFormField label="件名" required helpText="50 文字以内で入力してください">
        <DxInput placeholder="例: 備品購入の申請" required />
      </DxFormField>

      <DxFormField label="優先度" required>
        <select className="input-field" defaultValue="" required>
          <option value="">優先度を選択</option>
          <option value="high">高</option>
          <option value="mid">中</option>
          <option value="low">低</option>
        </select>
      </DxFormField>

      <DxFormField label="金額" required error="金額を入力してください">
        <DxInput type="number" placeholder="0" min={0} />
      </DxFormField>

      <DxFormField label="備考" helpText="任意">
        <DxInput placeholder="補足があれば記入してください" />
      </DxFormField>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <DxButton variant="secondary" type="button">
          キャンセル
        </DxButton>
        <DxButton variant="primary" type="submit">
          申請する
        </DxButton>
      </div>
    </form>
  ),
}
