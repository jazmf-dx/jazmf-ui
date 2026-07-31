import * as React from 'react'
import type { Preview, Decorator } from '@storybook/react-vite'
import { DxToaster } from '@/components/dx'
import './storybook.css'

/**
 * ダークモードの切替
 *
 * theme.css で `@custom-variant dark (&:where(.dark, .dark *))` を定義しているため、
 * `<html class="dark">` が付いたときだけダークになる（オプトイン方式）。
 *
 * <important>
 * 既存の Django テンプレートと既存 Dx コンポーネントは `bg-white` /
 * `text-gray-900` 直書きのため、まだダークで破綻する。
 * この切替はその破綻箇所を洗い出すためのもの。
 * 新規コンポーネントはセマンティックトークンのみを使い dark-ready にしている。
 * </important>
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark'

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    // プレビュー iframe の地色もテーマに追従させる
    document.body.style.backgroundColor =
      theme === 'dark' ? 'oklch(0.208 0.014 285.938)' : 'oklch(1 0 0)'
    return () => root.classList.remove('dark')
  }, [theme])

  return (
    <div className="dx-preview font-sans p-6">
      <Story />
      {/* トーストは全ページ常時マウントが前提（実アプリでは base.html） */}
      <DxToaster />
    </div>
  )
}

const preview: Preview = {
  decorators: [withTheme],

  globalTypes: {
    theme: {
      description: 'ライト / ダーク切替',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },

  parameters: {
    layout: 'fullscreen',

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // アクセシビリティ検査を全 Story で実行する。
    // 違反があっても Story は表示されるが、a11y パネルに警告が出る。
    a11y: { test: 'todo' },

    // レスポンシブ確認用。実アプリの想定ブレークポイントに合わせる。
    viewport: {
      options: {
        mobile: { name: 'Mobile (sm)', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet (md)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (lg)', styles: { width: '1280px', height: '800px' } },
      },
    },

    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Colors', 'Typography', 'Spacing', 'Radius & Shadow', 'Icons', 'CSS Classes'],
          'Components',
          'Patterns',
        ],
      },
    },
  },
}

export default preview
