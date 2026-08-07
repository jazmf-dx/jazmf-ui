import type { StorybookConfig } from '@storybook/react-vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const here = dirname(fileURLToPath(import.meta.url))
/** packages/dx-ui のルート */
const pkgRoot = resolve(here, '..')

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
  ],

  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  typescript: {
    // Props 表を実装の TS 型から自動生成する。
    // 既存コンポーネントは JSDoc が充実しているため、これだけで
    // 各 prop の説明が Docs タブに出る（手書きの argTypes は最小限で済む）。
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // node_modules の型（React の HTMLAttributes 等）まで拾うと
      // Props 表が数百行になり読めなくなるため除外する
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },

  viteFinal: async (viteConfig) => {
    return {
      ...viteConfig,
      plugins: [...(viteConfig.plugins ?? []), tailwindcss()],
    }
  },
}

export default config
